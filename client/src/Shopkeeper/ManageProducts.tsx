
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  price: number;
  profit: number;
  quantity: number;
  category: string;
  newProductName?: string;
  newCategory?: string;
}

const API_URL = 'https://rogshop02.onrender.com';

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [translatedTerms, setTranslatedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const shopkeeperId = localStorage.getItem('shopkeeperId');
  const shopName = localStorage.getItem('shopkeeperName');

  // Responsive screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`, {
          params: { shopkeeperId, shopName },
        });

        setProducts(
          response.data.map((p: Product) => ({
            ...p,
            profit: p.profit ?? 0,
            newProductName: p.productName,
            newCategory: p.category,
          }))
        );
      } catch (err) {
        console.error(err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/products-categories`,
          {
            params: { shopkeeperId, shopName },
          }
        );

        setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [shopkeeperId, shopName]);

  // Gujarati / Roman Gujarati Smart Search
  useEffect(() => {
    const query = searchTerm.trim();

    if (!query) {
      setTranslatedTerms([]);
      setSearchLoading(false);
      return;
    }

    let isActive = true;

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const response = await axios.get(
          `${API_URL}/api/smart-search/translate`,
          {
            params: { q: query },
          }
        );

        if (isActive) {
          const terms: string[] = ((response.data.terms as string[]) || [])
            .map((term: string) =>
              term.normalize('NFC').trim().toLowerCase()
            )
            .filter(Boolean);

          setTranslatedTerms(Array.from(new Set<string>(terms)));
        }
      } catch (err) {
        console.error('Smart search error:', err);

        if (isActive) {
          setTranslatedTerms([query.toLowerCase()]);
        }
      } finally {
        if (isActive) {
          setSearchLoading(false);
        }
      }
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Edit modal
  const openEditModal = (product: Product) => {
    setSelectedProduct({ ...product });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalChange = (
    field: keyof Product,
    value: string | number
  ) => {
    if (!selectedProduct) return;

    setSelectedProduct((prev) =>
      prev ? { ...prev, [field]: value } : null
    );
  };

  // Save product
  const handleSave = async () => {
    if (!selectedProduct) return;

    try {
      await axios.put(`${API_URL}/api/products`, {
        productName: selectedProduct.productName,
        newProductName: selectedProduct.newProductName,
        price: selectedProduct.price,
        profit: selectedProduct.profit,
        quantity: selectedProduct.quantity,
        category: selectedProduct.newCategory,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.productName === selectedProduct.productName
            ? {
                ...p,
                productName:
                  selectedProduct.newProductName || p.productName,
                price: selectedProduct.price,
                profit: selectedProduct.profit,
                quantity: selectedProduct.quantity,
                category:
                  selectedProduct.newCategory || p.category,
                newProductName: selectedProduct.newProductName,
                newCategory: selectedProduct.newCategory,
              }
            : p
        )
      );

      alert(
        `Product "${selectedProduct.productName}" updated successfully.`
      );

      closeModal();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to update product.');
    }
  };

  // Delete product
  const handleDelete = async (productName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/products`, {
        data: { productName },
      });

      setProducts((prev) =>
        prev.filter((p) => p.productName !== productName)
      );

      alert(`Product "${productName}" deleted successfully.`);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  // Smart product filtering
  const filteredProducts = products.filter((product) => {
    const productText = (
      `${product.productName} ${product.category}`
    )
      .normalize('NFC')
      .toLowerCase();

    const terms = [
      searchTerm,
      ...translatedTerms,
    ]
      .map((term) =>
        term.normalize('NFC').trim().toLowerCase()
      )
      .filter(Boolean);

    return terms.some((term) => productText.includes(term));
  });

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
      maxHeight: '90vh',
      overflowY: 'auto',
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

      {/* Search */}
      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search Gujarati / English products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        {searchLoading && (
          <p style={{ color: '#777', marginTop: '8px' }}>
            Converting search...
          </p>
        )}
      </div>

      {loading && (
        <p style={styles.loading}>Loading products...</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <p style={styles.loading}>No products found.</p>
          ) : isMobile ? (
            filteredProducts.map((product, index) => (
              <div
                key={`${product.productName}-${index}`}
                style={styles.productCard}
              >
                <p>
                  <strong>Name:</strong> {product.productName}
                </p>
                <p>
                  <strong>Price:</strong> ₹{product.price}
                </p>
                <p>
                  <strong>Profit:</strong> ₹{product.profit}
                </p>
                <p>
                  <strong>Quantity:</strong> {product.quantity}
                </p>
                <p>
                  <strong>Category:</strong> {product.category}
                </p>

                <div>
                  <button
                    style={styles.editButton}
                    onClick={() => openEditModal(product)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(product.productName)}
                  >
                    Delete
                  </button>
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
                    <th style={styles.th}>Profit</th>
                    <th style={styles.th}>Quantity</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={`${product.productName}-${index}`}>
                      <td style={styles.td}>
                        {product.productName}
                      </td>
                      <td style={styles.td}>₹{product.price}</td>
                      <td style={styles.td}>₹{product.profit}</td>
                      <td style={styles.td}>{product.quantity}</td>
                      <td style={styles.td}>{product.category}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.editButton}
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>

                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete(product.productName)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Product</h3>

            <label>
              Product Name:
              <input
                type="text"
                value={selectedProduct.productName}
                disabled
                style={styles.modalInput}
              />
            </label>

            <label>
              New Product Name:
              <input
                type="text"
                value={selectedProduct.newProductName || ''}
                onChange={(e) =>
                  handleModalChange('newProductName', e.target.value)
                }
                style={styles.modalInput}
              />
            </label>

            <label>
              Price:
              <input
                type="number"
                value={selectedProduct.price}
                onChange={(e) =>
                  handleModalChange('price', Number(e.target.value))
                }
                style={styles.modalInput}
              />
            </label>

            <label>
              Profit:
              <input
                type="number"
                value={selectedProduct.profit}
                onChange={(e) =>
                  handleModalChange('profit', Number(e.target.value))
                }
                min="0"
                step="0.01"
                style={styles.modalInput}
              />
            </label>

            <label>
              Quantity:
              <input
                type="number"
                value={selectedProduct.quantity}
                onChange={(e) =>
                  handleModalChange('quantity', Number(e.target.value))
                }
                style={styles.modalInput}
              />
            </label>

            <label>
              Category:
              <select
                value={selectedProduct.newCategory || ''}
                onChange={(e) =>
                  handleModalChange('newCategory', e.target.value)
                }
                style={styles.modalInput}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button
                style={styles.saveButton}
                onClick={handleSave}
              >
                Save
              </button>

              <button
                style={styles.cancelButton}
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
