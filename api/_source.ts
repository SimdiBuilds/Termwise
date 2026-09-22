// Source for the Vercel function. NEVER deployed directly (underscore prefix = Vercel
// skips it when detecting routes). Bundled to api/index.js by `npm run build:api`,
// which is committed to git so Vercel never has to transpile/trace this file itself.
// (Its own trace step silently dropped a local data import in testing, producing
// "Cannot find module '.../furtherMathCurriculum.js'" at runtime.)
import app from '../server.ts';

export default app;
