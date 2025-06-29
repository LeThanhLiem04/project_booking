import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import HotelIcon from '@mui/icons-material/Hotel';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const { notificationRefreshKey } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    console.log('Fetching notifications due to refresh key change.');
    try {
      const data = await notificationService.getNotifications();
      console.log('Fetched notifications:', data);
      setNotifications(data);
      const unread = data.filter(n => !n.read).length;
      console.log('Unread count:', unread);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [notificationRefreshKey]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
      case 'payment_pending':
        return <PaymentIcon color="primary" />;
      case 'booking_confirmed':
      case 'booking_pending':
        return <HotelIcon color="success" />;
      case 'booking_cancelled':
        return <CancelIcon color="error" />;
      default:
        return <CheckCircleIcon color="primary" />;
    }
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification._id);
    console.log('Notification clicked:', notification);
    console.log('Notification type:', notification.type);
    console.log('Notification link:', notification.link);

    if (notification.type === 'payment_success' || notification.type === 'booking_confirmed') {
      const idToPass = notification.metadata?.paymentId || notification.metadata?.bookingId;
      console.log('ID to pass for payments:', idToPass);
      if (idToPass) {
        navigate(`/my-payments?id=${idToPass}`);
      } else {
        navigate('/my-payments');
      }
      handleClose();
    } else if (notification.link) {
      navigate(notification.link);
      handleClose();
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true; // 'all' filter
  });

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          color: '#fff',
          '&:hover': { color: '#00eaff' },
          marginRight: 1,
        }}
        aria-label="Show notifications"
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#e91e63',
              color: '#fff',
              fontWeight: 'bold',
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            mt: 1.5,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Thông báo</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ color: '#00eaff' }}
            >
              Đánh dấu đã đọc tất cả
            </Button>
          )}
        </Box>
        <Box sx={{ px: 2, display: 'flex', gap: 1, mb: 1 }}>
          <Button 
            variant={filter === 'all' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => setFilter('all')}
          >
            Tất cả
          </Button>
          <Button 
            variant={filter === 'unread' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => setFilter('unread')}
          >
            Chưa đọc
          </Button>
          <Button 
            variant={filter === 'read' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => setFilter('read')}
          >
            Đã đọc
          </Button>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {filteredNotifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Không có thông báo mới"
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          ) : (
            filteredNotifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' },
                    py: 1.5,
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={formatDate(notification.createdAt)}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: notification.read ? 'normal' : 'bold',
                        color: notification.read ? 'text.primary' : 'primary.main',
                      }
                    }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationBell; 