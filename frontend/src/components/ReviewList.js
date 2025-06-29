import React, { useState } from 'react';
import { Box, Typography, Rating, Paper, Divider, Button } from '@mui/material';
import format from 'date-fns/format';

const ReviewList = ({ reviews }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  if (!reviews || reviews.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Chưa có đánh giá nào cho khách sạn này.
      </Typography>
    );
  }

  // Hiển thị tất cả đánh giá hoặc chỉ 5 đánh giá đầu tiên
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);
  const hasMoreReviews = reviews.length > 5;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Đánh giá từ khách hàng ({reviews.length} đánh giá)
      </Typography>
      {displayedReviews.map((review, index) => (
        <Paper key={review._id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              {review.userId?.username || 'Khách'}
            </Typography>
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {format(new Date(review.createdAt), 'dd/MM/yyyy')}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {review.comment}
          </Typography>
          {review.response && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                <Typography variant="subtitle2" color="primary">
                  Phản hồi từ khách sạn:
                </Typography>
                <Typography variant="body2">
                  {review.response}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
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
    </Box>
  );
};

export default ReviewList; 