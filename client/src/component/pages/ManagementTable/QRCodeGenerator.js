import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './QRCodeComponent.css'; // Tạo file CSS riêng

function QRCodeComponent({ sessionId }) {
  const url = `http://localhost:3000/menu?sessionId=${sessionId}`;

  return (
    <div className="qr-popup-content">
      <h3 className="qr-title">📱 QR Code for Guests</h3>
      <QRCodeCanvas value={url} size={200} />
      <p className="qr-subtitle">Scan to view the menu</p>
      <p><strong>Session ID:</strong> {sessionId}</p>
    </div>
  );
}
export default QRCodeComponent;
