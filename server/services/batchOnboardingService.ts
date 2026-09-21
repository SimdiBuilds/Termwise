import mammoth from 'mammoth';
import { extractTextFromPdfBuffer } from './pdfExtractor.ts';
import { aiCurriculumUnderstandingService } from './aiCurriculumUnderstanding.ts';
import { aiService } from '../ai/aiService.ts';
import { storage } from '../storage.ts';
import { plannerService } from './plannerService.ts';
import { ClassifiedSubjectGroup, Subject, SourceDocument, Question } from '../../src/types.ts';
import { shuffleQuestionOptions } from './questionUtils.ts';

export interface ProcessedUploadedFile {
  id: string;
  filename: string;
  buffer: Buffer;
  size: number;
  extractedText: string;
  pageCount: number;
  excerpt: string;
}

export class BatchOnboardingService {
  /**
   * Phase 1: Reads uploaded files, extracts text, and uses AI to classify into academic subjects.
   */
  async classifyUploadedFiles(
    files: { filename: string; buffer: Buffer; size: number }[]
  ): Promise<{
    groups: ClassifiedSubjectGroup[];
    totalFilesProcessed: number;
    failedFiles: string[];
  }> {
    const processedFiles: ProcessedUploadedFile[] = [];
    const failedFiles: string[] = [];

    for (const [idx, file] of files.entries()) {
      try {
        let extractedText = '';
        let pageCount = 1;

        if (file.filename.toLowerCase().endsWith('.pdf')) {
          const pdfData = await extractTextFromPdfBuffer(file.buffer);
          extractedText = pdfData.text || '';
          pageCount = pdfData.pageCount || 1;
        } else if (file.filename.toLowerCase().endsWith('.docx')) {
          const docx = await mammoth.extractRawText({ buffer: file.buffer });
          extractedText = docx.value || '';
        } else if (file.filename.toLowerCase().endsWith('.doc')) {
          throw new Error('Legacy .doc files are not supported. Save the file as .docx or PDF.');
        } else {
          extractedText = file.buffer.toString('utf-8');
        }

        // Clean extracted text
        extractedText = extractedText.replace(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g, ' ').trim();
        if (extractedText.startsWith('%PDF') || extractedText.includes('/Filter/FlateDecode')) {
          // Exclude unparsed binary gibberish if fallback fails
          extractedText = '';
        }

        if (extractedText.length < 40) {
          // Scanned or image-only file: nothing readable to build a curriculum from.
          failedFiles.push(file.filename);
          continue;
        }

        const excerpt = extractedText.slice(0, 2500);
        const fileId = `file_${Date.now()}_${idx}`;

        processedFiles.push({
          id: fileId,
          filename: file.filename,
          buffer: file.buffer,
          size: file.size,
          extractedText,
          pageCount,
          excerpt,
        });
      } catch (err) {
        console.warn(`Failed to process file ${file.filename}:`, err);
        failedFiles.push(file.filename);
      }
    }

    if (processedFiles.length === 0) {
      throw new Error('No readable text could be extracted from the uploaded files.');
    }

    // Call AI to classify documents into clean subject names
    const classifications = await aiService.classifyDocuments(
      processedFiles.map((f) => ({
        id: f.id,
        filename: f.filename,
        excerpt: f.excerpt,
      }))
    );

    // Group files by classified subject name
    const groupMap = new Map<string, ClassifiedSubjectGroup['files']>();

    for (const file of processedFiles) {
      const classInfo = classifications.find((c) => c.docId === file.id);
      const subjectName = classInfo ? classInfo.subjectName : 'General Studies';

      if (!groupMap.has(subjectName)) {
        groupMap.set(subjectName, []);
      }

      groupMap.get(subjectName)!.push({
        id: file.id,
        filename: file.filename,
        pageCount: file.pageCount,
        size: file.size,
        fullText: file.extractedText,
        textExcerpt: file.excerpt,
      });
    }

    const groups: ClassifiedSubjectGroup[] = Array.from(groupMap.entries()).map(([subjectName, files]) => ({
      subjectName,
      files,
    }));

    return {
      groups,
      totalFilesProcessed: processedFiles.length,
      failedFiles,
    };
  }

