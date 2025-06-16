import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../Header/AdminHeader";
import './AdminmenuCategory.css';

const API_URL = "http://localhost:8080/api/menu-categories";

function AdminMenuCategory() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: "", description: "" });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    // New state for search and pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(API_URL);
            setCategories(res.data);
        } catch (err) {
            setError("Failed to fetch categories");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, form);
            } else {
                await axios.post(API_URL, form);
            }
            setForm({ name: "", description: "" });
            setEditingId(null);
            fetchCategories();
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Operation failed");
        }
    };

    const handleEdit = (cat) => {
        setForm({ name: cat.name, description: cat.description || "" });
        setEditingId(cat._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchCategories();
            setError("");
        } catch (err) {
            setError("Delete failed");
        }
    };

    const handleCancel = () => {
        setForm({ name: "", description: "" });
        setEditingId(null);
        setError("");
    };

    // Filtered and paginated data
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    return (
        <>
            <AdminHeader />
            <div className="admin-category-container">
                <h2>Admin Menu Categories</h2>
                {error && <div className="error-message">{error}</div>}

                {/* Search bar */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search category..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="search-input"
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="category-form">
                    <input
                        name="name"
                        placeholder="Category name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                    />
                    <button type="submit">{editingId ? "Update" : "Add"}</button>
                    {editingId && (
                        <button type="button" onClick={handleCancel} className="cancel-btn">
                            Cancel
                        </button>
                    )}
                </form>

                {/* Category Table */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((cat, idx) => (
                                <tr key={cat._id} className={idx % 2 === 0 ? "even" : "odd"}>
                                    <td>{cat.name}</td>
                                    <td>{cat.description}</td>
                                    <td>
                                        <button onClick={() => handleEdit(cat)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(cat._id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="no-data">No categories found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
        </>
    );
}

export default AdminMenuCategory;
