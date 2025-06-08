import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/users', { withCredentials: true });
      setUsers(res.data);
    } catch {
      alert('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${id}/role`, { role }, { withCredentials: true });
      fetchUsers();
    } catch {
      alert('Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/users/${id}`, { withCredentials: true });
        fetchUsers();
      } catch {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                  <option value="user">User</option>
                  <option value="chef">Chef</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
