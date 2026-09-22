// Local development entry: `bun run dev` / `npm run dev`.
// Kept separate from server.ts so Vercel's serverless bundle (api/index.ts -> server.ts)
// never traces vite, which pulls in dev-only plugins that don't resolve in that context.
import app from './server.ts';

const PORT = Number(process.env.PORT) || 3000;

const { createServer: createViteServer } = await import('vite');
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});
app.use(vite.middlewares);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Termwise dev server listening on http://0.0.0.0:${PORT}`);
});
