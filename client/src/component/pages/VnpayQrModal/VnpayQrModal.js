import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import './VnpayQrModal.css';

const VnpayQrModal = ({ orderId, totalAmount, onClose }) => {
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setError('Lỗi: Không tìm thấy mã đơn hàng để thanh toán.');
      setIsLoading(false);
      return;
    }

    const createPaymentUrl = async () => {
      try {
        const response = await axios.post('http://localhost:8080/api/invoices/create-vnpay-url', { orderId });
        if (response.data?.data?.paymentUrl) {
          setPaymentUrl(response.data.data.paymentUrl);
        } else {
          setError(response.data?.message || 'Không nhận được URL thanh toán từ máy chủ.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tạo mã thanh toán. Vui lòng thử lại.');
        console.error("Lỗi tạo URL VNPAY:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    createPaymentUrl();
  }, [orderId]);

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <h2>Thanh toán VNPAY QR</h2>
        <p className="payment-amount">Số tiền: {totalAmount.toLocaleString('vi-VN')} VNĐ</p>
        
        <div className="qr-code-container">
          {isLoading && <p>Đang tạo mã QR...</p>}
          {error && <p className="error-message">{error}</p>}
          {paymentUrl && (
            <div className="qr-code-wrapper">
              <QRCode value={paymentUrl} size={220} />
            </div>
          )}
        </div>
        
        <button onClick={onClose} className="close-payment-modal-btn">
          Đóng
        </button>
      </div>
    </div>
  );
};

export default VnpayQrModal;