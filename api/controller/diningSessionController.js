const DiningSession = require('../models/diningSession');
const Table = require('../models/table');

// Tạo session mới
exports.createDiningSession = async (req, res) => {
  try {
    // const { tableId, userId } = req.body;
    const { 
      tableId, 
      userId, 
      customerName, 
      customerPhone, 
      guestCount, 
      reservationId, 
      specialRequest,
      notes
    } = req.body;
    console.log('Received session data:', req.body);
    // Kiểm tra bàn đã có session active chưa
    const existing = await DiningSession.findOne({ table: tableId, status: 'active' });
    if (existing) return res.status(400).json({ message: 'This table already has an active session.' });

    // const session = new DiningSession({ table: tableId, user: userId });
    // await session.save();

    const sessionData = {
      table: tableId,
      user: userId || null,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      guestCount: guestCount || 1,
      reservationId: reservationId || null,
      specialRequest: specialRequest || '',
      notes: notes || ''
    };

    console.log('Creating session with data:', sessionData); // Debug log

    const session = new DiningSession(sessionData);
    await session.save();

     // Cập nhật trạng thái bàn thành 'occupied'
     await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy session active theo bàn
exports.getActiveSessionByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const session = await DiningSession.findOne({ table: tableId, status: 'active' }).populate('table').populate('reservationId');
    if (!session) return res.status(404).json({ message: 'No active session for this table.' });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Kết thúc session
// exports.endDiningSession = async (req, res) => {
//   try {
//     const session = await DiningSession.findByIdAndUpdate(
//       req.params.id,
//       { status: 'completed', endTime: new Date() },
//       { new: true }
//     );
//     res.json(session);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// Kết thúc session
exports.endDiningSession = async (req, res) => {
  try {
    const session = await DiningSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session không tồn tại' });

    // Cập nhật session
    session.status = 'completed';
    session.endTime = new Date();
    await session.save();

    // Cập nhật trạng thái bàn
    await Table.findByIdAndUpdate(session.table, { status: 'available' });

    res.json({ message: 'Phiên đã được kết thúc thành công', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await DiningSession.find()
    .populate('table')
    .populate('reservationId')
    .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách sessions' });
  }
};


exports.getSessionById = async (req, res) => {
  try {
    const session = await DiningSession.findById(req.params.id)
    .populate('table')
    .populate('reservationId');
    if (!session) {
      return res.status(404).json({ message: 'Session không tồn tại' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
