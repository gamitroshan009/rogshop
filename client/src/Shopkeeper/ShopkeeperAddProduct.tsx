import { useState, useEffect } from 'react';
import axios from 'axios';

const ShopkeeperAddProduct = () => {
  const [formData, setFormData] = useState({
    productImage: null as File | null,
    productName: '',
    price: '',
    quantity: '',
    category: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState('');
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [message, setMessage] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [fadeIn, setFadeIn] = useState(false); // State for fade-in animation

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
    setFadeIn(true); // Trigger fade-in animation when component mounts
  }, [shopkeeperId, shopName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, productImage: e.target.files[0] });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    if (selectedCategory === 'Other') {
      setIsOtherCategory(true);
      setFormData({ ...formData, category: '' });
    } else {
      setIsOtherCategory(false);
      setFormData({ ...formData, category: selectedCategory });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('shopkeeperId', shopkeeperId || '');
    formDataToSend.append('shopName', shopName);
    formDataToSend.append('productImage', formData.productImage as Blob);
    formDataToSend.append('productName', formData.productName);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('category', formData.category);

    try {
      const response = await axios.post('http://localhost:5000/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      setFormData({ productImage: null, productName: '', price: '', quantity: '', category: '' });
      setIsOtherCategory(false);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

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
      await axios.delete('http://localhost:5000/api/delete-category', { data: payload });
      setCategories(categories.filter((category) => category !== selectedCategoryToDelete));
      setCategoryMessage('Category deleted successfully');
      setSelectedCategoryToDelete('');
    } catch (error: any) {
      setCategoryMessage(error.response?.data?.message || 'An error occurred while deleting category');
    }
  };

  return (
    <div className={`container ${fadeIn ? 'fade-in' : ''}`}>
      <h2 className="heading">Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" name="productImage" accept="image/*" onChange={handleFileChange} required className="input" />
        <input type="text" name="productName" placeholder="Product Name" value={formData.productName} onChange={handleInputChange} required className="input" />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} required className="input" />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleInputChange} required className="input" />

        <select name="category" value={formData.category} onChange={handleCategoryChange} required className="input">
          <option value="">Select Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
          <option value="Other">Other</option>
        </select>

        {isOtherCategory && (
          <input type="text" name="category" placeholder="Enter New Category" value={formData.category} onChange={handleInputChange} required className="input" />
        )}

        <button type="submit" className="button">Add Product</button>
      </form>

      <h3 className="sub-heading">Add New Category</h3>
      <input type="text" placeholder="New Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input" />
      <button type="button" onClick={handleAddCategory} className="add-category-button">Add Category</button>

      <h3 className="sub-heading">Delete Category</h3>
      <select value={selectedCategoryToDelete} onChange={(e) => setSelectedCategoryToDelete(e.target.value)} className="input">
        <option value="">Select Category to Delete</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>{category}</option>
        ))}
      </select>
      <button type="button" onClick={handleDeleteCategory} className="delete-category-button">Delete Category</button>

      {message && <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
      {categoryMessage && <p className={`message ${categoryMessage.includes('success') ? 'success' : 'error'}`}>{categoryMessage}</p>}
      
      <style>{`
        .container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          opacity: 0;
          animation: fadeIn 0.5s forwards;
        }

        .fade-in {
          animation: fadeIn 0.5s forwards;
        }

        .heading {
          text-align: center;
          margin-bottom: 1rem;
        }
        .sub-heading {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          font-weight: bold;
        }
        .input {
          width: 100%;
          padding: 0.6rem;
          margin-bottom: 1rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .button,
        .add-category-button,
        .delete-category-button {
          width: 100%;
          padding: 0.75rem;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 0.5rem;
        }
        .button {
          background-color: #007bff;
        }
        .add-category-button {
          background-color: #28a745;
        }
        .delete-category-button {
          background-color: #dc3545;
        }
        .message {
          text-align: center;
          margin-top: 1rem;
        }
        .success {
          color: green;
        }
        .error {
          color: red;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ShopkeeperAddProduct;
