export type BlockClassification =
  | 'INSTRUCTIONAL_CONTENT'
  | 'CURRICULUM_HEADING'
  | 'SUBHEADING'
  | 'EXAMPLE'
  | 'EXERCISE'
  | 'ANSWER_KEY'
  | 'TABLE_OF_CONTENTS'
  | 'ADMINISTRATIVE'
  | 'REFERENCE'
  | 'FRONT_MATTER'
  | 'APPENDIX'
  | 'UNKNOWN';

export interface DocumentBlock {
  id: string;
  pageNumber: number;
  blockOrder: number;
  text: string;
  cleanText: string;
  
  // Optical & Layout cues
  isAllUppercase: boolean;
  isCapitalized: boolean;
  isShortLine: boolean;
  lineCount: number;
  charCount: number;
  indentation: number;
  hasWhitespaceAbove: boolean;
  hasWhitespaceBelow: boolean;
  numberingPrefix?: string;
  bulletPrefix?: string;
  estimatedVisualWeight: number; // 0 to 1 score based on casing, whitespace, shortness, numbering
  
  // Structural classification
  structuralPrediction: BlockClassification;
  confidence: number;
}

export interface DocumentPage {
  pageNumber: number;
  blocks: DocumentBlock[];
  rawText: string;
  pageClassification: 'FRONT_MATTER' | 'TABLE_OF_CONTENTS' | 'BODY' | 'BACK_MATTER' | 'ADMINISTRATIVE';
  lineCount: number;
}

export interface DocumentProfile {
  totalPages: number;
  totalBlocks: number;
  dominantBlockLength: number;
  casingDistribution: {
    uppercaseCount: number;
    capitalizedCount: number;
    normalCount: number;
  };
  detectedNumberingSchemes: string[];
  candidateHeadingBlockIds: string[];
  tocPageNumbers: number[];
  frontMatterPageNumbers: number[];
  hasClearVisualHierarchy: boolean;
  organizationalStyleHint: string;
}

export interface InferredSection {
  id: string;
  title: string;
  level: number; // 1 = major topic/section, 2 = subsection/subtopic
  startPage: number;
  endPage: number;
  headingBlockId?: string;
  blockIds: string[];
  text: string;
  confidence: number;
  inferredType: 'INSTRUCTIONAL_TOPIC' | 'SUBSECTION' | 'TOC' | 'ADMINISTRATIVE' | 'SUPPLEMENTARY';
}

export interface DocumentStructureUnderstanding {
  documentTitle?: string;
  inferredSubject?: string;
  organizationSummary: string;
  sections: InferredSection[];
  tocPages: number[];
  administrativePages: number[];
  structuralConfidence: number;
  needsReviewSections: { title: string; reason: string; pageNumber: number }[];
}

export interface ExtractedDocument {
  id: string;
  filename: string;
  subjectHint?: string;
  inferredSubject?: string;
  pageCount: number;
  pages: DocumentPage[];
  allBlocks: DocumentBlock[];
  profile: DocumentProfile;
  structure?: DocumentStructureUnderstanding;
}
