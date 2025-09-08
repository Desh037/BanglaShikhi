import fs from 'fs';

const API_KEY = process.env.API_KEY;
const PROMPT = process.env.PROMPT || 'হ্যালো';

if (!API_KEY) {
  console.error('Missing API_KEY (provide via GitHub secret).');
  process.exit(1);
}

const messages = [
  { role: 'system', content: 'আপনি একটি বন্ধুত্বপূর্ণ বাংলা শিক্ষক।' },
  { role: 'user', content: PROMPT }
];

async function run() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.9,
        max_tokens: 150,
        top_p: 0.95,
        frequency_penalty: 1.2,
        presence_penalty: 0.8
      })
    });

    const text = await res.text();
    // Save both status and body so you can debug easily
    const out = {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      fetched_at: new Date().toISOString(),
      body: null
    };

    try {
      out.body = JSON.parse(text);
    } catch (e) {
      out.body = text;
    }

    // Ensure docs folder exists (GitHub Pages can serve docs/)
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/response.json', JSON.stringify(out, null, 2), 'utf-8');

    if (!res.ok) {
      console.error('API returned non-OK:', out.status, out.statusText);
      process.exit(1);
    } else {
      console.log('Saved response to docs/response.json');
    }
  } catch (err) {
    console.error('Fetch failed', err);
    // write error to file for debugging
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/response.json', JSON.stringify({ ok:false, error: String(err), time: new Date().toISOString() }, null, 2));
    process.exit(1);
  }
}

run();
