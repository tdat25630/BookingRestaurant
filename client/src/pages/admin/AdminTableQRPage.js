import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QRCodeComponent from '../../components/QRCodeGenerator';
import Header from "../../components/HeaderAdmin";

function AdminTableQRPage() {
  const [tables, setTables] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [loadingTableId, setLoadingTableId] = useState(null);
  const [activeSessions, setActiveSessions] = useState({});

  // Lấy danh sách bàn
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/tables');
      setTables(res.data);
    } catch (err) {
      console.error('❌ Lỗi lấy bàn:', err);
    }
  };

  // Lấy session active của từng bàn
  useEffect(() => {
    const fetchActiveSessions = async () => {
      const sessionMap = {};
      for (let table of tables) {
        try {
          const res = await axios.get(`http://localhost:8080/api/dining-sessions/table/${table._id}`);
          if (res.data && res.data._id) {
            sessionMap[table._id] = res.data._id;
          }
        } catch (err) {
          // Không có session active
        }
      }
      setActiveSessions(sessionMap);
    };

    if (tables.length) {
      fetchActiveSessions();
    }
  }, [tables]);

  // Tạo session mới cho bàn
  const createSessionForTable = async (tableId) => {
    try {
      setLoadingTableId(tableId);
      const res = await axios.post('http://localhost:8080/api/dining-sessions', {
        tableId: tableId
      });

      setSelectedSessionId(res.data._id);
      await fetchTables(); // Cập nhật lại trạng thái bàn
    } catch (err) {
      console.error('❌ Không thể tạo session:', err);
      alert('Không thể tạo session mới!');
    } finally {
      setLoadingTableId(null);
    }
  };

  // Kết thúc phiên ăn uống
  const endSession = async () => {
    const confirmEnd = window.confirm('Bạn có chắc chắn muốn kết thúc phiên này?');
    if (!confirmEnd) return;

    try {
      await axios.put(`http://localhost:8080/api/dining-sessions/${selectedSessionId}/complete`);
      alert('✅ Phiên đã kết thúc.');
      await fetchTables();
      setSelectedSessionId(null);
    } catch (err) {
      console.error('❌ Lỗi khi kết thúc phiên:', err);
      alert('Không thể kết thúc phiên!');
    }
  };

  return (
      <>
          <Header />
    <div style={{ padding: "20px" }}>
      <h2>📋 Danh sách bàn</h2>

      <ul>
        {tables.map(table => {
          const currentSessionId = activeSessions[table._id];

          return (
            <li key={table._id} style={{ margin: '10px 0' }}>
              <strong>{table.tableNumber}</strong> ({table.capacity} người) —
              Trạng thái: {table.status} —

              {currentSessionId ? (
                <button
                  onClick={() => setSelectedSessionId(currentSessionId)}
                  style={{ marginLeft: '10px' }}
                >
                  📷 Xem QR hiện tại
                </button>
              ) : (
                <button
                  onClick={() => createSessionForTable(table._id)}
                  disabled={loadingTableId === table._id}
                  style={{ marginLeft: '10px' }}
                >
                  {loadingTableId === table._id ? 'Đang tạo...' : '📥 Tạo session & xem mã QR'}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {selectedSessionId && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc' }}>
          <QRCodeComponent sessionId={selectedSessionId} />
          <button
            style={{
              marginTop: '15px',
              backgroundColor: 'crimson',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '6px'
            }}
            onClick={endSession}
          >
            🛑 Kết thúc phiên ăn uống
          </button>
        </div>
      )}
    </div>
    </>
  );
}

export default AdminTableQRPage;
