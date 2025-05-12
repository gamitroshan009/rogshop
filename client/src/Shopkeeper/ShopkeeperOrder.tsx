import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  quantity: number;
  price: number;
  category?: string;
}

interface Order {
  _id: string;
  email: string;
  mobileNo: string;
  address: string;
  products: Product[];
  createdAt: string;
  received: string;
}

const ShopkeeperOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchStatus, setSearchStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('');

  const shopName = localStorage.getItem('shopkeeperName') || '';
  const shopId = localStorage.getItem('shopkeeperId') || '';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders/shop', {
          params: { shopName, shopId },
        });
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setMessage('Error fetching orders');
      }
    };

    fetchOrders();
  }, [shopName, shopId]);

  const handleSearch = (value: string) => {
    setSearchStatus(value);
    if (value.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const lower = value.toLowerCase();
      const filtered = orders.filter(order =>
        order.received.toLowerCase().includes(lower)
      );
      setFilteredOrders(filtered);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    const confirmComplete = window.confirm('Mark this order as complete?');
    if (!confirmComplete) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        received: 'Complete',
      });

      const updatedOrders = orders.map(order =>
        order._id === orderId ? { ...order, received: response.data.order.received } : order
      );

      setOrders(updatedOrders);
      handleSearch(searchStatus); // Refilter
      setSelectedOrder(null);
      setMessage('Order marked as complete');
    } catch (error) {
      console.error('Error completing order:', error);
      setMessage('Error completing order');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Orders for {shopName}</h2>

      <input
        type="text"
        placeholder="Search by status (pending or complete)"
        value={searchStatus}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />

      {message && <p style={{ textAlign: 'center', color: 'green', marginBottom: '1rem' }}>{message}</p>}

      {filteredOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              style={{
                backgroundColor: '#fff',
                padding: '1rem',
                borderRadius: '5px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                borderLeft: `5px solid ${order.received.toLowerCase() === 'complete' ? 'green' : 'red'}`,
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <p><strong>{order.email}</strong></p>
              <p>Total: ₹{order.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#555', fontSize: '1.2rem' }}>No orders found.</p>
      )}

      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '600px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              overflowY: 'auto',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Order Details</h3>
            <p><strong>Customer Email:</strong> {selectedOrder.email}</p>
            <p><strong>Mobile No:</strong> {selectedOrder.mobileNo}</p>
            <p><strong>Address:</strong> {selectedOrder.address}</p>
            <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong>{' '}
              <span style={{ color: selectedOrder.received.toLowerCase() === 'complete' ? 'green' : 'red' }}>
                {selectedOrder.received}
              </span>
            </p>

            {/* Grouped by Category Table */}
            {Object.entries(
              selectedOrder.products.reduce((groups, product) => {
                const category = product.category || 'Uncategorized';
                if (!groups[category]) groups[category] = [];
                groups[category].push(product);
                return groups;
              }, {} as Record<string, Product[]>)
            ).map(([category, products]) => (
              <div key={category} style={{ marginBottom: '2rem' }}>
                {/* Category Header with lines */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }} />
                  <div style={{ padding: '0 1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Category: {category}
                  </div>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }} />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9' }}>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Product</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Qty</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Price</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, i) => (
                      <tr key={i}>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{product.productName}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{product.quantity}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>₹{product.price}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                          ₹{(product.quantity * product.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <p style={{ marginTop: '1rem' }}>
              <strong>Total Quantity:</strong> {selectedOrder.products.reduce((sum, p) => sum + p.quantity, 0)}
            </p>
            <p>
              <strong>Total Price:</strong> ₹{selectedOrder.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
            </p>

            {selectedOrder.received.toLowerCase() !== 'complete' && (
              <button
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '5px',
                  marginRight: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleCompleteOrder(selectedOrder._id)}
              >
                Mark as Complete
              </button>
            )}
            <button
              style={{
                backgroundColor: '#6c757d',
                color: '#fff',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperOrder;
