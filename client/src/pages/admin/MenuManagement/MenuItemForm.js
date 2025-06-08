import React, { useState, useEffect } from 'react';

const MenuItemForm = ({ item, onClear }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price);
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    // Gửi API hoặc console.log
    console.log('Lưu món ăn:', { id: item?.id, name, price });
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <h4>{item ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</h4>
      <input
        type="text"
        placeholder="Tên món ăn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Giá (VND)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <button type="submit">Lưu</button>
      {item && <button onClick={onClear} type="button">Hủy</button>}
    </form>
  );
};

export default MenuItemForm;
