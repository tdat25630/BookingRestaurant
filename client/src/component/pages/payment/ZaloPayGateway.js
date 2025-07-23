import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './ZaloPayGateway.css'; 

function ZaloPayGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount } = location.state || { orderId: null, amount: 0 };

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [appTransId, setAppTransId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    console.log("Dữ liệu nhận được từ trang hóa đơn (location.state):", location.state);

    if (!orderId) {
      setError('Lỗi: Không có thông tin đơn hàng được truyền đến trang này. Vui lòng thử lại từ trang hóa đơn.');
      setIsLoading(false);
      return;
    }

    const createOrder = async () => {
      try {
        const res = await axios.post('http://localhost:8080/api/zalopay/create-order', { orderId });
        setDebugInfo(res.data);

        if (res.data.success && res.data.zaloPayResponse && res.data.zaloPayResponse.order_url) {
          setQrCodeUrl(res.data.zaloPayResponse.order_url);
          setAppTransId(res.data.app_trans_id);
          setError('');
        } else {
          const ZaloPayResponse = res.data.zaloPayResponse;
          const subMessage = ZaloPayResponse?.sub_return_message;
          const mainMessage = ZaloPayResponse?.return_message || res.data.message;
          const errorMessage = subMessage ? `${subMessage} (${mainMessage})` : mainMessage || 'Phản hồi từ server không hợp lệ.';
          setError(`Lỗi: ${errorMessage}`);
          console.error("API response was successful but lacked required data:", res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tạo đơn hàng ZaloPay:", err);
        if (err.response) {
          setError(`Lỗi từ server: ${err.response.data.message || err.message} (Mã: ${err.response.status})`);
          setDebugInfo(err.response.data);
        } else if (err.request) {
          setError('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối và trạng thái backend.');
        } else {
          setError('Lỗi không xác định khi thiết lập yêu cầu.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    createOrder();
  }, [orderId, location.state]);

  useEffect(() => {
    if (!appTransId) return;

    const intervalId = setInterval(async () => {
      try {
        console.log(`Kiểm tra trạng thái cho app_trans_id: ${appTransId}`);
        const res = await axios.post('http://localhost:8080/api/zalopay/status', { app_trans_id: appTransId });
        
        if (res.data.ourDbStatus === 'paid') {
          clearInterval(intervalId);
          alert('Thanh toán thành công!');
          navigate(`/payment-result?status=success&orderId=${orderId}&amount=${amount}&apptransid=${appTransId}`);
        }
      } catch (err) {
        console.error("Lỗi khi polling:", err);
      }
    }, 5000); 

    return () => clearInterval(intervalId);
  }, [appTransId, navigate, orderId, amount]);

  return (
    <div className="gateway-container">
      <div className="gateway-card">
        <h2>Thanh toán qua ZaloPay</h2>
        <p className="gateway-amount">
          Số tiền: <span>{amount?.toLocaleString('vi-VN')}₫</span>
        </p>
        
        {isLoading && <div className="loader">Đang tạo mã...</div>}
        
        {error && (
            <div className="error-message">
                <p><strong>Rất tiếc, đã có lỗi xảy ra!</strong></p>
                <p>{error}</p>
            </div>
        )}
        
        {qrCodeUrl && (
          <div className="qr-section">
            <p>Sử dụng ứng dụng ZaloPay hoặc App ngân hàng để quét mã QR</p>
            <div className="qr-code-wrapper">
              <QRCodeSVG value={qrCodeUrl} size={256} level="H" />
            </div>
            <p className="waiting-text">Đang chờ thanh toán...</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default ZaloPayGateway;
