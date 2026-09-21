import { DocumentBlock, DocumentPage, ExtractedDocument, BlockClassification } from '../types/documentIR.ts';
import { extractTextFromPdfBuffer } from './pdfExtractor.ts';

export class DocumentExtractor {
  /**
   * Extract document from PDF buffer or raw text into format-agnostic Document IR.
   */
  async extractDocument(
    source: { buffer?: Buffer; rawText?: string; filename?: string; subjectHint?: string }
  ): Promise<ExtractedDocument> {
    const filename = source.filename || 'Uploaded_Notes.pdf';
    let textWithPages = source.rawText || '';
    let pageCount = 1;

    if (source.buffer) {
      try {
        const parsed = await extractTextFromPdfBuffer(source.buffer);
        if (parsed.text && parsed.text.trim()) {
          textWithPages = parsed.text;
          pageCount = parsed.pageCount || 1;
        }
      } catch (err) {
        console.warn('DocumentExtractor: PDF extraction failed, using fallback:', err);
      }
    }

    // Clean formatting and unicode artifacts
    const cleanText = textWithPages
      .replace(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    const pages = this.segmentPages(cleanText, pageCount);
    const allBlocks: DocumentBlock[] = [];

    for (const page of pages) {
      allBlocks.push(...page.blocks);
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: docId,
      filename,
      subjectHint: source.subjectHint,
      pageCount: pages.length,
      pages,
      allBlocks,
      profile: {
        totalPages: pages.length,
        totalBlocks: allBlocks.length,
        dominantBlockLength: this.calculateDominantBlockLength(allBlocks),
        casingDistribution: this.calculateCasingDistribution(allBlocks),
        detectedNumberingSchemes: this.detectNumberingSchemes(allBlocks),
        candidateHeadingBlockIds: [],
        tocPageNumbers: [],
        frontMatterPageNumbers: [],
        hasClearVisualHierarchy: true,
        organizationalStyleHint: 'Analyzing...',
      },
    };
  }

  /**
   * Segments text into structured pages based on [PAGE n] markers or natural page boundaries.
   */
  private segmentPages(text: string, expectedPageCount: number): DocumentPage[] {
    const pageMarkerRegex = /\[PAGE\s*(\d+)\]/gi;
    const matches = [...text.matchAll(pageMarkerRegex)];

    const pages: DocumentPage[] = [];

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const nextM = matches[i + 1];
        const pageNum = parseInt(m[1], 10);
        const startIndex = m.index! + m[0].length;
        const endIndex = nextM ? nextM.index! : text.length;
        const pageRawText = text.slice(startIndex, endIndex).trim();

        const blocks = this.segmentBlocks(pageRawText, pageNum);
        pages.push({
          pageNumber: pageNum,
          blocks,
          rawText: pageRawText,
          pageClassification: 'BODY',
          lineCount: pageRawText.split('\n').length,
        });
      }
    } else {
      // If no page tags exist, segment by major form feeds or chunk by sensible character counts
      const chunks = text.split(/\f|\n{4,}/);
      if (chunks.length > 1) {
        chunks.forEach((chunk, idx) => {
          const pageNum = idx + 1;
          const blocks = this.segmentBlocks(chunk.trim(), pageNum);
          pages.push({
            pageNumber: pageNum,
            blocks,
            rawText: chunk.trim(),
            pageClassification: 'BODY',
            lineCount: chunk.split('\n').length,
          });
        });
      } else {
        const blocks = this.segmentBlocks(text.trim(), 1);
        pages.push({
          pageNumber: 1,
          blocks,
          rawText: text.trim(),
          pageClassification: 'BODY',
          lineCount: text.split('\n').length,
        });
      }
    }

