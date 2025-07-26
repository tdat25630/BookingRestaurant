import axios from 'axios';
import StatusBadge from './StatusBadge';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';
import React, { useState } from 'react';

const NoteModal = ({ show, onClose, note, onSave }) => {
  const [editedNote, setEditedNote] = React.useState(note || '');

  React.useEffect(() => {
    setEditedNote(note || '');
  }, [note]);

  const handleSave = () => {
    onSave(editedNote);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ghi chú món ăn</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          as="textarea"
          rows={5}
          value={editedNote}
          onChange={(e) => setEditedNote(e.target.value)}
          placeholder="Nhập ghi chú..."
          autoFocus
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const OrderItem = ({ item, order, setOrders }) => {
  const [noteModalItemId, setNoteModalItemId] = useState(null);
  const [noteModalContent, setNoteModalContent] = useState('');
  const handleQuantityChange = (val) => {
    if (!/^\d*$/.test(val)) return;
    setOrders(prev =>
      prev.map(o =>
        o._id === order._id
          ? {
            ...o,
            items: o.items.map(i =>
              i._id === item._id ? { ...i, updatedQuantity: val } : i
            )
          }
          : o
      )
    );
  };

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa món này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/order-items/${id}`);
        toast.success('Đã xóa món thành công!');
        setOrders(prev =>
          prev.map(o =>
            o._id === order._id
              ? {
                ...o,
                items: o.items.filter(i => i._id !== id)
              }
              : o
          )
        );
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Xóa món thất bại!');
      }
    }
  };

  const updateItemNote = async (itemId, newNote) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/order-items/note/${itemId}`, {
        notes: newNote
      });

      // Update local state
      setOrders((prev) =>
        prev.map((orderItem) =>
          orderItem._id === order._id
            ? {
              ...orderItem,
              items: orderItem.items.map(i =>
                i._id === itemId ? { ...i, notes: newNote } : i
              )
            }
            : orderItem
        )
      );

      toast.success('Cập nhật ghi chú thành công!');
      return response.data;
    } catch (error) {
      console.error('Failed to update item note:', error);
      toast.error('Cập nhật ghi chú thất bại!');
      throw error;
    }
  };

  return (
    <div className="order-item">
      <div className="item-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            min="1"
            disabled={item.status !== 'ordered'}
            value={item.updatedQuantity ?? item.quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            style={{
              width: '60px',
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: item.status === 'ordered' ? '#1a1a1a' : '#2a2a2a',
              color: item.status === 'ordered' ? '#fff' : '#888',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          />
          <span>{item.menuItemId?.name || 'Món ăn'}</span>
        </div>
        <p className="item-details">
          {item.menuItemId?.category?.name || item.menuItemId?.categoryName || 'Danh mục'}
        </p>
        {item.notes && (
          <p
            className="item-notes"
            onClick={() => {
              setNoteModalItemId(item._id);
              setNoteModalContent(item.notes);
            }}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            📝 {item.notes}
          </p>
        )}

      </div>

      <div className="item-actions">
        <StatusBadge status={item.status} />
        {item.status === 'ordered' && (
          <button className="btn btn-danger" onClick={() => deleteItem(item._id)}>
            Xóa
          </button>
        )}
      </div>
      <NoteModal
        show={!!noteModalItemId}
        note={noteModalContent}
        onClose={() => setNoteModalItemId(null)}
        onSave={(newNote) => {
          // handle note save
          updateItemNote(noteModalItemId, newNote); // define this function!
        }}
      />

    </div>
  );
};


export default OrderItem;
