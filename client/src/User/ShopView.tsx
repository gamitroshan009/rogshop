import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/products?shopkeeperId=${shopId}&shopName=${shopName}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
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
      <style>
        {`
          .fade-in {
            opacity: 0;
            animation: fadeIn 0.5s forwards;
          }

          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>

      <header className="bg-primary text-white p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h1 className="fs-4 fw-bold mb-2 mb-md-0 mx-auto">{shopName}</h1>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="d-flex justify-content-start">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-end">
            <span
              className="fw-bold text-white cursor-pointer"
              onClick={() => setDropdownVisible((prev) => !prev)}
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

      <div className="row mt-3">
        <aside className="col-12 col-md-3 mb-3">
          <h3 className="fs-5 d-none d-md-block">Categories</h3>
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

        <main className="col-12 col-md-9">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : selectedCategory === '' ? (
            categories.map((category, catIndex) => {
              const categoryProducts = filteredProducts.filter(
                (product) => product.category === category
              );
              if (categoryProducts.length === 0) return null;
              return (
                <div key={catIndex}>
                  <h4 className="mb-3 mt-4">{category}</h4>
                  <div className="row">
                    {categoryProducts.map((product, index) => (
                      <div
                        key={product._id}
                        className={`col-6 col-sm-3 col-md-4 mb-3 product-item fade-in`}
                        style={{ animationDelay: `${index * 0.2}s` }}
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
                            <p className="card-text"><strong>Price:</strong> ₹{product.price}</p>
                            <p className="card-text"><strong>Stock:</strong> {product.quantity}</p>
                            <div className="d-flex align-items-center">
                              <button className="btn btn-sm btn-primary me-2" onClick={() => decrementQuantity(product._id)}>-</button>
                              <span className="quantity-box">{selectedQuantities[product._id] || 1}</span>
                              <button className="btn btn-sm btn-primary ms-2" onClick={() => incrementQuantity(product._id)}>+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="row">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className={`col-6 col-sm-3 col-md-4 mb-3 product-item fade-in`}
                  style={{ animationDelay: `${index * 0.2}s` }}
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
                      <p className="card-text"><strong>Price:</strong> ₹{product.price}</p>
                      <p className="card-text"><strong>Stock:</strong> {product.quantity}</p>
                      <div className="d-flex align-items-center">
                        <button className="btn btn-sm btn-primary me-2" onClick={() => decrementQuantity(product._id)}>-</button>
                        <span className="quantity-box">{selectedQuantities[product._id] || 1}</span>
                        <button className="btn btn-sm btn-primary ms-2" onClick={() => incrementQuantity(product._id)}>+</button>
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
