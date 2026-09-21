// api/ai/test-google.js
// 直接测试 Google Gemini API

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  var key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, error: 'GOOGLE_API_KEY not set' });
  }

  try {
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + key;

    var r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Reply with: OK' }] }]
      })
    });

    var text = await r.text();
    var parsed = null;
    try { parsed = JSON.parse(text); } catch (e) {}

    return res.status(200).json({
      ok: r.ok,
      http_status: r.status,
      parsed: parsed,
      raw_preview: text.slice(0, 300),
      key_prefix: key.slice(0, 6)
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
