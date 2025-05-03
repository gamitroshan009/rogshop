import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  shopName: string;
  products: Product[];
  address: string;
  createdAt: string;
}

const MyOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>('http://localhost:5000/api/orders', {
          params: { email: userEmail },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [userEmail]);

  return (
    <div className="order-container">
      <style>{`
        .order-container {
          max-width: 90%;
          margin: 2rem auto;
          padding: 1.5rem;
        }

        .order-title {
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        /* Desktop Table */
        .order-table {
          width: 100%;
          border-collapse: collapse;
        }

        .order-table thead {
          background-color: #007bff;
          color: white;
        }

        .order-table th,
        .order-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #ccc;
        }

        .order-table tr:hover {
          background-color: #f9f9f9;
        }

        .no-orders {
          text-align: center;
          font-size: 1rem;
          color: #888;
          padding: 1rem;
        }

        /* Mobile Cards */
        @media (max-width: 768px) {
          .order-table {
            display: none;
          }

          .order-card {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 1rem;
            background: #fff;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          }

          .order-card h4 {
            margin-bottom: 0.5rem;
            font-size: 1rem;
            color: #007bff;
          }

          .order-field {
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }

          .order-field span {
            font-weight: bold;
            display: inline-block;
            width: 110px;
          }
        }
      `}</style>

      <h2 className="order-title">My Orders</h2>

      {/* Desktop Table View */}
      {orders.length > 0 ? (
        <>
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Shop Name</th>
                <th>Products</th>
                <th>Total Qty</th>
                <th>Total Price</th>
                <th>Address</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.shopName}</td>
                  <td>
                    {order.products.map((p, i) => (
                      <div key={i}>{p.productName} (x{p.quantity})</div>
                    ))}
                  </td>
                  <td>{order.products.reduce((t, p) => t + p.quantity, 0)}</td>
                  <td>₹{order.products.reduce((t, p) => t + p.quantity * p.price, 0).toFixed(2)}</td>
                  <td>{order.address}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <h4>Order ID: {order._id}</h4>
              <div className="order-field"><span>Shop:</span> {order.shopName}</div>
              <div className="order-field">
                <span>Products:</span>
                {order.products.map((p, i) => (
                  <div key={i}>{p.productName} (x{p.quantity})</div>
                ))}
              </div>
              <div className="order-field">
                <span>Total Qty:</span> {order.products.reduce((t, p) => t + p.quantity, 0)}
              </div>
              <div className="order-field">
                <span>Total Price:</span> ₹{order.products.reduce((t, p) => t + p.price * p.quantity, 0).toFixed(2)}
              </div>
              <div className="order-field"><span>Address:</span> {order.address}</div>
              <div className="order-field"><span>Date:</span> {new Date(order.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </>
      ) : (
        <p className="no-orders">You have no orders yet.</p>
      )}
    </div>
  );
};

export default MyOrder;
