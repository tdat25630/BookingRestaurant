import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function QRCodeComponent({ sessionId }) {
  const url = `http://localhost:3000/menu?sessionId=${sessionId}`;

  return (
    <div>
      <h3>Mã QR cho khách</h3>
      <QRCodeCanvas value={url} size={200} />
      <p>📱 Quét để mở menu</p>
      <p><strong>Session ID:</strong> {sessionId}</p>
    </div>
  );
}
export default QRCodeComponent;
