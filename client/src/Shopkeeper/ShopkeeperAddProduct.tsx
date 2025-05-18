import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopkeeperAddProduct = () => {
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    quantity: '',
    category: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState('');
  const navigate = useNavigate();

  const shopName = localStorage.getItem('shopkeeperName') || 'Unknown Shop';
  const shopkeeperId = localStorage.getItem('shopkeeperId');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products-categories?shopkeeperId=${shopkeeperId}&shopName=${shopName}`
        );
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [shopkeeperId, shopName]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          params: { shopkeeperId, shopName },
        });
        setProducts(response.data || []);
      } catch (error) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, [shopkeeperId, shopName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, category: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send product data to the backend
      const response = await axios.post('http://localhost:5000/api/products', {
        shopkeeperId,
        shopName,
        productName: formData.productName,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category,
      });

      // Update the product list with the newly added product
      setProducts([...products, response.data.product]);
      setMessage('Product added successfully');
      setFormData({ productName: '', price: '', quantity: '', category: '' });
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryMessage('Category cannot be empty');
      return;
    }
    try {
      const payload = {
        shopkeeperId,
        shopName,
        categories: [newCategory.trim()],
      };
      const response = await axios.post('http://localhost:5000/api/products-categories', payload);
      setCategories(response.data.shopCategories.categories);
      setCategoryMessage('Category added successfully');
      setNewCategory('');
    } catch (error: any) {
      setCategoryMessage(error.response?.data?.message || 'An error occurred while adding category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!selectedCategoryToDelete) {
      setCategoryMessage('Please select a category to delete');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete the category "${selectedCategoryToDelete}"?`);
    if (!confirmDelete) return;

    try {
      const payload = {
        shopkeeperId,
        shopName,
        category: selectedCategoryToDelete,
      };

      const response = await axios.delete('http://localhost:5000/api/products-categories', { data: payload });

      // Update the categories list after deletion
      setCategories(response.data.categories);
      setCategoryMessage('Category deleted successfully');
      setSelectedCategoryToDelete('');
    } catch (error: any) {
      setCategoryMessage(error.response?.data?.message || 'An error occurred while deleting category');
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #ddd',
      borderRadius: 10,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Previous Page Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: '#f5f5f5',
          color: '#007bff',
          border: '1px solid #007bff',
          borderRadius: '6px',
          padding: '0.5rem 1.2rem',
          marginBottom: '1.5rem',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseOver={e => {
          (e.target as HTMLButtonElement).style.background = '#007bff';
          (e.target as HTMLButtonElement).style.color = '#fff';
        }}
        onMouseOut={e => {
          (e.target as HTMLButtonElement).style.background = '#f5f5f5';
          (e.target as HTMLButtonElement).style.color = '#007bff';
        }}
      >
        ← Previous Page
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          required
          style={inputStyle}
        >
          <option value="">Select Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
        <button type="submit" style={{
          width: '100%',
          padding: '0.75rem',
          color: '#fff',
          backgroundColor: '#007bff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          marginTop: '0.5rem'
        }}>Add Product</button>
      </form>
      {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Add New Category</h3>
      <input
        type="text"
        placeholder="New Category"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        style={inputStyle}
      />
      <button
        type="button"
        onClick={handleAddCategory}
        style={{
          width: '100%',
          padding: '0.75rem',
          color: '#fff',
          backgroundColor: '#28a745',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          marginTop: '0.5rem'
        }}
      >Add Category</button>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Delete Category</h3>
      <select
        value={selectedCategoryToDelete}
        onChange={(e) => setSelectedCategoryToDelete(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select Category to Delete</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>{category}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleDeleteCategory}
        style={{
          width: '100%',
          padding: '0.75rem',
          color: '#fff',
          backgroundColor: '#dc3545',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          marginTop: '0.5rem'
        }}
      >Delete Category</button>

      {categoryMessage && <p style={{ textAlign: 'center', marginTop: '1rem', color: categoryMessage.includes('success') ? 'green' : 'red' }}>{categoryMessage}</p>}

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Product List</h3>
      <ul>
        {products.map((p, idx) => (
          <li key={idx}>{p.productName} - ₹{p.price} - Qty: {p.quantity} - {p.category}</li>
        ))}
      </ul>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem',
  marginBottom: '1rem',
  borderRadius: 6,
  border: '1px solid #ccc',
};

export default ShopkeeperAddProduct;
