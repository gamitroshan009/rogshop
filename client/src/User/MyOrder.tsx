import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  quantity: number;
  price: number;
  category: string;
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

  const groupByCategory = (products: Product[]) => {
    return products.reduce((grouped, product) => {
      const category = product.category || 'Uncategorized';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(product);
      return grouped;
    }, {} as Record<string, Product[]>);
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

        .order-card {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 0.8rem;
          margin-bottom: 1rem;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
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

        .order-summary-left {
          display: flex;
          flex-direction: column;
        }

        .shop-name {
          font-size: 1.1rem;
        }

        .order-date {
          font-size: 0.85rem;
          color: #666;
        }

        .total-amount {
          text-align: right;
        }

        .toggle-icon {
          margin-left: 12px;
          font-size: 1.3rem;
          color: #555;
        }

        .order-details-wrapper {
          overflow: hidden;
          transition: max-height 0.6s ease;
        }

        .order-details {
          padding: 0.5rem 0.5rem 0;
        }

        .order-field {
          font-size: 0.9rem;
          margin-bottom: 0.4rem;
        }

        .order-field span {
          font-weight: bold;
        }

        .nested-table {
          width: 100%;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          border-collapse: collapse;
        }

        .nested-table th,
        .nested-table td {
          padding: 0.4rem;
          border-bottom: 1px solid #eee;
          text-align: left;
        }

        .no-orders {
          text-align: center;
          font-size: 1rem;
          color: #888;
          padding: 1rem;
        }
      `}</style>

      <h2 className="order-title">My Orders</h2>

      {orders.length > 0 ? (
        orders.map((order) => {
          const totalPrice = order.products.reduce((sum, p) => sum + p.quantity * p.price, 0).toFixed(2);
          const totalQty = order.products.reduce((sum, p) => sum + p.quantity, 0);
          const isExpanded = expandedOrders.includes(order._id);
          const groupedProducts = groupByCategory(order.products);

          return (
            <div key={order._id} className="order-card" onClick={() => toggleExpand(order._id)}>
              <div className="order-summary-row">
                <div className="order-summary-left">
                  <div className="shop-name">{order.shopName}</div>
                  <div className="order-date">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="total-amount">₹{totalPrice}</div>
                <div className="toggle-icon">{isExpanded ? '▲' : '▼'}</div>
              </div>

              <div className="order-details-wrapper" style={{ maxHeight: isExpanded ? '1000px' : '0' }}>
                <div className="order-details">
                  <div className="order-field"><span>Order ID:</span> {order._id}</div>
                  <div className="order-field"><span>Total Qty:</span> {totalQty}</div>
                  <div className="order-field"><span>Address:</span> {order.address}</div>
                     <tr className='nested-table'>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price(₹)</th>
                            <th>Total(₹)</th>
                        </tr>
                  {Object.entries(groupedProducts).map(([category, items]) => (
                    <div key={category}>
                       
                      <table className="nested-table">
                        <thead>
                        
                        </thead>
                        <tbody>
                          {items.map((p, i) => (
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
                  ))}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="no-orders">You have no orders yet.</p>
      )}
    </div>
  );
};

export default MyOrder;
