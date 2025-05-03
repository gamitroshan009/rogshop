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
  email: string;
  mobileNo: string;
  address: string;
  received: string;
  products: Product[];
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>('http://localhost:5000/api/admin/orders');
        const sorted = response.data.sort((a,) => (a.received === 'pending' ? -1 : 1));
        setOrders(sorted);
        setFilteredOrders(sorted);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setMessage('Error fetching orders');
      }
    };
    fetchOrders();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterOrders(value, statusFilter);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    filterOrders(searchTerm, value);
  };

  const filterOrders = (shopName: string, status: string) => {
    const filtered = orders.filter((order) => {
      const matchesShopName = order.shopName.toLowerCase().includes(shopName.toLowerCase());
      const matchesStatus = status ? order.received === status : true;
      return matchesShopName && matchesStatus;
    });
    setFilteredOrders(filtered);
  };

  const toggleDetails = (id: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrders(newExpanded);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        .heading {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .searchBar, .dropdown {
          padding: 0.5rem;
          font-size: 1rem;
          max-width: 300px;
          width: 100%;
        }
        .message {
          color: red;
          text-align: center;
        }
        .cardsContainer {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 1rem;
          background-color: #f9f9f9;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          font-size: 0.9rem;
        }
        .cardHeader {
          font-weight: bold;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        .pending {
          background-color: #ffc107;
          color: #000;
        }
        .complete {
          background-color: #28a745;
          color: #fff;
        }
        .toggleButton {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          background: #007bff;
          color: white;
          border: none;
          padding: 0.4rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .detail {
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        .emptyMessage {
          text-align: center;
          margin-top: 2rem;
          font-size: 1.1rem;
          color: #555;
        }
      `}</style>

      <h2 className="heading">Admin Dashboard - All Orders</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by Shop Name"
          value={searchTerm}
          onChange={handleSearch}
          className="searchBar"
        />
        <select value={statusFilter} onChange={handleStatusChange} className="dropdown">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="Complete">Complete</option>
        </select>
      </div>

      {message && <p className="message">{message}</p>}

      {filteredOrders.length > 0 ? (
        <div className="cardsContainer">
          {filteredOrders.map((order) => {
            const totalQuantity = order.products.reduce((acc, p) => acc + p.quantity, 0);
            const totalPrice = order.products.reduce((acc, p) => acc + p.quantity * p.price, 0).toFixed(2);

            return (
              <div key={order._id} className="card">
                <div className="cardHeader">Order ID: {order._id}</div>
                <div><strong>Shop:</strong> {order.shopName}</div>
                <div><strong>Email:</strong> {order.email}</div>
                <div><strong>Mobile:</strong> {order.mobileNo}</div>
                <div><strong>Total Quantity:</strong> {totalQuantity}</div>
                <div><strong>Total Price:</strong> ₹{totalPrice}</div>
                <div className={`badge ${order.received === 'Complete' ? 'complete' : 'pending'}`}>
                  {order.received || 'Pending'}
                </div>

                <button className="toggleButton" onClick={() => toggleDetails(order._id)}>
                  {expandedOrders.has(order._id) ? 'Hide Details' : 'Show Details'}
                </button>

                {expandedOrders.has(order._id) && (
                  <div className="detail">
                    <strong>Products:</strong>
                    <ul>
                      {order.products.map((p, i) => (
                        <li key={i}>{p.productName} (x{p.quantity}) - ₹{p.price}</li>
                      ))}
                    </ul>
                    <div><strong>Address:</strong> {order.address}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="emptyMessage">No orders found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
