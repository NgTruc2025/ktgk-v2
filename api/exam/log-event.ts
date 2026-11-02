export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  return res.status(200).json({
    success: true,
    eventType: body.eventType || 'UNKNOWN'
  });
}
