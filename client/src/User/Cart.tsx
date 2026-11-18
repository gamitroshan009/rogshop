
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Product {
  productName: string;
  shopkeeperId: string;
  quantity: number;
  price: number;
  profit: number;
}

interface CartItem {
  _id: string;
  product: string;
  shopName: string;
  shopId: string;
  quantity: number;
  totalBill: number;
  category?: string;
}

interface MergedCartItem extends CartItem {
  stock: number;
  profit: number;
}

const API = 'https://rogshop02.onrender.com/api';

const Cart: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [loading, setLoading] = useState(true);
  const [orderMessage, setOrderMessage] = useState('');

  const [progress, setProgress] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  const [orderDetails, setOrderDetails] = useState({
    email: '',
    mobileNo: '',
    address: '',
  });

  const userEmail = localStorage.getItem('userEmail') || 'User Email';
  const firstLetter = userEmail.charAt(0).toUpperCase();

  // FETCH CART
  const fetchCartItems = async () => {
    try {
      const response = await axios.get<CartItem[]>(`${API}/cart`, {
        params: {
          userEmail,
        },
      });

      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // INITIAL DATA
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchCartItems(),
        fetchProducts(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [userEmail]);

  // DEFAULT EMAIL
  useEffect(() => {
    if (userEmail !== 'User Email') {
      setOrderDetails((prev) => ({
        ...prev,
        email: userEmail,
      }));
    }
  }, [userEmail]);

  // SIDEBAR
  const handleMenuClick = (option: string) => {
    setShowUserMenu(false);

    if (option === 'profile') navigate('/profile');
    else if (option === 'cart') navigate('/cart');
    else if (option === 'orders') navigate('/orders');
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // MERGE CART WITH PRODUCTS
  const mergedCartItems: MergedCartItem[] = cartItems.map((item) => {
    const product = products.find(
      (p) =>
        p.productName === item.product &&
        p.shopkeeperId === item.shopId
    );

    return {
      ...item,
      stock: product?.quantity ?? 0,
      profit: product?.profit ?? 0,
    };
  });

  // TOTALS
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.totalBill,
    0
  );

  // UPDATE QUANTITY
  const handleUpdateQuantity = async (
    itemId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const item = mergedCartItems.find(
      (item) => item._id === itemId
    );

    if (!item) return;

    if (newQuantity > item.stock) {
      alert(`Only ${item.stock} items available in stock`);
      return;
    }

    try {
      setUpdatingItem(itemId);

      const response = await axios.put(
        `${API}/cart/${itemId}`,
        { quantity: newQuantity }
      );

      const updatedCartItem = response.data.cartItem;

      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? updatedCartItem : item
        )
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        'Unable to update quantity'
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  // REMOVE ITEM
  const handleRemoveItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to remove this product?')) {
      return;
    }

    try {
      await axios.delete(`${API}/cart/${itemId}`);

      setCartItems((prev) =>
        prev.filter((item) => item._id !== itemId)
      );
    } catch (error) {
      console.error(error);
      alert('Unable to remove product');
    }
  };

  // PROGRESS
  const simulateProgress = (): Promise<void> => {
    return new Promise((resolve) => {
      setProgress(1);
      setIsPlacingOrder(true);

      let current = 1;

      const interval = setInterval(() => {
        current += 1;
        setProgress(current);

        if (current >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });
  };

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      alert('Your cart is empty');
      return;
    }

    if (
      !orderDetails.email ||
      !orderDetails.mobileNo ||
      !orderDetails.address
    ) {
      alert('Please fill in all order details');
      return;
    }

    if (!/^\d{10}$/.test(orderDetails.mobileNo)) {
      alert('Please enter a valid 10 digit mobile number');
      return;
    }

    const shopId = cartItems[0].shopId;

    const sameShop = cartItems.every(
      (item) => item.shopId === shopId
    );

    if (!sameShop) {
      alert('Please place orders for different shops separately.');
      return;
    }

    if (!window.confirm('Are you sure you want to place this order?')) {
      return;
    }

    const orderProducts = cartItems.map((item) => ({
      productName: item.product,
      quantity: item.quantity,
      price: Number(
        (item.totalBill / item.quantity).toFixed(2)
      ),
    }));

    const orderData = {
      shopId: cartItems[0].shopId,
      shopName: cartItems[0].shopName,
      email: orderDetails.email,
      mobileNo: orderDetails.mobileNo,
      address: orderDetails.address,
      products: orderProducts,
    };

    try {
      await simulateProgress();

      await axios.post(`${API}/orders`, orderData);

      alert('Order placed successfully!');

      setCartItems([]);
      setShowOrderForm(false);

      setOrderMessage('Order placed successfully!');

      setTimeout(() => {
        setOrderMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Order error:', error);

      alert(
        error.response?.data?.message ||
        'Error placing order'
      );
    } finally {
      setIsPlacingOrder(false);
      setProgress(0);
    }
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '300px' }}>
        <p>Loading your cart...</p>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid position-relative p-0">

      {/* SIDEBAR OVERLAY */}
      <div
        onClick={() => setShowUserMenu(false)}
        style={{
          ...styles.overlay,
          opacity: showUserMenu ? 1 : 0,
          visibility: showUserMenu ? 'visible' : 'hidden',
        }}
      />

      {/* SIDEBAR */}
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

          <h4 style={{ margin: '12px 0 5px' }}>
            My Account
          </h4>

          <p style={styles.emailText}>
            {userEmail}
          </p>
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
            onClick={() => handleMenuClick('cart')}
          >
            <span>🛒</span> My Cart
          </div>

          <div
            style={styles.menuItem}
            onClick={() => handleMenuClick('orders')}
          >
            <span>📦</span> My Orders
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

      {/* ORDER PROGRESS OVERLAY */}
      {isPlacingOrder && (
        <div style={styles.progressOverlay}>
          <div style={styles.progressBox}>
            <h5 className="mb-3">
              Placing your order...
            </h5>

            <div className="progress" style={{ height: '20px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="text-white p-3" style={styles.header}>
        <div className="d-flex justify-content-between align-items-center">

          <button
            className="btn btn-light"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h1 className="fs-4 fw-bold mb-0">
            My Cart
          </h1>

          <div
            style={styles.profileCircle}
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Open Profile Menu"
          >
            {firstLetter}
          </div>

        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="container py-4">

        <h2 className="fw-bold mb-4">
          🛒 My Cart
        </h2>

        {orderMessage && (
          <div className="alert alert-success">
            {orderMessage}
          </div>
        )}

        {mergedCartItems.length > 0 ? (
          <>
            {/* SHOP NAME */}
            <div style={styles.shopHeader}>
              🏪 {mergedCartItems[0].shopName}
            </div>

            {/* PRODUCTS */}
            <div className="row mt-3">

              {mergedCartItems.map((item) => (
                <div
                  key={item._id}
                  className="col-12 col-md-6 col-lg-4 mb-4"
                  style={{ display: 'flex' }}
                >
                  <div className="card p-3 shadow-sm w-100"
                    style={styles.productCard}>

                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold mb-0">
                        {item.product}
                      </h5>

                      <span className="badge bg-primary">
                        {item.category || 'No Category'}
                      </span>
                    </div>

                    <p className="mb-2">
                      <strong>Price:</strong>{' '}
                      ₹{(item.totalBill / item.quantity).toFixed(2)}
                    </p>

                    <p className="mb-2">
                      <strong>Profit:</strong>{' '}
                      ₹{Number(item.profit).toFixed(2)}
                    </p>

                    <p className="mb-2">
                      <strong>Available Stock:</strong>{' '}
                      {item.stock}
                    </p>

                    <div className="d-flex align-items-center mb-3">
                      <strong className="me-3">
                        Quantity:
                      </strong>

                      <select
                        className="form-select"
                        style={{ width: '100px' }}
                        value={item.quantity}
                        disabled={
                          updatingItem === item._id ||
                          item.stock < 1
                        }
                        onChange={(e) =>
                          handleUpdateQuantity(
                            item._id,
                            Number(e.target.value)
                          )
                        }
                      >
                        {Array.from(
                          { length: item.stock },
                          (_, index) => index + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>

                      {updatingItem === item._id && (
                        <span className="ms-2 small text-primary">
                          Updating...
                        </span>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div>
                        <small className="text-muted">
                          Total Price
                        </small>

                        <h5 className="fw-bold text-success mb-0">
                          ₹{item.totalBill.toFixed(2)}
                        </h5>
                      </div>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        🗑 Remove
                      </button>
                    </div>

                  </div>
                </div>
              ))}

            </div>

            {/* CART SUMMARY */}
            <div className="card shadow-sm p-4 mt-2"
              style={styles.summaryCard}>

              <h4 className="fw-bold mb-3">
                Order Summary
              </h4>

              <div className="d-flex justify-content-between mb-2">
                <span>Total Quantity</span>
                <strong>{totalQuantity}</strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <h5>Total Amount</h5>

                <h5 className="fw-bold text-success">
                  ₹{totalAmount.toFixed(2)}
                </h5>
              </div>

              <button
                className="btn btn-success btn-lg w-100 mt-3"
                disabled={isPlacingOrder || !!updatingItem}
                onClick={() => setShowOrderForm(true)}
              >
                🛒 Place Order
              </button>

            </div>

          </>
        ) : (
          <div className="text-center py-5">
            <div style={{ fontSize: '65px' }}>
              🛒
            </div>

            <h4 className="mt-3">
              Your cart is empty
            </h4>

            <p className="text-muted">
              Add some products to your cart.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate(-1)}
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* ORDER FORM */}
        {showOrderForm && cartItems.length > 0 && (
          <div style={styles.formOverlay}>
            <div className="card shadow p-4"
              style={styles.formCard}>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">
                  Order Details
                </h4>

                <button
                  className="btn-close"
                  onClick={() => setShowOrderForm(false)}
                />
              </div>

              <label className="form-label fw-semibold">
                Email
              </label>

              <input
                type="email"
                className="form-control mb-3"
                placeholder="Enter email"
                value={orderDetails.email}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetails,
                    email: e.target.value,
                  })
                }
              />

              <label className="form-label fw-semibold">
                Mobile Number
              </label>

              <input
                type="tel"
                maxLength={10}
                className="form-control mb-3"
                placeholder="Enter mobile number"
                value={orderDetails.mobileNo}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetails,
                    mobileNo: e.target.value.replace(/\D/g, ''),
                  })
                }
              />

              <label className="form-label fw-semibold">
                Address
              </label>

              <textarea
                className="form-control mb-4"
                rows={3}
                placeholder="Enter delivery address"
                value={orderDetails.address}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetails,
                    address: e.target.value,
                  })
                }
              />

              <button
                className="btn btn-success btn-lg w-100"
                disabled={isPlacingOrder || !!updatingItem}
                onClick={handlePlaceOrder}
              >
                Submit Order
              </button>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// STYLES
const styles: { [key: string]: React.CSSProperties } = {

  header: {
    background: 'linear-gradient(135deg, #007bff, #0056b3)',
    borderRadius: '0 0 12px 12px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
  },

  profileCircle: {
    width: '45px',
    height: '45px',
    minWidth: '45px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ffffff, #dceeff)',
    color: '#007bff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid white',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 999,
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
    zIndex: 1000,
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

  productCard: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    minHeight: '230px',
    transition: '0.3s',
  },

  shopHeader: {
    background: 'linear-gradient(135deg, #007bff, #0056b3)',
    color: '#fff',
    padding: '15px 20px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
  },

  summaryCard: {
    borderRadius: '12px',
    maxWidth: '600px',
    marginLeft: 'auto',
  },

  progressOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressBox: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    minWidth: '300px',
    maxWidth: '90vw',
    textAlign: 'center',
  },

  formOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px',
    overflowY: 'auto',
  },

  formCard: {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '12px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
};

export default Cart;
