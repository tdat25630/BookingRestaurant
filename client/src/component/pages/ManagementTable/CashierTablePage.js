import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QRCodeComponent from './QRCodeGenerator';
import './CashierTableQRPage.css';
import CashierHeader from '../../Header/CashierHeader';

function CashierTablePage() {
    const [tables, setTables] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [loadingTableId, setLoadingTableId] = useState(null);
    const [activeSessions, setActiveSessions] = useState({});
    const [showCreateOptions, setShowCreateOptions] = useState(null);
    const [pendingReservations, setPendingReservations] = useState([]);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedTableForReservation, setSelectedTableForReservation] = useState(null);
    const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        guestCount: 1
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchTables();
        fetchPendingReservations();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/tables');
            setTables(res.data);
        } catch (err) {
            console.error('Error fetching tables:', err);
        }
    };

    const fetchPendingReservations = async () => {
        try {
            let allReservations = [];
            let currentPage = 1;
            let totalPages = 1;

            do {
                const res = await axios.get(`http://localhost:8080/api/reservation?status=pending&page=${currentPage}&pageSize=10`);

                allReservations = [...allReservations, ...(res.data.reservations || [])];
                totalPages = res.data.totalPages || 1;
                currentPage++;

            } while (currentPage <= totalPages);

            console.log(`Fetched ${allReservations.length} total reservations from ${totalPages} pages`);
            setPendingReservations(allReservations);
        } catch (err) {
            console.error('Error fetching pending reservations:', err);
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

    const createSessionForTable = async (tableId, reservationId = null) => {
        try {
            setLoadingTableId(tableId);

            let sessionData = { tableId: tableId };

            // Nếu có reservationId, lấy thông tin khách từ reservation
            if (reservationId) {
                const reservation = pendingReservations.find(r => r._id === reservationId);

                if (reservation) {
                    sessionData = {
                        tableId: tableId,
                        customerName: reservation.name,
                        customerPhone: reservation.phone,
                        guestCount: reservation.guestCount,
                        reservationId: reservationId,
                        specialRequest: reservation.specialRequest || ''
                    };
                }

                // Cập nhật reservation status thành confirmed
                await axios.put(`http://localhost:8080/api/reservation/${reservationId}`, {
                    status: 'confirmed'
                });
            }

            console.log('Creating session with data:', sessionData);
            const res = await axios.post('http://localhost:8080/api/dining-sessions', sessionData);
            setSelectedSessionId(res.data._id);
            await fetchTables();
            await fetchPendingReservations();
            setShowCreateOptions(null);
            setShowReservationModal(false);
        } catch (err) {
            console.error('Error creating session:', err);
            alert('Failed to create new session');
        } finally {
            setLoadingTableId(null);
        }
    };


    const createSessionWithCustomerInfo = async () => {
       
        if (!customerInfo.name.trim()) {
            alert('Vui lòng nhập tên khách');
            return;
        }
        // if (!customerInfo.phone.trim()) {
        //     alert('Vui lòng nhập số điện thoại');
        //     return;
        // }

        // Kiểm tra capacity bàn
        const selectedTable = tables.find(t => t._id === selectedTableForReservation);
        if (selectedTable && customerInfo.guestCount > selectedTable.capacity) {
            const confirmOverCapacity = window.confirm(
                `Bàn ${selectedTable.tableNumber} chỉ có ${selectedTable.capacity} chỗ ngồi, ` +
                `nhưng bạn đặt cho ${customerInfo.guestCount} người. Có muốn tiếp tục không?`
            );
            if (!confirmOverCapacity) return;
        }

        try {
            setLoadingTableId(selectedTableForReservation);

            const sessionData = {
                tableId: selectedTableForReservation,
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                guestCount: customerInfo.guestCount,
                specialRequest: customerInfo.specialRequest || ''
            };

            console.log('Creating session with customer info:', sessionData);
            const res = await axios.post('http://localhost:8080/api/dining-sessions', sessionData);
            setSelectedSessionId(res.data._id);
            
            // Refresh data
            await fetchTables();
            
            // Reset form và đóng modal
            setCustomerInfo({
                name: '',
                phone: '',
                guestCount: 1,
                specialRequest: ''
            });
            setShowCustomerInfoModal(false);
            setSelectedTableForReservation(null);

        } catch (err) {
            console.error('Error creating session:', err);
            alert('Failed to create new session');
        } finally {
            setLoadingTableId(null);
        }
    };

    const handleCreateClick = (tableId, e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowCreateOptions(prev => prev === tableId ? null : tableId);
    };

    const handleNewCustomer = (tableId) => {
        setShowCreateOptions(null);
        setSelectedTableForReservation(tableId);
        setShowCustomerInfoModal(true); 
    

     // Set default guest count dựa trên capacity của bàn
     const selectedTable = tables.find(t => t._id === tableId);
     if (selectedTable) {
         setCustomerInfo(prev => ({
             ...prev,
             guestCount: Math.min(prev.guestCount, selectedTable.capacity)
         }));
     }
 };


    const handleReservedCustomer = (tableId) => {
        setShowCreateOptions(null);
        setSelectedTableForReservation(tableId);
        setShowReservationModal(true);
    };

    const handleSelectReservation = (reservationId) => {
        createSessionForTable(selectedTableForReservation, reservationId);
    };

    const closeQRModal = () => setSelectedSessionId(null);
    const closeCreateOptions = () => setShowCreateOptions(null);
    const closeReservationModal = () => {
        setShowReservationModal(false);
        setSelectedTableForReservation(null);
    };
    const closeCustomerInfoModal = () => {
        setShowCustomerInfoModal(false);
        setSelectedTableForReservation(null);
        setCustomerInfo({
            name: '',
            phone: '',
            guestCount: 1,
            specialRequest: ''
        });
    };

    const getMatchingReservations = () => {
        return pendingReservations;
    };

    // Hàm helper để format thời gian hiển thị
    const formatReservationDateTime = (date, time) => {
        const today = new Date().toISOString().split('T')[0];
        const reservationDate = new Date(date).toISOString().split('T')[0];

        if (reservationDate === today) {
            return `Hôm nay ${time}`;
        } else {
            return `${new Date(date).toLocaleDateString('vi-VN')} ${time}`;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
           
            if (!event.target.closest('.create-section')) {
                setShowCreateOptions(null);
            }
        };

        if (showCreateOptions) {
         
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showCreateOptions]);


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
                                    <div className="create-section">
                                        <button
                                            className="create-btn"
                                            onClick={(e) => handleCreateClick(table._id, e)}
                                            disabled={loadingTableId === table._id}
                                        >
                                            {loadingTableId === table._id ? 'Creating...' : '➕ Create'}
                                        </button>

                                         {showCreateOptions === table._id && (
                                            <div
                                                className="create-options"
                                                onClick={e => e.stopPropagation()}
                                                onMouseLeave={() => {
                                                    // Optional: auto-close on mouse leave after delay
                                                    // setTimeout(() => setShowCreateOptions(null), 200);
                                                }}
                                            >
                                                <button
                                                    onClick={() => handleNewCustomer(table._id)}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#28a745';
                                                        e.target.style.color = '#ffffff';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#2a2a2a';
                                                        e.target.style.color = '#ffffff';
                                                    }}
                                                >
                                                    Khách mới
                                                </button>
                                                <button
                                                    onClick={() => handleReservedCustomer(table._id)}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#17a2b8';
                                                        e.target.style.color = '#ffffff';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#2a2a2a';
                                                        e.target.style.color = '#ffffff';
                                                    }}
                                                >
                                                    Khách đã đặt bàn
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

           {/* Customer Info Modal */}
           {showCustomerInfoModal && (
                <div className="modal-overlay" onClick={closeCustomerInfoModal}>
                    <div className="modal-content customer-info-modal" onClick={e => e.stopPropagation()}>
                        <h3>Thông tin khách hàng</h3>
                        <div className="customer-info-form">
                            <input 
                                type="text" 
                                placeholder="Tên khách hàng *"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                                required 
                            />
                            <input 
                                type="tel" 
                                placeholder="Số điện thoại "
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                
                            />
                            <select 
                                value={customerInfo.guestCount}
                                onChange={(e) => setCustomerInfo({...customerInfo, guestCount: parseInt(e.target.value)})}
                            >
                                {[1,2,3,4,5,6,7,8].map(num => (
                                    <option key={num} value={num}>{num} người</option>
                                ))}
                            </select>
                            {/* <textarea 
                                placeholder="Yêu cầu đặc biệt (tùy chọn)"
                                value={customerInfo.specialRequest}
                                onChange={(e) => setCustomerInfo({...customerInfo, specialRequest: e.target.value})}
                            /> */}
                        </div>
                        <div className="button-group">
                            <button 
                                onClick={createSessionWithCustomerInfo}
                                className="confirm-btn"
                                disabled={loadingTableId}
                            >
                                {loadingTableId ? 'Đang tạo...' : 'Tạo session'}
                            </button>
                            <button onClick={closeCustomerInfoModal} className="close-btn">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
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

            {/* Reservation Selection Modal */}
            {showReservationModal && (
                <div className="modal-overlay" onClick={closeReservationModal}>
                    <div className="modal-content reservation-modal" onClick={e => e.stopPropagation()}>
                        <h3>Chọn khách đã đặt bàn</h3>
                        <div className="reservation-list">
                            {getMatchingReservations().length === 0 ? (
                                <div>
                                    <p>Không có đặt bàn pending nào</p>
                                    <p style={{ fontSize: '12px', color: '#666' }}>
                                        Debug: Tổng {pendingReservations.length} reservations được tải
                                    </p>
                                </div>
                            ) : (
                                getMatchingReservations().map(reservation => {
                                    const selectedTable = tables.find(t => t._id === selectedTableForReservation);
                                    const isTableTooSmall = selectedTable && reservation.guestCount > selectedTable.capacity;

                                    return (
                                        <div key={reservation._id} className="reservation-item">
                                            <div className="reservation-info">
                                                <strong>{reservation.name}</strong>
                                                <span>📞 {reservation.phone}</span>
                                                <span>👥 {reservation.guestCount} người</span>
                                                <span>⏰ {formatReservationDateTime(reservation.reservationDate, reservation.reservationTime)}</span>
                                                {isTableTooSmall && (
                                                    <span className="table-warning">⚠️ Bàn {selectedTable.tableNumber} có thể hơi nhỏ ({selectedTable.capacity} chỗ)</span>
                                                )}
                                                {reservation.specialRequest && (
                                                    <span className="special-request">📝 {reservation.specialRequest}</span>
                                                )}
                                            </div>
                                            <button
                                                className="select-reservation-btn"
                                                onClick={() => handleSelectReservation(reservation._id)}
                                            >
                                                Chọn
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <button onClick={closeReservationModal} className="close-btn">Close</button>
                    </div>
                </div>
            )}


        </>
    );






}

export default CashierTablePage;