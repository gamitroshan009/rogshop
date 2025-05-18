import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ShopView: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const shopName = location.state?.shopName || 'Shop';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: string]: number }>({});
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: boolean }>({});
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  const [isMovingToCart, setIsMovingToCart] = useState(false);

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProgress(1); // Start at 1%

      let simulatedProgress = 1;
      const interval = setInterval(() => {
        simulatedProgress += 5;
        if (simulatedProgress >= 95) return;
        setProgress(simulatedProgress);
      }, 100);

      try {
        const response = await axios.get(
          `http://localhost:5000/api/products?shopkeeperId=${shopId}&shopName=${shopName}`
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products-categories?shopkeeperId=${shopId}&shopName=${shopName}`
        );
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [shopId, shopName]);

  const incrementQuantity = (productId: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }));
  };

  const decrementQuantity = (productId: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 1) - 1, 1),
    }));
  };

  const handleCheckboxChange = (productId: string) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

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

        await axios.post('http://localhost:5000/api/cart', cartItem);

        setProgress(Math.round(((i + 1) / selectedItems.length) * 100));
      }

      setTimeout(() => {
        alert('Selected products have been moved to the cart.');
        navigate('/cart');
      }, 300);
    } catch (error) {
      console.error('Error moving products to cart:', error);
      alert('Failed to move products to the cart.');
    } finally {
      setIsMovingToCart(false);
    }
  };

  const handleDropdownOption = (option: string) => {
    setDropdownVisible(false);
    if (option === 'myOrders') {
      navigate('/orders');
    } else if (option === 'cart') {
      navigate('/cart');
    } else if (option === 'logout') {
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-fluid position-relative">
      {/* Moving to Cart Progress Overlay */}
      {isMovingToCart && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
              minWidth: '300px',
              textAlign: 'center',
            }}
          >
            <h5 className="mb-3">Moving products to cart...</h5>
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

      {/* Page Header */}
      <header className="bg-primary text-white p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h1 className="fs-4 fw-bold mb-2 mb-md-0 mx-auto">{shopName}</h1>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="d-flex justify-content-start flex-grow-1 me-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-end position-relative">
            <span
              className="fw-bold text-white cursor-pointer"
              onClick={() => setDropdownVisible((prev) => !prev)}
              style={{ userSelect: 'none' }}
            >
              {userEmail}
            </span>
            {dropdownVisible && (
              <div className="dropdown-menu show position-absolute end-0 mt-2">
                <button className="dropdown-item" onClick={() => handleDropdownOption('myOrders')}>
                  🧾 My Orders
                </button>
                <button className="dropdown-item" onClick={() => handleDropdownOption('cart')}>
                  🛒 Cart
                </button>
                <button className="dropdown-item" onClick={() => handleDropdownOption('logout')}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Loading Progress for Initial Products */}
      {loading ? (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
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
          <aside className="col-12 col-md-3 mb-3">
            <h3 className="fs-5 d-none d-md-block">Categories</h3>
            <div className="d-md-none mb-3">
              <label htmlFor="categoriesSelect" className="form-label">Select Category</label>
              <select
                id="categoriesSelect"
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
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

          <main className="col-12 col-md-9">
            {(selectedCategory === '' ? categories : [selectedCategory]).map((category, catIndex) => {
              const categoryProducts = filteredProducts.filter(
                (product) => product.category === category
              );
              if (categoryProducts.length === 0) return null;
              return (
                <div key={catIndex}>
                  <h4 className="mb-3 mt-4">{category}</h4>
                  <div className="row">
                    {categoryProducts.map((product) => (
                      <div
                        key={product._id}
                        className="col-12 col-sm-6 col-md-4 mb-4 fade-in"
                        style={{ display: 'flex' }}
                      >
                        <div
                          className="card p-3 flex-grow-1"
                          style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={!!selectedProducts[product._id]}
                              onChange={() => handleCheckboxChange(product._id)}
                              style={{ transform: 'scale(1.2)', marginRight: '10px' }}
                            />
                            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{product.productName}</span>
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
                            <span
                              className="quantity-box"
                              style={{
                                minWidth: '30px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                              }}
                            >
                              {selectedQuantities[product._id] || 1}
                            </span>
                            <button
                              className="btn btn-sm btn-primary ms-2"
                              onClick={() => incrementQuantity(product._id)}
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
          </main>
        </div>
      )}

      <footer className="d-flex justify-content-center mt-4 mb-5">
        <button
          className="btn btn-success"
          onClick={handleMoveToCart}
          disabled={isMovingToCart}
        >
          Move Selected to Cart
        </button>
      </footer>
    </div>
  );
};

export default ShopView;
