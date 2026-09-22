// Self-hosted production entry (Railway, Render, etc.) after `bun run build`.
// Not used on Vercel: api/index.ts imports server.ts directly instead.
import path from 'path';
import express from 'express';
import app from './server.ts';

const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Termwise server listening on http://0.0.0.0:${PORT}`);
});
