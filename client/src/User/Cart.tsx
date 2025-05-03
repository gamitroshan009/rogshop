import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Css/Cart.css';

// Define interfaces for cart items and products
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // State for cart items
  const [products, setProducts] = useState<Product[]>([]); // State for products
  const [showOrderForm, setShowOrderForm] = useState(false); // State to toggle order form
  const [loading, setLoading] = useState(true); // State for loading indicator

  const [orderDetails, setOrderDetails] = useState({
    email: '',
    mobileNo: '',
    address: '',
  });

  const userEmail = localStorage.getItem('userEmail') || ''; // Get user email from localStorage
  const navigate = useNavigate(); // React Router's navigate function

  // Fetch cart items for the logged-in user
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

  // Fetch all products
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

  // Pre-fill email in order details if userEmail exists
  useEffect(() => {
    if (userEmail) {
      setOrderDetails((prev) => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  // Merge cart items with product details
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

  // Handle quantity update
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

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to remove this product from the cart?');
    if (!isConfirmed) {
      return; // Exit if the user cancels
    }

    try {
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Calculate total quantity
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Handle order placement
  const handlePlaceOrder = async () => {
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
      for (const item of cartItems) {
        await handleRemoveItem(item._id);
      }
      setCartItems([]);
      setShowOrderForm(false);
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Error placing order');
    }
  };

  if (loading) {
    return <p className="empty-message">Loading your cart...</p>;
  }

  return (
    <div className="cart-container">
      {/* Header */}
      <header className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-light"
          onClick={() => navigate(-1)} // Navigate back to the previous page
        >
          Back
        </button>
        <span className="fw-bold">{userEmail}</span>
      </header>

      <h2 className="cart-heading">My Cart</h2>
      {mergedCartItems.length > 0 ? (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Shop Name</th>
                <th>Quantity</th>
                <th>Stock</th>
                <th>Total Bill</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mergedCartItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.product}</td>
                  <td>{item.shopName}</td>
                  <td>
                    {item.stock > 0 ? (
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item._id, parseInt(e.target.value, 10))
                        }
                        className="cart-select"
                      >
                        {[...Array(item.stock).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: 'red' }}>Out of Stock</span>
                    )}
                  </td>
                  <td>{item.stock}</td>
                  <td>₹{item.totalBill.toFixed(2)}</td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <p>
              <strong>Total Quantity:</strong> {totalQuantity}
            </p>
          </div>

          <button
            className="order-button"
            onClick={() => setShowOrderForm(true)}
          >
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
