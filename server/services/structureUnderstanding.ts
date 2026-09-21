import { ExtractedDocument, DocumentStructureUnderstanding, InferredSection, DocumentBlock } from '../types/documentIR.ts';
import { GoogleGenAI } from '@google/genai';

export class StructureUnderstandingService {
  /**
   * Understands document organization using Gemini AI or generic optical structural heuristics.
   */
  async inferStructure(
    doc: ExtractedDocument,
    aiClient?: GoogleGenAI,
    isRateLimited: boolean = false
  ): Promise<DocumentStructureUnderstanding> {
    if (aiClient && !isRateLimited) {
      try {
        const aiStructure = await this.inferStructureWithAI(doc, aiClient);
        if (aiStructure.sections && aiStructure.sections.length > 0) {
          doc.structure = aiStructure;
          return aiStructure;
        }
      } catch (err) {
        console.warn('AI structure understanding failed, using generic structural analyzer:', err);
      }
    }

    // Generic layout-driven structural fallback
    const fallbackStructure = this.inferStructureFromLayout(doc);
    doc.structure = fallbackStructure;
    return fallbackStructure;
  }

  /**
   * Staged AI Document Understanding:
   * Passes representative document profile + candidate heading blocks + sample pages to Gemini.
   */
  private async inferStructureWithAI(
    doc: ExtractedDocument,
    ai: GoogleGenAI
  ): Promise<DocumentStructureUnderstanding> {
    const candidateBlocks = doc.allBlocks
      .filter((b) => doc.profile.candidateHeadingBlockIds.includes(b.id))
      .slice(0, 40)
      .map((b) => ({
        id: b.id,
        page: b.pageNumber,
        text: b.cleanText,
        visualWeight: b.estimatedVisualWeight,
        isUpper: b.isAllUppercase,
        numbering: b.numberingPrefix,
      }));

    // Representative sample of first 3 body pages and intermediate pages
    const samplePageSnippets = doc.pages
      .filter((p) => !doc.profile.tocPageNumbers.includes(p.pageNumber))
      .slice(0, 6)
      .map((p) => `--- PAGE ${p.pageNumber} ---\n${p.rawText.slice(0, 1200)}`)
      .join('\n\n');

    const prompt = `You are an expert document structural analyst.
Analyze the provided document layout evidence to infer how THIS SPECIFIC document is organized.

Document Information:
- Total Pages: ${doc.pageCount}
- Detected Style: ${doc.profile.organizationalStyleHint}
- Potential TOC Pages: ${JSON.stringify(doc.profile.tocPageNumbers)}
- Subject Hint: ${doc.subjectHint || 'Not specified'}

Detected Heading Candidates (Optical / Layout evidence):
${JSON.stringify(candidateBlocks, null, 2)}

Sample Document Pages:
${samplePageSnippets}

TASK:
1. Determine the document title and primary subject.
2. Identify the major instructional sections/modules (Level 1) and their page ranges.
3. Exclude pure table of contents pages, front covers, and standalone revision/exam placeholders from being main instructional sections.
4. If the document has no explicit labels (e.g. no "Week" or "Chapter" words), infer section boundaries from semantic topics and typography.
5. Assign a confidence score (0.0 to 1.0) to each section.

Return ONLY valid JSON matching this schema:
{
  "documentTitle": "Title of document",
  "inferredSubject": "Subject name (e.g. Biology, Mathematics, Physics, Agricultural Science)",
  "organizationSummary": "Brief explanation of how this document is structured",
  "sections": [
    {
      "title": "Clean, descriptive section topic title",
      "level": 1,
      "startPage": 1,
      "endPage": 6,
      "confidence": 0.95,
      "inferredType": "INSTRUCTIONAL_TOPIC"
    }
  ],
  "tocPages": [1],
  "administrativePages": [],
  "structuralConfidence": 0.92,
  "needsReviewSections": []
}`;

    const models = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ text: prompt }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);

        if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          // Map sections to actual blocks
          const enrichedSections: InferredSection[] = parsed.sections.map((s: any, idx: number) => {
            const startPage = typeof s.startPage === 'number' ? s.startPage : 1;
            const endPage = typeof s.endPage === 'number' ? s.endPage : startPage + 3;
            
            const matchingBlocks = doc.allBlocks.filter(
              (b) => b.pageNumber >= startPage && b.pageNumber <= endPage
            );
            
            return {
              id: `sec_${idx + 1}`,
              title: s.title || `Section ${idx + 1}`,
              level: s.level || 1,
              startPage,
              endPage,
              blockIds: matchingBlocks.map((b) => b.id),
              text: matchingBlocks.map((b) => b.text).join('\n\n'),
              confidence: s.confidence || 0.9,
              inferredType: s.inferredType || 'INSTRUCTIONAL_TOPIC',
            };
          });

          return {
            documentTitle: parsed.documentTitle || doc.filename,
            inferredSubject: parsed.inferredSubject || doc.subjectHint || 'Academic Subject',
            organizationSummary: parsed.organizationSummary || 'Identified via document AI analysis',
            sections: enrichedSections,
            tocPages: parsed.tocPages || doc.profile.tocPageNumbers,
            administrativePages: parsed.administrativePages || [],
            structuralConfidence: parsed.structuralConfidence || 0.9,
            needsReviewSections: parsed.needsReviewSections || [],
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Failed to infer structure with AI');
  }

  /**
   * Generic Layout-Driven Structural Analyzer:
   * Operates completely without word whitelists (no hard-coded WEEK/TOPIC/CHAPTER assumptions).
   * Segments the document by optical visual weight, page boundaries, and section gaps.
   */
  inferStructureFromLayout(doc: ExtractedDocument): DocumentStructureUnderstanding {
    const candidateHeadings: DocumentBlock[] = [];
    const nonTocPages = doc.pages.filter((p) => !doc.profile.tocPageNumbers.includes(p.pageNumber));

    for (const page of nonTocPages) {
      for (const block of page.blocks) {
        if (block.structuralPrediction === 'CURRICULUM_HEADING' && block.charCount >= 4) {
          candidateHeadings.push(block);
        }
      }
    }

    const sections: InferredSection[] = [];

    if (candidateHeadings.length >= 2) {
      for (let i = 0; i < candidateHeadings.length; i++) {
        const h = candidateHeadings[i];
        const nextH = candidateHeadings[i + 1];

        const startPage = h.pageNumber;
        const endPage = nextH ? nextH.pageNumber : doc.pageCount;

        // Gather all blocks in this section
        const sectionBlocks = doc.allBlocks.filter(
          (b) =>
            (b.pageNumber > startPage || (b.pageNumber === startPage && b.blockOrder >= h.blockOrder)) &&
            (!nextH || b.pageNumber < nextH.pageNumber || (b.pageNumber === nextH.pageNumber && b.blockOrder < nextH.blockOrder))
        );

        const sectionBody = sectionBlocks.map((b) => b.text).join('\n\n').trim();

        const cleanTitle = h.cleanText.replace(/^[•\-\*:\s]+/, '').replace(/[:\.\s]+$/, '').trim();
        const isPureTermHeader = /^(?:FIRST|SECOND|THIRD|FOURTH)\s+TERM$/i.test(cleanTitle) || /^TERM\s+\d+$/i.test(cleanTitle) || /^SCHEME\s+OF\s+WORK$/i.test(cleanTitle);

        // Skip tiny administrative fragments or empty term headers
        if ((sectionBody.length < 80 || (isPureTermHeader && sectionBody.length < 300)) && nextH) {
          continue;
        }

        sections.push({
          id: `sec_${sections.length + 1}`,
          title: cleanTitle,
          level: 1,
          startPage,
          endPage,
          headingBlockId: h.id,
          blockIds: sectionBlocks.map((b) => b.id),
          text: sectionBody,
          confidence: 0.85,
          inferredType: isPureTermHeader ? 'ADMINISTRATIVE' : 'INSTRUCTIONAL_TOPIC',
        });
      }
    }

    // If no distinct headings found, partition by page windows or substantial content blocks
    if (sections.length === 0) {
      const pageSize = Math.max(1, Math.ceil(nonTocPages.length / 5));
      for (let i = 0; i < nonTocPages.length; i += pageSize) {
        const pageChunk = nonTocPages.slice(i, i + pageSize);
        const startPage = pageChunk[0].pageNumber;
        const endPage = pageChunk[pageChunk.length - 1].pageNumber;
        const blocks = pageChunk.flatMap((p) => p.blocks);
        const firstBlockText = blocks[0]?.cleanText || `Unit ${sections.length + 1}`;
        const titleSnippet = firstBlockText.length > 50 ? `${firstBlockText.slice(0, 47)}...` : firstBlockText;

        sections.push({
          id: `sec_${sections.length + 1}`,
          title: titleSnippet || `Section ${sections.length + 1}`,
          level: 1,
          startPage,
          endPage,
          blockIds: blocks.map((b) => b.id),
          text: blocks.map((b) => b.text).join('\n\n'),
          confidence: 0.7,
          inferredType: 'INSTRUCTIONAL_TOPIC',
        });
      }
    }

    return {
      documentTitle: doc.filename,
      inferredSubject: doc.subjectHint || 'Academic Subject',
      organizationSummary: `Inferred ${sections.length} structural sections via generic layout analysis.`,
      sections,
      tocPages: doc.profile.tocPageNumbers,
      administrativePages: [],
      structuralConfidence: 0.8,
      needsReviewSections: sections.filter((s) => s.confidence < 0.75).map((s) => ({
        title: s.title,
        reason: 'Low optical contrast; verify section boundary',
        pageNumber: s.startPage,
      })),
    };
  }
}

export const structureUnderstandingService = new StructureUnderstandingService();
