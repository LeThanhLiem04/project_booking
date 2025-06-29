import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createPayment, confirmPayment, getBookingById } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Load Stripe key from environment variable
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ bookingId, clientSecret, amount, paymentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { triggerNotificationRefresh } = useAuth();

  // Add a state to manage if the card element is ready
  const [cardReady, setCardReady] = useState(false);

  useEffect(() => {
    if (elements) {
      const card = elements.getElement(CardElement);
      if (card) {
        setCardReady(true);
      }
      // You might also want to listen for 'ready' event on CardElement if needed
      // card.on('ready', () => setCardReady(true));
    }
  }, [elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !cardReady) {
      toast.error('Payment system is not fully ready. Please try again or refresh.');
      return;
    }
    try {
      console.log('Attempting to confirm payment with clientSecret:', clientSecret);
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (error) {
        console.error('Stripe confirmCardPayment error:', error);
        toast.error(error.message);
      } else {
        await confirmPayment({ paymentId, bookingId });
        toast.success('Thanh toán thành công! Đặt phòng đã được xác nhận.');
        triggerNotificationRefresh();
        navigate('/');
      }
    } catch (err) {
      console.error('Payment error in handleSubmit:', err);
      toast.error(err.response?.data?.message || 'Không thể xử lý thanh toán');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Thanh toán</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={!stripe || !cardReady} // Disable button until Stripe and CardElement are ready
        >
          Thanh toán {amount.toLocaleString()} VNĐ
        </Button>
      </Box>
    </Paper>
  );
};

const Booking = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { triggerNotificationRefresh } = useAuth();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to view booking details');
          navigate('/login');
          return;
        }

        const { data } = await getBookingById(bookingId);
        if (!data) {
          throw new Error('Booking not found');
        }
        setBooking(data);

        // Create payment intent
        console.log('Attempting to create payment for bookingId:', bookingId, 'with amount:', data.totalPrice);
        const { data: payment } = await createPayment({ bookingId, amount: data.totalPrice });
        console.log('Received payment object from backend:', JSON.stringify(payment, null, 2));
        if (!payment) {
          throw new Error('Failed to create payment intent');
        }
        setPaymentData({ bookingId, ...payment });
      } catch (err) {
        console.error('Lỗi khi tải chi tiết đặt phòng hoặc tạo thanh toán:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải chi tiết đặt phòng hoặc tạo thanh toán';
        setError(errorMessage);
        toast.error(errorMessage);
        
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === '1' && !toastShownRef.current) {
      toast.success('Đặt phòng thành công!');
      triggerNotificationRefresh();
      window.history.replaceState({}, document.title, location.pathname);
      toastShownRef.current = true;
    }
  }, [location]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography color="error">Booking not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hoàn tất đặt phòng
      </Typography>
      <Paper elevation={3} sx={{ p: 4, mb: 2 }}>
        <Typography variant="h6">Chi tiết đặt phòng</Typography>
        <Typography>Mã đặt phòng: {booking._id}</Typography>
        <Typography>Phòng: {booking.roomId?.name || 'Không xác định'}</Typography>
        <Typography>Ngày nhận phòng: {new Date(booking.checkInDate).toLocaleDateString()}</Typography>
        <Typography>Ngày trả phòng: {new Date(booking.checkOutDate).toLocaleDateString()}</Typography>
        <Typography>Tổng tiền: {booking.totalPrice.toLocaleString()} VNĐ</Typography>
      </Paper>
      {paymentData && (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            bookingId={paymentData.bookingId}
            clientSecret={paymentData.clientSecret}
            amount={paymentData.payment.amount}
            paymentId={paymentData.payment._id}
          />
        </Elements>
      )}
      {/* Bank Transfer Section */}
      <Paper elevation={3} sx={{ p: 4, mt: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chuyển khoản ngân hàng (Quét QR)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <img src="/qr-bank-liem.png" alt="QR chuyển khoản Agribank" width={180} style={{ borderRadius: 8, border: '1px solid #eee' }} />
          <Box>
            <Typography>Số tài khoản: <b>6607205204037</b></Typography>
            <Typography>Ngân hàng: <b>Agribank</b></Typography>
            <Typography>Chủ tài khoản: <b>LE THANH LIEM</b></Typography>
            <Typography>
              Nội dung chuyển khoản: <b>Thanh toan booking #{booking._id}</b>
            </Typography>
            <Typography color="warning.main" sx={{ mt: 1 }}>
              * Vui lòng chuyển đúng nội dung để được xác nhận nhanh nhất!
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Booking;