import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchHotels, getAvailableRooms, getReviewsByHotel } from '../services/api';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon, LocationOn, MoreHoriz } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import { toast } from 'react-toastify';
import axios from 'axios'; // Import axios to check error type

const bannerUrl = 'https://dreamimaginations.com/wp-content/uploads/2023/12/Minimalist-Style-Home-Interior-Designs-Ocean-AI-Artwork-18-480x269.jpg'; // Banner mới

const adultsOptions = [1, 2, 3, 4, 5];
const childrenOptions = [0, 1, 2, 3, 4, 5];

const ITEMS_PER_PAGE = 6; // Số item hiển thị trên mỗi trang

const Home = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
  });
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [page, setPage] = useState(1); // Thêm state cho trang hiện tại
  const [expandedDesc, setExpandedDesc] = useState({}); // Lưu trạng thái mở rộng mô tả từng khách sạn

  const fetchHotels = async () => {
    try {
      setLoading(true);
      // searchHotels now returns hotels with averageRating and totalReviews
      const response = await searchHotels({});
      const hotelsData = response.data || [];
      console.log('Fetched hotels data with reviews:', hotelsData); // Log fetched data
      console.log('Sample hotel reviews data:', hotelsData[0]?.totalReviews, hotelsData[0]?.averageRating); // Log sample data
      setHotels(hotelsData);
      setPage(1); // Reset trang về 1 khi dữ liệu thay đổi
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
      setError('Không thể tải khách sạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []); // Fetch hotels initially and whenever dependency changes (none in this case)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let hotelsToShow = [];
      if (form.checkIn && form.checkOut) {
        // Get all hotels
        const response = await searchHotels({ location: form.location });
        const allHotels = response.data || [];
        // Get all available rooms in date range
        const availableRoomsRes = await getAvailableRooms(form.checkIn, form.checkOut);
        const availableRooms = availableRoomsRes.data || [];
        // Get hotel IDs that have at least one available room
        const hotelIdsWithAvailableRooms = new Set(availableRooms.map(r => r.hotelId?._id || r.hotelId));
        hotelsToShow = allHotels.filter(hotel => hotelIdsWithAvailableRooms.has(hotel._id));
      } else {
        const response = await searchHotels({
          location: form.location,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
        });
        hotelsToShow = response.data || [];
      }
      setHotels(hotelsToShow);
      setPage(1); // Reset trang về 1 khi lọc/tìm kiếm
    } catch (err) {
      setError('Không thể tìm kiếm khách sạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (e, hotel) => {
    e.stopPropagation(); // Prevent card click event
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    setSelectedHotel(hotel);
    setReviewDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    setReviewDialogOpen(false);
    setSelectedHotel(null);
    fetchHotels(); 
  };

  // Logic phân trang
  const totalPages = Math.ceil(hotels.length / ITEMS_PER_PAGE);
  const paginatedHotels = hotels.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang khi chuyển trang
  };

  const toggleDesc = (hotelId) => {
    setExpandedDesc((prev) => ({ ...prev, [hotelId]: !prev[hotelId] }));
  };

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
      </Box>
    );
  }

  return (
    <Box>
      {/* Banner */}
      <Box
        sx={{
          width: '100%',
          height: { xs: 320, md: 480 },
          backgroundImage: `url(${bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          marginTop: 0,
          paddingTop: 0,
          overflow: 'hidden',
        }}
      >
        {/* Box tìm kiếm nổi trên banner */}
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: 20,
            transform: 'translateX(-50%)',
            minWidth: { xs: '90%', md: 700 },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Tìm kiếm khách sạn
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  label="Địa điểm"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Ngày nhận phòng"
                  name="checkIn"
                  type="date"
                  value={form.checkIn}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Ngày trả phòng"
                  name="checkOut"
                  type="date"
                  value={form.checkOut}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button type="submit" variant="contained" color="success" fullWidth sx={{ height: '100%' }}>
                  Tìm kiếm
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      {/* Đệm phía dưới để không bị che */}
      <Box sx={{ height: 80 }} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Chào mừng bạn đến với hệ thống đặt phòng khách sạn của liemlee
        </Typography>
        <Typography variant="h6" gutterBottom>
          Khách sạn nổi bật
        </Typography>
        {hotels.length === 0 ? (
          <Typography>Không có khách sạn nào.</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedHotels.map((hotel) => (
                <Grid item xs={12} sm={6} md={4} key={hotel._id}>
                  <Card
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/hotels/${hotel._id}/rooms`)}
                  >
                    {hotel.image && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={hotel.image?.startsWith('http') ? hotel.image : `http://localhost:3001${hotel.image}`}
                        alt={hotel.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {hotel.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ color: 'error.main', mr: 0.5, fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                          {hotel.address}{hotel.address && hotel.city ? ', ' : ''}{hotel.city}
                        </Typography>
                      </Box>
                      {hotel.description && (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={expandedDesc[hotel._id]
                              ? { mt: 0.5, fontSize: 14 }
                              : { mt: 0.5, fontSize: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }
                            }
                          >
                            {hotel.description}
                          </Typography>
                          {hotel.description.length > 80 && (
                            <Button
                              size="small"
                              color="primary"
                              sx={{ textTransform: 'none', minHeight: 0, minWidth: 0, p: 0, mt: 0.5 }}
                              onClick={e => { e.stopPropagation(); toggleDesc(hotel._id); }}
                            >
                              {expandedDesc[hotel._id] ? 'Thu gọn' : 'Xem thêm'}
                            </Button>
                          )}
                        </>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Rating
                          value={hotel.rating || 0}
                          readOnly
                          precision={0.5}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {hotel.totalReviews || 0} lượt đánh giá
                        </Typography>
                      </Box>
                      {user && (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={(e) => handleReviewClick(e, hotel)}
                          sx={{ mt: 2 }}
                        >
                          Viết đánh giá
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}
      </Box>

      {/* Dialog for ReviewForm */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{`Viết đánh giá cho ${selectedHotel?.name}`}</DialogTitle>
        <DialogContent>
          {selectedHotel && <ReviewForm hotelId={selectedHotel._id} onReviewSubmitted={handleReviewSubmitted} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;