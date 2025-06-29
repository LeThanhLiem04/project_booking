import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchHotels, getRoomsByHotel } from '../services/api';
import { 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box,
  Link,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Pagination,
  Button
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LocationOn } from '@mui/icons-material';

const ITEMS_PER_PAGE = 6;

const Hotels = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCity, setFilterCity] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [page, setPage] = useState(1);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [pageRoom, setPageRoom] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (hotelId) {
          console.log('Fetching rooms for hotel:', hotelId);
          const roomsResponse = await getRoomsByHotel(hotelId);
          console.log('Rooms response:', roomsResponse.data);
          setRooms(roomsResponse.data || []);
        } else {
          console.log('Fetching hotels...');
          const hotelsResponse = await searchHotels({});
          console.log('Hotels from search:', hotelsResponse.data);
          setHotels(hotelsResponse.data || []);
          setPage(1);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        console.error('Error response:', error.response);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setHotels([]);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const cityList = Array.from(new Set(hotels.map(h => h.city).filter(Boolean)));

  const filteredHotels = hotels.filter(hotel => {
    const matchCity = filterCity ? hotel.city === filterCity : true;
    const matchAddress = filterAddress ? hotel.address?.toLowerCase().includes(filterAddress.toLowerCase()) : true;
    return matchCity && matchAddress;
  });

  const totalPages = Math.ceil(filteredHotels.length / ITEMS_PER_PAGE);
  const paginatedHotels = filteredHotels.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDesc = (hotelId) => {
    setExpandedDesc(prev => ({ ...prev, [hotelId]: !prev[hotelId] }));
  };

  const totalRoomPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = rooms.slice(
    (pageRoom - 1) * ITEMS_PER_PAGE,
    pageRoom * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPageRoom(1);
  }, [hotelId]);

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {hotelId ? (
        <>
          <Typography variant="h4" gutterBottom>
            Rooms for Hotel
          </Typography>
          {rooms.length === 0 ? (
            <Typography>Không tìm thấy phòng nào cho khách sạn này.</Typography>
          ) : (
            <>
            <Grid container spacing={2}>
                {paginatedRooms.map((room) => (
                <Grid item xs={12} sm={6} md={3} key={room._id}>
                  <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <CardMedia
                      component="img"
                      sx={{
                        height: 200,
                        objectFit: 'cover',
                        width: '100%',
                      }}
                      image={room.image?.startsWith('http') ? room.image : `http://localhost:3001${room.image}`}
                      alt={room.name}
                      onError={(e) => console.error('Image failed to load:', `http://localhost:3001${room.image}`)}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {room.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Giá: {room.price.toLocaleString()} VNĐ | Sức chứa: {room.capacity}
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Link href={`/booking?roomId=${room._id}`} color="primary" underline="hover">
                          Đặt ngay →
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
              {totalRoomPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalRoomPages}
                    page={pageRoom}
                    onChange={(e, value) => setPageRoom(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Khách sạn
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ background: '#fff', borderRadius: 2, boxShadow: 2, p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Bộ lọc</Typography>
                <FormControl fullWidth sx={{ mb: 2 }} size="small">
                  <InputLabel>Thành phố</InputLabel>
                  <Select
                    value={filterCity}
                    label="Thành phố"
                    onChange={e => setFilterCity(e.target.value)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {cityList.map(city => (
                      <MenuItem key={city} value={city}>{city}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Địa chỉ"
                  value={filterAddress}
                  onChange={e => setFilterAddress(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              {filteredHotels.length === 0 ? (
                <Typography>Không tìm thấy khách sạn nào.</Typography>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {paginatedHotels.map((hotel) => (
                      <Grid item xs={12} sm={6} md={4} key={hotel._id}>
                        <Card
                          sx={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                          onClick={() => navigate(`/hotels/${hotel._id}/rooms`)}
                        >
                          <CardMedia
                            component="img"
                            sx={{
                              height: 200,
                              objectFit: 'cover',
                              width: '100%',
                            }}
                            image={hotel.image?.startsWith('http') ? hotel.image : `http://localhost:3001${hotel.image}`}
                            alt={hotel.name}
                            onError={(e) => console.error('Image failed to load:', `http://localhost:3001${hotel.image}`)}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
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
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Hotels;