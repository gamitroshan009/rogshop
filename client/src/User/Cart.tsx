import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Css/Cart.css';

interface Product {
  productName: string;
  shopkeeperId: string;
  quantity: number;
}

interface CartItem {
  _id: string;
  product: string;
  shopName: string;
  shopId: string;
  quantity: number;
  totalBill: number;
}

interface MergedCartItem extends CartItem {
  stock: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState({
    email: '',
    mobileNo: '',
    address: '',
  });

  const userEmail = localStorage.getItem('userEmail') || '';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get<CartItem[]>(`http://localhost:5000/api/cart`, {
          params: { userEmail },
        });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };
    fetchCartItems();
  }, [userEmail]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`http://localhost:5000/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (userEmail) {
      setOrderDetails((prev) => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

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

  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + item.totalBill, 0);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const updatedItem = mergedCartItems.find((item) => item._id === itemId);
      if (!updatedItem) return;

      if (newQuantity > updatedItem.stock) {
        alert('Quantity exceeds available stock');
        return;
      }

      const updatedTotalBill = parseFloat(
        ((updatedItem.totalBill / updatedItem.quantity) * newQuantity).toFixed(2)
      );

      await axios.put(`http://localhost:5000/api/cart/${itemId}`, {
        quantity: newQuantity,
        totalBill: updatedTotalBill,
      });

      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, quantity: newQuantity, totalBill: updatedTotalBill }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this product from the cart?');
    if (confirmRemove) {
      try {
        await axios.delete(`http://localhost:5000/api/cart/${itemId}`);
        setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  const handlePlaceOrder = async () => {
    const confirmOrder = window.confirm('Are you sure you want to place the order and remove all products from the cart?');
    if (confirmOrder) {
      if (!orderDetails.email || !orderDetails.mobileNo || !orderDetails.address) {
        alert('Please fill in all the order details.');
        return;
      }

      const orderProducts = cartItems.map((item) => ({
        productName: item.product,
        quantity: item.quantity,
        price: parseFloat((item.totalBill / item.quantity).toFixed(2)),
      }));

      const orderData = {
        shopId: cartItems[0]?.shopId,
        shopName: cartItems[0]?.shopName,
        email: orderDetails.email,
        mobileNo: orderDetails.mobileNo,
        address: orderDetails.address,
        products: orderProducts,
      };

      try {
        await axios.post('http://localhost:5000/api/orders', orderData);
        alert('Order placed successfully');

        // Automatically remove all items from the cart
        for (const item of cartItems) {
          await axios.delete(`http://localhost:5000/api/cart/${item._id}`);
        }

        setCartItems([]);
        setShowOrderForm(false);
        setOrderMessage('All products have been removed from the cart.');
        setTimeout(() => setOrderMessage(''), 3000);
      } catch (error: any) {
        console.error('Error placing order:', error);
        alert(error.response?.data?.message || 'Error placing order');
      }
    }
  };

  if (loading) {
    return <p className="empty-message">Loading your cart...</p>;
  }

  return (
    <div className="cart-container">
      <header className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <button className="btn btn-light" onClick={() => navigate(-1)}>Back</button>
        <span className="fw-bold">{userEmail}</span>
      </header>

      <h2 className="cart-heading">My Cart</h2>
      {orderMessage && <p className="order-message">{orderMessage}</p>}
      {mergedCartItems.length > 0 ? (
        <>
         {mergedCartItems.length > 0 && (
  <>
    <div className="shop-header">{mergedCartItems[0].shopName}</div>
    <div className="shop-divider"></div>

    {mergedCartItems.map((item) => (
      <div key={item._id} className="mobile-product-card">
        <div className="mobile-product-row">
          <span className="mobile-product-label">Product:</span>
          <span>{item.product}</span>
        </div>
        <div className="mobile-product-row">
          <span className="mobile-product-label">Price:</span>
          <span>₹{(item.totalBill / item.quantity).toFixed(2)}</span>
        </div>
        <div className="mobile-product-row">
          <span className="mobile-product-label">Quantity:</span>
          <select
            value={item.quantity}
            onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value, 10))}
          >
            {[...Array(item.stock).keys()].map((num) => (
              <option key={num + 1} value={num + 1}>
                {num + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="mobile-product-row">
          <span className="mobile-product-label">Total:</span>
          <span>₹{item.totalBill.toFixed(2)}</span>
        </div>
        <div className="mobile-product-row">
          <button className="remove-button" onClick={() => handleRemoveItem(item._id)}>Remove</button>
        </div>
      </div>
    ))}
  </>
)}


          <div className="cart-summary">
            <p><strong>Total Quantity:</strong> {totalQuantity}</p>
            <p><strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}</p>
          </div>

          <button className="order-button" onClick={() => setShowOrderForm(true)}>
            Place Order
          </button>
        </>
      ) : (
        <p className="empty-message">Your cart is empty.</p>
      )}

      {showOrderForm && (
        <div className="order-form">
          <h3>Order Details</h3>
          <input
            type="email"
            placeholder="Email"
            value={orderDetails.email}
            onChange={(e) =>
              setOrderDetails({ ...orderDetails, email: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Mobile No"
            value={orderDetails.mobileNo}
            onChange={(e) =>
              setOrderDetails({ ...orderDetails, mobileNo: e.target.value })
            }
          />
          <textarea
            placeholder="Address"
            value={orderDetails.address}
            onChange={(e) =>
              setOrderDetails({ ...orderDetails, address: e.target.value })
            }
          />
          <button className="submit-button" onClick={handlePlaceOrder}>
            Submit Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
