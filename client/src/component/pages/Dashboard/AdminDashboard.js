import React from 'react';
import AdminHeader from '../../Header/AdminHeader'; // Import đúng component header dành cho admin

function AdminDashboard() {
  return (
    <>
      <AdminHeader />
      <div className="container mt-4">
        <h1>Admin Dashboard</h1>
      </div>
    </>
  );
}

export default AdminDashboard;
