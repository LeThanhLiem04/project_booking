import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Hotels from './pages/Hotels';
import Booking from './pages/Booking';
import AdminPanel from './pages/AdminPanel';
import AdminDashboard from './pages/AdminDashboard';
import ReviewManagement from './pages/ReviewManagement';
import Rooms from './pages/Rooms';
import MyBookings from './pages/MyBookings';
import MyPayments from './pages/MyPayments';
import RoomDetails from './pages/RoomDetails';
import HotelDetails from './pages/HotelDetails';
import PrivateRoute from './components/PrivateRoute';
import HotelRooms from './pages/HotelRooms';
import { useEffect } from 'react';
import Contact from './pages/Contact';
import ChatBot from './components/ChatBot';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import TestPage from './pages/TestPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ToastContainer />
            <Routes>
              {/* Admin Routes - No Layout */}
              <Route path="/admin/*" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              
              {/* User Routes - With Layout */}
              <Route path="/*" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="hotels" element={<Hotels />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="hotels/:id" element={<HotelDetails />} />
                <Route path="hotels/:id/rooms" element={<HotelRooms />} />
                <Route path="rooms/:id" element={<RoomDetails />} />
                <Route path="booking/:bookingId" element={<PrivateRoute><Booking /></PrivateRoute>} />
                <Route path="my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
                <Route path="contact" element={<Contact />} />
                <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
                <Route path="my-payments" element={<PrivateRoute><MyPayments /></PrivateRoute>} />
                <Route path="test" element={<TestPage />} />
              </Route>
            </Routes>
            <ChatBot />
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;