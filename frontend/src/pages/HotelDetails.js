import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Paper, CircularProgress, Button } from '@mui/material';
import { getHotelById, getReviewsByHotel } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { LocationOn } from '@mui/icons-material';

const HotelDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState(false);

  useEffect(() => {
    fetchHotelDetails();
    fetchReviews();
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      const response = await getHotelById(id);
      setHotel(response.data);
    } catch (err) {
      setError('Không thể tải thông tin khách sạn');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await getReviewsByHotel(id);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const toggleDesc = () => {
    setExpandedDesc(!expandedDesc);
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

  if (!hotel) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography>Không tìm thấy thông tin khách sạn.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {hotel.name}
            </Typography>
            {hotel.image && (
              <Box
                component="img"
                src={hotel.image.startsWith('http') ? hotel.image : `http://localhost:3001${hotel.image}`}
                alt={hotel.name}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2,
                }}
              />
            )}
            {hotel.description && (
              <>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={expandedDesc
                    ? { mb: 1 }
                    : { 
                        mb: 1, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }
                  }
                >
                  {hotel.description}
                </Typography>
                {hotel.description.length > 150 && (
                  <Button
                    size="small"
                    color="primary"
                    sx={{ textTransform: 'none', minHeight: 0, minWidth: 0, p: 0, mb: 2 }}
                    onClick={toggleDesc}
                  >
                    {expandedDesc ? 'Thu gọn' : 'Xem thêm'}
                  </Button>
                )}
              </>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ color: 'text.secondary', mr: 1, fontSize: 24 }} />
              <Typography variant="body1" color="text.secondary">
                {hotel.address}, {hotel.city}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12}>
          {user && <ReviewForm hotelId={id} onReviewSubmitted={fetchReviews} />}
          <ReviewList reviews={reviews} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HotelDetails;