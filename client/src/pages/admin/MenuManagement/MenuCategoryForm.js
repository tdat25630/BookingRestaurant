import React, { useState, useEffect } from 'react';

const MenuCategoryForm = ({ category, onClear }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    console.log('Lưu danh mục:', { id: category?.id, name });
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <h4>{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h4>
      <input
        type="text"
        placeholder="Tên danh mục"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">Lưu</button>
      {category && <button onClick={onClear} type="button">Hủy</button>}
    </form>
  );
};

export default MenuCategoryForm;
