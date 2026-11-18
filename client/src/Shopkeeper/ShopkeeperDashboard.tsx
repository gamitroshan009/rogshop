
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { CSSProperties } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Product {
  _id: string;
  productName: string;
  productImage: string;
  price: number;
  profit: number;
  quantity: number;
}

const ShopkeeperDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const shopkeeperId = localStorage.getItem('shopkeeperId');
  const shopName = localStorage.getItem('shopkeeperName') || 'My Shop';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get<Product[]>(
          'http://localhost:5000/api/products',
          {
            params: {
              shopkeeperId,
              shopName,
            },
          }
        );

        setProducts(response.data);
      } catch {
        setError('Failed to fetch products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopkeeperId, shopName]);

  const totalProfit = products.reduce(
    (sum, product) =>
      sum + Number(product.profit || 0) * Number(product.quantity || 0),
    0
  );

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );

  const styles: { [key: string]: CSSProperties } = {
    page: {
      minHeight: '100vh',
      background: '#f4f7fb',
      paddingBottom: '40px',
    },
    content: {
      maxWidth: '1200px',
      margin: 'auto',
      padding: '25px 20px',
    },
    summaryCard: {
      background: '#fff',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: '0 3px 15px rgba(0,0,0,0.05)',
      border: '1px solid #edf0f5',
      height: '100%',
    },
    summaryLabel: {
      color: '#78869a',
      fontSize: '14px',
      marginBottom: '8px',
      fontWeight: 500,
    },
    summaryValue: {
      fontSize: '27px',
      fontWeight: 700,
      color: '#075fc9',
      margin: 0,
    },
    sectionTitle: {
      fontSize: '21px',
      fontWeight: 700,
      color: '#26364a',
    },
    productCard: {
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #edf0f5',
      overflow: 'hidden',
      boxShadow: '0 3px 12px rgba(0,0,0,0.05)',
      height: '100%',
    },
    productImage: {
      width: '100%',
      height: '180px',
      objectFit: 'contain',
      padding: '15px',
      background: '#f8faff',
    },
    productBody: {
      padding: '18px',
    },
    productName: {
      fontSize: '17px',
      fontWeight: 700,
      color: '#26364a',
      marginBottom: '15px',
    },
    detail: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
      fontSize: '14px',
      color: '#68778a',
    },
    empty: {
      background: '#fff',
      borderRadius: '16px',
      padding: '45px 20px',
      textAlign: 'center',
      color: '#78869a',
      border: '1px solid #edf0f5',
    },
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '80vh' }}
      >
        <div className="spinner-border text-primary mb-3" />
        <h6 className="text-secondary">Loading products...</h6>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Total Products</p>
              <h3 style={styles.summaryValue}>
                {products.length}
              </h3>
            </div>
          </div>

          <div className="col-md-4">
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Total Stock</p>
              <h3 style={styles.summaryValue}>
                {totalStock}
              </h3>
            </div>
          </div>

          <div className="col-md-4">
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Total Profit</p>
              <h3 style={{ ...styles.summaryValue, color: '#15945a' }}>
                ₹{totalProfit.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 style={styles.sectionTitle}>My Products</h4>

          <span className="badge rounded-pill bg-primary px-3 py-2">
            {products.length} Products
          </span>
        </div>

        {products.length === 0 ? (
          <div style={styles.empty}>
            <h5 className="fw-bold">No Products Found</h5>
            <p className="mb-0">
              Your shop products will appear here.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div
                className="col-12 col-sm-6 col-lg-4 col-xl-3"
                key={product._id}
              >
                <div style={styles.productCard}>
                  {product.productImage ? (
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      style={styles.productImage}
                    />
                  ) : (
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{
                        ...styles.productImage,
                        color: '#9aa8ba',
                        fontSize: '45px',
                      }}
                    >
                      <i className="bi bi-image" />
                    </div>
                  )}

                  <div style={styles.productBody}>
                    <h5 style={styles.productName}>
                      {product.productName}
                    </h5>

                    <div style={styles.detail}>
                      <span>Price</span>
                      <strong className="text-primary">
                        ₹{Number(product.price).toFixed(2)}
                      </strong>
                    </div>

                    <div style={styles.detail}>
                      <span>Quantity</span>
                      <strong className="text-dark">
                        {product.quantity}
                      </strong>
                    </div>

                    <div style={styles.detail}>
                      <span>Profit / Unit</span>
                      <strong className="text-success">
                        ₹{Number(product.profit || 0).toFixed(2)}
                      </strong>
                    </div>

                    <hr />

                    <div style={styles.detail}>
                      <strong className="text-dark">
                        Total Profit
                      </strong>
                      <strong className="text-success">
                        ₹{(
                          Number(product.profit || 0) *
                          Number(product.quantity || 0)
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopkeeperDashboard;
