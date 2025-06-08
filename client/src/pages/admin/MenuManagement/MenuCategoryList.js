import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MenuCategoryList = ({ onEdit }) => {
  const [categories, setCategories] = useState([]);

  // Gọi API để lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Lỗi khi fetch danh mục:', error);
      }
    };
  
    fetchCategories();
  }, []);
  return (
    <ul>
      {categories.map((cat) => (
        <li key={cat.id} style={{ marginBottom: '0.5rem' }}>
          {cat.name}
          <button style={{ marginLeft: '1rem' }} onClick={() => onEdit(cat)}>
            Chỉnh sửa
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MenuCategoryList;
