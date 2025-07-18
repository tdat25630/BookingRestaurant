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

    // const fetchPendingReservations = async () => {
    //     try {
    //         const res = await axios.get('http://localhost:8080/api/reservation?status=pending');
    //         console.log('Pending reservations response:', res.data); 
    //         setPendingReservations(res.data.reservations || res.data || []); 
    //     } catch (err) {
    //         console.error('Error fetching pending reservations:', err);
    //     }
    // };
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

    // const createSessionForTable = async (tableId, reservationId = null) => {
    //     try {
    //         setLoadingTableId(tableId);
    //         const sessionData = { tableId: tableId };

    //         if (reservationId) {
    //             await axios.put(`http://localhost:8080/api/reservation/${reservationId}`, {
    //                 status: 'confirmed'
    //             });
    //         }

    //         const res = await axios.post('http://localhost:8080/api/dining-sessions', sessionData);
    //         setSelectedSessionId(res.data._id);
    //         await fetchTables();
    //         await fetchPendingReservations();
    //         setShowCreateOptions(null);
    //         setShowReservationModal(false);
    //     } catch (err) {
    //         console.error('Error creating session:', err);
    //         alert('Failed to create new session');
    //     } finally {
    //         setLoadingTableId(null);
    //     }
    // };

   // UPDATED: Sửa hàm createSessionForTable để lưu thông tin khách
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

    // const createSessionForTable = async (tableId, reservationId = null) => {
    //     try {
    //         setLoadingTableId(tableId);
            
    //         let sessionData = { 
    //             tableId: tableId,
    //             customerName: '',
    //             customerPhone: '',
    //             guestCount: 1,
    //             specialRequest: ''
    //         }; 
            
    //         // Nếu có reservationId, lấy thông tin khách từ reservation
    //         if (reservationId) {
    //             const reservation = pendingReservations.find(r => r._id === reservationId);
                
    //             if (reservation) {
    //                 sessionData = {
    //                     tableId: tableId, // Đảm bảo consistent với field name
    //                     customerName: reservation.name || '',
    //                     customerPhone: reservation.phone || '',
    //                     guestCount: reservation.guestCount || 1,
    //                     reservationId: reservationId,
    //                     specialRequest: reservation.specialRequest || ''
    //                 };
                    
    //                 // Cập nhật reservation status thành confirmed
    //                 try {
    //                     await axios.put(`http://localhost:8080/api/reservation/${reservationId}`, {
    //                         status: 'confirmed'
    //                     });
    //                     console.log('Reservation confirmed successfully');
    //                 } catch (updateError) {
    //                     console.error('Error updating reservation status:', updateError);
    //                     // Có thể tiếp tục tạo session mà không dừng lại
    //                 }
    //             } else {
    //                 console.warn(`Reservation with ID ${reservationId} not found in pending reservations`);
    //             }
    //         }
    
    //         console.log('Creating session with data:', sessionData);
            
    //         const res = await axios.post('http://localhost:8080/api/dining-sessions', sessionData);
            
    //         if (res.data && res.data._id) {
    //             setSelectedSessionId(res.data._id);
                
    //             // Refresh data
    //             await Promise.all([
    //                 fetchTables(),
    //                 fetchPendingReservations()
    //             ]);
                
    //             // Close modals
    //             setShowCreateOptions(null);
    //             setShowReservationModal(false);
                
    //             console.log('Session created successfully:', res.data);
    //         } else {
    //             throw new Error('Invalid response from server');
    //         }
            
    //     } catch (err) {
    //         console.error('Error creating session:', err);
            
    //         // Hiển thị error message chi tiết hơn
    //         const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
    //         alert(`Failed to create new session: ${errorMessage}`);
            
    //         // Nếu có lỗi, có thể rollback reservation status
    //         if (reservationId) {
    //             try {
    //                 await axios.put(`http://localhost:8080/api/reservation/${reservationId}`, {
    //                     status: 'pending'
    //                 });
    //             } catch (rollbackError) {
    //                 console.error('Error rolling back reservation status:', rollbackError);
    //             }
    //         }
    //     } finally {
    //         setLoadingTableId(null);
    //     }
    // };

    const handleCreateClick = (tableId, e) => {
        e.stopPropagation();
        setShowCreateOptions(tableId);
    };

    const handleNewCustomer = (tableId) => {
        createSessionForTable(tableId);
    };

    const handleReservedCustomer = (tableId) => {
        setSelectedTableForReservation(tableId);
        setShowReservationModal(true);
        setShowCreateOptions(null);
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
                                            <div className="create-options" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => handleNewCustomer(table._id)}>
                                                  Khách mới
                                                </button>
                                                <button onClick={() => handleReservedCustomer(table._id)}>
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
                                    <p style={{fontSize: '12px', color: '#666'}}>
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

            {/* Click outside to close create options */}
            {showCreateOptions && (
                <div className="overlay" onClick={closeCreateOptions}></div>
            )}
        </>
    );
}

export default CashierTablePage;