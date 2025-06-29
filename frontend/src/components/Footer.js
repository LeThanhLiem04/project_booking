import { Box, Typography, Link, Grid, TextField, Button, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: '#2d2d2d', color: '#fff', mt: 0, pt: 0, pb: 3, px: { xs: 2, md: 8 } }}>
      <Grid container spacing={4} justifyContent="center">
        {/* About */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff', borderBottom: '2px solid #2196f3', display: 'inline-block' }}>GIỚI THIỆU</Typography>
          <Typography variant="body2" sx={{ mt: 2, color: '#ccc' }}>
            Chúng tôi cung cấp các phòng nghỉ sang trọng, ẩm thực tinh tế và dịch vụ tận tâm cho kỳ nghỉ đáng nhớ của bạn.
          </Typography>
        </Grid>
        {/* Payment Accepted */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff', borderBottom: '2px solid #2196f3', display: 'inline-block' }}>CHẤP NHẬN THANH TOÁN</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" style={{ height: 32, background: '#fff', borderRadius: 4, padding: 2 }} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/American_Express_logo.svg/320px-American_Express_logo.svg.png" alt="Amex" style={{ height: 32, background: '#fff', borderRadius: 4, padding: 2 }} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="MasterCard" style={{ height: 32, background: '#fff', borderRadius: 4, padding: 2 }} />
          </Box>
          <Box sx={{ mt: 1 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: 24, marginTop: 8 }} />
          </Box>
        </Grid>
        {/* Get Notifications */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff', borderBottom: '2px solid #2196f3', display: 'inline-block' }}>NHẬN THÔNG BÁO</Typography>
          <Box sx={{ mt: 2 }}>
            <TextField
              placeholder="Địa chỉ email của bạn"
              size="small"
              variant="outlined"
              sx={{ background: '#444', borderRadius: 1, input: { color: '#fff' }, width: '100%' }}
              InputProps={{ style: { color: '#fff' } }}
            />
            <Button variant="contained" sx={{ mt: 2, width: '100%', background: 'linear-gradient(90deg,#2196f3,#21cbf3)', fontWeight: 700 }}>
              ĐĂNG KÝ
            </Button>
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 3, color: '#fff' }}>THEO DÕI CHÚNG TÔI</Typography>
          <Box sx={{ mt: 1 }}>
            <IconButton sx={{ color: '#fff', mr: 1, background: '#444' }}><FacebookIcon /></IconButton>
            <IconButton sx={{ color: '#fff', background: '#444' }}><TwitterIcon /></IconButton>
          </Box>
        </Grid>
        {/* Explore */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff', borderBottom: '2px solid #2196f3', display: 'inline-block' }}>KHÁM PHÁ</Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link href="#" underline="hover" sx={{ color: '#ccc', fontSize: 16 }}>Chính sách</Link>
            <Link href="#" underline="hover" sx={{ color: '#ccc', fontSize: 16 }}>Thông báo pháp lý</Link>
            <Link href="#" underline="hover" sx={{ color: '#ccc', fontSize: 16 }}>Điều khoản & Điều kiện</Link>
            <Link href="#" underline="hover" sx={{ color: '#ccc', fontSize: 16 }}>Về chúng tôi</Link>
            <Link href="#" underline="hover" sx={{ color: '#ccc', fontSize: 16 }}>Thanh toán an toàn</Link>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;