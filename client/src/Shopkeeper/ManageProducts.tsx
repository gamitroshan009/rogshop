import { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  price: number;
  quantity: number;
  category: string;
  newProductName?: string;
  newCategory?: string;
}

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const shopkeeperId = localStorage.getItem('shopkeeperId');
  const shopName = localStorage.getItem('shopkeeperName'); // Add this line

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          params: { shopkeeperId, shopName }, // Send both
        });
        setProducts(
          response.data.map((p: Product) => ({
            ...p,
            newProductName: p.productName,
            newCategory: p.category,
          }))
        );
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products-categories', {
          params: { shopkeeperId },
        });
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
    return () => window.removeEventListener('resize', handleResize);
  }, [shopkeeperId, shopName]); // <-- Added shopName here

  const openEditModal = (product: Product) => {
    setSelectedProduct({ ...product });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalChange = (field: keyof Product, value: string | number) => {
    if (!selectedProduct) return;
    setSelectedProduct((prev) =>
      prev ? { ...prev, [field]: value } : null
    );
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    try {
      await axios.put('http://localhost:5000/api/products', {
        productName: selectedProduct.productName,
        newProductName: selectedProduct.newProductName,
        price: selectedProduct.price,
        quantity: selectedProduct.quantity,
        category: selectedProduct.newCategory,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.productName === selectedProduct.productName
            ? {
                ...p,
                productName: selectedProduct.newProductName || p.productName,
                price: selectedProduct.price,
                quantity: selectedProduct.quantity,
                category: selectedProduct.newCategory || p.category,
                newProductName: selectedProduct.newProductName,
                newCategory: selectedProduct.newCategory,
              }
            : p
        )
      );

      alert(`✅ Product "${selectedProduct.productName}" updated successfully.`);
      closeModal();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('❌ Failed to update product.');
    }
  };

  const handleDelete = async (productName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${productName}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete('http://localhost:5000/api/products', {
        data: { productName },
      });
      setProducts(products.filter((p) => p.productName !== productName));
      alert(`🗑️ Product "${productName}" deleted successfully.`);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('❌ Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '10px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      fontSize: '2rem',
      color: '#007bff',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    searchWrapper: {
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    searchInput: {
      padding: '0.6rem 1rem',
      width: '100%',
      maxWidth: '500px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '1rem',
    },
    loading: {
      textAlign: 'center',
      fontSize: '1.2rem',
      color: '#555',
      padding: '2rem',
    },
    productCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      border: '1px solid #ddd',
      padding: '0.75rem',
      backgroundColor: '#007bff',
      color: '#fff',
      textAlign: 'left',
    },
    td: {
      border: '1px solid #ddd',
      padding: '0.75rem',
      textAlign: 'left',
    },
    editButton: {
      backgroundColor: '#ffc107',
      color: '#000',
      border: 'none',
      padding: '0.5rem 0.75rem',
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '0.5rem',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      padding: '0.5rem 0.75rem',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
    },
    modal: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '500px',
      textAlign: 'left',
    },
    modalInput: {
      width: '100%',
      padding: '0.5rem',
      marginTop: '0.5rem',
      marginBottom: '1rem',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '0.5rem',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: '#fff',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Manage Products</h2>

      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {loading && <p style={styles.loading}>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {isMobile ? (
            filteredProducts.map((product) => (
              <div key={product.productName} style={styles.productCard}>
                <p><strong>Name:</strong> {product.productName}</p>
                <p><strong>Price:</strong> ₹{product.price}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <div>
                  <button style={styles.editButton} onClick={() => openEditModal(product)}>Edit</button>
                  <button style={styles.deleteButton} onClick={() => handleDelete(product.productName)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product Name</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Quantity</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.productName}>
                      <td style={styles.td}>{product.productName}</td>
                      <td style={styles.td}>₹{product.price}</td>
                      <td style={styles.td}>{product.quantity}</td>
                      <td style={styles.td}>{product.category}</td>
                      <td style={styles.td}>
                        <button style={styles.editButton} onClick={() => openEditModal(product)}>Edit</button>
                        <button style={styles.deleteButton} onClick={() => handleDelete(product.productName)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {isModalOpen && selectedProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Product</h3>
            <label>
              Product Name:
              <input type="text" value={selectedProduct.productName} disabled style={styles.modalInput} />
            </label>
            <label>
              New Product Name:
              <input
                type="text"
                value={selectedProduct.newProductName}
                onChange={(e) => handleModalChange('newProductName', e.target.value)}
                style={styles.modalInput}
              />
            </label>
            <label>
              Price:
              <input
                type="number"
                value={selectedProduct.price}
                onChange={(e) => handleModalChange('price', parseFloat(e.target.value))}
                style={styles.modalInput}
              />
            </label>
            <label>
              Quantity:
              <input
                type="number"
                value={selectedProduct.quantity}
                onChange={(e) => handleModalChange('quantity', parseInt(e.target.value))}
                style={styles.modalInput}
              />
            </label>
            <label>
              Category:
              <select
                value={selectedProduct.newCategory}
                onChange={(e) => handleModalChange('newCategory', e.target.value)}
                style={styles.modalInput}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button style={styles.saveButton} onClick={handleSave}>Save</button>
              <button style={styles.cancelButton} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
