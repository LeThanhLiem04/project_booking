# 🏨 Booking Hotel - Hệ thống đặt phòng khách sạn

Một ứng dụng web đầy đủ tính năng cho việc đặt phòng khách sạn với giao diện người dùng hiện đại và hệ thống quản lý toàn diện.

## ✨ Tính năng chính

### 👤 Người dùng
- **Đăng ký/Đăng nhập**: Hệ thống xác thực an toàn với JWT
- **Tìm kiếm khách sạn**: Tìm kiếm theo địa điểm, ngày check-in/check-out
- **Xem chi tiết khách sạn**: Thông tin, hình ảnh, đánh giá
- **Đặt phòng**: Chọn phòng, ngày, thanh toán
- **Quản lý đặt phòng**: Xem lịch sử, hủy đặt phòng
- **Đánh giá**: Viết và xem đánh giá khách sạn
- **Hồ sơ cá nhân**: Cập nhật thông tin cá nhân
- **Thanh toán**: Tích hợp Stripe cho thanh toán an toàn
- **Chatbot**: Hỗ trợ khách hàng với AI

### 👨‍💼 Admin
- **Dashboard**: Thống kê tổng quan với biểu đồ
- **Quản lý khách sạn**: Thêm, sửa, xóa khách sạn
- **Quản lý phòng**: Quản lý phòng trong từng khách sạn
- **Quản lý đặt phòng**: Xem và xử lý đặt phòng
- **Quản lý người dùng**: Quản lý tài khoản người dùng
- **Quản lý đánh giá**: Kiểm duyệt đánh giá
- **Quản lý thanh toán**: 
  - Xem tất cả giao dịch thanh toán
  - Lọc theo trạng thái (pending, completed, failed)
  - Tìm kiếm theo người dùng, khách sạn
  - Lọc theo khoảng thời gian
  - Lọc theo khoảng giá (min/max)
  - Xem chi tiết từng giao dịch (số tiền, phương thức, ngày thanh toán)
  - Phân trang dữ liệu
- **Thống kê**: Báo cáo doanh thu, đặt phòng theo thời gian

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** với Express.js
- **MongoDB** với Mongoose ODM
- **JWT** cho xác thực
- **Multer** cho upload file
- **Cloudinary** cho lưu trữ hình ảnh
- **Nodemailer** cho gửi email
- **Stripe** cho thanh toán
- **Google AI** cho chatbot
- **Helmet, CORS, Rate Limiting** cho bảo mật

### Frontend
- **React.js** với Hooks
- **Material-UI** cho UI components
- **React Router** cho routing
- **Axios** cho HTTP requests
- **React Toastify** cho thông báo
- **Recharts** cho biểu đồ
- **Date-fns** cho xử lý ngày tháng
- **Stripe Elements** cho thanh toán

## 📁 Cấu trúc dự án

```
Booking_Hotel_10/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Cấu hình database, cloudinary, nodemailer
│   │   ├── controllers/    # Logic xử lý request
│   │   ├── middlewares/    # Middleware xác thực
│   │   ├── models/         # Schema MongoDB
│   │   ├── repositories/   # Layer truy cập dữ liệu
│   │   ├── routes/         # Định nghĩa API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── uploads/            # Thư mục lưu file upload
│   ├── server.js           # Entry point
│   └── package.json
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── pages/          # Các trang của ứng dụng
│   │   ├── services/       # API services
│   │   └── App.js          # Main component
│   └── package.json
└── README.md
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MongoDB
- npm hoặc yarn

### Backend

1. **Cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Cấu hình môi trường:**
Tạo file `.env` trong thư mục `backend`:
```env
MONGODB_URI=mongodb://localhost:27017/booking_hotel
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
GOOGLE_AI_API_KEY=your_google_ai_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

3. **Chạy server:**
```bash
npm run dev
```
Server sẽ chạy tại `http://localhost:3001`

### Frontend

1. **Cài đặt dependencies:**
```bash
cd frontend
npm install
```

2. **Chạy ứng dụng:**
```bash
npm start
```
Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Hotels
- `GET /api/hotels` - Lấy danh sách khách sạn
- `GET /api/hotels/:id` - Lấy chi tiết khách sạn
- `POST /api/hotels` - Tạo khách sạn mới (Admin)
- `PUT /api/hotels/:id` - Cập nhật khách sạn (Admin)
- `DELETE /api/hotels/:id` - Xóa khách sạn (Admin)

### Rooms
- `GET /api/rooms` - Lấy danh sách phòng
- `GET /api/rooms/:id` - Lấy chi tiết phòng
- `POST /api/rooms` - Tạo phòng mới (Admin)
- `PUT /api/rooms/:id` - Cập nhật phòng (Admin)
- `DELETE /api/rooms/:id` - Xóa phòng (Admin)

### Bookings
- `GET /api/bookings` - Lấy danh sách đặt phòng
- `POST /api/bookings` - Tạo đặt phòng mới
- `PUT /api/bookings/:id` - Cập nhật trạng thái đặt phòng
- `DELETE /api/bookings/:id` - Hủy đặt phòng

### Reviews
- `GET /api/reviews` - Lấy danh sách đánh giá
- `POST /api/reviews` - Tạo đánh giá mới
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

### Payments
- `POST /api/payments/create-payment-intent` - Tạo payment intent
- `GET /api/payments` - Lấy lịch sử thanh toán
- `POST /api/payments/confirm` - Xác nhận thanh toán
- `GET /api/payments/my-payments` - Lấy thanh toán của người dùng hiện tại
- `GET /api/payments/booking/:bookingId` - Lấy thông tin thanh toán theo booking ID

### Admin
- `GET /api/admin/stats` - Thống kê tổng quan
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/bookings` - Quản lý đặt phòng
- `GET /api/admin/payments` - Quản lý thanh toán (tất cả giao dịch)
- `GET /api/admin/hotels` - Quản lý khách sạn
- `GET /api/admin/rooms` - Quản lý phòng
- `GET /api/admin/reviews` - Quản lý đánh giá

## 🔐 Bảo mật

- **JWT Authentication**: Xác thực người dùng
- **Password Hashing**: Mã hóa mật khẩu với bcrypt
- **CORS Protection**: Bảo vệ cross-origin requests
- **Rate Limiting**: Giới hạn số request
- **Helmet**: Bảo mật HTTP headers
- **CSRF Protection**: Bảo vệ CSRF attacks
- **Input Validation**: Kiểm tra dữ liệu đầu vào

## 📱 Tính năng nâng cao

- **Real-time Chatbot**: Hỗ trợ khách hàng với AI
- **Email Notifications**: Thông báo qua email
- **Image Upload**: Upload và quản lý hình ảnh
- **Pagination**: Phân trang dữ liệu
- **Search & Filter**: Tìm kiếm và lọc nâng cao
- **Responsive Design**: Giao diện responsive
- **Dark/Light Theme**: Chủ đề sáng/tối
- **Payment Management**: 
  - Theo dõi tất cả giao dịch thanh toán
  - Lọc và tìm kiếm giao dịch theo nhiều tiêu chí
  - Xem chi tiết từng giao dịch thanh toán
  - Thống kê doanh thu theo thời gian
  - Quản lý trạng thái thanh toán

## 📞 Liên hệ

- Email: [liem10042004@gmail.com]

---

**Lưu ý**: Đảm bảo cấu hình đúng các biến môi trường trước khi chạy dự án. Một số tính năng như thanh toán, email, và chatbot yêu cầu API keys từ các dịch vụ bên thứ ba. 
