// api/ai/chat.js
// Vercel Serverless Function — Multi-Provider AI Proxy

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  var provider = body.provider;
  var prompt = body.prompt;
  var model = body.model;
  var options = body.options || {};

  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    var result;

    switch (provider) {
      case 'google':
      case 'gemini':
        result = await callGoogle(prompt, model, options);
        break;
      case 'groq':
        result = await callGroq(prompt, model, options);
        break;
      case 'openai':
        result = await callOpenAI(prompt, model, options);
        break;
      case 'anthropic':
        result = await callAnthropic(prompt, model, options);
        break;
      case 'deepseek':
        result = await callDeepSeek(prompt, model, options);
        break;
      default:
        result = await callGoogle(prompt, model, options);
    }

    return res.status(200).json({
      text: result.text,
      provider: result.provider,
      model: result.model,
      usage: result.usage || null
    });
  } catch (err) {
    console.error('[API /ai/chat]', err);
    return res.status(500).json({ error: err.message || 'AI request failed' });
  }
};

async function callGoogle(prompt, model, options) {
  var key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not configured');

  var m = model || 'gemini-3.6-flash';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key;

  var r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: (options && options.temperature) || 0.7,
        maxOutputTokens: (options && options.max_tokens) || 2048
      }
    })
  });

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('Google Gemini ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '',
    provider: 'google',
    model: m,
    usage: data.usageMetadata || null
  };
}

async function callGroq(prompt, model, options) {
  var key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not configured');

  var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('Groq ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '',
    provider: 'groq',
    model: data.model,
    usage: data.usage
  };
}

async function callOpenAI(prompt, model, options) {
  var key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  var r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('OpenAI ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '',
    provider: 'openai',
    model: data.model,
    usage: data.usage
  };
}

async function callAnthropic(prompt, model, options) {
  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');

  var r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('Anthropic ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.content && data.content[0] && data.content[0].text) || '',
    provider: 'anthropic',
    model: data.model,
    usage: data.usage
  };
}

async function callDeepSeek(prompt, model, options) {
  var key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured');

  var r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!r.ok) {
    var errText = await r.text();
    throw new Error('DeepSeek ' + r.status + ': ' + errText.slice(0, 300));
  }

  var data = await r.json();
  return {
    text: (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '',
    provider: 'deepseek',
    model: data.model,
    usage: data.usage
  };
}
