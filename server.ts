import express from 'express';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { storage } from './server/storage.ts';
import { aiProvider } from './server/ai/geminiProvider.ts';
import { masteryService } from './server/services/masteryService.ts';
import { mistakeService } from './server/services/mistakeService.ts';
import { plannerService } from './server/services/plannerService.ts';
import { flexibleLessonEngine } from './server/services/lessonEngine.ts';
import { extractTextFromPdfBuffer } from './server/services/pdfExtractor.ts';
import { batchOnboardingService } from './server/services/batchOnboardingService.ts';
import { Question, Subject, Topic, Concept, TestRecord } from './src/types.ts';
import { generateSubjectAwareFallbackQuestion, numericMatches, keywordOverlap } from './server/services/questionUtils.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Optional access password (HTTP Basic). Set APP_PASSWORD on any deployment that is reachable from the internet.
const ACCESS_PASSWORD = process.env.APP_PASSWORD;
if (ACCESS_PASSWORD) {
  const digest = (v: string) => crypto.createHash('sha256').update(v).digest();
  app.use((req, res, next) => {
    if (req.path === '/api/health') return next();
    const [scheme, encoded] = (req.headers.authorization || '').split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');
      const pass = decoded.slice(decoded.indexOf(':') + 1);
      if (crypto.timingSafeEqual(digest(pass), digest(ACCESS_PASSWORD))) return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="Termwise", charset="UTF-8"');
    res.status(401).send('Authentication required');
  });
}

// Serverless (Vercel): load shared state before each request and finish cloud writes before responding.
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try { await storage.ready(); await storage.refresh(); } catch { /* fall back to local state */ }
    const end = res.end.bind(res) as (...a: any[]) => any;
    (res as any).end = (...args: any[]) => { storage.flush().finally(() => end(...args)); return res; };
    next();
  });
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// App Settings & Term Countdown
app.get('/api/settings', (req, res) => {
  const settings = storage.getSettings();
  const end = new Date(settings.termEndDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.floor(diffDays / 7);

  let countdownLabel = '';
  if (diffDays <= 0) {
    countdownLabel = 'Term complete';
  } else if (diffDays === 1) {
    countdownLabel = '1 day until your term ends';
  } else if (diffDays < 7) {
    countdownLabel = `${diffDays} days until your term ends`;
  } else if (weeksRemaining === 1) {
    countdownLabel = '1 week until your term ends';
  } else {
    countdownLabel = `${weeksRemaining} weeks until your term ends`;
  }

  res.json({
    ...settings,
    daysRemaining: diffDays,
    weeksRemaining,
    countdownLabel,
  });
});

app.post('/api/settings', (req, res) => {
  const b = req.body || {};
  const patch: Record<string, any> = {};
  const isDate = (v: any) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
  if (b.termEndDate !== undefined) {
    if (!isDate(b.termEndDate)) return res.status(400).json({ error: 'Term end date must be a valid date.' });
    patch.termEndDate = b.termEndDate;
  }
  if (b.termStartDate !== undefined) {
    if (!isDate(b.termStartDate)) return res.status(400).json({ error: 'Term start date must be a valid date.' });
    patch.termStartDate = b.termStartDate;
  }
  if (b.targetStudyMinutesPerDay !== undefined) {
    const n = Number(b.targetStudyMinutesPerDay);
    if (!Number.isFinite(n) || n < 15 || n > 600) return res.status(400).json({ error: 'Daily target must be between 15 and 600 minutes.' });
    patch.targetStudyMinutesPerDay = Math.round(n);
  }
  if (b.masteryThreshold !== undefined) {
    const n = Number(b.masteryThreshold);
    if (!Number.isFinite(n) || n < 50 || n > 100) return res.status(400).json({ error: 'Mastery threshold must be between 50 and 100.' });
    patch.masteryThreshold = Math.round(n);
  }
  // onboardingCompleted is controlled by the server only.
  res.json(storage.updateSettings(patch));
});

// Batch Onboarding & Multi-file Curriculum Processing
app.post('/api/onboarding/classify-batch', upload.array('files', 20), async (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }
    const input = files.map((f) => ({
      filename: f.originalname,
      buffer: f.buffer,
      size: f.size,
    }));
    const result = await batchOnboardingService.classifyUploadedFiles(input);
    res.json(result);
  } catch (err: any) {
    console.error('Error classifying batch uploaded files:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze uploaded files.' });
  }
});

