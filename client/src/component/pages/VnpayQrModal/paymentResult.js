import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './paymentResult.css';

const PaymentResult = () => { 
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('vnp_Amount'); 
  const bankCode = searchParams.get('vnp_BankCode');
  const payDate = searchParams.get('vnp_PayDate');
  const errorCode = searchParams.get('code');
  
  // Điều kiện này vẫn đúng
  const isSuccess = status === 'success' && searchParams.get('vnp_ResponseCode') === '00';

  useEffect(() => {
   
  }, [orderId]);

  return (
    <div className={`result-container ${isSuccess ? 'success' : 'failed'}`}>
      <div className="result-card">
        <h1>{isSuccess ? 'Giao dịch Thành công' : 'Giao dịch Thất bại'}</h1>
        <p className="result-message">
          {isSuccess 
            ? 'Cảm ơn bạn đã thanh toán. Chúc bạn có một bữa ăn ngon miệng!' 
            : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'
          }
        </p>
        
        <div className="result-details">
            <p><strong>Mã đơn hàng:</strong> {orderId}</p>
            {isSuccess ? (
                <>
                 
                    <p><strong>Số tiền:</strong> {(amount / 100).toLocaleString('vi-VN')} VNĐ</p>
                    <p><strong>Ngân hàng:</strong> {bankCode}</p>
                    <p><strong>Thời gian:</strong> {payDate}</p>
                </>
            ) : (
                <p><strong>Mã lỗi:</strong> {errorCode}</p>
            )}
        </div>
        
        <Link to="/" className="btn-home">Quay về Trang chủ</Link>
      </div>
    </div>
  );
};

export default PaymentResult; // Đổi tên export cho khớp