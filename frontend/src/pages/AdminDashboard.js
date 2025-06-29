import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Hotel as HotelIcon,
  MeetingRoom as RoomIcon,
  BookOnline as BookingIcon,
  RateReview as ReviewIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  CalendarMonth as CalendarMonthIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import AdminUsers from './AdminUsers';
import AdminHotels from './AdminHotels';
import AdminRooms from './AdminRooms';
import AdminBookings from './AdminBookings';
import AdminReviews from './AdminReviews';
import AdminPayments from './AdminPayments';
import { getStats, getCancelledBookingsStats } from '../services/api';

const StatsCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ 
        backgroundColor: `${color}15`, 
        borderRadius: '50%', 
        p: 1, 
        mr: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { sx: { color: color, fontSize: 28 } })}
      </Box>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', px: 2, pb: 2 }}>
      {value}
    </Typography>
  </Card>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartType, setChartType] = useState('revenue'); // 'revenue' or 'bookings'
  const [timePeriod, setTimePeriod] = useState('month'); // 'month' or 'quarter'
  const [cancelledChartData, setCancelledChartData] = useState([]);
  const [loadingCancelledChart, setLoadingCancelledChart] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats('revenue', 'month', selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    fetchStats(chartType, timePeriod, selectedYear);
  }, [chartType, timePeriod, selectedYear]);

  useEffect(() => {
    fetchCancelledStats(selectedYear, timePeriod);
  }, [selectedYear, timePeriod]);

  const fetchStats = async (type, period, year = selectedYear) => {
    if (!stats) setLoadingStats(true);
    setLoadingChart(true);

    try {
      const response = await getStats({ type, period, year });

      if (response.data) {
        if (response.data.totalStats) {
           setStats(response.data.totalStats);
        }

        if (response.data.timeSeriesData) {
            const formattedData = response.data.timeSeriesData.map(item => ({
              time: item.time,
              value: item.value,
            }));
             setChartData(formattedData);
        } else {
            setChartData([]);
        }

      }

    } catch (err) {
      console.error('Error fetching stats:', err);
       if (!stats) setStats(null);
       setChartData([]);
    } finally {
      setLoadingStats(false);
      setLoadingChart(false);
    }
  };

  const fetchCancelledStats = async (year, periodType) => {
    setLoadingCancelledChart(true);
    try {
      const response = await getCancelledBookingsStats(year, periodType);
      if (response.data) {
        const rawData = response.data;
        const filledData = [];
        
        if (periodType === 'month') {
          for (let i = 1; i <= 12; i++) {
            const existing = rawData.find(d => d._id.month === i);
            filledData.push({
              name: `${i}/${year}`,
              count: existing ? existing.count : 0,
            });
          }
        } else { // quarter
          for (let i = 1; i <= 4; i++) {
            const existing = rawData.find(d => d._id.quarter === i);
            filledData.push({
              name: `Quý ${i}/${year}`,
              count: existing ? existing.count : 0,
            });
          }
        }
        setCancelledChartData(filledData);
      } else {
        setCancelledChartData([]);
      }
    } catch (err) {
      console.error('Error fetching cancelled bookings stats:', err);
      setCancelledChartData([]);
    } finally {
      setLoadingCancelledChart(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

  // Hàm rút gọn số liệu
  const formatNumberShort = (value) => {
    if (value >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return value.toLocaleString();
  };

  // Tính tick dài nhất cho cả hai biểu đồ
  const getMaxTickLength = (data, key) => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(d => formatNumberShort(d[key] || 0).toString().length));
  };
  const maxTickLength = Math.max(
    getMaxTickLength(chartData, 'value'),
    getMaxTickLength(cancelledChartData, 'count')
  );
  // Ước lượng width dựa trên số ký tự (mỗi ký tự ~8px, cộng thêm padding)
  const yAxisWidth = Math.max(40, maxTickLength * 8 + 16);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>Năm</InputLabel>
          <Select
            value={selectedYear}
            label="Năm"
            onChange={e => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Tổng quan
        </Typography>
      </Box>
      {loadingStats && !stats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : stats ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <StatsCard
              title="Tổng người dùng"
              value={stats.totalUsers || 0}
              icon={<PeopleIcon />}
              color="#00eaff"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard
              title="Tổng đặt phòng"
              value={stats.totalBookings || 0}
              icon={<BookingIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard
              title="Tổng doanh thu"
              value={`${stats.totalRevenue?.toLocaleString() || 0} VNĐ`}
              icon={<MoneyIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard
              title="Tỷ lệ đặt phòng"
              value={`${stats.bookingRate || 0}%`}
              icon={<TrendingUpIcon />}
              color="#e91e63"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard
              title="Tổng hủy phòng"
              value={stats.totalCancelledBookings || 0}
              icon={<CancelIcon />}
              color="#f44336"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard
              title="Tỷ lệ hủy phòng"
              value={
                stats.totalBookings && stats.totalBookings > 0
                  ? `${((stats.totalCancelledBookings / stats.totalBookings) * 100).toFixed(2)}%`
                  : '0%'
              }
              icon={<CancelIcon />}
              color="#b71c1c"
            />
          </Grid>
        </Grid>
      ) : (
        <Typography>Không có dữ liệu tổng quan.</Typography>
      )}

      <Box sx={{ width: '100%', mx: 0, px: 0 }}>
        <Paper square sx={{ p: 3, mx: 0, width: '100%', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <Typography variant="h6" gutterBottom>Thống kê chi tiết</Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item>
              <FormControl size="small">
                <InputLabel>Năm</InputLabel>
                <Select
                  value={selectedYear}
                  label="Năm"
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl size="small">
                <InputLabel>Loại thống kê</InputLabel>
                <Select
                  value={chartType}
                  label="Loại thống kê"
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <MenuItem value="revenue">Doanh thu</MenuItem>
                  <MenuItem value="bookings">Số lượng đặt phòng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl size="small">
                <InputLabel>Kỳ hạn</InputLabel>
                <Select
                  value={timePeriod}
                  label="Kỳ hạn"
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <MenuItem value="month">Theo tháng</MenuItem>
                  <MenuItem value="quarter">Theo quý</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loadingChart ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}><CircularProgress /></Box>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'revenue' ? (
                <LineChart data={chartData} margin={{ left: 40, right: 30, top: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={formatNumberShort} width={yAxisWidth} />
                  <Tooltip formatter={formatNumberShort} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name={chartType === 'revenue' ? 'Doanh thu (VNĐ)' : 'Số lượng đặt phòng'} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ left: 40, right: 30, top: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={formatNumberShort} width={yAxisWidth} />
                  <Tooltip formatter={formatNumberShort} />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name={chartType === 'revenue' ? 'Doanh thu (VNĐ)' : 'Số lượng đặt phòng'} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>Không có dữ liệu để hiển thị biểu đồ.</Typography>
          )}
        </Paper>
        <Paper square sx={{ p: 3, mx: 0, width: '100%', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <Typography variant="h6" gutterBottom>Thống kê hủy phòng</Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item>
              <FormControl size="small">
                <InputLabel>Năm</InputLabel>
                <Select
                  value={selectedYear}
                  label="Năm"
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl size="small">
                <InputLabel>Kỳ hạn</InputLabel>
                <Select
                  value={timePeriod}
                  label="Kỳ hạn"
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <MenuItem value="month">Theo tháng</MenuItem>
                  <MenuItem value="quarter">Theo quý</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loadingCancelledChart ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}><CircularProgress /></Box>
          ) : cancelledChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cancelledChartData} margin={{ left: 40, right: 30, top: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatNumberShort} width={yAxisWidth} />
                <Tooltip formatter={formatNumberShort} />
                <Legend />
                <Bar dataKey="count" fill="#f44336" name="Số lượng hủy phòng" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>Không có dữ liệu hủy phòng để hiển thị biểu đồ.</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    navigate('/login', { replace: true });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Tổng quan', icon: <DashboardIcon />, path: '/admin/overview' },
    { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Quản lý khách sạn', icon: <HotelIcon />, path: '/admin/hotels' },
    { text: 'Quản lý phòng', icon: <RoomIcon />, path: '/admin/rooms' },
    { text: 'Quản lý đặt phòng', icon: <BookingIcon />, path: '/admin/bookings' },
    { text: 'Quản lý thanh toán', icon: <MoneyIcon />, path: '/admin/payments' },
    { text: 'Trang chủ', icon: <DashboardIcon />, path: '/' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Paper sx={{ width: 280, position: 'fixed', height: '100vh', borderRadius: 0 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#000' }}>
          <img src="/Brikk_logo-1.gif" style={{ height: 40 }} />
          <Typography variant="h6" sx={{ color: '#fff' }}>Admin Panel</Typography>
        </Box>
        <Divider />
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem
                button
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 234, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 234, 255, 0.2)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 234, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#00eaff' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    color: location.pathname === item.path ? '#00eaff' : 'inherit'
                  }}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2, boxSizing: 'border-box' }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ mb: 2 }}
          >
            Đăng xuất
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, ml: '280px' }}>
        <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: '#000', color: '#fff', boxShadow: 'none', borderRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, zIndex: 1201 }}>
          <Toolbar sx={{ py: 1 }}>
            <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
              {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'Bảng điều khiển'}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 