app.post('/api/onboarding/confirm-and-build', async (req, res) => {
  try {
    const { groups, termEndDate, targetStudyMinutesPerDay } = req.body;
    if (!groups || !Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({ error: 'No classified subject groups provided.' });
    }
    const result = await batchOnboardingService.buildFullTermCurriculum(
      groups,
      termEndDate || new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
      Number(targetStudyMinutesPerDay) || 120
    );
    res.json(result);
  } catch (err: any) {
    console.error('Error confirming and building onboarding curriculum:', err);
    res.status(500).json({ error: err?.message || 'Failed to build curriculum and study schedule.' });
  }
});

app.post('/api/onboarding/reset', (req, res) => {
  storage.resetCurriculum();
  res.json({ success: true, message: 'Curriculum reset for new onboarding setup.' });
});

// Reset to seed data
app.post('/api/curriculum/reset', (req, res) => {
  storage.resetToSeed();
  res.json({ success: true, message: 'Reset to standard school syllabus data.' });
});

// Get all subjects
app.get('/api/curriculum/subjects', (req, res) => {
  res.json(storage.getSubjects());
});


// Get topics for subject
app.get('/api/curriculum/topics', (req, res) => {
  const subjectId = req.query.subjectId as string | undefined;
  res.json(storage.getTopics(subjectId));
});

// Get concepts
app.get('/api/curriculum/concepts', (req, res) => {
  const topicId = req.query.topicId as string | undefined;
  const subjectId = req.query.subjectId as string | undefined;
  const concepts = storage.getConcepts(topicId, subjectId);
  const allMastery = storage.getAllMastery();

  const enriched = concepts.map((c) => ({
    ...c,
    mastery: allMastery[c.id] || {
      score: 0,
      status: 'UNLEARNED',
      repetitions: 0,
      totalAttempts: 0,
    },
  }));
  res.json(enriched);
});

// Get single concept with full context
app.get('/api/curriculum/concept/:id', (req, res) => {
  const concept = storage.getConcept(req.params.id);
  if (!concept) {
    return res.status(404).json({ error: 'Concept not found' });
  }
  const mastery = storage.getMastery(concept.id);
  const questions = storage.getQuestions(concept.id);
  const attempts = storage.getAttempts(concept.id);
  res.json({ concept, mastery, questions, attempts });
});

// Get curriculum & mastery progress metrics
app.get('/api/curriculum/metrics', (req, res) => {
  const subjectId = req.query.subjectId as string | undefined;
  const metrics = masteryService.getCurriculumMetrics(subjectId);
  res.json(metrics);
});

