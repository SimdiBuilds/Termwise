// Source for the Vercel function. NEVER deployed directly (underscore prefix = Vercel
// skips it when detecting routes). Bundled to api/index.js by `npm run build:api`,
// and committed to git so Vercel can detect a concrete serverless function before
// the build command regenerates it.
// (Its own trace step silently dropped a local data import in testing, producing
// "Cannot find module '.../furtherMathCurriculum.js'" at runtime.)
import app from '../server.ts';

export default app;
