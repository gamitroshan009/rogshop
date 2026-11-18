
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Css/Cart.css';

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
}

const API = '   https://rogshop02.onrender.com/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
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

  const userEmail = localStorage.getItem('userEmail') || '';
  const navigate = useNavigate();

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await axios.get<CartItem[]>(`${API}/cart`, {
        params: { userEmail },
      });

      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCartItems(), fetchProducts()]);
      setLoading(false);
    };

    loadData();
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      setOrderDetails((prev) => ({
        ...prev,
        email: userEmail,
      }));
    }
  }, [userEmail]);

  // Merge cart with product stock
  const mergedCartItems: MergedCartItem[] = cartItems.map((cartItem) => {
    const productDetails = products.find(
      (product) =>
        product.productName === cartItem.product &&
        product.shopkeeperId === cartItem.shopId
    );

    return {
      ...cartItem,
      stock: productDetails?.quantity ?? 0,
    };
  });

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.totalBill,
    0
  );

  // UPDATE CART QUANTITY
  const handleUpdateQuantity = async (
    itemId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const updatedItem = mergedCartItems.find(
      (item) => item._id === itemId
    );

    if (!updatedItem) return;

    if (newQuantity > updatedItem.stock) {
      alert(`Only ${updatedItem.stock} items available in stock`);
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
      console.error('Quantity update error:', error);

      alert(
        error.response?.data?.message ||
        'Unable to update quantity'
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  // REMOVE CART ITEM
  const handleRemoveItem = async (itemId: string) => {
    const confirmRemove = window.confirm(
      'Are you sure you want to remove this product from cart?'
    );

    if (!confirmRemove) return;

    try {
      await axios.delete(`${API}/cart/${itemId}`);

      setCartItems((prev) =>
        prev.filter((item) => item._id !== itemId)
      );

    } catch (error) {
      console.error('Error removing item:', error);
      alert('Unable to remove product');
    }
  };

  // PROGRESS BAR
  const simulateProgress = (): Promise<void> => {
    return new Promise((resolve) => {
      setProgress(1);
      setIsPlacingOrder(true);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            resolve();
            return 100;
          }

          return prev + 1;
        });
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

    // Current order API supports one shop per order.
    const shopId = cartItems[0].shopId;

    const sameShop = cartItems.every(
      (item) => item.shopId === shopId
    );

    if (!sameShop) {
      alert(
        'Please place orders for different shops separately.'
      );
      return;
    }

    const confirmOrder = window.confirm(
      'Are you sure you want to place this order?'
    );

    if (!confirmOrder) return;

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

      alert('Order placed successfully');

      setCartItems([]);
      setShowOrderForm(false);

      setOrderMessage('Order placed successfully!');

      setTimeout(() => {
        setOrderMessage('');
      }, 3000);

    } catch (error: any) {
      console.error('Error placing order:', error);

      alert(
        error.response?.data?.message ||
        'Error placing order'
      );

    } finally {
      setIsPlacingOrder(false);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <p className="empty-message">
        Loading your cart...
      </p>
    );
  }

  return (
    <div className="cart-container">

      <header className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-light"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <span className="fw-bold">{userEmail}</span>
      </header>

      <h2 className="cart-heading">My Cart</h2>

      {isPlacingOrder && (
        <div className="overlay">
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        </div>
      )}

      {orderMessage && (
        <p className="order-message">{orderMessage}</p>
      )}

      {mergedCartItems.length > 0 ? (
        <>
          <div className="shop-header">
            {mergedCartItems[0].shopName}
          </div>

          <div className="shop-divider"></div>

          {mergedCartItems.map((item) => (
            <div
              key={item._id}
              className="mobile-product-card"
            >
              <div className="mobile-product-row">
                <span className="mobile-product-label">
                  Product:
                </span>

                <span>{item.product}</span>
              </div>

              <div className="mobile-product-row">
  <span className="mobile-product-label">
    Category:
  </span>
  <span>{item.category || 'No Category'}</span>
</div>

              <div className="mobile-product-row">
                <span className="mobile-product-label">
                  Price:
                </span>

                <span>
                  ₹
                  {(
                    item.totalBill / item.quantity
                  ).toFixed(2)}
                </span>
              </div>

              <div className="mobile-product-row">
                <span className="mobile-product-label">
                  Profit:
                </span>
                <span>
                  ₹
                  {Number(
                    products.find(
                      (product) =>
                        product.productName === item.product &&
                        product.shopkeeperId === item.shopId
                    )?.profit ?? 0
                  ).toFixed(2)}
                </span>
              </div>

              <div className="mobile-product-row">
                <span className="mobile-product-label">
                  Quantity:
                </span>

                <select
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
                  <span> Updating...</span>
                )}
              </div>

              <div className="mobile-product-row">
                <span className="mobile-product-label">
                  Available Stock:
                </span>

                <span>{item.stock}</span>
              </div>

              <div className="mobile-product-row">
                <span className="mobile-product-label">
                  Total:
                </span>

                <span>
                  ₹{item.totalBill.toFixed(2)}
                </span>
              </div>

              <div className="mobile-product-row">
                <button
                  className="remove-button"
                  onClick={() =>
                    handleRemoveItem(item._id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <p>
              <strong>Total Quantity:</strong>{' '}
              {totalQuantity}
            </p>

            <p>
              <strong>Total Amount:</strong>{' '}
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>

          <button
            className="order-button"
            disabled={isPlacingOrder || !!updatingItem}
            onClick={() => setShowOrderForm(true)}
          >
            Place Order
          </button>
        </>
      ) : (
        <p className="empty-message">
          Your cart is empty.
        </p>
      )}

      {showOrderForm && (
        <div className="order-form">
          <h3>Order Details</h3>

          <input
            type="email"
            placeholder="Email"
            value={orderDetails.email}
            onChange={(e) =>
              setOrderDetails({
                ...orderDetails,
                email: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Mobile No"
            value={orderDetails.mobileNo}
            onChange={(e) =>
              setOrderDetails({
                ...orderDetails,
                mobileNo: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Address"
            value={orderDetails.address}
            onChange={(e) =>
              setOrderDetails({
                ...orderDetails,
                address: e.target.value,
              })
            }
          />

          <button
            className="submit-button"
            disabled={isPlacingOrder || !!updatingItem}
            onClick={handlePlaceOrder}
          >
            Submit Order
          </button>
        </div>
      )}

    </div>
  );
};

export default Cart;
