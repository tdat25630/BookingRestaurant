import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Alert,
  Spinner,
  InputGroup,
  Pagination
} from 'react-bootstrap';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSort,
  FaPercentage,
  FaDollarSign,
  FaGift
} from 'react-icons/fa';
import axios from 'axios';
import './PromotionManagement.css';

const PromotionManagement = () => {
  // State management
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [deletingPromotion, setDeletingPromotion] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    points_required: 0,
    min_order_value: 0,
    start_date: '',
    end_date: '',
    promotion_type: 'general',
    usage_limit: 1,
    is_active: true
  });

  // Fetch promotions
  useEffect(() => {
    fetchPromotions();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = promotions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(promo =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(promo => {
        const now = new Date();
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);

        switch (filterStatus) {
          case 'active':
            return promo.is_active && startDate <= now && endDate >= now;
          case 'inactive':
            return !promo.is_active;
          case 'expired':
            return endDate < now;
          case 'upcoming':
            return startDate > now;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(promo => promo.discount_type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'start_date' || sortBy === 'end_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPromotions(filtered);
    setCurrentPage(1);
  }, [promotions, searchTerm, filterStatus, filterType, sortBy, sortOrder]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/promotions');
      setPromotions(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingPromotion) {
        await axios.put(`http://localhost:8080/api/promotions/update/${editingPromotion._id}`, formData);
        setSuccess('Promotion updated successfully');
      } else {
        await axios.post('http://localhost:8080/api/promotions/create', formData);
        setSuccess('Promotion created successfully');
      }

      setShowModal(false);
      setEditingPromotion(null);
      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      setError(error.response?.data?.message || 'Failed to save promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8080/api/promotions/delete/${deletingPromotion._id}`);
      setSuccess('Promotion deleted successfully');
      setShowDeleteModal(false);
      setDeletingPromotion(null);
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setError('Failed to delete promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      points_required: promotion.points_required || 0,
      min_order_value: promotion.min_order_value || 0,
      start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : '',
      end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : '',
      promotion_type: promotion.promotion_type || 'general',
      usage_limit: promotion.usage_limit || 1,
      is_active: promotion.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      points_required: 0,
      min_order_value: 0,
      start_date: '',
      end_date: '',
      promotion_type: 'general',
      usage_limit: 1,
      is_active: true
    });
  };

  const getStatusBadge = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (!promotion.is_active) {
      return <Badge bg="secondary">Inactive</Badge>;
    } else if (endDate < now) {
      return <Badge bg="danger">Expired</Badge>;
    } else if (startDate > now) {
      return <Badge bg="warning">Upcoming</Badge>;
    } else {
      return <Badge bg="success">Active</Badge>;
    }
  };

  const getDiscountDisplay = (promotion) => {
    if (promotion.discount_type === 'percentage') {
      return (
        <span className="discount-value">
          <FaPercentage className="me-1" />
          {promotion.discount_value}%
        </span>
      );
    } else {
      return (
        <span className="discount-value">
          <FaDollarSign className="me-1" />
          {promotion.discount_value.toLocaleString('vi-VN')}₫
        </span>
      );
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

  return (
    <div className="promotion-management-container">
      <Container fluid>
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FaGift className="me-3" />
              Promotion Management
            </h1>
            <p>Manage discounts, coupons, and promotional campaigns</p>
            <div className="summary-info">
              <span className="total-count">
                Total Promotions: <strong>{promotions.length}</strong>
              </span>
              <span className="active-count">
                Active: <strong>{promotions.filter(p => {
                  const now = new Date();
                  const start = new Date(p.start_date);
                  const end = new Date(p.end_date);
                  return p.is_active && start <= now && end >= now;
                }).length}</strong>
              </span>
            </div>
          </div>
          <Button
            className="add-promotion-btn"
            onClick={() => {
              resetForm();
              setEditingPromotion(null);
              setShowModal(true);
            }}
          >
            <FaPlus className="me-2" />
            Add New Promotion
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Search and Filter Section */}
        <Card className="search-filter-section">
          <Card.Body>
            <Row>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="input"
                    placeholder="Search by code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                  <option value="upcoming">Upcoming</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Created Date</option>
                  <option value="start_date">Start Date</option>
                  <option value="end_date">End Date</option>
                  <option value="code">Code</option>
                  <option value="discount_value">Discount Value</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-warning"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-100"
                >
                  <FaSort className="me-1" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Promotions Table */}
        <Card className="promotions-table">
          <Card.Body>
            {loading ? (
              <div className="loading-spinner">
                <Spinner animation="border" />
                <span className="ms-2">Loading promotions...</span>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="empty-state">
                <FaGift size={48} className="text-muted mb-3" />
                <h3>No promotions found</h3>
                <p>Create your first promotion to get started</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="promotion-table">
                    <thead>
                      <tr style={{ color: 'black' }}>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Discount</th>
                        <th>Period</th>
                        <th>Status</th>
                        <th>Usage</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((promotion) => (
                        <tr key={promotion._id}>
                          <td>
                            <div className="promotion-code">
                              <strong>{promotion.code}</strong>
                              {promotion.promotion_type === 'points_based' && (
                                <Badge bg="info" size="sm" className="ms-2">
                                  Points
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="promotion-description">
                              {promotion.description}
                            </div>
                          </td>
                          <td>
                            <Badge bg={promotion.discount_type === 'percentage' ? 'primary' : 'success'}>
                              {promotion.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                            </Badge>
                          </td>
                          <td>
                            <div className="discount-display" style={{color: 'white'}}>
                              {getDiscountDisplay(promotion)}
                            </div>
                          </td>
                          <td>
                            <div className="date-range">
                              <div className="start-date">
                                <small>Start:</small> {new Date(promotion.start_date).toLocaleDateString()}
                              </div>
                              <div className="end-date">
                                <small>End:</small> {new Date(promotion.end_date).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(promotion)}
                          </td>
                          <td>
                            <div className="usage-info">
                              <div className="usage-count">
                                {promotion.used_count || 0} / {promotion.usage_limit || '∞'}
                              </div>
                              <div className="usage-bar">
                                <div
                                  className="usage-fill"
                                  style={{
                                    width: `${promotion.usage_limit ? (promotion.used_count / promotion.usage_limit) * 100 : 0}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleEdit(promotion)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setDeletingPromotion(promotion);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />

                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}

                      <Pagination.Next
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingPromotion(null);
          resetForm();
        }}
        size="lg"
        className="promotion-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Promotion Code *</Form.Label>
                  <Form.Control
                    type="input"
                    placeholder="Enter promotion code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Promotion Type</Form.Label>
                  <Form.Select
                    value={formData.promotion_type}
                    onChange={(e) => setFormData({ ...formData, promotion_type: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="points_based">Points-Based</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter promotion description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Type *</Form.Label>
                  <Form.Select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(VND)'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={formData.discount_type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    min="0"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Points Required</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter points required"
                    value={formData.points_required}
                    onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Order Value (VND)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter minimum order value"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Usage Limit</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter usage limit (0 for unlimited)"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Check
                    type="switch"
                    id="is-active-switch"
                    label="Active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mt-2"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setEditingPromotion(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingPromotion ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingPromotion ? 'Update Promotion' : 'Create Promotion'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setDeletingPromotion(null);
        }}
        className="delete-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the promotion <strong>{deletingPromotion?.code}</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletingPromotion(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Promotion'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PromotionManagement;
