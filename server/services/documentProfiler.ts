import { DocumentBlock, DocumentPage, DocumentProfile, ExtractedDocument } from '../types/documentIR.ts';

export class DocumentProfiler {
  /**
   * Performs generic layout and structural analysis across extracted document blocks.
   */
  profileDocument(doc: ExtractedDocument): DocumentProfile {
    const totalPages = doc.pages.length;
    const totalBlocks = doc.allBlocks.length;

    // Detect Table of Contents pages
    const tocPageNumbers = this.detectTableOfContentsPages(doc.pages);
    const frontMatterPageNumbers = this.detectFrontMatterPages(doc.pages, tocPageNumbers);

    // Identify candidate heading blocks across the entire document
    const candidateHeadingBlockIds: string[] = [];

    for (const page of doc.pages) {
      const isFrontMatter = frontMatterPageNumbers.includes(page.pageNumber);
      const isTOC = tocPageNumbers.includes(page.pageNumber);

      if (isTOC) {
        page.pageClassification = 'TABLE_OF_CONTENTS';
      } else if (isFrontMatter) {
        page.pageClassification = 'FRONT_MATTER';
      } else {
        page.pageClassification = 'BODY';
      }

      for (const block of page.blocks) {
        if (isTOC) {
          block.structuralPrediction = 'TABLE_OF_CONTENTS';
          continue;
        }

        const isMathList = /(?:(?:[I|V|X]+|\d+|[a-e])\.\s+[^\n]+){2,}/i.test(block.cleanText);
        const digitsCount = (block.cleanText.match(/\d/g) || []).length;
        const lettersCount = (block.cleanText.match(/[a-zA-Z]/g) || []).length;
        const isMathExercise = isMathList || (digitsCount > 6 && digitsCount > lettersCount * 0.4);
        const hasRealTitleWords = (block.cleanText.match(/[a-zA-Z]{3,}/g) || []).length >= 1;

        // Generic Heading Heuristics (based on optical signals, not keyword matching)
        const isOpticalHeading =
          block.estimatedVisualWeight >= 0.5 &&
          block.isShortLine &&
          block.charCount >= 3 &&
          block.charCount <= 90 &&
          !block.bulletPrefix &&
          !isMathExercise &&
          hasRealTitleWords;

        if (isMathExercise) {
          block.structuralPrediction = 'EXERCISE';
        } else if (isOpticalHeading) {
          block.structuralPrediction = 'CURRICULUM_HEADING';
          candidateHeadingBlockIds.push(block.id);
        } else if (block.numberingPrefix && block.isShortLine && hasRealTitleWords) {
          block.structuralPrediction = 'SUBHEADING';
          candidateHeadingBlockIds.push(block.id);
        } else {
          block.structuralPrediction = 'INSTRUCTIONAL_CONTENT';
        }
      }
    }

    const hasClearVisualHierarchy = candidateHeadingBlockIds.length >= 2;
    let organizationalStyleHint = 'Prose / Semantic Layout';
    if (doc.profile.detectedNumberingSchemes.length > 0) {
      organizationalStyleHint = `Numbered Hierarchy (${doc.profile.detectedNumberingSchemes.join(', ')})`;
    } else if (candidateHeadingBlockIds.length > 0) {
      organizationalStyleHint = 'Optical Typographic Headings';
    }

    const updatedProfile: DocumentProfile = {
      ...doc.profile,
      totalPages,
      totalBlocks,
      tocPageNumbers,
      frontMatterPageNumbers,
      candidateHeadingBlockIds,
      hasClearVisualHierarchy,
      organizationalStyleHint,
    };

    doc.profile = updatedProfile;
    return updatedProfile;
  }

  /**
   * Identifies Table of Contents / Outline pages using generic optical density of short listing lines.
   */
  private detectTableOfContentsPages(pages: DocumentPage[]): number[] {
    const tocPages: number[] = [];

    // TOC usually occurs in the first 1-4 pages
    const earlyPages = pages.filter((p) => p.pageNumber <= 4);

    for (const page of earlyPages) {
      const blocks = page.blocks;
      if (blocks.length < 3) continue;

      // Count short lines with numbers or trailing dots/page indicators
      let listLikeCount = 0;
      for (const b of blocks) {
        if (b.isShortLine && (b.numberingPrefix || /\.{2,}|\bpage\b|\bpg\b|\d+$/i.test(b.cleanText))) {
          listLikeCount++;
        }
      }

      // If more than 40% of blocks look like index listings, classify page as TOC
      if (listLikeCount >= 3 && listLikeCount / blocks.length >= 0.35) {
        tocPages.push(page.pageNumber);
      }
    }

    return tocPages;
  }

  /**
   * Identifies Front Matter (cover, title page, preface) before the instructional content starts.
   */
  private detectFrontMatterPages(pages: DocumentPage[], tocPages: number[]): number[] {
    const frontMatter: number[] = [];
    const minTocPage = tocPages.length > 0 ? Math.min(...tocPages) : 2;

    for (const page of pages) {
      if (page.pageNumber < minTocPage && page.blocks.length <= 4) {
        frontMatter.push(page.pageNumber);
      }
    }

    return frontMatter;
  }
}

export const documentProfiler = new DocumentProfiler();
