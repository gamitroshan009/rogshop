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
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
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

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

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
          vertical-align: top;
        }

        .order-table tr:hover {
          background-color: #f9f9f9;
        }

        .nested-table {
          width: 100%;
          font-size: 0.9rem;
          border-collapse: collapse;
        }

        .nested-table th,
        .nested-table td {
          padding: 0.3rem;
          border-bottom: 1px solid #eee;
        }

        .no-orders {
          text-align: center;
          font-size: 1rem;
          color: #888;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .order-table {
            display: none;
          }

          .order-card {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 0.8rem;
            margin-bottom: 1rem;
            background: #fff;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            transition: all 0.7s ease;
          }

          .order-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1rem;
            font-weight: bold;
            padding: 0.2rem 0.5rem;
            color: #007bff;
          }

          .shop-name {
            flex: 1;
          }

          .total-amount {
            flex: 1;
            text-align: right;
          }

          .toggle-icon {
            margin-left: 10px;
            font-size: 1.2rem;
            color: #666;
          }

          .order-details-wrapper {
            overflow: hidden;
            transition: max-height 0.6s ease;
          }

          .order-details {
            padding-top: 0.5rem;
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
            width: 100px;
          }

          .nested-table-mobile {
            width: 100%;
            font-size: 0.85rem;
            margin-top: 0.5rem;
            border-collapse: collapse;
          }

          .nested-table-mobile th,
          .nested-table-mobile td {
            padding: 0.3rem;
            border-bottom: 1px solid #eee;
          }
        }
      `}</style>

      <h2 className="order-title">My Orders</h2>

      {orders.length > 0 ? (
        <>
          {/* Desktop Table View */}
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
                    <table className="nested-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price(₹)</th>
                          <th>Total(₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.products.map((p, i) => (
                          <tr key={i}>
                            <td>{p.productName}</td>
                            <td>{p.quantity}</td>
                            <td>{p.price}</td>
                            <td>{(p.quantity * p.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
          {orders.map((order) => {
            const totalPrice = order.products.reduce((t, p) => t + p.quantity * p.price, 0).toFixed(2);
            const totalQty = order.products.reduce((t, p) => t + p.quantity, 0);
            const isExpanded = expandedOrders.includes(order._id);

            return (
              <div key={order._id} className="order-card" onClick={() => toggleExpand(order._id)}>
                <div className="order-summary-row">
                  <div className="shop-name">{order.shopName}</div>
                  <div className="total-amount">₹{totalPrice}</div>
                  <div className="toggle-icon">{isExpanded ? '▲' : '▼'}</div>
                </div>

                <div
                  className="order-details-wrapper"
                  style={{ maxHeight: isExpanded ? '1000px' : '0' }}
                >
                  <div className="order-details">
                    <div className="order-field"><span>Order ID:</span> {order._id}</div>
                    <div className="order-field">
                      <span>Products:</span>
                      <table className="nested-table-mobile">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price(₹)</th>
                            <th>Total(₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.products.map((p, i) => (
                            <tr key={i}>
                              <td>{p.productName}</td>
                              <td>{p.quantity}</td>
                              <td>{p.price}</td>
                              <td>{(p.quantity * p.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="order-field"><span>Total Qty:</span> {totalQty}</div>
                    <div className="order-field"><span>Address:</span> {order.address}</div>
                    <div className="order-field"><span>Date:</span> {new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <p className="no-orders">You have no orders yet.</p>
      )}
    </div>
  );
};

export default MyOrder;
