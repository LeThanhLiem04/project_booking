import { useState, useEffect } from 'react';
import { getAllReviews, deleteReview } from '../services/api';
import { Typography, Button, Box, List, ListItem, ListItemText, Paper } from '@mui/material';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await getAllReviews();
      setReviews(data);
    };
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    await deleteReview(id);
    setReviews(reviews.filter((r) => r._id !== id));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Review Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <List>
          {reviews.map((r) => (
            <ListItem key={r._id}>
              <ListItemText primary={`Hotel: ${r.hotelId.name} - Rating: ${r.rating} - ${r.comment}`} />
              <Button variant="contained" color="error" onClick={() => handleDelete(r._id)}>
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ReviewManagement;