// Process pasted text notes into curriculum
app.post('/api/curriculum/import-text', async (req, res) => {
  storage.startBatch();
  try {
    const { subjectId, subjectName, notesText, sourceTitle } = req.body;
    if (!notesText || notesText.trim().length < 20) {
      storage.endBatch();
      return res.status(400).json({ error: 'Notes content is too short to process.' });
    }

    let targetSubject: Subject | undefined;
    if (subjectName && subjectName.trim()) {
      const trimmed = subjectName.trim();
      targetSubject = storage.getSubjects().find(s => s.name.toLowerCase() === trimmed.toLowerCase());
      if (!targetSubject) {
        targetSubject = {
          id: `sub-${Date.now()}`,
          name: trimmed,
          description: `Imported school notes for ${trimmed}`,
          createdAt: new Date().toISOString(),
        };
        storage.addSubject(targetSubject);
      }
    } else if (subjectId && subjectId !== 'new') {
      targetSubject = storage.getSubject(subjectId);
    }

    if (!targetSubject) {
      const fallbackName = sourceTitle?.trim() || 'General Coursework';
      targetSubject = {
        id: `sub-${Date.now()}`,
        name: fallbackName,
        description: `Imported notes for ${fallbackName}`,
        createdAt: new Date().toISOString(),
      };
      storage.addSubject(targetSubject);
    }

    const targetSubjectId = targetSubject.id;

    const docId = `doc-${Date.now()}`;
    const docTitle = sourceTitle || `${targetSubject.name} Notes`;
    storage.addDocument({
      id: docId,
      subjectId: targetSubjectId,
      title: docTitle,
      filename: `${docTitle.replace(/\s+/g, '_')}.txt`,
      uploadDate: new Date().toISOString(),
      previewText: notesText.slice(0, 300),
    });

    // Compile into curriculum hierarchy via AI / deterministic parser
    const extracted = await aiProvider.extractCurriculum(targetSubject.name, notesText);

    if (extracted.inferredSubject && (!sourceTitle || targetSubject.name === 'General Coursework')) {
      targetSubject.name = extracted.inferredSubject;
    }

    let conceptsAdded = 0;
    for (const [topicIndex, t] of extracted.topics.entries()) {
      const topicId = `top-${Date.now()}-${topicIndex}`;
      const newTopic: Topic = {
        id: topicId,
        subjectId: targetSubjectId,
        title: t.title,
        order: storage.getTopics(targetSubjectId).length + 1,
        description: t.description,
      };
      storage.addTopic(newTopic);

      for (const [conceptIndex, c] of t.concepts.entries()) {
        const conceptId = `c-${Date.now()}-${topicIndex}-${conceptIndex}`;
        const newConcept: Concept = {
          id: conceptId,
          topicId: topicId,
          subjectId: targetSubjectId,
          name: c.name,
          subtopicTitle: c.subtopicTitle || '',
          topicTitle: t.title,
          subjectName: targetSubject.name,
          explanation: c.explanation,
          definitions: c.definitions || [],
          formulas: c.formulas || [],
          keyFacts: c.keyFacts || [],
          examples: c.examples || [],
          sourceDocument: docTitle,
          sourcePage: c.sourcePage || 1,
          order: conceptIndex + 1,
          prerequisiteConceptIds: [],
          prerequisiteNames: (c as any).prerequisites || [],
        };
        storage.addConcept(newConcept);
        conceptsAdded++;

        // Add sample questions if provided
        if (c.sampleQuestions && Array.isArray(c.sampleQuestions)) {
          for (const [qIdx, q] of c.sampleQuestions.entries()) {
            const newQ: Question = {
              id: `q-${conceptId}-${qIdx}`,
              conceptId,
              subjectId: targetSubjectId,
              topicId,
              subtopicTitle: c.subtopicTitle || '',
              category: (q.category as any) || 'RECALL',
              type: q.type || 'MULTIPLE_CHOICE',
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              tolerance: q.tolerance,
              explanation: q.explanation || 'Verified with school notes.',
              sourceDocument: docTitle,
              sourcePage: c.sourcePage || 1,
            };
            storage.addQuestion(newQ);
          }
        }
      }
    }

    res.json({
      success: true,
      subjectId: targetSubjectId,
      topicsCount: extracted.topics.length,
      conceptsCount: conceptsAdded,
    });
  } catch (err: any) {
    console.error('Error importing text notes:', err);
    res.status(500).json({ error: err.message || 'Failed to process notes.' });
  } finally {
    storage.endBatch();
  }
});

