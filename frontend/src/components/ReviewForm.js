import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, TextField, Button, Paper } from '@mui/material';
import { createReview } from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios'; // Import axios to check error type

const ReviewForm = ({ hotelId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]); // Thêm state lưu danh sách đánh giá
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Hàm load danh sách đánh giá
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      console.log('Gọi API lấy review cho hotelId:', hotelId); // Log hotelId
      const res = await axios.get(`http://localhost:3001/api/hotels/reviews/${hotelId}`);
      console.log('Kết quả API trả về:', res.data); // Log response
      setReviews(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy review:', err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    console.log('ReviewForm mounted với hotelId:', hotelId); // Log khi mount
    if (hotelId) {
      fetchReviews();
    }
    // eslint-disable-next-line
  }, [hotelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét của bạn');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = { hotelId, rating, comment };
      console.log('Sending review data:', reviewData);
      console.log('Current token:', localStorage.getItem('token'));
      
      const response = await createReview(reviewData);
      console.log('Review response:', response);
      
      if (response.data) {
        toast.success('Đánh giá đã được gửi thành công');
        setRating(0);
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        fetchReviews(); // Load lại đánh giá mới
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Không thể gửi đánh giá';

      if (axios.isAxiosError(error) && error.response) {
        // Prioritize backend message if available
        errorMessage = error.response.data?.message || error.message;

        if (error.response.status === 403) {
           if (errorMessage.includes('already reviewed')){
             toast.error(errorMessage);
           } else {
              // Fallback for other 403 errors if any
             toast.error('Bạn không có quyền thực hiện thao tác này.');
           }
        } else {
           // Handle other specific status codes if needed
          toast.error('Lỗi: ' + errorMessage);
        }

      } else {
         // Handle non-Axios errors or errors without response
        toast.error('Đã xảy ra lỗi không xác định.');
      }

    } finally {
      setSubmitting(false);
    }
  };

  // Hiển thị tất cả đánh giá hoặc chỉ 5 đánh giá đầu tiên
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);
  const hasMoreReviews = reviews.length > 5;

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Viết đánh giá
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Đánh giá của bạn</Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={0.5}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nhận xét của bạn"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </form>
      </Paper>
      {/* Hiển thị danh sách đánh giá */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Các đánh giá trước đây ({reviews.length} đánh giá)
        </Typography>
        {loadingReviews ? (
          <Typography>Đang tải đánh giá...</Typography>
        ) : reviews.length === 0 ? (
          <Typography>Chưa có đánh giá nào.</Typography>
        ) : (
          <>
            {displayedReviews.map((review, idx) => (
              <Box key={idx} sx={{ borderBottom: '1px solid #eee', mb: 2, pb: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body1">{review.comment}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {/* Ưu tiên username, sau đó đến name nếu có */}
                  {review.userId?.username || review.userId?.name || ''}
                </Typography>
              </Box>
            ))}
            
            {/* Nút "Xem thêm" hoặc "Thu gọn" */}
            {hasMoreReviews && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  sx={{ minWidth: 120 }}
                >
                  {showAllReviews ? 'Thu gọn' : `Xem thêm (${reviews.length - 5})`}
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </>
  );
};

export default ReviewForm; 