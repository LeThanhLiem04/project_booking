import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Room } from '../src/models/Room.js';
import { Booking } from '../src/models/Booking.js';
import { paymentService } from '../src/services/payment-service.js';

const router = express.Router();

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hàm helper để lấy thông tin phòng
async function getRoomInfo() {
  const rooms = await Room.find().populate({
    path: 'hotelId',
    select: 'name address city'
  });
  return rooms.map(room => ({
    type: room.type,
    price: room.price,
    capacity: room.capacity,
    amenities: room.amenities,
    hotelName: room.hotelId ? room.hotelId.name : 'N/A',
    hotelAddress: room.hotelId ? room.hotelId.address : 'N/A',
    hotelCity: room.hotelId ? room.hotelId.city : 'N/A',
  }));
}

// Hàm helper để kiểm tra phòng trống
async function checkRoomAvailability(checkIn, checkOut) {
  const bookings = await Booking.find({
    $or: [
      {
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn }
      }
    ]
  });
  
  const bookedRoomIds = bookings.map(booking => booking.roomId);
  const availableRooms = await Room.find({ _id: { $nin: bookedRoomIds } });
  
  return availableRooms;
}

// Hàm helper để lấy thông tin đặt phòng
async function getBookingInfo() {
  const bookings = await Booking.find()
    .populate('userId', 'name email')
    .populate('roomId', 'type price capacity');
  return bookings.map(booking => ({
    bookingId: booking._id,
    userName: booking.userId ? booking.userId.name : 'N/A',
    userEmail: booking.userId ? booking.userId.email : 'N/A',
    roomType: booking.roomId ? booking.roomId.type : 'N/A',
    roomPrice: booking.roomId ? booking.roomId.price : 'N/A',
    checkInDate: booking.checkInDate.toISOString().split('T')[0],
    checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
    totalPrice: booking.totalPrice,
    status: booking.status,
  }));
}

