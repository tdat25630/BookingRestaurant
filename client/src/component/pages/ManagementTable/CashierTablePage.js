import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QRCodeComponent from './QRCodeGenerator';
import AdminHeader from '../../Header/AdminHeader';
import './AdminTableQRPage.css';
import CashierHeader from '../../Header/CashierHeader';

function CashierTablePage() {
    const [tables, setTables] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [loadingTableId, setLoadingTableId] = useState(null);
    const [activeSessions, setActiveSessions] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/tables');
            setTables(res.data);
        } catch (err) {
            console.error('Error fetching tables:', err);
        }
    };

    useEffect(() => {
        const fetchActiveSessions = async () => {
            const sessionMap = {};
            for (let table of tables) {
                try {
                    const res = await axios.get(`http://localhost:8080/api/dining-sessions/table/${table._id}`);
                    if (res.data && res.data._id) {
                        sessionMap[table._id] = res.data._id;
                    }
                } catch { }
            }
            setActiveSessions(sessionMap);
        };

        if (tables.length) fetchActiveSessions();
    }, [tables]);

    const createSessionForTable = async (tableId) => {
        try {
            setLoadingTableId(tableId);
            const res = await axios.post('http://localhost:8080/api/dining-sessions', {
                tableId: tableId
            });
            setSelectedSessionId(res.data._id);
            await fetchTables();
        } catch (err) {
            console.error('Error creating session:', err);
            alert('Failed to create new session');
        } finally {
            setLoadingTableId(null);
        }
    };

    const closeQRModal = () => setSelectedSessionId(null);

    return (
        <>
            <CashierHeader />
            <div className="admin-table-container">
                <h2>🍽️ Table Management</h2>
                <ul className="table-grid">
                    {tables.map(table => {
                        const currentSessionId = activeSessions[table._id];
                        return (
                            <li key={table._id}>
                                <strong>Table {table.tableNumber}</strong>
                                <span>Seats: {table.capacity} | Status: {table.status}</span>

                                {currentSessionId ? (
                                    <button className="view-btn" onClick={() => setSelectedSessionId(currentSessionId)}>
                                        📷 View QR
                                    </button>
                                ) : (
                                    <button
                                        className="create-btn"
                                        onClick={() => createSessionForTable(table._id)}
                                        disabled={loadingTableId === table._id}
                                    >
                                        {loadingTableId === table._id ? 'Creating...' : '➕ Create & Show QR'}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Modal */}
            {selectedSessionId && (
                <div className="modal-overlay" onClick={closeQRModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <QRCodeComponent sessionId={selectedSessionId} />

                        <div className="button-group">
  <button
    className="end-btn"
    onClick={async () => {
      const confirmEnd = window.confirm('Are you sure you want to end this session?');
      if (!confirmEnd) return;

      try {
        await axios.put(`http://localhost:8080/api/dining-sessions/${selectedSessionId}/complete`);
        alert('✅ Session ended.');
        await fetchTables();
        setSelectedSessionId(null);
      } catch (err) {
        console.error('Error ending session:', err);
        alert('❌ Failed to end session.');
      }
    }}
  >
    🔚 End Session
  </button>

  <button
    onClick={() => navigate(`/cashier/checkout?sessionId=${selectedSessionId}`)}
    className="checkout-btn"
  >
    💵 Checkout
  </button>

  <button onClick={closeQRModal} className="close-btn">Close</button>
</div>




                    </div>
                </div>
            )}

        </>
    );
}
export default CashierTablePage;
