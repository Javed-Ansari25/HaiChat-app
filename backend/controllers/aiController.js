const https = require('https');
const Message = require('../models/Message');

console.log(
  'API KEY:',
  process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING'
);

// ─── Gemini REST helper (FIXED MODEL) ───────────────────────────────

const geminiCallModel = (prompt) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              return reject(new Error(json.error.message));
            }
            const text =
              json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return reject(new Error('Empty response'));
            resolve(text.trim());
          } catch (e) {
            reject(new Error('Failed to parse Gemini response'));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });

const geminiRequest = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set');
  }
  return geminiCallModel(prompt);
};

// ─── Controllers ───────────────────────────────────────────────────

const getSmartReplies = async (req, res) => {
  const { lastMessage } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      suggestions: ['👍 Sure!', 'Got it!', 'Thanks!'],
    });
  }

  try {
    const prompt =
      `You are a chat reply assistant. Someone sent: "${lastMessage}"\n` +
      `Give exactly 3 short reply suggestions (5 words max each).\n` +
      `Reply with ONLY a JSON array like: ["Sure!", "Sounds good!", "Thanks!"]`;

    const raw = await geminiRequest(prompt);

    let suggestions = ['👍 Sure!', 'Got it!', 'Thanks!'];
    try {
      const parsed = JSON.parse(
        raw.replace(/```json|```/gi, '').trim()
      );
      if (Array.isArray(parsed)) {
        suggestions = parsed.slice(0, 3);
      }
    } catch {}

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Smart replies error:', error.message);
    res.json({
      success: true,
      suggestions: ['👍 OK', 'Got it!', 'Thanks!'],
    });
  }
};

const aiChatAssistant = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res
      .status(503)
      .json({ message: 'AI not configured' });
  }

  try {
    let context = '';
    if (history.length) {
      context =
        history
          .filter(
            (m) => m.role === 'user' || m.role === 'assistant'
          )
          .slice(-10)
          .map(
            (m) =>
              `${m.role === 'user' ? 'User' : 'HAI'}: ${
                m.content
              }`
          )
          .join('\n') + '\n\n';
    }

    const prompt =
      `You are HAI, a friendly AI assistant in a chat app.\n` +
      `Be helpful, concise, and warm.\n\n` +
      `${context}User: ${message}\nHAI:`;

    const reply = await geminiRequest(prompt);
    res.json({ success: true, response: reply });
  } catch (error) {
    console.error('Gemini chat error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const summarizeChat = async (req, res) => {
  const { chatId } = req.params;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: 'AI not configured' });
  }

  try {
    const messages = await Message.find({
      chatId,
      isDeleted: false,
      messageType: 'text',
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name');

    if (!messages.length) {
      return res.json({
        success: true,
        summary: 'No messages to summarize yet.',
      });
    }

    const chatHistory = messages
      .reverse()
      .map(
        (m) => `${m.sender?.name ?? 'Unknown'}: ${m.content}`
      )
      .join('\n');

    const summary = await geminiRequest(
      `Summarize this chat in 3-5 bullet points starting with •.\n\n${chatHistory}`
    );

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Summarize error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const analyzeSentiment = async (req, res) => {
  const { text } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: 'AI not configured' });
  }

  try {
    const raw = await geminiRequest(
      `Analyze sentiment of: "${text}"\n` +
        `Return ONLY JSON:\n` +
        `{"sentiment":"positive|negative|neutral","tone":"one word","emoji":"emoji","score":0-100}`
    );

    let analysis = {
      sentiment: 'neutral',
      tone: 'neutral',
      emoji: '😐',
      score: 50,
    };

    try {
      analysis = JSON.parse(
        raw.replace(/```json|```/gi, '').trim()
      );
    } catch {}

    res.json({ success: true, analysis });
  } catch {
    res.status(500).json({ message: 'Analysis failed' });
  }
};

const testAI = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ ok: false, message: 'API key missing' });
  }

  try {
    const reply = await geminiRequest(
      'Reply with exactly the word: WORKING'
    );
    res.json({
      ok: true,
      model: 'gemini-flash-latest',
      reply,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getSmartReplies,
  aiChatAssistant,
  summarizeChat,
  analyzeSentiment,
  testAI,
};