    return pages;
  }

  /**
   * Segments a single page into rich layout blocks.
   */
  private segmentBlocks(pageText: string, pageNumber: number): DocumentBlock[] {
    const rawLines = pageText.split('\n');
    const blocks: DocumentBlock[] = [];
    let currentParagraph: string[] = [];
    let blockIndex = 0;

    const flushParagraph = (isHeadingCandidate: boolean = false) => {
      if (currentParagraph.length === 0) return;
      const joined = currentParagraph.join('\n').trim();
      if (!joined) {
        currentParagraph = [];
        return;
      }

      blockIndex++;
      const id = `blk_p${pageNumber}_b${blockIndex}`;
      const firstLine = currentParagraph[0].trim();
      const isAllUpper = /^[A-Z0-9\s\W]+$/.test(joined) && /[A-Z]/.test(joined);
      const isCapitalized = /^[A-Z][a-z0-9]/.test(firstLine);
      const isShort = joined.length < 80 && currentParagraph.length <= 2;
      const numberingMatch = firstLine.match(/^(?:(?:\d+\.)+|\d+\b|[A-Z]\.|\([a-z0-9]+\))\s+/i);
      const bulletMatch = firstLine.match(/^[•\-\*\>]\s+/);
      const indent = currentParagraph[0].search(/\S|$/);

      const isNumbered = /^(?:(?:\d+\.)+|\d+\b|[A-Z]\.|\([a-z0-9]+\))\s+[A-Z]/i.test(firstLine);
      const isMultiEnumeration = /(?:(?:[I|V|X]+|\d+|[a-e])\.\s+[^\n]+){2,}/i.test(joined);
      const digitsCount = (joined.match(/\d/g) || []).length;
      const lettersCount = (joined.match(/[a-zA-Z]/g) || []).length;
      const isMathExercise = isMultiEnumeration || (digitsCount > 8 && digitsCount > lettersCount * 0.4);

      // Optical visual weight score (0.0 to 1.0)
      let visualWeight = 0.2;
      if (isAllUpper && isShort && !isMathExercise) visualWeight += 0.4;
      if (isShort && !bulletMatch && !isMathExercise) visualWeight += 0.2;
      if (numberingMatch && isShort && !isMathExercise) visualWeight += 0.2;
      if (currentParagraph.length === 1 && !isMathExercise) visualWeight += 0.1;

      let structuralPrediction: BlockClassification = 'INSTRUCTIONAL_CONTENT';
      if (isMathExercise) {
        structuralPrediction = 'EXERCISE';
        visualWeight = 0.1;
      } else if (visualWeight >= 0.6) {
        structuralPrediction = 'CURRICULUM_HEADING';
      } else if (bulletMatch) {
        structuralPrediction = 'INSTRUCTIONAL_CONTENT';
      }

      blocks.push({
        id,
        pageNumber,
        blockOrder: blockIndex,
        text: joined,
        cleanText: joined.replace(/\s+/g, ' ').trim(),
        isAllUppercase: isAllUpper,
        isCapitalized,
        isShortLine: isShort,
        lineCount: currentParagraph.length,
        charCount: joined.length,
        indentation: indent,
        hasWhitespaceAbove: true,
        hasWhitespaceBelow: true,
        numberingPrefix: numberingMatch ? numberingMatch[0].trim() : undefined,
        bulletPrefix: bulletMatch ? bulletMatch[0].trim() : undefined,
        estimatedVisualWeight: Math.min(1.0, visualWeight),
        structuralPrediction,
        confidence: 0.7,
      });

      currentParagraph = [];
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        // Blank line -> Paragraph boundary
        flushParagraph();
        continue;
      }

      // Check if this line looks like a standalone short heading
      const isShortLine = trimmed.length < 75;
      const isUpper = /^[A-Z0-9\s\W]+$/.test(trimmed) && /[A-Z]/.test(trimmed);
      const isNumbered = /^(?:(?:\d+\.)+|\d+\b|[A-Z]\.|\([a-z0-9]+\))\s+[A-Z]/i.test(trimmed);

      if (isShortLine && (isUpper || isNumbered) && currentParagraph.length > 0) {
        flushParagraph();
      }

      currentParagraph.push(line);

      if (isShortLine && (isUpper || isNumbered)) {
        flushParagraph(true);
      }
    }

    flushParagraph();
    return blocks;
  }

  private calculateDominantBlockLength(blocks: DocumentBlock[]): number {
    if (blocks.length === 0) return 0;
    const totalChars = blocks.reduce((acc, b) => acc + b.charCount, 0);
    return Math.round(totalChars / blocks.length);
  }

  private calculateCasingDistribution(blocks: DocumentBlock[]) {
    let uppercaseCount = 0;
    let capitalizedCount = 0;
    let normalCount = 0;

    for (const b of blocks) {
      if (b.isAllUppercase) uppercaseCount++;
      else if (b.isCapitalized) capitalizedCount++;
      else normalCount++;
    }

    return { uppercaseCount, capitalizedCount, normalCount };
  }

  private detectNumberingSchemes(blocks: DocumentBlock[]): string[] {
    const schemes = new Set<string>();
    for (const b of blocks) {
      if (b.numberingPrefix) {
        if (/^\d+\./.test(b.numberingPrefix)) schemes.add('Decimal (1., 2., 3.)');
        if (/^\d+\.\d+/.test(b.numberingPrefix)) schemes.add('Hierarchical (1.1, 1.2)');
        if (/^[A-Z]\./.test(b.numberingPrefix)) schemes.add('Alphabetic (A., B., C.)');
        if (/^\([a-z0-9]+\)/i.test(b.numberingPrefix)) schemes.add('Parenthetical ((i), (a))');
      }
    }
    return Array.from(schemes);
  }
}

export const documentExtractor = new DocumentExtractor();
