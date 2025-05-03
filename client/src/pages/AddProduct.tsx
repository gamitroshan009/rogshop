import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id?: string;
  name: string;
  price: number;
  category: string;
}

const AddProduct = () => {
  const [form, setForm] = useState<Product>({ name: '', price: 0, category: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // Track selected products for bill
  const [editId, setEditId] = useState<string | null>(null); // To track which product is being edited

  const productURL = 'https://rog-qylu.onrender.com/api/products';
  const categoryURL = 'https://rog-qylu.onrender.com/api/categories';
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get<Product[]>(productURL);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(categoryURL);
      const categoryNames = res.data.map((cat: any) => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(categoryURL, { category: newCategory.trim() });
      alert(`Category "${newCategory}" added!`);
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${productURL}/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post(productURL, form);
      }
      setForm({ name: '', price: 0, category: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({ name: product.name, price: product.price, category: product.category });
    setEditId(product._id || null);
  };

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`${productURL}/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectAllProducts = () => {
    const allProductIds = products.map((product) => product._id || '');
    setSelectedProducts(allProductIds);
  };

  const addToBill = () => {
    const selected = products.filter((p) => selectedProducts.includes(p._id || ''));
    const bill = selected.map((p) => ({ ...p, quantity: 1 }));
    localStorage.setItem('bill', JSON.stringify(bill));
    setSelectedProducts([]);
    navigate('/bill');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{editId ? '✏️ Edit Product' : '🛒 Add Product'}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
          style={inputStyle}
        />

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
          style={inputStyle}
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button type="submit" style={buttonStyle}>
          {editId ? '✅ Update Product' : '➕ Add Product'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <div>
        <h3>Add New Category</h3>
        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={inputStyle}
        />
        <button onClick={addCategory} style={{ ...buttonStyle, backgroundColor: '#28a745' }}>
          ➕ Add Category
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h3>📦 Product List by Category</h3>

      {categories.map((category) => {
        const categoryProducts = products.filter((p) => p.category === category);
        return (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <h4 style={{ backgroundColor: '#f1f1f1', padding: '0.5rem', borderRadius: '4px' }}>{category}</h4>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>✔</th>
                  <th style={thStyle}>Product Name</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryProducts.map((product) => (
                  <tr key={product._id}>
                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id || '')}
                        onChange={() => toggleSelectProduct(product._id || '')}
                      />
                    </td>
                    <td style={tdStyle}>{product.name}</td>
                    <td style={tdStyle}>₹{product.price}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(product)} style={editBtn}>
                        📝 Edit
                      </button>{' '}
                      <button onClick={() => deleteProduct(product._id!)} style={deleteBtn}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <button onClick={selectAllProducts} style={{ ...buttonStyle, backgroundColor: '#17a2b8', marginTop: '20px' }}>
        Select All Products
      </button>

      {selectedProducts.length > 0 && (
        <button onClick={addToBill} style={{ ...buttonStyle, backgroundColor: '#ffc107', marginTop: '20px' }}>
          🧾 Add to Bill
        </button>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginTop: '0.5rem',
};

const thStyle = {
  padding: '10px',
  backgroundColor: '#e9ecef',
  border: '1px solid #ddd',
  textAlign: 'left' as const,
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ddd',
};

const editBtn = {
  backgroundColor: '#ffc107',
  color: '#000',
  padding: '5px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '0.5rem',
};

const deleteBtn = {
  backgroundColor: '#dc3545',
  color: '#fff',
  padding: '5px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default AddProduct;
