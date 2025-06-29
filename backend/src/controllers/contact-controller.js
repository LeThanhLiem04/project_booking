import nodemailer from 'nodemailer';

export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
  }
  try {
    // Cấu hình transporter (bạn cần thay đổi user, pass cho phù hợp)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.CONTACT_EMAIL_PASS || 'your-app-password',
      },
    });
    // Nội dung email
    const mailOptions = {
      from: email,
      to: process.env.CONTACT_EMAIL_RECEIVER || 'your-email@gmail.com',
      subject: `Liên hệ từ ${name}`,
      text: `Tên: ${name}\nEmail: ${email}\nNội dung: ${message}`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Gửi email thành công!' });
  } catch (error) {
    console.error('Lỗi gửi email liên hệ:', error);
    res.status(500).json({ message: 'Gửi email thất bại.' });
  }
}; 