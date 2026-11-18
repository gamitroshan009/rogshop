
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  const shopkeeperEmail =
    localStorage.getItem('shopkeeperEmail') || 'Shopkeeper';

  const firstLetter = shopkeeperEmail.charAt(0).toUpperCase();

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

    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
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

  const handleMenuClick = (option: string) => {
    setShowUserMenu(false);

    if (option === 'profile') navigate('/shopkeeper-profile');
    else if (option === 'products') navigate('/shopkeeper-dashboard');
    else if (option === 'orders') navigate('/shopkeeper-orders');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const styles: { [key: string]: CSSProperties } = {
    page: {
      minHeight: '100vh',
      background: '#f4f7fb',
      paddingBottom: '40px',
    },
    header: {
      background: '#fff',
      padding: '15px 25px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      gap: '15px',
    },
    heading: {
      fontSize: '23px',
      fontWeight: 800,
      color: '#075fc9',
      margin: 0,
    },
    profileCircle: {
      width: '45px',
      height: '45px',
      minWidth: '45px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #007bff, #00c6ff)',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 3px 10px rgba(0,123,255,0.3)',
      border: '2px solid white',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.45)',
      zIndex: 99,
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
    },
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '280px',
      maxWidth: '80vw',
      height: '100vh',
      backgroundColor: '#fff',
      zIndex: 100,
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      transition: 'transform 0.35s ease',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
    },
    sidebarHeader: {
      padding: '35px 20px 25px',
      background: 'linear-gradient(135deg, #007bff, #00c6ff)',
      color: '#fff',
      textAlign: 'center',
    },
    avatarLarge: {
      width: '75px',
      height: '75px',
      borderRadius: '50%',
      backgroundColor: '#fff',
      color: '#007bff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '0 auto',
      border: '3px solid rgba(255,255,255,0.7)',
    },
    emailText: {
      fontSize: '13px',
      opacity: 0.9,
      wordBreak: 'break-all',
    },
    menuList: {
      padding: '15px 0',
    },
    menuItem: {
      padding: '16px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      fontSize: '15px',
      fontWeight: 600,
      color: '#333',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    menuDivider: {
      height: '1px',
      backgroundColor: '#eee',
      margin: '10px 20px',
    },
    sidebarFooter: {
      marginTop: 'auto',
      padding: '20px',
      textAlign: 'center',
      color: '#999',
      fontSize: '13px',
      fontWeight: 'bold',
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

  return (
    <div style={styles.page}>

      {/* SIDEBAR OVERLAY */}
      <div
        onClick={() => setShowUserMenu(false)}
        style={{
          ...styles.overlay,
          opacity: showUserMenu ? 1 : 0,
          visibility: showUserMenu ? 'visible' : 'hidden',
        }}
      />

      {/* LEFT SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          transform: showUserMenu
            ? 'translateX(0)'
            : 'translateX(-100%)',
        }}
      >
        <div style={styles.sidebarHeader}>
          <div style={styles.avatarLarge}>
            {firstLetter}
          </div>

          <h3 style={{ margin: '10px 0 5px' }}>My Account</h3>
          <p style={styles.emailText}>{shopkeeperEmail}</p>
        </div>

        <div style={styles.menuList}>

          <div
            style={styles.menuItem}
            onClick={() => handleMenuClick('profile')}
          >
            <span>👤</span> My Profile
          </div>

          <div
            style={styles.menuItem}
            onClick={() => handleMenuClick('products')}
          >
            <span>📦</span> My Products
          </div>

          <div
            style={styles.menuItem}
            onClick={() => handleMenuClick('orders')}
          >
            <span>🛒</span> My Orders
          </div>

          <div style={styles.menuDivider} />

          <div
            style={{ ...styles.menuItem, color: '#e53935' }}
            onClick={handleLogout}
          >
            <span>🚪</span> Logout
          </div>

        </div>

        <div style={styles.sidebarFooter}>
          ROG SHOP
        </div>
      </div>

      {/* HEADER */}
      <header
        style={{
          ...styles.header,
          flexDirection: isMobile ? 'row' : 'row',
        }}
      >
        <h1 style={styles.heading}>ROG SHOP</h1>

        <div
          style={styles.profileCircle}
          onClick={() => setShowUserMenu(!showUserMenu)}
          title="Open Profile Menu"
        >
          {firstLetter}
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      {loading ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: '80vh' }}
        >
          <div className="spinner-border text-primary mb-3" />
          <h6 className="text-secondary">Loading products...</h6>
        </div>
      ) : error ? (
        <div className="container mt-5">
          <div className="alert alert-danger text-center">
            {error}
          </div>
        </div>
      ) : (
        <div style={styles.content}>

          {/* SUMMARY CARDS */}
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

          {/* PRODUCTS */}
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
      )}
    </div>
  );
};

export default ShopkeeperDashboard;
