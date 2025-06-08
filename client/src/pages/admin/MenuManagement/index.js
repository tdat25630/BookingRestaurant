import React, { useState } from 'react';
import MenuItemList from './MenuItemList';
import MenuCategoryList from './MenuCategoryList';
import MenuItemForm from './MenuItemForm';
import MenuCategoryForm from './MenuCategoryForm';

const MenuManagement = () => {
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>🍽️ Quản lý Menu</h2>
      <div style={{ display: 'flex', gap: '3rem' }}>
        <div style={{ flex: 1 }}>
          <h3>Danh sách món ăn</h3>
          <MenuItemList onEdit={(item) => setEditingItem(item)} />
          <MenuItemForm item={editingItem} onClear={() => setEditingItem(null)} />
        </div>
        <div style={{ flex: 1 }}>
          <h3>Danh mục món ăn</h3>
          <MenuCategoryList onEdit={(category) => setEditingCategory(category)} />
          <MenuCategoryForm category={editingCategory} onClear={() => setEditingCategory(null)} />
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
