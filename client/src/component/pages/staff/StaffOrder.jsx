import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import StaffHeader from '../../Header/StaffHeader';
import OrderHeader from './OrderHeader';
import OrderStats from './OrderStats';
import OrderFilters from './OrderFilters';
import OrderCard from './OrderCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0]; // local YYYY-MM-DD
  });

  const [itemSortOption, setItemSortOption] = useState({});
  const [defaultStatus, setDefaultStatus] = useState('ordered');

  const socketRef = useRef(null);
  const dateFilterRef = useRef(dateFilter);

  const mergeOrdersPreservingEdits = (newOrders, prevOrders) => {
    return newOrders.map(newOrder => {
      const prevOrder = prevOrders.find(o => o._id === newOrder._id);
      if (!prevOrder) return newOrder;

      const mergedItems = newOrder.items.map(newItem => {
        const prevItem = prevOrder.items?.find(i => i._id === newItem._id);
        return prevItem?.updatedQuantity !== undefined
          ? { ...newItem, updatedQuantity: prevItem.updatedQuantity }
          : newItem;
      });

      return { ...newOrder, items: mergedItems };
    });
  };

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const queryParams = new URLSearchParams();
      if (dateFilterRef.current) queryParams.append('date', dateFilterRef.current);

      const response = await axios.get(`http://localhost:8080/api/chef/orders?${queryParams}`);
      const sortedOrders = [...(response.data.orders || [])].sort((a, b) => {
        const aHasPending = a.items.some(item => item.status === 'ordered');
        const bHasPending = b.items.some(item => item.status === 'ordered');
        return (aHasPending === bHasPending) ? 0 : aHasPending ? -1 : 1;
      });

      setOrders(prev => mergeOrdersPreservingEdits(sortedOrders, prev));
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/chef/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    dateFilterRef.current = dateFilter;
    fetchOrders();
    fetchStats();
  }, [dateFilter]);

  useEffect(() => {
    let reconnectInterval;

    const connectWebSocket = () => {
      socketRef.current = new WebSocket('ws://localhost:8080');

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };

      socketRef.current.onmessage = (event) => {
        const message = event.data;
        console.log('[WebSocket] Message:', message);

        if (message === 'orderCreated' || message === 'orderUpdated') {
          console.log('receive an event');
          fetchOrders(false); // use current filter
          fetchStats();
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
          }, 3000); // retry every 3 seconds
        }
      };
    };

    connectWebSocket();

    return () => {
      clearInterval(reconnectInterval);
      socketRef.current?.close();
    };
  }, []);

  const filteredOrders = orders.filter(order =>
    !tableFilter ||
    order.sessionId?.table?.tableNumber?.toLowerCase().includes(tableFilter.toLowerCase())
  );


  return (
    <>
      <StaffHeader />
      <div className="chef-order-container">
        <OrderHeader onRefresh={() => { setRefreshing(true); fetchOrders(false); fetchStats(); }} refreshing={refreshing} />
        {/* <OrderStats stats={stats} />*/}
        <OrderFilters
          tableFilter={tableFilter}
          setTableFilter={setTableFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        {error && <div className="error-message">❌ {error}</div>}

        <div className='my-3 mr-3'>
          {['all', 'ordered', 'preparing', 'cooking', 'done'].map(status => {
            const isActive = defaultStatus === status;

            // Count the number of items for this status
            const count = orders.reduce((acc, order) => {
              const matchingItems = order.items.filter(item =>
                status === 'all' ? true : item.status === status
              );
              return acc + matchingItems.length;
            }, 0);

            return (
              <button
                key={status}
                onClick={() => {
                  setItemSortOption('');
                  setDefaultStatus(status)
                }}
                style={{
                  backgroundColor: isActive ? '#ff6347' : '#1a1a1a',
                  color: isActive ? 'white' : '#ccc',
                  border: `1px solid ${isActive ? '#ff6347' : '#333'}`,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
              >
                {status === 'all' ? 'Tất cả' :
                  status === 'ordered' ? 'Chờ' :
                    status === 'preparing' ? 'Đã nhận' :
                      status === 'cooking' ? 'Đang nấu' :
                        status === 'done' ? 'Xong' : status}{' '}
                <span style={{ color: isActive ? '#fff' : '#aaa' }}>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="orders-container">
          {loading ? (
            <div className="loading"><div className="spinner" />Đang tải...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders"><div className="no-orders-icon">🧑‍🍳</div><p>Không có đơn hàng</p></div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                itemSortOption={itemSortOption}
                setItemSortOption={setItemSortOption}
                setOrders={setOrders}
                toast={toast}
                fetchOrders={fetchOrders}
                fetchStats={fetchStats}
                defaultStatus={defaultStatus}
              />
            ))
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Order;
