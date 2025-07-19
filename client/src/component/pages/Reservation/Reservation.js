import React, { useState, useEffect } from 'react';
import {
  Container, Form, Button, Row, Col, Alert, FloatingLabel, Modal
} from 'react-bootstrap';
import Header from '../../Header/Header';
import './Reservation.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import DishSelectionModal from './DishSelectionModal';

function Reservation() {
  const [showDishModal, setShowDishModal] = useState(false); const [showOtpModal, setShowOtpModal] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [menuItems, setMenuItems] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    reservationDate: '',
    reservationTime: '',
    guestCount: 1,
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);

  const [otpTarget, setOtpTarget] = useState('phone');
  const [otpSent, setOtpSent] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!storedUser || !storedUser._id) {
          console.log('User information not found');
        }

        const token = localStorage.getItem('token');

        const response = await axios.get(`http://localhost:8080/api/user/${storedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        console.log(response.data)

        setFormData(prev => ({
          ...prev,
          email: response.data.email || '',
          phone: response.data.phone || '',
        }));

      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchUserProfile()

    fetch('http://localhost:8080/api/menu-items')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('Error fetching menu items:', err));

  }, []);
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  useEffect(() => {
    if (showOtpModal) {
      if (formData.email) {
        setOtpTarget('email');
      } else if (formData.phone) {
        setOtpTarget('phone');
      }
    }
  }, [showOtpModal]);

  const validate = () => {
    const errs = {};
    const phoneRegex = /^0\d{9}$/;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!formData.phone && !formData.email) errs.contact = 'Cần cung cấp số điện thoại hoặc email';
    if (formData.phone && !phoneRegex.test(formData.phone)) errs.phone = 'Số điện thoại không hợp lệ';
    if (!formData.name.trim()) errs.name = 'Tên là bắt buộc';

    if (!formData.reservationDate) {
      errs.reservationDate = 'Ngày là bắt buộc';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.reservationDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errs.reservationDate = 'Ngày không hợp lệ';
      }
    }

    if (!timeRegex.test(formData.reservationTime)) {
      errs.reservationTime = 'Giờ không hợp lệ (HH:mm)';
    } else {
      const [hours, minutes] = formData.reservationTime.split(':').map(Number);

      // Enforce 9AM to 9PM time slot
      if (hours < 9 || (hours === 21 && minutes > 0) || hours > 21) {
        errs.reservationTime = 'Giờ chỉ được phép từ 09:00 đến 21:00';
      } else {
        const selectedDate = new Date(formData.reservationDate);
        const reservationDateTime = new Date(selectedDate);
        reservationDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const requiredTime = 3
        const fiveHoursLater = new Date(now.getTime() + requiredTime * 60 * 60 * 1000);

        // If selected date is today, check the time rule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate.getTime() === today.getTime()) {
          if (reservationDateTime < fiveHoursLater) {
            errs.reservationTime = `Thời gian phải ít nhất ${requiredTime} tiếng kể từ bây giờ`;
          }
        }
      }
    }

    if (formData.guestCount < 1) errs.guestCount = 'Tối thiểu 1 khách';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    if (!validate()) return;
    setShowOtpModal(true);
  };

  const sendOtp = async () => {
    const target = otpTarget === 'phone' ? formData.phone.trim() : formData.email.trim();
    if (!target) {
      setOtpStatus(`Thiếu ${otpTarget === 'phone' ? 'số điện thoại' : 'email'}`);
      return;
    }
    setOtpStatus('Đang gửi...');

    const payload = otpTarget === 'phone' ? { phone: target } : { email: target };

    try {
      const res = await fetch(`http://localhost:8080/api/reservation/otp/${otpTarget}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOtpStatus(`OTP đã gửi qua ${otpTarget === 'phone' ? 'số điện thoại' : 'email'}`);
        setOtpSent(true);
        setResendTimer(60);
      } else {
        const data = await res.json();
        setOtpStatus(data.error || 'Lỗi khi gửi OTP');
      }
    } catch (error) {
      setOtpStatus('Lỗi kết nối tới máy chủ');
    }
  };

  const confirmOtpAndSubmit = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log(formData)

    try {
      const res = await fetch('http://localhost:8080/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          phone: formData.phone || null,
          email: formData.email || null,
          preOrders: selectedDishes,
          otp: inputOtp,
          otpTarget: otpTarget,
          accountId: storedUser?._id || null
        }),
      });

      const data = await res.json();

      if (res.ok) {
        //setSuccess('Đặt bàn thành công!');
        toast.success("Đặt bàn thành công!");
        setFormData({ phone: storedUser?.phone ?? '', name: '', reservationDate: '', reservationTime: '', guestCount: 1, email: storedUser?.email ?? '' });
        setSelectedDishes([]);
        setErrors({});
        setShowOtpModal(false);
        setOtpSent(false);
        setInputOtp('');
        setOtpStatus('');
      } else {
        //setOtpStatus(data.error || 'OTP sai hoặc có lỗi');
        toast.error(data.error || 'OTP sai hoặc có lỗi');
      }
    } catch (err) {
      //setOtpStatus(err.message || 'Lỗi gửi yêu cầu');
      toast.error('Lỗi gửi yêu cầu');
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-4 booking-form-container">
        <h3 className="mb-4 text-center" style={{ color: "#ffc107" }}>Đặt bàn</h3>

        {success && <Alert variant="success">{success}</Alert>}
        {errors.api && <Alert variant="danger">{errors.api}</Alert>}

        <Form onSubmit={handleSubmit} className="p-4 shadow-sm rounded" style={{ backgroundColor: "#2a2a2a" }}>
          <Row className="mb-3">
            <Col md={6}>
              <FloatingLabel controlId="floatingName" label="Tên khách hàng *">
                <Form.Control type="input" name="name" value={formData.name} isInvalid={!!errors.name} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </FloatingLabel>
            </Col>

            <Col md={6}>
              <FloatingLabel controlId="floatingGuests" label="Số lượng khách *">
                <Form.Control type="number" name="guestCount" min="1" value={formData.guestCount} isInvalid={!!errors.guestCount} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">{errors.guestCount}</Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <FloatingLabel controlId="floatingDate" label="Ngày đặt bàn *">
                <Form.Control type="date" name="reservationDate" value={formData.reservationDate} isInvalid={!!errors.reservationDate} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">{errors.reservationDate}</Form.Control.Feedback>
              </FloatingLabel>
            </Col>

            <Col md={6}>
              <FloatingLabel controlId="floatingTime" label="Giờ đặt bàn *">
                <Form.Control type="time" name="reservationTime" value={formData.reservationTime} isInvalid={!!errors.reservationTime} onChange={handleChange} lang="en-GB" />
                <Form.Control.Feedback type="invalid">{errors.reservationTime}</Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>

          <div className="d-flex align-items-center mt-4" style={{ color: "#ffc107" }}>
            <hr className="flex-grow-1 mx-1" />
            <span>Email hoặc số điện thoại <span style={{ color: 'red' }}>*</span></span>
            <hr className="flex-grow-1 mx-1" />
          </div>

          <div className="d-flex align-items-center my-2" style={{ color: "#ffc107" }}>
            <span style={{ color: 'red', margin: '0 auto' }}>{errors.contact}</span>
          </div>

          <Row className="mb-3">
            <Col md={6}>
              <FloatingLabel controlId="floatingPhone" label="Số điện thoại">
                <Form.Control type="input" name="phone" value={formData.phone} isInvalid={!!errors.phone} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </FloatingLabel>
            </Col>
            <Col md={6}>
              <FloatingLabel controlId="floatingEmail" label="Email">
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </FloatingLabel>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button variant="outline-warning" onClick={() => setShowDishModal(true)} className="">Chọn món đặt trước</Button>
            <br />
            <Button variant="primary" type="submit" size="lg">Đặt bàn</Button>
          </div>
        </Form>
      </Container>

      {/* /OTP MODAL/ */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác thực OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Gửi OTP qua:</Form.Label>
              <Form.Select value={otpTarget} onChange={e => { setOtpTarget(e.target.value); setOtpSent(false); setInputOtp(''); setOtpStatus(''); }}>
                {formData.email && <option value="email">Email</option>}
                {formData.phone && <option value="phone">Số điện thoại</option>}
              </Form.Select>
            </Form.Group>

            <Button
              variant="primary"
              className="mb-3"
              onClick={sendOtp}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0 ? `Gửi lại sau ${resendTimer}s` : 'Gửi OTP'}
            </Button>
            {otpSent && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nhập mã OTP:</Form.Label>
                  <Form.Control type="text" value={inputOtp} onChange={e => setInputOtp(e.target.value)} />
                </Form.Group>
                <Button onClick={confirmOtpAndSubmit} variant="success">Xác thực & Đặt bàn</Button>
              </>
            )}

            {otpStatus && <Alert variant="info" className="mt-3">{otpStatus}</Alert>}
          </Form>
        </Modal.Body>
      </Modal>
      <DishSelectionModal
        show={showDishModal}
        onHide={() => setShowDishModal(false)}
        menuItems={menuItems}
        selectedDishes={selectedDishes}
        setSelectedDishes={setSelectedDishes}
      />
      <div>
        <ToastContainer />
      </div>
    </>
  );
}

export default Reservation;