// Hàm helper để lấy thông tin thanh toán theo bookingId
async function getPaymentInfoByBookingId(bookingId) {
  const payment = await paymentService.getPaymentByBookingId(bookingId);
  if (!payment) {
    return null;
  }
  return {
    bookingId: payment.bookingId._id,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt.toISOString().split('T')[0],
    roomType: payment.bookingId.roomId ? payment.bookingId.roomId.type : 'N/A',
    hotelName: payment.bookingId.roomId && payment.bookingId.roomId.hotelId ? payment.bookingId.roomId.hotelId.name : 'N/A',
  };
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Lấy thông tin phòng
    const roomInfo = await getRoomInfo();
    // Lấy thông tin đặt phòng
    const bookingInfo = await getBookingInfo();

    let paymentStatusInfo = null;
    // Simple keyword detection for payment status check
    const bookingIdMatch = message.match(/(?:kiểm tra|xem) (?:thanh toán|trạng thái thanh toán) (?:cho )?đặt phòng (?:mã )?([a-zA-Z0-9]+)/i);
    
    if (bookingIdMatch && bookingIdMatch[1]) {
      const bookingId = bookingIdMatch[1];
      paymentStatusInfo = await getPaymentInfoByBookingId(bookingId);
      if (paymentStatusInfo) {
        res.json({
          reply: `Trạng thái thanh toán cho đặt phòng mã ${paymentStatusInfo.bookingId}:
- Tình trạng: ${paymentStatusInfo.status}
- Số tiền: ${paymentStatusInfo.amount} VND
- Phương thức: ${paymentStatusInfo.paymentMethod}
- Khách sạn: ${paymentStatusInfo.hotelName}
- Loại phòng: ${paymentStatusInfo.roomType}
- Ngày thanh toán: ${paymentStatusInfo.createdAt}`
        });
        return;
      } else {
        res.json({
          reply: `Không tìm thấy thông tin thanh toán cho đặt phòng mã ${bookingId}. Vui lòng kiểm tra lại mã đặt phòng.`
        });
        return;
      }
    }

    // Tạo prompt cho Gemini AI
    const prompt = `
      Bạn là trợ lý đặt phòng khách sạn thân thiện và hữu ích. Dưới đây là thông tin về các loại phòng đang có sẵn trong hệ thống:
      ${JSON.stringify(roomInfo, null, 2)}
      
      Và đây là thông tin về các đặt phòng hiện có (chỉ truy cập nếu được hỏi về đặt phòng cụ thể hoặc quản lý đặt phòng, ví dụ: 'đặt phòng của tôi'):
      ${JSON.stringify(bookingInfo, null, 2)}
      
      Khách hàng hỏi: "${message}"
      
      Hãy trả lời câu hỏi của khách hàng dựa trên thông tin có sẵn, luôn giữ thái độ tích cực và hỗ trợ. Đặc biệt, hãy trả lời **ngắn gọn, súc tích**, và **tách thành các câu riêng biệt hoặc dùng gạch đầu dòng** để dễ đọc và dễ hiểu. Tránh các câu trả lời dài dòng.
      
      Nếu phát hiện khách hàng hỏi bằng tiếng Anh hoặc yêu cầu trả lời bằng tiếng Anh, hãy trả lời song ngữ: trước tiên trả lời bằng tiếng Việt, sau đó dịch nguyên văn câu trả lời sang tiếng Anh. Nếu khách hàng hỏi bằng tiếng Việt, chỉ cần trả lời bằng tiếng Việt.
      
      Các câu hỏi thường gặp và cách bạn nên trả lời:
      
      1.  **Về các loại phòng/giá phòng:**
          -   Nếu khách hàng hỏi về "các loại phòng", "giá phòng", "phòng có bao nhiêu loại", "phòng nào rẻ nhất", "phòng nào đắt nhất":
              +   Liệt kê rõ ràng tên loại phòng và giá của từng loại dựa trên thông tin \`roomInfo\` bạn có.
              +   Ví dụ: "Khách sạn chúng tôi có các loại phòng như: Phòng Đơn (giá X VND), Phòng Đôi (giá Y VND), Suite (giá Z VND)."
              +   Nếu hỏi về rẻ nhất/đắt nhất, hãy so sánh và chỉ ra phòng tương ứng.
      
      2.  **Về tình trạng phòng trống/đặt phòng:**
          -   Nếu khách hàng hỏi về "phòng trống", "còn phòng không", "đặt phòng", "có thể ở vào ngày X không":
              +   **Quan trọng:** Yêu cầu khách hàng cung cấp **ngày check-in và ngày check-out cụ thể** để bạn có thể kiểm tra chính xác.
              +   Ví dụ: "Để kiểm tra phòng trống, bạn vui lòng cho tôi biết ngày check-in và check-out mong muốn của bạn là khi nào ạ?"
              +   Bạn không thể tự động kiểm tra phòng trống nếu không có ngày cụ thể.
      
      3.  **Về tiện nghi phòng:**
          -   Nếu khách hàng hỏi về "tiện nghi", "phòng có gì", "phòng tắm có gì":
              +   Mô tả các tiện nghi chung của các loại phòng hoặc tiện nghi cụ thể nếu khách hàng hỏi về một loại phòng nhất định (dựa trên \`amenities\` trong \`roomInfo\`).
              +   Ví dụ: "Phòng Đơn của chúng tôi có điều hòa, TV, minibar, và phòng tắm riêng."
      
      4.  **Về địa điểm khách sạn:**
          -   Nếu khách hàng hỏi về "địa điểm", "khách sạn ở đâu", "vị trí":
              +   Cung cấp thông tin địa chỉ chung của khách sạn (nếu có thông tin này trong database hoặc hãy trả lời là khách sạn ở các thành phố lớn như TP.HCM, Hà Nội...). (Lưu ý: hiện tại \`roomInfo\` không chứa thông tin địa điểm khách sạn, bạn có thể cần bổ sung thêm nếu muốn trả lời chi tiết hơn).
      
      5.  **Về đặt phòng của khách hàng:**
          -   Nếu khách hàng hỏi về "đặt phòng của tôi", "kiểm tra đặt phòng", "xem đặt phòng của tôi":
              +   Yêu cầu khách hàng cung cấp thông tin định danh (ví dụ: email hoặc mã đặt phòng) để tìm kiếm trong \`bookingInfo\`.\n              +   Nếu tìm thấy, hãy liệt kê các đặt phòng liên quan một cách ngắn gọn.\n              +   Ví dụ: "Bạn có đặt phòng vào ngày Y cho Phòng Đôi. Mã đặt phòng của bạn là ABC."
              +   Nếu không tìm thấy hoặc thông tin không đủ, hãy hỏi lại hoặc yêu cầu thông tin chi tiết hơn.\n      
      6.  **Về thông tin quản lý/chủ khách sạn:**
          -   Nếu khách hàng hỏi về "ông chủ", "quản lý", "ai là chủ khách sạn", "ai quản lý khách sạn":
              +   Hãy trả lời rằng: "Ông chủ và người quản lý của các khách sạn là Lê Thanh Liêm. Bạn có thể liên hệ qua số điện thoại: 0375846312."
              +   Giữ thông tin này cố định và không thay đổi.\n
      7.  **Về quy trình đặt phòng:**
          -   Nếu khách hàng hỏi "làm thế nào để đặt phòng?", "quy trình đặt phòng ra sao?":
              +   Hướng dẫn khách hàng truy cập trang đặt phòng, chọn ngày, loại phòng, và điền thông tin cần thiết.
              +   Ví dụ: "Để đặt phòng, bạn vui lòng truy cập trang Đặt phòng trên website của chúng tôi, chọn ngày nhận/trả phòng và loại phòng mong muốn, sau đó điền thông tin cá nhân và hoàn tất thanh toán."

      8.  **Về giờ nhận/trả phòng:**
          -   Nếu khách hàng hỏi "giờ check-in/check-out là mấy giờ?", "khi nào tôi có thể nhận phòng/trả phòng?":
              +   Cung cấp thông tin giờ nhận/trả phòng tiêu chuẩn của khách sạn.
              +   Ví dụ: "Giờ nhận phòng (check-in) là từ 14:00 chiều và giờ trả phòng (check-out) là 12:00 trưa. Nếu bạn muốn nhận/trả phòng sớm/muộn hơn, vui lòng thông báo trước để chúng tôi sắp xếp."

      9.  **Về các tiện ích chung của khách sạn (không phải trong phòng):**
          -   Nếu khách hàng hỏi "khách sạn có bể bơi không?", "có phòng gym không?", "có nhà hàng không?":
              +   Liệt kê các tiện ích chung mà khách sạn cung cấp.
              +   Ví dụ: "Khách sạn của chúng tôi có bể bơi ngoài trời, phòng tập gym hiện đại, và nhà hàng phục vụ các món ăn đa dạng."

      10. **Về bữa sáng:**
          -   Nếu khách hàng hỏi "bữa sáng có được bao gồm không?", "bữa sáng được phục vụ khi nào?":
              +   Thông báo về việc bữa sáng có được bao gồm trong giá phòng không và giờ phục vụ.
              +   Ví dụ: "Bữa sáng được bao gồm trong giá phòng và được phục vụ từ 6:30 sáng đến 10:00 sáng tại nhà hàng của khách sạn."

      11. **Về hủy đặt phòng:**
          -   Nếu khách hàng hỏi "làm sao để hủy đặt phòng?", "tôi có thể hủy đặt phòng không?":
              +   Hướng dẫn khách hàng về quy trình hủy đặt phòng và chính sách hủy.
              +   Ví dụ: "Bạn có thể hủy đặt phòng bằng cách liên hệ trực tiếp với bộ phận lễ tân của khách sạn hoặc qua phần Quản lý đặt phòng trên website. Vui lòng lưu ý chính sách hủy của chúng tôi có thể áp dụng phí tùy thuộc vào thời điểm hủy."
      
      12. **Về trạng thái thanh toán:**
          -   Nếu khách hàng hỏi về "kiểm tra thanh toán", "trạng thái thanh toán", "phòng đã thanh toán chưa":
              +   Yêu cầu khách hàng cung cấp **mã đặt phòng** để bạn kiểm tra trạng thái thanh toán. Bạn không thể tự động biết mã đặt phòng của khách hàng.
              +   Ví dụ: "Vui lòng cung cấp mã đặt phòng để tôi có thể kiểm tra trạng thái thanh toán giúp bạn."
      
      Nếu câu hỏi không rõ ràng hoặc bạn không đủ thông tin từ \`roomInfo\` hoặc \`bookingInfo\`, hãy hỏi lại khách hàng để làm rõ yêu cầu hoặc cung cấp thông tin chung nhất có thể.\n    `;

    // Gọi Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 