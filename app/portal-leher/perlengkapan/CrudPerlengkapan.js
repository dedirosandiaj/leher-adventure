'use client';
import { useState } from 'react';
import { useActionState } from 'react';
import { addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem } from './actions';
import styles from '../crud.module.css';

export default function CrudPerlengkapan({ categories, items }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  
  const [catState, catAction] = useActionState(
    editingCategory ? updateCategory : addCategory, 
    null
  );
  const [itemState, itemAction] = useActionState(
    editingItem ? updateItem : addItem, 
    null
  );

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditingItem(null);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditingCategory(null);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditingItem(null);
  };

  const handleDeleteCategory = async (id) => {
    if (confirm('Yakin ingin menghapus kategori ini? Semua item di dalamnya juga akan terhapus.')) {
      await deleteCategory(id);
    }
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Yakin ingin menghapus item ini?')) {
      await deleteItem(id);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola Perlengkapan</h1>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Kategori
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'items' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Item Perlengkapan
        </button>
      </div>

      {/* Category Section */}
      {activeTab === 'categories' && (
        <>
          {/* Category Form */}
          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h2>
            <form action={catAction} className={styles.form}>
              {editingCategory && (
                <input type="hidden" name="id" value={editingCategory.id} />
              )}
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Nama Kategori</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Contoh: Tas & Carrier"
                    defaultValue={editingCategory?.name || ''}
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Urutan</label>
                  <input 
                    type="number" 
                    name="order" 
                    placeholder="0"
                    defaultValue={editingCategory?.order || 0}
                  />
                </div>
              </div>

              {catState?.error && <div className={styles.error}>{catState.error}</div>}
              {catState?.success && <div className={styles.success}>{catState.success}</div>}

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.addBtn}>
                  {editingCategory ? 'Update Kategori' : 'Tambah Kategori'}
                </button>
                {editingCategory && (
                  <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className={styles.listCard}>
            <h2 className={styles.sectionTitle}>Daftar Kategori ({categories.length})</h2>
            {categories.length === 0 ? (
              <p className={styles.empty}>Belum ada kategori.</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Urutan</th>
                      <th>Nama Kategori</th>
                      <th>Jumlah Item</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.order}</td>
                        <td>{cat.name}</td>
                        <td>{cat._count?.items || 0} item</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button 
                              type="button" 
                              className={styles.editBtnSm}
                              onClick={() => handleEditCategory(cat)}
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className={styles.deleteBtnSm}
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Items Section */}
      {activeTab === 'items' && (
        <>
          {/* Item Form */}
          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}>
              {editingItem ? 'Edit Item' : 'Tambah Item Baru'}
            </h2>
            <form action={itemAction} className={styles.form}>
              {editingItem && (
                <input type="hidden" name="id" value={editingItem.id} />
              )}
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Nama Item</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Contoh: Carrier 60L"
                    defaultValue={editingItem?.name || ''}
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Kategori</label>
                  <select name="categoryId" defaultValue={editingItem?.categoryId || ''} required>
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Deskripsi</label>
                  <input 
                    type="text" 
                    name="description" 
                    placeholder="Deskripsi singkat item"
                    defaultValue={editingItem?.description || ''}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      name="required" 
                      defaultChecked={editingItem?.required || false}
                    />
                    <span>Wajib dibawa</span>
                  </label>
                </div>
              </div>

              {itemState?.error && <div className={styles.error}>{itemState.error}</div>}
              {itemState?.success && <div className={styles.success}>{itemState.success}</div>}

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.addBtn}>
                  {editingItem ? 'Update Item' : 'Tambah Item'}
                </button>
                {editingItem && (
                  <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Items List */}
          <div className={styles.listCard}>
            <h2 className={styles.sectionTitle}>Daftar Item ({items.length})</h2>
            {items.length === 0 ? (
              <p className={styles.empty}>Belum ada item.</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Nama Item</th>
                      <th>Kategori</th>
                      <th>Deskripsi</th>
                      <th>Wajib</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <span className={styles.categoryBadge}>
                            {item.category?.name}
                          </span>
                        </td>
                        <td>{item.description || '-'}</td>
                        <td>
                          {item.required ? (
                            <span className={styles.requiredBadge}>Wajib</span>
                          ) : (
                            <span className={styles.optionalBadge}>Opsional</span>
                          )}
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button 
                              type="button" 
                              className={styles.editBtnSm}
                              onClick={() => handleEditItem(item)}
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className={styles.deleteBtnSm}
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
