import { api } from './api';

const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Thay bằng preset của bạn
const CLOUDINARY_CLOUD_NAME = 'dla5gvonz'; // Thay bằng cloud name của bạn

export const updateProfile = async (data) => {
  let payload = { ...data };
  if (data.avatar) {
    // Upload file lên Cloudinary trước
    const formData = new FormData();
    formData.append('file', data.avatar);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadData = await res.json();
    if (uploadData.secure_url) {
      payload.avatarUrl = uploadData.secure_url;
      delete payload.avatar;
    } else {
      throw new Error('Tải ảnh lên thất bại!');
    }
  }
  // Gửi lên backend
  const res = await api.put('/users/profile', payload);
  return { user: res.data };
};

// Lấy thống kê hoạt động của user hiện tại
export const getUserStats = async () => {
  // Lấy tất cả booking của user
  const bookingsRes = await api.get('/bookings');
  const bookings = bookingsRes.data || [];
  // Lấy tất cả payment completed của user
  const paymentsRes = await api.get('/payments/my-payments');
  const completedPayments = (paymentsRes.data || []).filter(p => p.status === 'completed');
  // Lấy bookingId đã completed payment
  const completedBookingIds = new Set(completedPayments.map(p => p.bookingId?._id || p.bookingId));
  // Chỉ tính các booking đã completed payment
  const completedBookings = bookings.filter(b => completedBookingIds.has(b._id));
  const totalBookings = completedBookings.length;
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const avgSpent = totalBookings > 0 ? Math.round(totalSpent / totalBookings) : 0;
  return {
    totalBookings,
    totalSpent,
    avgSpent,
  };
}; 