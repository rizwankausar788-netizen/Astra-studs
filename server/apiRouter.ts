import { IncomingMessage, ServerResponse } from 'http';
import {
  chatWithTutor,
  transcribeAudio,
  generateStudyPlan,
  generateQuizQuestions,
  generateFlashcards,
  startConceptVideo,
  checkVideoStatus,
  ai,
} from './geminiService.js';
import { GenerateVideosOperation } from '@google/genai';

async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // limit body to 15MB for base64 images
      if (body.length > 15 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/gemini')) {
    return false;
  }

  // Handle CORS preflight if needed
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return true;
  }

  try {
    if (url === '/api/gemini/health' && req.method === 'GET') {
      sendJson(res, 200, { status: 'ok', hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
      return true;
    }

    if (url === '/api/gemini/chat' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await chatWithTutor(body);
      sendJson(res, 200, result);
      return true;
    }

    if (url === '/api/gemini/transcribe' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await transcribeAudio(body.audioBase64, body.mimeType);
      sendJson(res, 200, { transcript: result });
      return true;
    }

    if (url === '/api/gemini/generate-plan' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await generateStudyPlan(body);
      sendJson(res, 200, result);
      return true;
    }

    if (url === '/api/gemini/generate-quiz' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await generateQuizQuestions(body);
      sendJson(res, 200, { questions: result });
      return true;
    }

    if (url === '/api/gemini/generate-flashcards' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await generateFlashcards(body);
      sendJson(res, 200, { flashcards: result });
      return true;
    }

    if (url === '/api/gemini/generate-video' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await startConceptVideo(body);
      sendJson(res, 200, result);
      return true;
    }

    if (url === '/api/gemini/video-status' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await checkVideoStatus(body.operationName);
      sendJson(res, 200, result);
      return true;
    }

    if (url === '/api/gemini/video-download' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const apiKey = process.env.GEMINI_API_KEY;
      if (!ai || !apiKey) {
        sendJson(res, 400, { error: 'No API key configured for video streaming' });
        return true;
      }

      const op = new GenerateVideosOperation();
      op.name = body.operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) {
        sendJson(res, 404, { error: 'Video URI not found or video still processing' });
        return true;
      }

      const videoRes = await fetch(videoUri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      res.setHeader('Content-Type', 'video/mp4');
      if (videoRes.body) {
        // Stream back to client
        const reader = videoRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        res.statusCode = 500;
        res.end();
      }
      return true;
    }

    sendJson(res, 404, { error: 'Not found' });
    return true;
  } catch (error: any) {
    console.error('API Server Error:', error);
    sendJson(res, 500, { error: error.message || 'Internal server error' });
    return true;
  }
}
