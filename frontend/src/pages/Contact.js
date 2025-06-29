import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);
    try {
      // Gửi dữ liệu tới backend
      await axios.post('/api/contact', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Gửi liên hệ thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>Liên hệ với chúng tôi</Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Left Column: Contact Info and Form */}
        <Box sx={{ flex: 1 }}>
          {/* Contact Information */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Thông tin liên hệ</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body1">371 Đ. Nguyễn Kiệm, Phường 3, Gò Vấp, Hồ Chí Minh 700000</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body1">0375846312</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body1">liem10042004@gmail.com</Typography>
            </Box>
          </Paper>

          {/* Contact Form */}
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>Gửi tin nhắn cho chúng tôi</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Họ tên"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                type="email"
              />
              <TextField
                label="Nội dung liên hệ"
                name="message"
                value={form.message}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                multiline
                rows={4}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} fullWidth disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
              </Button>
            </form>
            {sent && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
          </Paper>
        </Box>

        {/* Right Column: Google Maps */}
        <Box sx={{ flex: 1, minHeight: 400 }}> {/* minHeight để đảm bảo bản đồ có chiều cao nhất định */}
          <Typography variant="h6" gutterBottom>Vị trí của chúng tôi</Typography>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3, height: '100%' }}>
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5778788688486!2d105.81925941489146!3d21.008453786009854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab73b7cf6521%3A0x100c242031b0ca42!2zMjY2IMSQ4buZaSBD4bqlbiwgTGnhu4V1IEdpYWksIEJhIMSQw6xuaCwgSMOgIE7hu5lpLCBWaeH7h3QgTmFt!5e0!3m2!1svi!2s!4v1648714564330!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Contact; 