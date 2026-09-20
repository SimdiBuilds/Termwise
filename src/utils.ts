/**
 * Safely parses a Fetch response as JSON.
 * If the response is not JSON (e.g. an HTML error page or Gateway Timeout),
 * it extracts a descriptive error message with the status code instead of throwing a generic "Unexpected token" error.
 */
export async function safeParseJson<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  
  // If the status is not ok, try to read the error body
  if (!res.ok) {
    if (contentType && contentType.includes('application/json')) {
      try {
        const errData = await res.json();
        throw new Error(errData.error || errData.message || `Server error (${res.status})`);
      } catch (err: any) {
        if (err.message && !err.message.includes('Unexpected token')) {
          throw err;
        }
      }
    }
    
    // Fallback to text reading
    const text = await res.text().catch(() => '');
    if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<body')) {
      const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        if (title.toLowerCase().includes('cookie check')) {
          throw new Error("Cookie Check Blocked: Your browser is blocking third-party cookies in this embedded preview frame. To bypass this, please click the 'Open in New Tab' button in the top-right corner of the preview to complete your note uploads securely.");
        }
        throw new Error(`Network/Server Error: ${title} (${res.status})`);
      }
      throw new Error(`Server returned an unexpected HTML error page (${res.status} ${res.statusText || 'Error'}).`);
    }
    throw new Error(text || `Request failed with status ${res.status} (${res.statusText || 'Error'}).`);
  }

  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<body')) {
      const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        if (title.toLowerCase().includes('cookie check')) {
          throw new Error("Cookie Check Blocked: Your browser is blocking third-party cookies in this embedded preview frame. To bypass this, please click the 'Open in New Tab' button in the top-right corner of the preview to complete your note uploads securely.");
        }
        throw new Error(`Server Error: ${title} (${res.status})`);
      }
      throw new Error(`Server returned an unexpected HTML response (${res.status}).`);
    }
    throw new Error(text || `Server returned non-JSON response with status ${res.status}.`);
  }

  try {
    return await res.json() as T;
  } catch (err: any) {
    throw new Error(`Malformed JSON response from server: ${err.message}`);
  }
}
