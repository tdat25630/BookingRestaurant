import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "../../../context/SessionContext";
import Header from "../../Header/Header";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css"; 

function CheckoutPage() {
  const { sessionId } = useSession();
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // States for voucher functionality
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState({ type: '', text: '' });

  // Fetch the unpaid order for the current session
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/orders/session/${sessionId}`);
        const orderToPay = Array.isArray(res.data) 
          ? res.data.find(order => order.paymentStatus === 'unpaid') 
          : null;
        setPendingOrder(orderToPay);
        if (orderToPay) {
          setFinalAmount(orderToPay.totalAmount); // Initialize the final amount
        }
      } catch (err) {
        console.error("❌ Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  // Fetch the list of active vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/promotions/active');
            if (res.data.success) {
                setVouchers(res.data.data);
            }
        } catch (error) {
            console.error("❌ Error fetching vouchers:", error);
        }
    };
    fetchVouchers();
  }, []);

  // This function now only sets the selected voucher code
  const handleVoucherChange = (voucherCode) => {
    setSelectedVoucher(voucherCode);
  };

  // This function handles the API call when the "Apply" button is clicked
  const handleApplyVoucher = async () => {
    // If the user re-selects the default option and clicks Apply, reset the price.
    if (!selectedVoucher) {
      setDiscount(0);
      setFinalAmount(pendingOrder?.totalAmount || 0);
      setVoucherMessage({ type: '', text: '' }); // Clear any previous message
      return;
    }

    if (!pendingOrder) {
      setVoucherMessage({ type: 'error', text: 'No order to apply voucher to.' });
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8080/api/orders/${pendingOrder._id}/apply-voucher`, { voucherCode: selectedVoucher });
      if (res.data.success) {
        setDiscount(res.data.data.discount);
        setFinalAmount(res.data.data.newTotalAmount);
        setVoucherMessage({ type: 'success', text: res.data.message });
      }
    } catch (error) {
      const message = error.response?.data?.message || "An unknown error occurred.";
      setDiscount(0);
      setFinalAmount(pendingOrder?.totalAmount || 0);
      setVoucherMessage({ type: 'error', text: message });
    }
  };

  // Navigate to the payment gateway with the final amount
  const handleNavigateToPayment = () => {
    if (pendingOrder) {
      navigate('/payment-gateway', { 
        state: { 
          orderId: pendingOrder._id, 
          amount: finalAmount // Use the final amount after discount
        } 
      });
    } else {
      alert("No unpaid order found to proceed with payment.");
    }
  };

  if (loading) return <div className="loading-container">🔄 Loading your order...</div>;
  if (!sessionId) return <div className="info-container">⚠️ No dining session found!</div>;
  if (!pendingOrder) {
    return (
      <>
        <Header />
        <div className="info-container">
          <h3>🧺 You have no orders to pay.</h3>
          <button onClick={() => navigate(`/menu?sessionId=${sessionId}`)} className="btn-action">
            🍽 Order Now
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-container">
        <h2>🧾 Your Bill</h2>
        <div key={pendingOrder._id} className="order-card">
          <h4>🕒 {new Date(pendingOrder.orderTime).toLocaleString('en-US')}</h4>
          <p>
            <strong>Payment Status:</strong>{" "}
            <span className={`status-${pendingOrder.paymentStatus}`}>
              {pendingOrder.paymentStatus === 'unpaid' ? 'Unpaid' : 'Paid'}
            </span>
          </p>

          <ul className="order-items-list">
            {pendingOrder.items.map((item) => (
              <li key={item._id}>
                🍽 {item.menuItemId?.name || "Unknown Item"} × {item.quantity} —{" "}
                {item.price.toLocaleString("en-US")}₫
              </li>
            ))}
          </ul>
          
          <p className="sub-total"><strong>Subtotal: </strong>{pendingOrder.totalAmount?.toLocaleString("en-US") || 0}₫</p>
          {discount > 0 && (
            <p className="discount-applied"><strong>Discount: </strong>-{discount.toLocaleString("en-US")}₫</p>
          )}
          <p className="total-amount">
            <strong>Total: </strong>
            {finalAmount?.toLocaleString("en-US") || 0}₫
          </p>
        </div>

        {/* Voucher Section Updated */}
        <div className="voucher-section">
            <select 
                className="voucher-select"
                value={selectedVoucher}
                onChange={(e) => handleVoucherChange(e.target.value)}
            >
                <option value="">-- Choose Voucher --</option>
                {vouchers.map(voucher => (
                    <option key={voucher._id} value={voucher.code}>
                        {voucher.code} - {voucher.description}
                    </option>
                ))}
            </select>
            <button onClick={handleApplyVoucher} className="btn-apply-voucher">
                Apply
            </button>
        </div>
        {voucherMessage.text && (
            <p className={`voucher-message ${voucherMessage.type}`}>{voucherMessage.text}</p>
        )}

        <div className="action-buttons">
          <button onClick={() => navigate(`/menu?sessionId=${sessionId}`)} className="btn-action">
            ➕ Add More Items
          </button>
          {/* <button 
            onClick={handleNavigateToPayment} 
            className="btn-payment btn-zalo"
          >
            📲 Pay with QR Code
          </button> */}
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;
