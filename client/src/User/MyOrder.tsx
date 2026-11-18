
import React, { useEffect, useState, Fragment, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import ReactDOMServer from 'react-dom/server';
import OrderPDF from '../components/OrderPDF';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Product {
  productName: string;
  quantity: number;
  price: number;
  profit: number;
  category: string;
}

interface Order {
  _id: string;
  shopName: string;
  products: Product[];
  address: string;
  createdAt: string;
}

const API = 'https://rogshop02.onrender.com/api';

const MyOrder: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('userEmail') || '';
  const firstLetter = userEmail.charAt(0).toUpperCase();

  // FETCH ORDERS
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>(
          `${API}/orders`,
          {
            params: { email: userEmail },
          }
        );

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  // SORT LATEST ORDER FIRST
  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  // SIDEBAR NAVIGATION
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

  // EXPAND / COLLAPSE
  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // GENERATE PDF
  const generatePDF = (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);

    if (!order) return;

    const elementHTML = ReactDOMServer.renderToString(
      <OrderPDF order={order} />
    );

    const container = document.createElement('div');
    container.innerHTML = elementHTML;

    document.body.appendChild(container);

    const opt = {
      margin: 0.5,
      filename: `Order_${orderId}.pdf`,
      html2canvas: {
        scale: 2,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
      },
    };

    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      })
      .catch((error: unknown) => {
        console.error('PDF generation error:', error);

        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      });
  };

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
            {firstLetter || 'U'}
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
            style={{
              ...styles.menuItem,
              color: '#e53935',
            }}
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
      <header className="text-white p-3" style={styles.header}>

        <div className="d-flex justify-content-between align-items-center">

          <button
            className="btn btn-light"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h1 className="fs-4 fw-bold mb-0">
            My Orders
          </h1>

          <div
            style={styles.profileCircle}
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Open Profile Menu"
          >
            {firstLetter || 'U'}
          </div>

        </div>

      </header>

      {/* PAGE CONTENT */}
      <main className="container py-4">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">

          <h2 className="fw-bold mb-0">
            📦 My Orders
          </h2>

          <span className="badge bg-primary fs-6">
            {orders.length} Orders
          </span>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: '300px' }}>

            <p className="mb-3">
              Loading your orders...
            </p>

            <div className="spinner-border text-primary" />

          </div>

        ) : sortedOrders.length > 0 ? (

          sortedOrders.map((order, orderIndex) => {

            // TOTAL AMOUNT
            const total = order.products.reduce(
              (sum, p) => sum + p.quantity * p.price,
              0
            );

            // TOTAL QUANTITY
            const totalQty = order.products.reduce(
              (sum, p) => sum + p.quantity,
              0
            );

            // TOTAL PROFIT
            const totalProfit = order.products.reduce(
              (sum, p) => sum + (p.profit || 0) * p.quantity,
              0
            );

            // GROUP PRODUCTS CATEGORY WISE
            const groupedProducts = order.products.reduce<
              Record<string, Product[]>
            >((groups, product) => {

              const category =
                product.category?.trim() || 'Other';

              if (!groups[category]) {
                groups[category] = [];
              }

              groups[category].push(product);

              return groups;

            }, {});

            // SORT CATEGORIES
            const sortedCategories = Object.keys(
              groupedProducts
            ).sort((a, b) => a.localeCompare(b));

            // SERIAL NUMBERS
            const serialNumbers = new Map(
              order.products.map((product, index) => [
                product,
                index + 1,
              ])
            );

            const getSerialNumber = (product: Product) =>
              serialNumbers.get(product) || '';

            const isExpanded = expandedOrders.includes(
              order._id
            );

            return (

              <div
                key={order._id}
                className="card shadow-sm mb-4"
                style={styles.orderCard}
              >

                {/* ORDER HEADER */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  style={styles.orderHeader}
                >

                  <div className="d-flex align-items-center gap-3">

                    <div style={styles.orderIcon}>
                      📦
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        {order.shopName}
                      </h5>

                      <small className="text-muted">
                        {new Date(
                          order.createdAt
                        ).toLocaleString()}
                      </small>

                      <div className="mt-1">
                        <span className="badge bg-success">
                          Order #{orderIndex + 1}
                        </span>
                      </div>

                    </div>

                  </div>

                  <div className="text-end">

                    <h5 className="fw-bold text-success mb-1">
                      ₹{total.toFixed(2)}
                    </h5>

                    <small className="text-success">
                      Profit: ₹{totalProfit.toFixed(2)}
                    </small>

                    <div className="mt-2">
                      <span className="text-primary fw-bold">
                        {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                      </span>
                    </div>

                  </div>

                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (

                  <div className="p-3">

                    <hr />

                    {/* ORDER INFORMATION */}
                    <div className="row g-3 mb-3">

                      <div className="col-12 col-md-6">
                        <div style={styles.infoBox}>
                          <small className="text-muted">
                            Order ID
                          </small>

                          <div className="fw-semibold text-break">
                            {order._id}
                          </div>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div style={styles.infoBox}>
                          <small className="text-muted">
                            Total Quantity
                          </small>

                          <h5 className="fw-bold mb-0">
                            {totalQty}
                          </h5>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <div style={styles.infoBox}>
                          <small className="text-muted">
                            Total Profit
                          </small>

                          <h5 className="fw-bold text-success mb-0">
                            ₹{totalProfit.toFixed(2)}
                          </h5>
                        </div>
                      </div>

                      <div className="col-12">
                        <div style={styles.infoBox}>
                          <strong>Delivery Address:</strong>

                          <p className="mb-0 mt-1">
                            📍 {order.address}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* CATEGORY WISE TABLE */}
                    <h5 className="fw-bold mt-4 mb-3">
                      Product Details
                    </h5>

                    <div className="table-responsive">

                      <table className="table table-bordered table-hover align-middle"
                        style={styles.table}>

                        <thead className="table-primary">

                          <tr>
                            <th>Product</th>
                            <th>Sr. No.</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Profit</th>
                            <th>Total</th>
                          </tr>

                        </thead>

                        <tbody>

                          {sortedCategories.map((category) => (

                            <Fragment key={category}>

                              {/* CATEGORY HEADING */}
                              <tr>
                                <td
                                  colSpan={6}
                                  style={styles.categoryHeading}
                                >
                                  📁 {category}
                                </td>
                              </tr>

                              {/* CATEGORY PRODUCTS */}
                              {groupedProducts[category].map(
                                (p, idx) => (

                                  <tr key={`${category}-${idx}`}>

                                    <td className="fw-semibold">
                                      {p.productName}
                                    </td>

                                    <td>
                                      {getSerialNumber(p)}
                                    </td>

                                    <td>
                                      {p.quantity}
                                    </td>

                                    <td>
                                      ₹{p.price}
                                    </td>

                                    <td className="text-success">
                                      ₹{Number(
                                        p.profit || 0
                                      ).toFixed(2)}
                                    </td>

                                    <td className="fw-bold">
                                      ₹{(
                                        p.quantity * p.price
                                      ).toFixed(2)}
                                    </td>

                                  </tr>

                                )
                              )}

                            </Fragment>

                          ))}

                        </tbody>

                      </table>

                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="card p-3 mt-3"
                      style={styles.summaryBox}>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Products Quantity</span>
                        <strong>{totalQty}</strong>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Profit</span>
                        <strong className="text-success">
                          ₹{totalProfit.toFixed(2)}
                        </strong>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between">
                        <h5 className="fw-bold">
                          Total Amount
                        </h5>

                        <h5 className="fw-bold text-primary">
                          ₹{total.toFixed(2)}
                        </h5>
                      </div>

                    </div>

                  </div>

                )}

                {/* PDF BUTTON */}
                <div className="px-3 pb-3">

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => generatePDF(order._id)}
                  >
                    📄 Generate PDF
                  </button>

                </div>

              </div>

            );

          })

        ) : (

          /* EMPTY ORDERS */
          <div className="text-center py-5">

            <div style={{ fontSize: '65px' }}>
              📦
            </div>

            <h4 className="mt-3 fw-bold">
              You have no orders yet
            </h4>

            <p className="text-muted">
              Your placed orders will appear here.
            </p>

            <button
              className="btn btn-primary px-4"
              onClick={() => navigate(-1)}
            >
              Continue Shopping
            </button>

          </div>

        )}

      </main>

    </div>
  );
};

// STYLES
const styles: { [key: string]: CSSProperties } = {

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

  orderCard: {
    border: '1px solid #ddd',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px',
    cursor: 'pointer',
    gap: '12px',
    background: '#fff',
  },

  orderIcon: {
    width: '50px',
    height: '50px',
    minWidth: '50px',
    borderRadius: '12px',
    background: '#eaf3ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
  },

  infoBox: {
    background: '#f8faff',
    border: '1px solid #e1e8f0',
    borderRadius: '8px',
    padding: '12px',
    height: '100%',
    overflowWrap: 'anywhere',
  },

  table: {
    minWidth: '650px',
    fontSize: '14px',
  },

  categoryHeading: {
    background: '#e9f2ff',
    fontWeight: 'bold',
    padding: '12px',
    color: '#0056b3',
  },

  summaryBox: {
    background: '#f8faff',
    borderRadius: '10px',
    border: '1px solid #e1e8f0',
    maxWidth: '500px',
    marginLeft: 'auto',
  },

};

export default MyOrder;
