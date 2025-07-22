import React, { useState } from 'react';
import '../Chef/ChefOrder.css';
import { Tabs, Tab } from 'react-bootstrap';

const OrderCard = ({ orders, formatTime, getItemStatusBadge, updateItemStatus, renderOrderActions }) => {
  const [key, setKey] = useState('ordered');

  const tabStyle = {
    backgroundColor: '#101010',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    marginBottom: '30px'
  };

  return (
    <div className="shadow" style={tabStyle}>
      <Tabs
        id="order-status-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
        fill
      >
        {['ordered', 'preparing', 'done'].map(status => (
          <Tab eventKey={status} title={status.charAt(0).toUpperCase() + status.slice(1)} key={status}>
            {orders.map(order => {
              const filteredItems = order.originalItems?.filter(item => item.status === status) || [];

              if (filteredItems.length === 0) return null;

              return (
                <div key={order._id} style={{ marginBottom: '20px' }}>
                  {/* Order Header */}
                  <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                    <h3>
                      Bàn {order.sessionId?.table?.tableNumber || order.sessionId?.tableNumber || order.tableNumber || 'N/A'}
                    </h3>
                    {order.sessionId?.customerName && (
                      <p>Tên khách: {order.sessionId.customerName}</p>
                    )}
                    <div>
                      <span>Vào lúc: {formatTime(order.orderTime)}</span>{' '}
                      <span style={{
                        color: order.waitingTime > 30 ? 'red' :
                              order.waitingTime > 15 ? 'orange' : 'lightgreen'
                      }}>
                        ⏱️ {order.waitingTime} phút
                      </span>
                    </div>
                    <div>
                      <p>{order.totalAmount.toLocaleString('vi-VN')}₫ - {order.itemCount || order.items?.length || 0} món</p>
                    </div>
                  </div>

                  {/* Filtered Items */}
                  <div style={{ marginTop: '10px' }}>
                    {filteredItems.map((item) => (
                      <div key={item._id} style={{ marginBottom: '10px', borderBottom: '1px dashed #555', paddingBottom: '5px' }}>
                        <div>
                          <strong>{item.quantity}x {item.menuItemId?.name || 'Món ăn'}</strong>
                          <p>{item.menuItemId?.category?.name || item.menuItemId?.categoryName || 'Danh mục'}</p>
                          {item.notes && <p>📝 {item.notes}</p>}
                        </div>
                        <div>
                          {getItemStatusBadge(item.status)}
                          {item.status === 'ordered' && (
                            <button
                              onClick={() => updateItemStatus(item._id, 'preparing')}
                              className="btn btn-danger btn-sm"
                              style={{ marginLeft: '10px' }}
                            >
                              Bắt đầu
                            </button>
                          )}
                          {item.status === 'preparing' && (
                            <button
                              onClick={() => updateItemStatus(item._id, 'done')}
                              className="btn btn-success btn-sm"
                              style={{ marginLeft: '10px' }}
                            >
                              Xong
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  {renderOrderActions(order)}
                  {order.estimatedCompleteTime && order.status === 'preparing' && (
                    <div>⏰ Dự kiến xong: {formatTime(order.estimatedCompleteTime)}</div>
                  )}
                </div>
              );
            })}
            {/* Empty Tab Fallback */}
            {orders.every(order =>
              (order.originalItems?.filter(item => item.status === status)?.length || 0) === 0
            ) && (
              <p style={{ textAlign: 'center', color: '#aaa' }}>Không có món nào</p>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default OrderCard;
