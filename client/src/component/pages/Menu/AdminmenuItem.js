import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../Header/AdminHeader';
import { Container } from 'react-bootstrap';
import './AdminmenuItem.css';

const API_URL = 'http://localhost:8080/api/menu-items';

function AdminMenuItem() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
    isAvailable: true,
    category: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(API_URL);
      setItems(res.data);
    } catch (err) {
      console.error('Error loading items:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/menu-categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({ name: '', description: '', image: '', price: '', isAvailable: true, category: '' });
      setEditingId(null);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      category: item.category?._id || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchItems();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleCreateNew = () => {
    setForm({ name: '', description: '', image: '', price: '', isAvailable: true, category: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category?._id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      <AdminHeader />
      <Container className="menu-page-container">
        <h2>Admin - Manage Menu Items</h2>

        <div className="admin-menu-wrapper">
          {/* LEFT SIDE */}
          <div className="menu-list">
            <button className="create-btn" onClick={handleCreateNew}>+ Create New</button>

            <div className="filters">
              <input
                className="search-input"
                type="text"
                placeholder="Search menu item..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <select
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <table className="menu-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item._id}>
                    <td><img src={item.image} alt={item.name} className="item-img" /></td>
                    <td>{item.name}</td>
                    <td>{item.category?.name || 'No Category'}</td>
                    <td>{item.price}</td>
                    <td>{item.isAvailable ? 'Yes' : 'No'}</td>
                    <td>
                      <button onClick={() => handleEdit(item)}>Edit</button>
                      <button onClick={() => handleDelete(item._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? 'active' : ''}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          {showForm && (
            <div className="menu-form">
              <h4>{editingId ? 'Edit Item' : 'Add New Item'}</h4>
              <form onSubmit={handleSubmit}>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
                <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" />
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" />
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <label>
                  <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} /> Available
                </label>
                <button type="submit">{editingId ? 'Update' : 'Create'}</button>
              </form>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

export default AdminMenuItem;