// PDF Upload Endpoint with direct Gemini Multimodal processing
app.post('/api/curriculum/upload-pdf', upload.single('pdf'), async (req, res) => {
  storage.startBatch();
  try {
    if (!req.file) {
      storage.endBatch();
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const { subjectId, subjectName } = req.body;
    let targetSubject: Subject | undefined;

    if (subjectName && subjectName.trim()) {
      const trimmed = subjectName.trim();
      targetSubject = storage.getSubjects().find(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (!targetSubject) {
        targetSubject = {
          id: `sub-${Date.now()}`,
          name: trimmed,
          description: `Imported from ${req.file.originalname}`,
          createdAt: new Date().toISOString(),
        };
        storage.addSubject(targetSubject);
      }
    } else if (subjectId && subjectId !== 'new') {
      targetSubject = storage.getSubject(subjectId);
    }

    if (!targetSubject) {
      let inferred = req.file.originalname.replace(/\.[a-zA-Z0-9]+$/i, '').replace(/[-_]/g, ' ').trim();
      // Capitalize inferred words nicely
      inferred = inferred
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      targetSubject = {
        id: `sub-${Date.now()}`,
        name: inferred || 'Uploaded Course Notes',
        description: `Curriculum extracted from ${req.file.originalname}`,
        createdAt: new Date().toISOString(),
      };
      storage.addSubject(targetSubject);
    }

    const targetSubjectId = targetSubject.id;

    // Extract text safely using universal PDF parser with page numbering
    let extractedText = '';
    try {
      const pdfData = await extractTextFromPdfBuffer(req.file.buffer);
      extractedText = pdfData.text || '';
    } catch (parseErr) {
      console.warn('extractTextFromPdfBuffer failed, proceeding to multimodal fallback:', parseErr);
    }

    // Clean up extracted text and strictly exclude raw binary PDF stream gibberish
    if (extractedText) {
      extractedText = extractedText.replace(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g, ' ').trim();
      if (extractedText.startsWith('%PDF') || extractedText.includes('/Filter/FlateDecode')) {
        extractedText = '';
      }
    }

    const docId = `doc-${Date.now()}`;
    storage.addDocument({
      id: docId,
      subjectId: targetSubjectId,
      title: req.file.originalname.replace(/\.pdf$/i, ''),
      filename: req.file.originalname,
      uploadDate: new Date().toISOString(),
      previewText: extractedText ? extractedText.slice(0, 400) : `School Syllabus PDF: ${req.file.originalname}`,
    });

    // Pass the actual PDF buffer directly to Gemini so it reads formulas, structure, and text reliably
    const extracted = await aiProvider.extractCurriculum(
      targetSubject.name,
      extractedText,
      req.file.buffer
    );

    if (extracted.inferredSubject && (!req.body.subjectName || targetSubject.name === 'Uploaded Course Notes')) {
      targetSubject.name = extracted.inferredSubject;
    }

    let conceptsAdded = 0;
    for (const [topicIndex, t] of extracted.topics.entries()) {
      const topicId = `top-${Date.now()}-${topicIndex}`;
      const newTopic: Topic = {
        id: topicId,
        subjectId: targetSubjectId,
        title: t.title,
        order: storage.getTopics(targetSubjectId).length + 1,
        description: t.description,
      };
      storage.addTopic(newTopic);

      for (const [conceptIndex, c] of t.concepts.entries()) {
        const conceptId = `c-${Date.now()}-${topicIndex}-${conceptIndex}`;
        const newConcept: Concept = {
          id: conceptId,
          topicId: topicId,
          subjectId: targetSubjectId,
          name: c.name,
          subtopicTitle: c.subtopicTitle || '',
          topicTitle: t.title,
          subjectName: targetSubject.name,
          explanation: c.explanation,
          definitions: c.definitions || [],
          formulas: c.formulas || [],
          keyFacts: c.keyFacts || [],
          examples: c.examples || [],
          sourceDocument: req.file.originalname,
          sourcePage: c.sourcePage || 1,
          order: conceptIndex + 1,
          prerequisiteConceptIds: [],
          prerequisiteNames: (c as any).prerequisites || [],
        };
        storage.addConcept(newConcept);
        conceptsAdded++;

        if (c.sampleQuestions && Array.isArray(c.sampleQuestions)) {
          for (const [qIdx, q] of c.sampleQuestions.entries()) {
            const newQ: Question = {
              id: `q-${conceptId}-${qIdx}`,
              conceptId,
              subjectId: targetSubjectId,
              topicId,
              subtopicTitle: c.subtopicTitle || '',
              category: (q.category as any) || 'RECALL',
              type: q.type || 'MULTIPLE_CHOICE',
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              tolerance: q.tolerance,
              explanation: q.explanation || 'Directly aligned with notes.',
              sourceDocument: req.file.originalname,
              sourcePage: c.sourcePage || 1,
            };
            storage.addQuestion(newQ);
          }
        }
      }
    }

    res.json({
      success: true,
      subjectId: targetSubjectId,
      filename: req.file.originalname,
      topicsCount: extracted.topics.length,
      conceptsCount: conceptsAdded,
    });
  } catch (err: any) {
    console.error('PDF upload error:', err);
    res.status(500).json({ error: err.message || 'Error processing uploaded PDF.' });
  } finally {
    storage.endBatch();
  }
});

// Subject Creation & Management Endpoints
app.post('/api/curriculum/subjects', (req, res) => {
  try {
    const { name, description, code } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Subject name is required.' });
    }
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || `Course curriculum for ${name.trim()}`,
      code: code?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    storage.addSubject(newSubject);
    res.json(newSubject);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create subject.' });
  }
});

app.delete('/api/curriculum/subjects/:id', (req, res) => {
  try {
    storage.deleteSubject(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/curriculum/concepts/:id', (req, res) => {
  try {
    storage.deleteConcept(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/curriculum/topics/:id', (req, res) => {
  try {
    storage.deleteTopic(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/curriculum/documents', (req, res) => {
  const subjectId = req.query.subjectId as string | undefined;
  res.json(storage.getDocuments(subjectId).map(({ extractedText, ...doc }) => doc));
});

app.delete('/api/curriculum/documents/:id', (req, res) => {
  try {
    storage.deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/mistakes/:id', (req, res) => {
  try {
    storage.deleteMistake(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/curriculum/clear-all', (req, res) => {
  try {
    storage.clearAll();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start an adaptive flexible lesson session
app.post('/api/learn/lesson/start', async (req, res) => {
  try {
    const { conceptId, sessionId } = req.body;
    if (!conceptId) {
      return res.status(400).json({ error: 'conceptId is required.' });
    }
    const session = await flexibleLessonEngine.startSession(conceptId, sessionId);
    storage.saveSession(session);
    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start lesson session.' });
  }
});

// Process a student response in the flexible lesson loop
app.post('/api/learn/lesson/respond', async (req, res) => {
  try {
    const { sessionId, studentAnswer } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }
    const result = await flexibleLessonEngine.processResponse(sessionId, studentAnswer);
    if (result?.session) storage.saveSession(result.session);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process lesson response.' });
  }
});

// Get session state
app.get('/api/learn/lesson/session/:sessionId', (req, res) => {
  const session = flexibleLessonEngine.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Lesson session not found.' });
  }
  res.json(session);
});

// Explain concept differently endpoint
app.post('/api/learn/lesson/explain-differently', async (req, res) => {
  try {
    const { conceptId } = req.body;
    if (!conceptId) {
      return res.status(400).json({ error: 'conceptId is required.' });
    }
    const concept = storage.getConcept(conceptId);
    if (!concept) {
      return res.status(404).json({ error: 'Concept not found.' });
    }
    const docs = storage.getDocuments().filter((d) => d.subjectId === concept.subjectId);
    const sourceText = docs.map((d) => d.extractedText).join('\n\n').slice(0, 3000) || concept.explanation;

    const altExplanation = await aiProvider.generateAlternativeExplanation(concept, sourceText);
    res.json({ alternativeExplanation: altExplanation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate alternative explanation.' });
  }
});

// Supabase Database Sync Status
app.get('/api/storage/supabase-status', (req, res) => {
  res.json(storage.getSupabaseStatus());
});

// Run Three-Student Benchmark simulation for verification
app.post('/api/learn/simulate-benchmark', async (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DIAGNOSTICS !== 'true') {
    return res.status(404).json({ error: 'Diagnostics are disabled on this deployment.' });
  }
  try {
    const { conceptId, profile } = req.body;
    if (!conceptId) {
      return res.status(400).json({ error: 'conceptId is required.' });
    }
    const prof = profile || 'STUDENT_A';
    const result = await flexibleLessonEngine.simulateBenchmark(conceptId, prof);
    res.json(result);
  } catch (err: any) {
    console.error('Benchmark simulation error:', err);
    res.status(500).json({ error: err.message || 'Simulation failed.' });
  }
});

// Fetch/start flexible lesson for concept
app.get('/api/learn/lesson/:conceptId', async (req, res) => {
  try {
    const concept = storage.getConcept(req.params.conceptId);
    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    const session = await flexibleLessonEngine.startSession(concept.id);
    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start lesson.' });
  }
});

// Submit answer attempt
app.post('/api/learn/submit-attempt', async (req, res) => {
  try {
    const { questionId, studentAnswer, conceptId } = req.body;
    let question = storage.getQuestion(questionId);
    const concept = storage.getConcept(conceptId || (question ? question.conceptId : ''));

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found.' });
    }

    if (!question) {
      // Fallback question if not registered
      question = {
        id: questionId || `q-temp-${Date.now()}`,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        topicId: concept.topicId,
        category: 'APPLICATION',
        type: 'OPEN_EXPLANATION',
        questionText: `Evaluation for ${concept.name}`,
        correctAnswer: concept.definitions[0] || concept.explanation,
        explanation: concept.explanation,
      };
    }

    let isCorrect = false;
    let score = 0;
    let feedback = '';
    let mistakeRecord = null;

    // 1. DETERMINISTIC MARKING FOR MCQs & NUMERICAL
    if (question.type === 'MULTIPLE_CHOICE') {
      const studentClean = (studentAnswer || '').trim().toLowerCase();
      const correctClean = (question.correctAnswer || '').trim().toLowerCase();
      isCorrect = studentClean === correctClean;
      score = isCorrect ? 1.0 : 0.0;
      feedback = isCorrect
        ? `Correct. ${question.explanation}`
        : `Incorrect. Expected: "${question.correctAnswer}". ${question.explanation}`;
    } else if (question.type === 'NUMERICAL') {
      const numMatch = numericMatches(studentAnswer, question.correctAnswer, question.tolerance);

      if (numMatch !== null) {
        isCorrect = numMatch;
        score = isCorrect ? 1.0 : 0.0;
        feedback = isCorrect
          ? `Correct calculation. Yields ${question.correctAnswer} ${question.units || ''}.`
          : `Calculation error. Your answer ${studentAnswer} differed from expected ${question.correctAnswer} ${question.units || ''}.`;
      } else {
        isCorrect = false;
        score = 0.0;
        feedback = 'Please provide a valid numerical value.';
      }
    } else {
      // 2. OPEN EXPLANATION (Grounded AI evaluation)
      const evaluation = await aiProvider.evaluateOpenAnswer(question, studentAnswer, concept);
      isCorrect = evaluation.isCorrect;
      score = evaluation.score;
      feedback = evaluation.feedback;
    }

    // 3. DETERMINISTIC MASTERY UPDATE
    const updatedMastery = masteryService.updateMasteryOnAttempt(
      concept.id,
      isCorrect,
      question.category,
      score
    );

    // 4. MISTAKE BANK INTEGRATION
    if (!isCorrect) {
      mistakeRecord = await mistakeService.recordMistake(
        question,
        concept,
        studentAnswer
      );
    } else {
      // Check if there was an unresolved mistake on this concept and increment resolution count
      const openMistakes = storage.getMistakes(false).filter((m) => m.conceptId === concept.id);
      for (const m of openMistakes) {
        storage.incrementMistakeAttempt(m.id, true);
      }
    }

    // Record raw attempt
    storage.recordAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: question.id,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      studentAnswer,
      isCorrect,
      score,
      feedback,
      timestamp: new Date().toISOString(),
    });

    res.json({
      isCorrect,
      score,
      feedback,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      mastery: updatedMastery,
      mistakeRecord,
    });
  } catch (err: any) {
    console.error('Error submitting attempt:', err);
    res.status(500).json({ error: err.message || 'Error processing attempt.' });
  }
});

// Review queue
app.get('/api/review/queue', (req, res) => {
  const subjectId = req.query.subjectId as string | undefined;
  const due = masteryService.getDueReviews(subjectId);
  res.json(due);
});

// Mistake Bank
app.get('/api/mistakes', (req, res) => {
  const resolvedQuery = req.query.resolved as string | undefined;
  const resolved = resolvedQuery === 'true' ? true : resolvedQuery === 'false' ? false : undefined;
  const subjectId = req.query.subjectId as string | undefined;

  let mistakes = storage.getMistakes(resolved);
  if (subjectId) {
    mistakes = mistakes.filter((m) => m.subjectId === subjectId);
  }
  const stats = mistakeService.getMistakeStats(subjectId);
  res.json({ mistakes, stats });
});

app.post('/api/mistakes/:id/resolve', (req, res) => {
  storage.resolveMistake(req.params.id);
  res.json({ success: true });
});

// Daily Planner
app.get('/api/planner/today', (req, res) => {
  const minutes = parseInt(req.query.targetMinutes as string) || storage.getSettings().targetStudyMinutesPerDay || 90;
  const rawDate = req.query.date as string | undefined;
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : undefined;
  res.json(plannerService.generateDailyPlan(minutes, date));
});

app.post('/api/planner/toggle-item', (req, res) => {
  const { date, itemId } = req.body || {};
  if (!itemId) return res.status(400).json({ error: 'itemId is required.' });
  const targetDate = date || new Date().toISOString().split('T')[0];
  storage.togglePlanItem(targetDate, itemId);
  res.json(storage.getDailyPlan(targetDate));
});

// Tests & Mock Exams
app.post('/api/tests/generate', async (req, res) => {
  try {
    const { subjectId, type, topicId } = req.body;
    let concepts = [];

    if (type === 'CUMULATIVE_TEST') {
      const allConceptsInSubject = storage.getConcepts(undefined, subjectId);
      const allMastery = storage.getAllMastery();
      const covered = allConceptsInSubject.filter(
        (c) => allMastery[c.id] && allMastery[c.id].status !== 'UNLEARNED' && allMastery[c.id].totalAttempts > 0
      );

      if (covered.length === 0) {
        return res.status(400).json({
          error: "No covered topics found! Go to the 'Learn' tab to study some concepts first before generating a Cumulative Test."
        });
      }
      concepts = covered;
    } else if (type === 'TOPIC_TEST') {
      const topic = storage.getTopics(subjectId).find((t) => t.id === topicId);
      if (!topic) {
        return res.status(400).json({ error: 'That topic does not belong to the selected subject.' });
      }
      concepts = storage.getConcepts(topicId, subjectId);
    } else {
      // MOCK_EXAM covers the full curriculum
      concepts = storage.getConcepts(undefined, subjectId);
    }

    if (concepts.length === 0) {
      return res.status(400).json({ error: 'There are no concepts to test in this selection yet.' });
    }

    // Shuffle and pick 5 to 10 concepts to generate fresh AI test questions for
    const shuffledConcepts = [...concepts].sort(() => 0.5 - Math.random());
    const selectedConcepts = shuffledConcepts.slice(0, Math.max(5, Math.min(10, shuffledConcepts.length)));

    const generatedQuestions: any[] = [];
    await Promise.all(selectedConcepts.map(async (concept, idx) => {
      const category = idx % 2 === 0 ? 'RECALL' : 'APPLICATION';
      const difficulty = idx === 0 ? 'EASY' : idx < 3 ? 'MEDIUM' : 'HARD';

      let qPayload;
      try {
        qPayload = await aiProvider.generateQuestion(concept, category, difficulty);
      } catch {
        qPayload = generateSubjectAwareFallbackQuestion(concept, category, difficulty);
      }

      const qId = `test-q-${Date.now()}-${idx}`;
      const question: Question = {
        id: qId,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        topicId: concept.topicId,
        category: qPayload.category || category,
        type: qPayload.type || 'MULTIPLE_CHOICE',
        questionText: qPayload.questionText,
        options: qPayload.options,
        correctAnswer: qPayload.correctAnswer,
        explanation: qPayload.explanation,
        distractorDiagnoses: qPayload.distractorDiagnoses,
        sourcePage: concept.sourcePage || 1,
      };

      storage.addQuestion(question);
      generatedQuestions[idx] = ({
        id: question.id,
        conceptId: question.conceptId,
        subjectId: question.subjectId,
        topicId: question.topicId,
        category: question.category,
        type: question.type,
        questionText: question.questionText,
        options: question.options,
        units: question.units,
        sourcePage: question.sourcePage,
      });
    }));

    res.json({
      testId: `test-${Date.now()}`,
      type: type || 'TOPIC_TEST',
      subjectId: subjectId || selectedConcepts[0]?.subjectId || 'sub-general',
      questions: generatedQuestions,
    });
  } catch (err: any) {
    console.error('Error generating dynamic test:', err);
    res.status(500).json({ error: err.message || 'Failed to generate test.' });
  }
});

app.post('/api/tests/submit', async (req, res) => {
  try {
    const { testId, subjectId, type, answers, durationMinutes } = req.body || {};
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'No answers were submitted.' });
    }
    if (testId) {
      const already = storage.getTestRecords().find((r) => r.id === testId);
      if (already) return res.json(already);
    }
    const qMap = new Map(storage.getQuestions().map((q) => [q.id, q]));

    // Grade first (open answers may need the AI evaluator, so do them in parallel).
    const graded = (
      await Promise.all(
        answers.map(async (ans: any) => {
          const q = qMap.get(ans?.questionId);
          if (!q) return null;
          const student = String(ans.studentAnswer ?? '');
          const concept = storage.getConcept(q.conceptId);
          let isCorrect = false;
          if (student.trim()) {
            if (q.type === 'MULTIPLE_CHOICE') {
              isCorrect = student.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            } else if (q.type === 'NUMERICAL') {
              isCorrect = numericMatches(student, q.correctAnswer, q.tolerance) === true;
            } else {
              try {
                if (!concept) throw new Error('no concept');
                isCorrect = Boolean((await aiProvider.evaluateOpenAnswer(q, student, concept)).isCorrect);
              } catch {
                isCorrect = keywordOverlap(student, q.correctAnswer, q.explanation) >= 0.4;
              }
            }
          }
          return { q, concept, student, isCorrect };
        })
      )
    ).filter(Boolean) as { q: Question; concept: Concept | undefined; student: string; isCorrect: boolean }[];

    if (graded.length === 0) {
      return res.status(400).json({ error: 'None of the submitted questions were recognised.' });
    }

    let correctCount = 0;
    const strongConcepts = new Set<string>();
    const weakConcepts = new Set<string>();
    const mistakeBreakdown: Record<string, number> = {};

    for (const { q, concept, student, isCorrect } of graded) {
      if (isCorrect) correctCount++;
      if (!concept) continue;
      if (isCorrect) {
        strongConcepts.add(concept.name);
        masteryService.updateMasteryOnAttempt(concept.id, true, q.category);
      } else {
        weakConcepts.add(concept.name);
        // A blank answer is marked wrong but is not evidence of a specific mistake.
        if (student.trim()) {
          masteryService.updateMasteryOnAttempt(concept.id, false, q.category);
          const mistake = await mistakeService.recordMistake(q, concept, student);
          mistakeBreakdown[mistake.mistakeType] = (mistakeBreakdown[mistake.mistakeType] || 0) + 1;
        }
      }
    }

    const totalQuestions = graded.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const kind = type === 'MOCK_EXAM' ? 'Mock exam' : type === 'CUMULATIVE_TEST' ? 'Cumulative test' : 'Topic test';
    const subjectName = storage.getSubject(subjectId)?.name;
    const testRecord: TestRecord = {
      id: testId || `test-${Date.now()}`,
      title: subjectName ? `${kind}: ${subjectName}` : kind,
      subjectId: subjectId || storage.getSubjects()[0]?.id || '',
      type: type || 'TOPIC_TEST',
      totalQuestions,
      correctCount,
      scorePercentage,
      completedAt: new Date().toISOString(),
      durationMinutes: Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0 ? Math.round(Number(durationMinutes)) : 0,
      strongConcepts: Array.from(strongConcepts),
      weakConcepts: Array.from(weakConcepts),
      mistakeBreakdown,
    };

    storage.recordTest(testRecord);
    res.json(testRecord);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error grading test.' });
  }
});

app.get('/api/tests/history', (req, res) => {
  res.json(storage.getTestRecords());
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
// This file only defines the Express app. It never imports vite or calls
// app.listen(), so Vercel's function bundler (which statically traces every
// reachable import) never pulls dev-only tooling into the serverless bundle.
// Local dev runs dev.ts; self-hosted production runs start.ts.
export default app;
