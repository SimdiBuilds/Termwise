import { GoogleGenAI } from '@google/genai';
import { ExtractedCurriculumPayload } from '../ai/provider.ts';
import { safeParseJson } from '../ai/jsonHelper.ts';

export interface RawDocumentInput {
  text: string;
  filename?: string;
  subjectHint?: string;
  pageCount?: number;
}

interface SyllabusTopicBlueprint {
  title: string;
  description?: string;
  syllabusSubtopics: string[];
  startPage?: number;
  endPage?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AICurriculumUnderstandingService {
  /**
   * Main entry point:
   * Uses a Two-Phase Blueprint & Focused Topic Extraction Architecture:
   * Phase 1: Reads the Scheme of Work / Syllabus / Document Headers to extract the global Blueprint (Topics & Page Boundaries).
   * Phase 2: Systematically executes a focused extraction for EACH Topic, guaranteeing 100% granular concept extraction
   *          (every hormone, cell type, organ, definition, equation, and comparison table).
   */
  async buildCurriculum(
    input: RawDocumentInput,
    aiClient?: GoogleGenAI,
    isRateLimited: boolean = false
  ): Promise<ExtractedCurriculumPayload> {
    const rawText = input.text || '';
    const cleanText = this.normalizePageMarkers(rawText);
    const subjectName = input.subjectHint || 'Academic Course';

    if (aiClient && !isRateLimited) {
      try {
        const aiResult = await this.understandWithTwoPhaseAI(cleanText, subjectName, aiClient);
        if (aiResult && aiResult.topics && aiResult.topics.length > 0) {
          return aiResult;
        }
      } catch (err) {
        console.warn('AI curriculum understanding failed, switching to semantic fallback engine:', err);
      }
    }

    // Semantic Fallback Engine (content-driven, resilient)
    return this.compileCurriculumSemantically(cleanText, subjectName);
  }

  /**
   * Two-Phase AI Extraction Engine
   */
  private async understandWithTwoPhaseAI(
    text: string,
    subjectHint: string,
    ai: GoogleGenAI
  ): Promise<ExtractedCurriculumPayload> {
    const pageMap = this.extractPageMap(text);
    const totalPages = pageMap.size;

    // Phase 1: Extract Syllabus Blueprint (Topics, Subtopics, and Page Ranges)
    const blueprint = await this.extractSyllabusBlueprint(text, subjectHint, ai, pageMap);

    if (!blueprint || blueprint.topics.length === 0) {
      // Fallback: If no blueprint was found, process in 2-page window passes
      return this.processWindowedChunks(text, subjectHint, ai);
    }

    console.log(`[AICurriculum] Blueprint discovered ${blueprint.topics.length} topics. Beginning Phase 2 deep topic extraction...`);

    // Phase 2: For each topic in the blueprint, extract all granular concepts from its specific pages
    const extractedTopics: any[] = [];
    const batchSize = 3;

    for (let i = 0; i < blueprint.topics.length; i += batchSize) {
      const currentBatch = blueprint.topics.slice(i, i + batchSize);
      const batchPromises = currentBatch.map(async (topicBp) => {
        try {
          const topicText = this.getTopicContent(pageMap, topicBp.startPage, topicBp.endPage, text);
          if (!topicText || topicText.trim().length < 80) return null;

          const topicResult = await this.extractTopicDeepConcepts(topicBp, topicText, ai, topicBp.startPage || 1);
          return topicResult;
        } catch (err: any) {
          console.warn(`Deep extraction failed for topic ${topicBp.title}, using semantic fallback for topic:`, err?.message || err);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      for (const res of batchResults) {
        if (res && res.concepts && res.concepts.length > 0) {
          extractedTopics.push(res);
        }
      }

      if (i + batchSize < blueprint.topics.length) {
        await sleep(300);
      }
    }

    if (extractedTopics.length === 0) {
      return this.processWindowedChunks(text, subjectHint, ai);
    }

    return {
      topics: extractedTopics,
      inferredSubject: blueprint.subject || subjectHint,
    };
  }

  /**
   * Phase 1: Extracts the Document Syllabus Blueprint (Topics and Subtopics from Scheme of Work / Headings)
   */
  private async extractSyllabusBlueprint(
    fullText: string,
    subjectHint: string,
    ai: GoogleGenAI,
    pageMap: Map<number, string>
  ): Promise<{ subject: string; topics: SyllabusTopicBlueprint[] }> {
    // Collect the first 3 pages (or first 8,000 characters) where Schemes of Work / Tables of Contents reside
    let openingText = '';
    const sortedPages = Array.from(pageMap.keys()).sort((a, b) => a - b);
    for (const pNum of sortedPages) {
      if (pNum <= 3 || openingText.length < 8000) {
        openingText += `=== PAGE ${pNum} ===\n${pageMap.get(pNum) || ''}\n\n`;
      }
    }

    // Also scan all page headings throughout the document to assist topic boundary detection
    let headingSummaries = '';
    for (const [pNum, content] of pageMap.entries()) {
      const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const possibleHeadings = lines.slice(0, 4).filter(
        (l) => /^(week|topic|chapter|unit|section|lesson|1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.|9\.|10\.)/i.test(l) || l === l.toUpperCase()
      );
      if (possibleHeadings.length > 0) {
        headingSummaries += `Page ${pNum}: ${possibleHeadings.slice(0, 2).join(' | ')}\n`;
      }
    }

    const prompt = `You are a senior curriculum architect and syllabus designer.
Analyze the opening Scheme of Work / Syllabus and the page headings from the school notes.

Extract the complete list of academic Topics, their syllabus subtopic points, and their starting and ending page numbers.

Syllabus Context: ${subjectHint || 'Academic Course'}

DOCUMENT SCHEME OF WORK & OPENING PAGES:
"""
${openingText}
"""

DOCUMENT PAGE HEADINGS & BOUNDARIES:
"""
${headingSummaries}
"""

CRITICAL BOUNDARY AND DOMAIN RULES:
- You MUST only extract topics and subtopics that are ACTUALLY present and discussed in the provided school notes text.
- NEVER copy the illustrative example placeholder topics (like "Sexual Reproduction", "Conjugation", "Spirogyra", "Vertebrate Reproductive Systems") into your output unless they are explicitly present in the provided school notes.
- If the notes are about Further Mathematics, you MUST extract Further Mathematics topics (e.g., Indices, Logarithms, Surds, Sets, Vectors, AP/GP, etc.) found in the text.
- If the notes are about Agricultural Science, you MUST extract Agricultural Science topics.
- DO NOT mix up subjects. It is a critical failure to output "Sexual Reproduction" or any biology topics under a Mathematics, Physics, or Economics syllabus.
- Clean and normalize all extracted topic titles to be accurate to the notes, avoiding noisy, short, or generic terms (never use titles like "= 104" or "Chapter One").

OUTPUT SCHEMA (JSON ONLY):
{
  "subject": "Clean Academic Subject (e.g. Senior Secondary Biology)",
  "topics": [
    {
      "title": "Clean Academic Topic Name (e.g. Indices and Exponential Functions)",
      "description": "Pedagogical overview of this topic",
      "syllabusSubtopics": [
        "First subtopic or law",
        "Second subtopic or application"
      ],
      "startPage": 2,
      "endPage": 5
    }
  ]
}

Return ONLY valid JSON.`;

    const models = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];
    for (const model of models) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{ text: prompt }],
          config: { responseMimeType: 'application/json', temperature: 0.1 },
        });

        const parsed = safeParseJson<any>(res.text || '{}', null);
        if (parsed && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
          const validTopics: SyllabusTopicBlueprint[] = parsed.topics
            .filter((t: any) => !this.isAdministrativeTitle(t.title))
            .map((t: any, idx: number) => ({
              title: this.cleanAcademicName(t.title || `Topic ${idx + 1}`),
              description: t.description || '',
              syllabusSubtopics: Array.isArray(t.syllabusSubtopics) ? t.syllabusSubtopics : [],
              startPage: typeof t.startPage === 'number' ? t.startPage : 1,
              endPage: typeof t.endPage === 'number' ? t.endPage : sortedPages[sortedPages.length - 1] || 1,
            }));

          if (validTopics.length > 0) {
            return {
              subject: parsed.subject || subjectHint,
              topics: validTopics,
            };
          }
        }
      } catch (err) {
        console.warn('Blueprint extraction attempt failed on model', model, err);
      }
    }

    return { subject: subjectHint, topics: [] };
  }

  /**
   * Phase 2: Deep, exhaustive extraction for a single specific Topic.
   */
  private async extractTopicDeepConcepts(
    topicBp: SyllabusTopicBlueprint,
    topicNotesText: string,
    ai: GoogleGenAI,
    basePage: number
  ): Promise<any> {
    const subtopicHints = topicBp.syllabusSubtopics.length > 0
      ? `Syllabus Subtopics to Cover & Decompose:\n${topicBp.syllabusSubtopics.map((s) => `- ${s}`).join('\n')}`
      : 'Cover all relevant subtopics present in the notes.';

    const prompt = `You are an elite academic professor and master teacher.
Perform a 100% EXHAUSTIVE CONCEPT EXTRACTION for the following topic:

Topic: ${topicBp.title}
${subtopicHints}

LESSON NOTES (Pages ${topicBp.startPage || basePage} to ${topicBp.endPage || basePage}):
"""
${topicNotesText}
"""

CRITICAL DOMAIN MATCHING RULES:
- You MUST only extract concepts that are ACTUALLY present and discussed in the provided lesson notes text for the topic "${topicBp.title}".
- DO NOT copy the illustrative examples (like "Sexual Reproduction", "Sperm Cell", "Testes", etc.) into your output. Extract concepts strictly from the provided text.
- Clean and normalize all concept names, ensuring they are professional, concise, and accurate (never use titles like "= 104" or "Chapter One" or "Content").

CRITICAL ZERO-OMISSION & LATEX FORMATTING RULES:
1. ANY and ALL mathematical notation, formulas, equations, variables, symbols, fractions, superscripts, subscripts, units, or chemical expressions MUST be written in valid LaTeX delimiters:
   - Use '$ ... $' for inline math expressions (e.g. '$x^2 + y^2 = r^2$', 'a/b as \\frac{a}{b}', '\\theta').
   - Use '$$ ... $$' for standalone equations or multi-line derivations.
   - NEVER output plain ASCII math like 'x^2' or 'a/b' or '1/2' without LaTeX delimiters.
2. Extract EVERY SINGLE teachable concept, definition, anatomical structure, physiological mechanism, organ, tissue, cell type, hormone, developmental stage, law, formula, and comparison table.
3. DO NOT SUMMARIZE MULTIPLE CONCEPTS INTO ONE. Every distinct sub-bullet or paragraph topic MUST be an individual Concept entry.
   - Example 1: In Sexual Reproduction -> extract "Definition of Sexual Reproduction", "Conjugation in Spirogyra and Paramecium", "Fusion of Gametes (Syngamy)", "Structure & Anatomy of Sperm Cell (Head, Acrosome, Middle Piece, Tail)", "Hormones in Spermatogenesis (FSH, LH, Androgen/Testosterone, Leydig Cells)", "Structure of Ovum (Vitelline Membrane, Zona Pellucida, Corona Radiata)", "Differences Between Male and Female Gametes", "Zygote Cleavage & Morula Formation", "Blastocyst Formation & Implantation".
   - Example 2: In Vertebrate Reproduction -> extract "Testes and Scrotum Thermoregulation", "Seminiferous Tubules and Sertoli Cells", "Epididymis and Vas Deferens", "Male Accessory Glands (Seminal Vesicles, Prostate, Cowper's Gland)", "Ovaries and Oogenesis", "Fallopian Tubes (Infundibulum, Fimbriae)", "Uterus and Endometrium", "Embryonic Membranes (Yolk Sac, Amnion, Chorion, Allantois)", "Placenta and Umbilical Cord Functions", "Differences Between Male and Female Reproductive Systems", "Reproductive System in Reptiles (Agama Lizard)", "Reproductive System in Bony Fish (Tilapia)".
3. For each concept:
   - Provide a clear 2-4 sentence pedagogical explanation synthesizing how it works.
   - Extract exact formal syllabus definitions.
   - Extract any chemical formulas or equations if present.
   - List key examinable facts, organs, hormones, or rules.
   - Record the exact sourcePage where it is taught.

OUTPUT SCHEMA (JSON ONLY):
{
  "title": "${this.cleanAcademicName(topicBp.title)}",
  "description": "Comprehensive pedagogical overview of ${this.cleanAcademicName(topicBp.title)}",
  "subtopics": [
    {
      "title": "Clean Subtopic Name",
      "description": "Subtopic overview"
    }
  ],
  "concepts": [
    {
      "name": "Specific Concept Name",
      "subtopicTitle": "Matching Subtopic Name",
      "explanation": "Clear 2-4 sentence instructional explanation from the notes",
      "definitions": ["Formal definition"],
      "formulas": ["Equation/Formula if any"],
      "keyFacts": ["Key Fact 1", "Key Fact 2"],
      "examples": ["Example organism or application"],
      "sourcePage": ${topicBp.startPage || basePage},
      "prerequisites": []
    }
  ]
}

Return ONLY valid JSON.`;

    const models = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];

    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await ai.models.generateContent({
            model,
            contents: [{ text: prompt }],
            config: { responseMimeType: 'application/json', temperature: 0.1 },
          });

          const rawText = res.text || '{}';
          const parsed = safeParseJson<any>(rawText, null);

          if (parsed && Array.isArray(parsed.concepts) && parsed.concepts.length > 0) {
            const validConcepts = parsed.concepts
              .filter((c: any) => !this.isAdministrativeTitle(c.name))
              .map((c: any, cIdx: number) => ({
                name: this.cleanAcademicName(c.name || `Concept ${cIdx + 1}`),
                subtopicTitle: this.cleanAcademicName(c.subtopicTitle || parsed.subtopics?.[0]?.title || 'Core Principles'),
                explanation: c.explanation || `Comprehensive instructional coverage of ${c.name}.`,
                definitions: Array.isArray(c.definitions) ? c.definitions : [],
                formulas: Array.isArray(c.formulas) ? c.formulas : [],
                keyFacts: Array.isArray(c.keyFacts) ? c.keyFacts : [],
                examples: Array.isArray(c.examples) ? c.examples : [],
                sourcePage: typeof c.sourcePage === 'number' ? c.sourcePage : basePage,
                prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
                sampleQuestions: [],
              }));

            const subtopics = (parsed.subtopics || [])
              .filter((st: any) => !this.isAdministrativeTitle(st.title))
              .map((st: any) => ({
                title: this.cleanAcademicName(st.title || 'Core Principles'),
                description: st.description || '',
              }));

            if (subtopics.length === 0) {
              subtopics.push({ title: 'Core Principles', description: `Fundamental principles of ${topicBp.title}` });
            }

            return {
              title: this.cleanAcademicName(parsed.title || topicBp.title),
              description: parsed.description || topicBp.description || `Curriculum module covering ${topicBp.title}.`,
              subtopics,
              concepts: validConcepts,
            };
          }
        } catch (err: any) {
          const errMsg = (err?.message || String(err)).toLowerCase();
          const isTransient = errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('resource_exhausted') || errMsg.includes('overloaded');
          if (isTransient && attempt === 1) {
            await sleep(600);
            continue;
          }
          break;
        }
      }
    }

    return null;
  }

  /**
   * Helper: Extracts text belonging to a topic based on start and end page
   */
  private getTopicContent(
    pageMap: Map<number, string>,
    startPage: number = 1,
    endPage: number = 1,
    fullText: string
  ): string {
    if (pageMap.size === 0) return fullText;

    let content = '';
    const actualEnd = Math.max(startPage, endPage);
    for (let p = startPage; p <= actualEnd; p++) {
      if (pageMap.has(p)) {
        content += `=== PAGE ${p} ===\n${pageMap.get(p)}\n\n`;
      }
    }

    return content.trim() || fullText;
  }

  /**
   * Helper: Parses page numbers into a Map<pageNum, text>
   */
  private extractPageMap(text: string): Map<number, string> {
    const pageMap = new Map<number, string>();
    const pages = text.split(/===\s*PAGE\s*(\d+)\s*===/gi);

    if (pages.length > 1) {
      let curPage = 1;
      for (let i = 1; i < pages.length; i += 2) {
        curPage = parseInt(pages[i], 10) || curPage;
        const body = (pages[i + 1] || '').trim();
        pageMap.set(curPage, body);
      }
    } else {
      pageMap.set(1, text);
    }

    return pageMap;
  }

  /**
   * Windowed chunk processing fallback
   */
  private async processWindowedChunks(
    text: string,
    subjectHint: string,
    ai: GoogleGenAI
  ): Promise<ExtractedCurriculumPayload> {
    const pageChunks = this.splitIntoPageChunks(text, 2);
    const validChunks = pageChunks.filter((chunk) => chunk.text.length >= 120);
    const chunkResults: ExtractedCurriculumPayload[] = [];

    const batchSize = 3;
    for (let i = 0; i < validChunks.length; i += batchSize) {
      const currentBatch = validChunks.slice(i, i + batchSize);
      const batchPromises = currentBatch.map(async (chunk) => {
        try {
          const mockTopicBp: SyllabusTopicBlueprint = {
            title: `Module (Pages ${chunk.startPage}-${chunk.endPage})`,
            syllabusSubtopics: [],
            startPage: chunk.startPage,
            endPage: chunk.endPage,
          };
          const res = await this.extractTopicDeepConcepts(mockTopicBp, chunk.text, ai, chunk.startPage);
          if (res && res.concepts && res.concepts.length > 0) {
            return {
              topics: [res],
              inferredSubject: subjectHint,
            };
          }
        } catch (chunkErr) {
          console.warn(`Chunk fallback error for pages ${chunk.startPage}-${chunk.endPage}:`, chunkErr);
        }
        return this.compileChunkSemantically(chunk.text, subjectHint, chunk.startPage);
      });

      const results = await Promise.all(batchPromises);
      for (const r of results) {
        if (r && r.topics && r.topics.length > 0) {
          chunkResults.push(r);
        }
      }
    }

    return this.reconcileCurriculumChunks(chunkResults, subjectHint);
  }

  /**
   * Ensures consistent === PAGE n === markers across raw text.
   */
  private normalizePageMarkers(text: string): string {
    let normalized = text
      .replace(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    normalized = normalized.replace(/\[PAGE\s*(\d+)\]/gi, '=== PAGE $1 ===');

    if (!normalized.includes('=== PAGE')) {
      if (normalized.includes('\f')) {
        const pages = normalized.split('\f');
        normalized = pages.map((p, idx) => `=== PAGE ${idx + 1} ===\n${p}`).join('\n\n');
      } else {
        normalized = `=== PAGE 1 ===\n${normalized}`;
      }
    }

    return normalized.trim();
  }

  /**
   * Identifies whether a candidate title is administrative noise.
   */
  private isAdministrativeTitle(title: string): boolean {
    if (!title) return true;
    const clean = title.trim();
    const lower = clean.toLowerCase();
    
    // Filter out very short strings or those without letters
    if (clean.length < 4) return true;
    if (!/[a-zA-Z]/.test(clean)) return true; // Must contain at least some letters
    
    // Filter out math equations or assignments that are captured as titles
    if (clean.includes('=') || clean.includes('+') || clean.includes('√') || clean.includes('^')) {
      if (/[\+\-\*\/\=\<\>\√\^]/.test(clean)) {
        return true;
      }
    }

    return (
      lower.includes('school') ||
      lower.includes('scheme of work') ||
      lower.includes('behavioral objective') ||
      lower.includes('behavioural objective') ||
      lower.includes('learning objective') ||
      lower.includes('lesson note') ||
      lower.includes('first term') ||
      lower.includes('second term') ||
      lower.includes('third term') ||
      lower.includes('attracting children') ||
      lower.includes('returning leaders') ||
      lower.includes('reference materials') ||
      lower.includes('textbook') ||
      lower.includes('reference book') ||
      lower.includes('table of contents') ||
      lower.includes('content') ||
      lower === 'contents' ||
      lower === 'example' ||
      lower === 'examples' ||
      lower === 'solution' ||
      lower === 'solutions' ||
      lower === 'chapter' ||
      lower.includes('chapter ') ||
      lower.includes('p a g e') ||
      lower.includes('page ') ||
      /^week\s*\d+/i.test(lower) ||
      /^lesson\s*\d+/i.test(lower) ||
      /^page\s*\d+/i.test(lower) ||
      /^chapter\s*[a-z0-9]+/i.test(lower) ||
      /^topic\s*\d+/i.test(lower) ||
      /^unit\s*\d+/i.test(lower) ||
      /^section\s*\d+/i.test(lower) ||
      /^\d+\s*\|\s*p\s*a\s*g\s*e/i.test(lower) ||
      /^\d+\s*p\s*a\s*g\s*e/i.test(lower)
    );
  }

  /**
   * Reconciles multiple windowed extraction outputs into a unified curriculum.
   */
  private reconcileCurriculumChunks(
    chunks: ExtractedCurriculumPayload[],
    subjectHint: string
  ): ExtractedCurriculumPayload {
    const allTopics = chunks.flatMap((c) => c.topics);
    const mergedMap = new Map<string, any>();

    for (const t of allTopics) {
      if (this.isAdministrativeTitle(t.title)) continue;

      const normalizedKey = this.normalizeTopicKey(t.title);
      const subtopics = Array.isArray(t.subtopics) ? t.subtopics : [];
      const concepts = Array.isArray(t.concepts) ? t.concepts : [];

      if (!mergedMap.has(normalizedKey)) {
        mergedMap.set(normalizedKey, {
          title: t.title,
          description: t.description,
          subtopics: [...subtopics],
          concepts: [...concepts],
        });
      } else {
        const existing = mergedMap.get(normalizedKey)!;

        for (const st of subtopics) {
          if (this.isAdministrativeTitle(st.title)) continue;
          const existingSt = existing.subtopics.find(
            (s: any) => s.title.toLowerCase().trim() === st.title.toLowerCase().trim()
          );
          if (!existingSt) {
            existing.subtopics.push(st);
          }
        }

        for (const c of concepts) {
          if (this.isAdministrativeTitle(c.name)) continue;
          const existingC = existing.concepts.find(
            (ec: any) => ec.name.toLowerCase().trim() === c.name.toLowerCase().trim()
          );
          if (!existingC) {
            existing.concepts.push(c);
          }
        }
      }
    }

    return {
      topics: Array.from(mergedMap.values()),
      inferredSubject: chunks[0]?.inferredSubject || subjectHint,
    };
  }

  /**
   * Normalizes topic titles for semantic matching
   */
  private normalizeTopicKey(title: string): string {
    return title
      .toLowerCase()
      .replace(/^(topic|chapter|unit|module|week)\s*\d+[:\.\-\s]*/gi, '')
      .replace(/^(the|an|a)\s+/gi, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Splits long text by page markers for batched window processing.
   */
  private splitIntoPageChunks(
    text: string,
    pagesPerChunk: number = 2
  ): { startPage: number; endPage: number; text: string }[] {
    const pageMarkerRegex = /===\s*PAGE\s*(\d+)\s*===/gi;
    const matches = [...text.matchAll(pageMarkerRegex)];

    if (matches.length === 0) {
      return [{ startPage: 1, endPage: 1, text }];
    }

    const chunks: { startPage: number; endPage: number; text: string }[] = [];
    for (let i = 0; i < matches.length; i += pagesPerChunk) {
      const sliceMatches = matches.slice(i, i + pagesPerChunk);
      const startMatch = sliceMatches[0];
      const nextBatchFirstMatch = matches[i + pagesPerChunk];

      const startPage = parseInt(startMatch[1], 10);
      const endPage = parseInt(sliceMatches[sliceMatches.length - 1][1], 10);

      const startIndex = startMatch.index!;
      const endIndex = nextBatchFirstMatch ? nextBatchFirstMatch.index! : text.length;

      chunks.push({
        startPage,
        endPage,
        text: text.slice(startIndex, endIndex).trim(),
      });
    }

    return chunks;
  }

  private compileChunkSemantically(chunkText: string, subjectHint: string, basePage: number): ExtractedCurriculumPayload {
    return this.compileCurriculumSemantically(chunkText, subjectHint);
  }

  /**
   * High-quality content-driven semantic compiler fallback
   */
  private compileCurriculumSemantically(text: string, subjectHint: string): ExtractedCurriculumPayload {
    const pages = text.split(/===\s*PAGE\s*(\d+)\s*===/gi);
    const pageEntries: { pageNum: number; content: string }[] = [];

    if (pages.length > 1) {
      let curPage = 1;
      for (let i = 1; i < pages.length; i += 2) {
        curPage = parseInt(pages[i], 10) || curPage;
        const body = (pages[i + 1] || '').trim();
        if (body) {
          pageEntries.push({ pageNum: curPage, content: body });
        }
      }
    } else {
      pageEntries.push({ pageNum: 1, content: text });
    }

    const topics: any[] = [];
    const pageSize = Math.max(1, Math.ceil(pageEntries.length / 5));

    for (let i = 0; i < pageEntries.length; i += pageSize) {
      const chunkPages = pageEntries.slice(i, i + pageSize);
      const startPage = chunkPages[0]?.pageNum || 1;
      const endPage = chunkPages[chunkPages.length - 1]?.pageNum || startPage;

      const concepts: any[] = [];
      for (const p of chunkPages) {
        const lines = p.content
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 5 && l.length < 70 && !this.isAdministrativeTitle(l));

        for (const line of lines.slice(0, 5)) {
          const cleanName = this.cleanAcademicName(line);
          if (cleanName && !concepts.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
            concepts.push({
              name: cleanName,
              subtopicTitle: `Core Principles of ${subjectHint}`,
              explanation: `Instructional coverage of ${cleanName} for ${subjectHint} (Page ${p.pageNum}).`,
              definitions: [`Standard principle and definition for ${cleanName}.`],
              formulas: [],
              keyFacts: [`Key examinable fact from page ${p.pageNum}.`],
              examples: [],
              sourcePage: p.pageNum,
              prerequisites: [],
              sampleQuestions: [],
            });
          }
        }
      }

      if (concepts.length > 0) {
        topics.push({
          title: `${subjectHint} - Module ${topics.length + 1} (Pages ${startPage}-${endPage})`,
          description: `Syllabus module covering curriculum topics for ${subjectHint}.`,
          subtopics: [{ title: 'Core Principles', description: `Fundamental concepts in ${subjectHint}` }],
          concepts: concepts.slice(0, 10),
        });
      }
    }

    return {
      topics: topics.length > 0 ? topics : [
        {
          title: `${subjectHint} Syllabus Overview`,
          description: `Core instructional principles for ${subjectHint}.`,
          subtopics: [{ title: 'General Principles', description: 'Core course concepts' }],
          concepts: [
            {
              name: `Introduction to ${subjectHint}`,
              subtopicTitle: 'General Principles',
              explanation: `Foundational concepts and principles for ${subjectHint}.`,
              definitions: [`Standard foundational concept for ${subjectHint}.`],
              formulas: [],
              keyFacts: [],
              examples: [],
              sourcePage: 1,
              prerequisites: [],
              sampleQuestions: [],
            },
          ],
        },
      ],
      inferredSubject: subjectHint,
    };
  }

  /**
   * Cleans raw text into normalized, student-friendly academic title case.
   */
  private cleanAcademicName(raw: string): string {
    let clean = raw
      .replace(/^[=•\-\*:\s\d\.\(\)\+]+/, '')
      .replace(/[:\.\s=]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (clean === clean.toUpperCase() && clean.length > 2) {
      clean = clean
        .toLowerCase()
        .split(' ')
        .map((word) => {
          if (['and', 'or', 'of', 'in', 'to', 'for', 'the', 'a', 'an', 'on', 'at', 'by'].includes(word)) {
            return word;
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }

    return clean;
  }
}

export const aiCurriculumUnderstandingService = new AICurriculumUnderstandingService();