  /**
   * Phase 2: Builds full curriculum hierarchy, connects source provenance, and initializes the study schedule.
   */
  async buildFullTermCurriculum(
    groups: ClassifiedSubjectGroup[],
    termEndDate: string,
    targetStudyMinutesPerDay: number
  ) {
    // Refuse up front when nothing is readable, before anything is deleted.
    const readable = (groups || []).filter((g) => g.files.some((f) => (f.fullText || f.textExcerpt || '').trim().length >= 40));
    if (readable.length === 0) {
      throw new Error('None of these notes contain readable text, so your existing curriculum was kept.');
    }
    groups = readable;

    // Snapshot first: a failed rebuild must never leave the student with an empty curriculum.
    const snapshot = storage.snapshot();
    storage.startBatch();
    try {
      // 1. Reset old default/seed data for clean onboarding
      storage.resetCurriculum();

      // 2. Update Term Settings
      const todayStr = new Date().toISOString().split('T')[0];
      storage.updateSettings({
        termStartDate: todayStr,
        termEndDate,
        targetStudyMinutesPerDay: Number(targetStudyMinutesPerDay) || 120,
        onboardingCompleted: true,
      });

      let totalTopics = 0;
      let totalConcepts = 0;
      let totalDocuments = 0;
      const createdSubjects: Subject[] = [];

      // 3. Process each subject group sequentially
      for (const [groupIdx, group] of groups.entries()) {
        const subjectId = `sub_${Date.now()}_${groupIdx}`;
        const subjectName = group.subjectName.trim() || 'Academic Subject';

        const subject: Subject = {
          id: subjectId,
          name: subjectName,
          description: `Curriculum derived from ${group.files.length} school source document(s).`,
          createdAt: new Date().toISOString(),
        };

        storage.addSubject(subject);
        createdSubjects.push(subject);

        // Save source documents and compile combined text
        let combinedText = '';
        for (const [fileIdx, file] of group.files.entries()) {
          totalDocuments++;
          const docId = `doc_${Date.now()}_${fileIdx}`;
          const docText = file.fullText || file.textExcerpt || '';
          combinedText += `\n\n=== SOURCE FILE: ${file.filename} ===\n\n` + docText;

          const docRecord: SourceDocument = {
            id: docId,
            subjectId,
            title: file.filename.replace(/\.[a-zA-Z0-9]+$/i, ''),
            filename: file.filename,
            pageCount: file.pageCount || 1,
            uploadDate: new Date().toISOString(),
            previewText: docText.slice(0, 300),
            extractedText: docText,
          };

          storage.addDocument(docRecord);
        }

        // Build AI Curriculum (Topics -> Subtopics -> Concepts -> Questions)
        try {
          const extracted = await aiService.extractCurriculum(subjectName, combinedText);

          if (extracted && extracted.topics && extracted.topics.length > 0) {
            for (const [topIdx, topData] of extracted.topics.entries()) {
              totalTopics++;
              const topicId = `top_${Date.now()}_${groupIdx}_${topIdx}`;
              
              storage.addTopic({
                id: topicId,
                subjectId,
                title: topData.title,
                order: topIdx + 1,
                description: topData.description || `Key syllabus topics for ${topData.title}`,
              });

              if (topData.concepts && Array.isArray(topData.concepts)) {
                for (const [concIdx, c] of topData.concepts.entries()) {
                  totalConcepts++;
                  const conceptId = `conc_${Date.now()}_${groupIdx}_${topIdx}_${concIdx}`;
                  const sourceDocName = group.files[0]?.filename || 'Uploaded Notes';

                  storage.addConcept({
                    id: conceptId,
                    topicId,
                    topicTitle: topData.title,
                    subtopicTitle: c.subtopicTitle || '',
                    subjectId,
                    subjectName,
                    name: c.name,
                    explanation: c.explanation,
                    definitions: c.definitions || [],
                    formulas: c.formulas || [],
                    keyFacts: c.keyFacts || [],
                    examples: c.examples || [],
                    sourceDocument: sourceDocName,
                    sourcePage: c.sourcePage || 1,
                    order: concIdx + 1,
                    prerequisiteConceptIds: [],
                  });

                  // Add sample questions if available
                  if (c.sampleQuestions && Array.isArray(c.sampleQuestions)) {
                    for (const [qIdx, q] of c.sampleQuestions.entries()) {
                      const questionId = `q_${Date.now()}_${groupIdx}_${qIdx}`;
                      const newQ: Question = shuffleQuestionOptions({
                        id: questionId,
                        conceptId,
                        subjectId,
                        topicId,
                        subtopicTitle: c.subtopicTitle || '',
                        category: (q.category as any) || 'RECALL',
                        type: q.type || 'MULTIPLE_CHOICE',
                        questionText: q.questionText || `Test question regarding ${c.name}`,
                        options: q.options || [],
                        correctAnswer: q.correctAnswer || (q.options?.[0] || 'Option A'),
                        explanation: q.explanation || 'Verified with source school notes.',
                        sourceDocument: sourceDocName,
                        sourcePage: c.sourcePage || 1,
                      });
                      storage.addQuestion(newQ);
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn(`Curriculum extraction failed for subject ${subjectName}:`, err);
        }
      }

      if (totalConcepts === 0) {
        throw new Error('No concepts could be built from these notes. Your existing curriculum was kept.');
      }

      // 4. Generate initial adaptive daily plan
      const initialPlan = plannerService.generateDailyPlan(targetStudyMinutesPerDay);

      return {
        success: true,
        summary: {
          subjectsCount: createdSubjects.length,
          topicsCount: totalTopics,
          conceptsCount: totalConcepts,
          documentsCount: totalDocuments,
        },
        subjects: createdSubjects,
        initialPlan,
        settings: storage.getSettings(),
      };
    } catch (err) {
      storage.restore(snapshot);
      throw err;
    } finally {
      storage.endBatch();
    }
  }
}

export const batchOnboardingService = new BatchOnboardingService();
