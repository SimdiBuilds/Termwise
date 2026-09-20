import { PDFParse } from 'pdf-parse';

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    
    if (result && Array.isArray(result.pages) && result.pages.length > 0) {
      const formatted = result.pages
        .map((p: any, idx: number) => `=== PAGE ${p.num || idx + 1} ===\n${p.text || ''}`)
        .join('\n\n');
      return {
        text: formatted,
        pageCount: result.total || result.pages.length,
      };
    }
    
    if (result && typeof result.text === 'string' && result.text.trim()) {
      return {
        text: result.text,
        pageCount: result.total || 1,
      };
    }
  } catch (err) {
    console.warn('PDFParse instance getText failed, trying direct function call fallback:', err);
  }

  // Legacy pdf-parse fallback if class-based instantiation fails
  try {
    const legacy = (PDFParse as any);
    if (typeof legacy === 'function') {
      const data = await legacy(buffer);
      let outText = data.text || '';
      // If no page markers exist, check for form feed (\f) delimiters
      if (!outText.includes('=== PAGE') && outText.includes('\f')) {
        const pages = outText.split('\f');
        outText = pages.map((p: string, idx: number) => `=== PAGE ${idx + 1} ===\n${p}`).join('\n\n');
      }
      return {
        text: outText,
        pageCount: data.numpages || 1,
      };
    }
  } catch (legacyErr) {
    console.warn('Legacy pdf-parse call failed:', legacyErr);
  }

  return { text: '', pageCount: 0 };
}
