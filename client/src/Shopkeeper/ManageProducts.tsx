import { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  price: number;
  quantity: number;
  isEditing?: boolean;
}

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const shopkeeperId = localStorage.getItem('shopkeeperId');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          params: { shopkeeperId },
        });
        setProducts(response.data.map((p: Product) => ({ ...p, isEditing: false })));
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopkeeperId]);

  const toggleEdit = (productName: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productName === productName ? { ...p, isEditing: !p.isEditing } : p
      )
    );
  };

  const handleChange = (productName: string, field: keyof Product, value: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productName === productName
          ? { ...p, [field]: field === 'price' || field === 'quantity' ? Number(value) : value }
          : p
      )
    );
  };

  const handleSave = async (product: Product) => {
    
    try {
      await axios.put('http://localhost:5000/api/products', {
        productName: product.productName,
        newProductName: product.productName,
        price: product.price,
        quantity: product.quantity,
      });
      toggleEdit(product.productName);
      alert(`✅ Product "${product.productName}" updated successfully.`);
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

  if (loading) return <p style={styles.loading}>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

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

      {/* Table layout for desktop */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.productName}>
                <td style={styles.td}>
                  {product.isEditing ? (
                    <input
                      value={product.productName}
                      onChange={(e) =>
                        handleChange(product.productName, 'productName', e.target.value)
                      }
                    />
                  ) : (
                    product.productName
                  )}
                </td>
                <td style={styles.td}>
                  {product.isEditing ? (
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) =>
                        handleChange(product.productName, 'price', e.target.value)
                      }
                    />
                  ) : (
                    product.price
                  )}
                </td>
                <td style={styles.td}>
                  {product.isEditing ? (
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) =>
                        handleChange(product.productName, 'quantity', e.target.value)
                      }
                    />
                  ) : (
                    product.quantity
                  )}
                </td>
                <td style={styles.td}>
                  {product.isEditing ? (
                    <button style={styles.saveButton} onClick={() => handleSave(product)}>
                      Save
                    </button>
                  ) : (
                    <button style={styles.editButton} onClick={() => toggleEdit(product.productName)}>
                      Edit
                    </button>
                  )}
                  <button style={styles.deleteButton} onClick={() => handleDelete(product.productName)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div style={styles.cardContainer}>
        {filteredProducts.map((product) => (
          <div key={product.productName} style={styles.card}>
            <p><strong>Product Name:</strong>{' '}
              {product.isEditing ? (
                <input
                  value={product.productName}
                  onChange={(e) =>
                    handleChange(product.productName, 'productName', e.target.value)
                  }
                />
              ) : (
                product.productName
              )}
            </p>
            <p><strong>Price:</strong>{' '}
              {product.isEditing ? (
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    handleChange(product.productName, 'price', e.target.value)
                  }
                />
              ) : (
                product.price
              )}
            </p>
            <p><strong>Quantity:</strong>{' '}
              {product.isEditing ? (
                <input
                  type="number"
                  value={product.quantity}
                  onChange={(e) =>
                    handleChange(product.productName, 'quantity', e.target.value)
                  }
                />
              ) : (
                product.quantity
              )}
            </p>
            <div style={styles.cardActions}>
              {product.isEditing ? (
                <button style={styles.saveButton} onClick={() => handleSave(product)}>Save</button>
              ) : (
                <button style={styles.editButton} onClick={() => toggleEdit(product.productName)}>Edit</button>
              )}
              <button style={styles.deleteButton} onClick={() => handleDelete(product.productName)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '2rem',
    color: '#007bff',
    marginBottom: '1.5rem',
  },
  searchWrapper: {
    marginBottom: '1.5rem',
  },
  searchInput: {
    padding: '0.6rem 1rem',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#555',
    padding: '2rem',
  },
  tableContainer: {
    display: window.innerWidth > 768 ? 'block' : 'none',
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
  cardContainer: {
    display: window.innerWidth <= 768 ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardActions: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default ManageProducts;
