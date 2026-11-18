
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Product {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
  category: string;
}

const ShopView: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const shopName = location.state?.shopName || 'Shop';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: string]: number }>({});
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: boolean }>({});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  const [isMovingToCart, setIsMovingToCart] = useState(false);

  const userEmail = localStorage.getItem('userEmail') || 'User Email';
  const firstLetter = userEmail.charAt(0).toUpperCase();

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProgress(1);

      let simulatedProgress = 1;

      const interval = setInterval(() => {
        simulatedProgress += 5;
        if (simulatedProgress >= 95) return;
        setProgress(simulatedProgress);
      }, 100);

      try {
        const response = await axios.get(
          `https://rogshop02.onrender.com/api/products?shopkeeperId=${shopId}&shopName=${encodeURIComponent(shopName)}`
        );

        setProducts(response.data);
        setProgress(100);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProgress(100);
      } finally {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchProducts();
  }, [shopId, shopName]);

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `https://rogshop02.onrender.com/api/products-categories?shopkeeperId=${shopId}&shopName=${encodeURIComponent(shopName)}`
        );

        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [shopId, shopName]);

  // QUANTITY
  const incrementQuantity = (productId: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(
        (prev[productId] || 1) + 1,
        products.find((p) => p._id === productId)?.quantity || 1
      ),
    }));
  };

  const decrementQuantity = (productId: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 1) - 1, 1),
    }));
  };

  // CHECKBOX
  const handleCheckboxChange = (productId: string) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // MOVE TO CART
  const handleMoveToCart = async () => {
    const selectedProductIds = Object.keys(selectedProducts).filter(
      (productId) => selectedProducts[productId]
    );

    if (selectedProductIds.length === 0) {
      alert('Please select at least one product to move to the cart.');
      return;
    }

    const selectedItems = products.filter((product) =>
      selectedProductIds.includes(product._id)
    );

    for (const product of selectedItems) {
      const quantity = selectedQuantities[product._id] || 1;

      if (quantity > product.quantity) {
        alert(`Only ${product.quantity} units available for ${product.productName}`);
        return;
      }
    }

    setIsMovingToCart(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedItems.length; i++) {
        const product = selectedItems[i];

        const cartItem = {
          userEmail,
          shopId,
          shopName,
          product: product.productName,
          quantity: selectedQuantities[product._id] || 1,
          totalBill: product.price * (selectedQuantities[product._id] || 1),
        };

        await axios.post(
          'https://rogshop02.onrender.com/api/cart',
          cartItem
        );

        setProgress(Math.round(((i + 1) / selectedItems.length) * 100));
      }

      alert('Selected products have been moved to the cart.');
      navigate('/cart');

    } catch (error) {
      console.error('Error moving products to cart:', error);
      alert('Failed to move products to the cart.');
    } finally {
      setIsMovingToCart(false);
    }
  };

  // SIDEBAR NAVIGATION
  const handleMenuClick = (option: string) => {
    setShowUserMenu(false);

    if (option === 'profile') navigate('/profile');
    else if (option === 'cart') navigate('/cart');
    else if (option === 'orders') navigate('/orders');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-fluid position-relative">

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

      {/* MOVING TO CART OVERLAY */}
      {isMovingToCart && (
        <div style={styles.progressOverlay}>
          <div style={styles.progressBox}>
            <h5 className="mb-3">
              Moving products to cart...
            </h5>

            <div className="progress" style={{ height: '20px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                role="progressbar"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <header className="text-white p-3" style={styles.header}>

        <div className="d-flex justify-content-between align-items-center">

          <h1 className="fs-4 fw-bold mb-0">
            {shopName}
          </h1>

          {/* PROFILE AVATAR */}
          <div
            style={styles.profileCircle}
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Open Profile Menu"
          >
            {firstLetter}
          </div>

        </div>

        <div className="mt-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </header>

      {/* INITIAL LOADING */}
      {loading ? (

        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: '300px' }}
        >
          <p className="mb-3">Loading products...</p>

          <div className="progress w-75" style={{ height: '20px' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-info"
              role="progressbar"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        </div>

      ) : (

        <div className="row mt-3">

          {/* CATEGORIES */}
          <aside className="col-12 col-md-3 mb-3">

            <h3 className="fs-5 d-none d-md-block">
              Categories
            </h3>

            <div className="d-md-none mb-3">

              <label htmlFor="categoriesSelect" className="form-label">
                Select Category
              </label>

              <select
                id="categoriesSelect"
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All</option>

                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}

              </select>

            </div>

            <ul className="list-group d-none d-md-block">

              <li
                className={`list-group-item ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
                style={{ cursor: 'pointer' }}
              >
                All
              </li>

              {categories.map((category, index) => (
                <li
                  key={index}
                  className={`list-group-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  style={{ cursor: 'pointer' }}
                >
                  {category}
                </li>
              ))}

            </ul>

          </aside>

          {/* PRODUCTS */}
          <main className="col-12 col-md-9">

            {(selectedCategory === ''
              ? categories
              : [selectedCategory]
            ).map((category, catIndex) => {

              const categoryProducts = filteredProducts.filter(
                (product) => product.category === category
              );

              if (categoryProducts.length === 0) return null;

              return (

                <div key={catIndex}>

                  <h4 className="mb-3 mt-4">
                    {category}
                  </h4>

                  <div className="row">

                    {categoryProducts.map((product) => (

                      <div
                        key={product._id}
                        className="col-12 col-sm-6 col-md-4 mb-4 fade-in"
                        style={{ display: 'flex' }}
                      >

                        <div
                          className="card p-3 flex-grow-1"
                          style={styles.productCard}
                        >

                          <div style={{ flex: 1 }}>

                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={!!selectedProducts[product._id]}
                              onChange={() => handleCheckboxChange(product._id)}
                              style={{
                                transform: 'scale(1.2)',
                                marginRight: '10px',
                              }}
                            />

                            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                              {product.productName}
                            </span>

                            <p className="mb-1" style={{ fontSize: '0.9rem' }}>
                              <strong>Price:</strong> ₹{product.price}
                            </p>

                            <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                              <strong>Stock:</strong> {product.quantity}
                            </p>

                          </div>

                          <div className="d-flex align-items-center">

                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => decrementQuantity(product._id)}
                              aria-label={`Decrease quantity of ${product.productName}`}
                            >
                              -
                            </button>

                            <span style={styles.quantityBox}>
                              {selectedQuantities[product._id] || 1}
                            </span>

                            <button
                              className="btn btn-sm btn-primary ms-2"
                              onClick={() => incrementQuantity(product._id)}
                              disabled={
                                (selectedQuantities[product._id] || 1) >= product.quantity
                              }
                              aria-label={`Increase quantity of ${product.productName}`}
                            >
                              +
                            </button>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              );

            })}

            {filteredProducts.length === 0 && (
              <p className="text-center text-muted mt-5">
                No products found.
              </p>
            )}

          </main>

        </div>

      )}

      {/* MOVE TO CART BUTTON */}
      <footer className="d-flex justify-content-center mt-4 mb-5">

        <button
          className="btn btn-success px-4 py-2"
          onClick={handleMoveToCart}
          disabled={isMovingToCart}
        >
          🛒 Move Selected to Cart
        </button>

      </footer>

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

  productCard: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },

  quantityBox: {
    minWidth: '30px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
};

export default ShopView;
