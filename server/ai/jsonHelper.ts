export function safeParseJson<T = any>(raw: string, fallback?: T): T {
  if (!raw || typeof raw !== 'string') return (fallback !== undefined ? fallback : {}) as T;
  let text = raw.trim();

  // 1. Strip markdown code fence markers if present
  text = text.replace(/^[\s\S]*?```(?:json)?\s*/i, '');
  if (text.includes('```')) {
    text = text.replace(/\s*```[\s\S]*$/i, '');
  }

  // 2. Direct parse attempt first
  try {
    return JSON.parse(text);
  } catch {}

  // 3. Locate outermost JSON boundaries
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');

  if (firstBrace === -1 && firstBracket === -1) {
    if (fallback !== undefined) return fallback;
    throw new Error('No valid JSON structure found in response');
  }

  let isObject = true;
  let startIdx = firstBrace;
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    isObject = false;
    startIdx = firstBracket;
  }

  const endChar = isObject ? '}' : ']';
  const lastIdx = text.lastIndexOf(endChar);

  if (lastIdx > startIdx) {
    let candidate = text.slice(startIdx, lastIdx + 1);
    // Remove trailing commas before closing braces/brackets
    candidate = candidate.replace(/,\s*([\}\]])/g, '$1');
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  if (fallback !== undefined) return fallback;
  throw new Error('Failed to parse AI JSON response: ' + text.slice(0, 120));
}
