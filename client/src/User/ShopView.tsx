import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const ShopView = () => {
  const { shopId } = useParams();
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
  const [loading, setLoading] = useState(true);  // State for loading
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);  // Set loading to true before fetching
        const response = await axios.get(
          `http://localhost:5000/api/products?shopkeeperId=${shopId}&shopName=${shopName}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);  // Set loading to false after fetching
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

    try {
      for (const product of selectedItems) {
        const cartItem = {
          userEmail,
          shopId,
          shopName,
          product: product.productName,
          quantity: selectedQuantities[product._id] || 1,
          totalBill: product.price * (selectedQuantities[product._id] || 1),
        };
        await axios.post('http://localhost:5000/api/cart', cartItem);
      }
      alert('Selected products have been moved to the cart.');
      navigate('/cart');
    } catch (error) {
      console.error('Error moving products to cart:', error);
      alert('Failed to move products to the cart.');
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
    <div className="container-fluid">
      {/* Internal CSS for Fade-In Effect */}
      <style>
        {`
          .fade-in {
            opacity: 0;
            animation: fadeIn 0.5s forwards;
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>

      {/* Header */}
      <header className="bg-primary text-white p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          {/* Shop Name Centered */}
          <h1 className="fs-4 fw-bold mb-2 mb-md-0 mx-auto">{shopName}</h1>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          {/* Search Bar on Left */}
          <div className="d-flex justify-content-start">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Email & Dropdown on Right */}
          <div className="d-flex justify-content-end">
            <span
              className="fw-bold text-white cursor-pointer"
              onClick={() => setDropdownVisible((prev) => !prev)}
            >
              {userEmail}
            </span>
            {dropdownVisible && (
              <div className="dropdown-menu show position-absolute end-0 mt-2">
                <button
                  className="dropdown-item"
                  onClick={() => handleDropdownOption('myOrders')}
                >
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

      <div className="row mt-3">
        {/* Sidebar */}
        <aside className="col-12 col-md-3 mb-3">
          <h3 className="fs-5 d-none d-md-block">Categories</h3>

          {/* List Box for Mobile */}
          <div className="d-md-none">
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

          {/* List for Larger Screens */}
          <ul className="list-group d-none d-md-block">
            <li
              className={`list-group-item ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All
            </li>
            {categories.map((category, index) => (
              <li
                key={index}
                className={`list-group-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="col-12 col-md-9">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className={`col-6 col-sm-3 col-md-4 mb-3 product-item fade-in`}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <div className="card">
                    <div className="image-container">
                      <img
                        src={`data:image/jpeg;base64,${product.productImage}`}
                        className="card-img-top product-image"
                        alt={product.productName}
                      />
                    </div>
                    <div className="card-body">
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={!!selectedProducts[product._id]}
                        onChange={() => handleCheckboxChange(product._id)}
                      />
                      <h5 className="card-title">{product.productName}</h5>
                      <p className="card-text">
                        <strong>Price:</strong> ₹{product.price}
                      </p>
                      <p className="card-text">
                        <strong>Stock:</strong> {product.quantity}
                      </p>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => decrementQuantity(product._id)}
                        >
                          -
                        </button>
                        <span className="quantity-box">
                          {selectedQuantities[product._id] || 1}
                        </span>
                        <button
                          className="btn btn-sm btn-primary ms-2"
                          onClick={() => incrementQuantity(product._id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-success mt-3" onClick={handleMoveToCart}>
            Move Selected to Cart
          </button>
        </main>
      </div>
    </div>
  );
};

export default ShopView;
