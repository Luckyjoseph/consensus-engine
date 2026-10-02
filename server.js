import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OpenAI } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure TarqaAI client using the OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.TARQA_API_KEY,
  baseURL: process.env.TARQA_BASE_URL || 'https://api.tarqaai.com/v1',
});

// Endpoint: Fetch all models currently active on your TarqaAI account
app.get('/api/models', async (req, res) => {
  try {
    const modelList = await client.models.list();
    // Extract model IDs and sort them alphabetically
    const models = modelList.data.map(m => m.id).sort();
    res.json({ models });
  } catch (error) {
    console.error('Failed to retrieve model list from TarqaAI:', error.message);
    // Graceful fallback with standard models if provider listing fails
    res.json({
      models: [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
      ]
    });
  }
});

// Helper function to query a model and measure latency
async function fetchModelResponse(model, prompt) {
  const startTime = Date.now();
  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });
    const durationMs = Date.now() - startTime;
    return {
      model,
      content: response.choices[0]?.message?.content || 'No content returned.',
      latency: durationMs,
      error: null,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    return {
      model,
      content: null,
      latency: durationMs,
      error: err.message || 'Unknown error occurred.',
    };
  }
}

// Consensus route
app.post('/api/consensus', async (req, res) => {
  const { prompt, modelA, modelB, judgeModel } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A valid text prompt is required.' });
  }

  try {
    // 1. Run Candidate Models concurrently
    const [resultA, resultB] = await Promise.all([
      fetchModelResponse(modelA, prompt),
      fetchModelResponse(modelB, prompt),
    ]);

    const textA = resultA.content || `[Failed: ${resultA.error}]`;
    const textB = resultB.content || `[Failed: ${resultB.error}]`;

    // 2. Build concise synthesis instructions for Arbiter
    const arbiterPrompt = `
You are an expert technical judge. Review the user prompt and the two candidate answers below.

User Prompt: "${prompt}"

---
Candidate Model A (${modelA}):
${textA}

---
Candidate Model B (${modelB}):
${textB}

---
Format your response clearly using strictly these three concise sections:

### 1. Key Comparison
- Provide 2 brief bullet points on where the answers agree or differ, noting any factual inaccuracies or weak reasoning.

### 2. Verdict
- In 1 to 2 sentences, declare which model gave the better answer and why.

### 3. Consolidated Best Answer
- Deliver a clear, definitive, and easy-to-understand synthesis combining the strongest points from both. Keep it under 150 words. Avoid fluff or meta-announcements.
`;

    // 3. Request synthesis from Arbiter model
    const arbiterStart = Date.now();
    const arbiterResponse = await client.chat.completions.create({
      model: judgeModel,
      messages: [
        { 
          role: 'system', 
          content: 'You are an objective, sharp judge. Keep answers concise, clear, structured, and free of fluff.' 
        },
        { role: 'user', content: arbiterPrompt }
      ],
      max_tokens: 500
    });
    const arbiterLatency = Date.now() - arbiterStart;

    res.json({
      candidates: [resultA, resultB],
      arbiter: {
        model: judgeModel,
        content: arbiterResponse.choices[0]?.message?.content || 'Synthesis failed.',
        latency: arbiterLatency,
      }
    });

  } catch (error) {
    console.error('Consensus route error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Consensus Engine running at: http://localhost:${port}`);
});