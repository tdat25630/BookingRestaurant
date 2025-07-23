import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CashierHeader from '../../Header/CashierHeader';
import './InvoiceList.css'; // We will create this CSS file next

function InvoiceList() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/invoices');
                if (res.data.success) {
                    setInvoices(res.data.data);
                }
            } catch (err) {
                setError('Failed to fetch invoices. Please try again later.');
                console.error("Error fetching invoices:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const handleViewDetails = (invoiceId) => {
       
        navigate(`/cashier/invoices/${invoiceId}`);
    };

    if (loading) return <div className="loading-container">Loading invoices...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <>
            <CashierHeader />
            <div className="invoice-list-container">
                <h2 className="page-title">Invoice Management</h2>
                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <tr key={invoice._id}>
                                    <td>{invoice._id}</td>
                                    <td>{invoice.order_id?._id || 'N/A'}</td>
                                    <td>{new Date(invoice.invoice_date).toLocaleString('en-US')}</td>
                                    <td>{invoice.total_amount.toLocaleString('en-US')}₫</td>
                                    <td>
                                        <span className={`status-badge status-${invoice.payment_status}`}>
                                            {invoice.payment_status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-details"
                                            onClick={() => handleViewDetails(invoice._id)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">No invoices found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default InvoiceList;
