export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, message: 'Student verification endpoint ready' });
  }

  const body = req.body || {};
  const { studentId, fullName, className, examCode } = body;

  if (!studentId || !fullName || !className) {
    return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ Họ tên, Mã học sinh và Lớp.' });
  }

  const normId = studentId.trim().toUpperCase();

  return res.status(200).json({
    success: true,
    student: {
      studentId: normId,
      fullName: fullName.trim(),
      className: className.trim(),
      grade: 12,
      status: 'Chưa thi'
    }
  });
}
