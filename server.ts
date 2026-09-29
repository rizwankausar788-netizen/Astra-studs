import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRequest } from './server/apiRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing middleware for JSON
app.use(express.json({ limit: '15mb' }));

// Delegate API routes to our API router
app.use(async (req, res, next) => {
  if (req.url.startsWith('/api/gemini')) {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      next();
    }
  } else {
    next();
  }
});

// Serve static assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Astra Exam Prep server running on http://0.0.0.0:${PORT}`);
});
