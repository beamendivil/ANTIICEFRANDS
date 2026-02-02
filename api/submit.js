export default function handler(req, res) {
  res.status(410).json({ message: 'This endpoint is no longer in use.' });
}