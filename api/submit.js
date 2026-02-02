import { Resend } from 'resend';

const readRequestBody = (req) => new Promise((resolve) => {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => resolve(data));
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_TO || process.env.RESEND_FROM;

  if (!apiKey || !from || !to) {
    return res.status(500).json({ message: 'Email service is not configured.' });
  }

  let payload = req.body;
  if (!payload || typeof payload !== 'object') {
    const raw = await readRequestBody(req);
    try {
      payload = JSON.parse(raw || '{}');
    } catch {
      payload = {};
    }
  }

  const {
    name,
    email,
    orgName,
    city,
    state,
    category,
    website,
    description,
    changes,
  } = payload || {};

  if (!name || !email || !changes) {
    return res.status(400).json({ message: 'Name, email, and requested changes are required.' });
  }

  const resend = new Resend(apiKey);

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    orgName ? `Organization/Business: ${orgName}` : '',
    city ? `City: ${city}` : '',
    state ? `State: ${state}` : '',
    category ? `Category: ${category}` : '',
    website ? `Website: ${website}` : '',
    description ? `Description: ${description}` : '',
    '',
    'Requested changes:',
    changes,
  ].filter(Boolean);

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Directory update request',
      text: lines.join('\n'),
      reply_to: email,
    });

    return res.status(200).json({ message: 'Submitted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email send failed.';
    return res.status(500).json({ message });
  }
}