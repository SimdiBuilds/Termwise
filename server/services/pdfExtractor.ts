export async function extractTextFromPdfBuffer(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  try {
    // Load pdf-parse only when a PDF is actually being processed.
    // This prevents the PDF.js/DOMMatrix dependency from crashing
    // unrelated API routes during serverless startup.
    const { PDFParse } = await import('pdf-parse');

    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();

      if (result && Array.isArray(result.pages) && result.pages.length > 0) {
        const formatted = result.pages
          .map(
            (p: any, idx: number) =>
              `=== PAGE ${p.num || idx + 1} ===\n${p.text || ''}`
          )
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

      return { text: '', pageCount: 0 };
    } finally {
      await parser.destroy();
    }
  } catch (err) {
    console.warn('PDF text extraction failed:', err);
    return { text: '', pageCount: 0 };
  }
}