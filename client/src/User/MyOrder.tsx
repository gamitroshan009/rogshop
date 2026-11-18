
import { useEffect, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import ReactDOMServer from 'react-dom/server';
import OrderPDF from '../components/OrderPDF';

interface Product {
  productName: string;
  quantity: number;
  price: number;
  profit: number;
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
        const response = await axios.get<Order[]>(
          '   http://localhost:5000/api/orders',
          {
            params: { email: userEmail },
          }
        );

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (userEmail) {
      fetchOrders();
    }
  }, [userEmail]);

  // Expand / Collapse Order
  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Generate PDF
  const generatePDF = (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);

    if (!order) return;

    const elementHTML = ReactDOMServer.renderToString(
      <OrderPDF order={order} />
    );

    const container = document.createElement('div');
    container.innerHTML = elementHTML;

    document.body.appendChild(container);

    const opt = {
      margin: 0.5,
      filename: `Order_${orderId}.pdf`,
      html2canvas: {
        scale: 2,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
      },
    };

    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        document.body.removeChild(container);
      })
      .catch((error: unknown) => {
        console.error('PDF generation error:', error);
        document.body.removeChild(container);
      });
  };

  return (
    <div
      style={{
        maxWidth: '90%',
        margin: '2rem auto',
        padding: '1.5rem',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>
        My Orders
      </h2>

      {orders.length > 0 ? (
        orders.map((order) => {

          // Total Amount
          const total = order.products
            .reduce(
              (sum, p) => sum + p.quantity * p.price,
              0
            )
            .toFixed(2);

          // Total Quantity
          const totalQty = order.products.reduce(
            (sum, p) => sum + p.quantity,
            0
          );

          const totalProfit = order.products.reduce(
            (sum, p) => sum + (p.profit || 0) * p.quantity,
            0
          );

          // Group Products Category Wise
          const groupedProducts = order.products.reduce<
            Record<string, Product[]>
          >((groups, product) => {
            const category =
              product.category?.trim() || 'Other';

            if (!groups[category]) {
              groups[category] = [];
            }

            groups[category].push(product);

            return groups;
          }, {});

          // Sort Categories
          const sortedCategories = Object.keys(
            groupedProducts
          ).sort((a, b) => a.localeCompare(b));

          const serialNumbers = new Map(
            order.products.map((product, index) => [product, index + 1])
          );

          const getSerialNumber = (product: Product) =>
            serialNumbers.get(product) || '';

          const isExpanded = expandedOrders.includes(
            order._id
          );

          return (
            <div
              key={order._id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem',
                background: '#fdfdfd',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              {/* Order Header */}
              <div
                onClick={() => toggleExpand(order._id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{order.shopName}</strong>
                  <br />

                  <span
                    style={{
                      fontSize: '0.9rem',
                      color: '#666',
                    }}
                  >
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                  }}
                >
                  ₹{total}
                  <br />
                  <span style={{ color: '#28a745', fontSize: '0.85rem' }}>
                    Profit: ₹{totalProfit.toFixed(2)}
                  </span>
                  <br />

                  <span>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded Order Details */}
              {isExpanded && (
                <div style={{ marginTop: '1rem' }}>

                  <p>
                    <strong>Order ID:</strong>{' '}
                    {order._id}
                  </p>

                  <p>
                    <strong>Total Qty:</strong>{' '}
                    {totalQty}
                  </p>

                  <p>
                    <strong>Total Profit:</strong>{' '}
                    ₹{totalProfit.toFixed(2)}
                  </p>

                  <p>
                    <strong>Address:</strong>{' '}
                    {order.address}
                  </p>

                  {/* Category Wise Products Table */}
                  <table
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      fontSize: '0.9rem',
                      borderCollapse: 'collapse',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: '#343a40',
                          color: '#fff',
                        }}
                      >
                        <th style={thStyle}>Product</th>
                        <th style={thStyle}>Sr. No.</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Profit</th>
                        <th style={thStyle}>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sortedCategories.map(
                        (category) => (
                          <>
                            {/* Category Heading */}
                            <tr key={category}>
                              <td
                                colSpan={6}
                                style={{
                                  background: '#e9ecef',
                                  fontWeight: 'bold',
                                  padding: '10px',
                                  border: '1px solid #ddd',
                                }}
                              >
                                {category}
                              </td>
                            </tr>

                            {/* Category Products */}
                            {groupedProducts[
                              category
                            ].map((p, idx) => (
                              <tr
                                key={`${category}-${idx}`}
                              >
                                <td style={tdStyle}>
                                  {p.productName}
                                </td>

                                <td style={tdStyle}>
                                  {getSerialNumber(p)}
                                </td>

                                <td style={tdStyle}>
                                  {p.quantity}
                                </td>

                                <td style={tdStyle}>
                                  ₹{p.price}
                                </td>

                                <td style={tdStyle}>
                                  ₹{Number(p.profit || 0).toFixed(2)}
                                </td>

                                <td style={tdStyle}>
                                  ₹
                                  {(
                                    p.quantity * p.price
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Generate PDF Button */}
              <button
                style={{
                  marginTop: '1rem',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => generatePDF(order._id)}
              >
                Generate PDF
              </button>
            </div>
          );
        })
      ) : (
        <p
          style={{
            textAlign: 'center',
            color: '#777',
          }}
        >
          You have no orders yet.
        </p>
      )}
    </div>
  );
};

// Table Styles
const thStyle: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

export default MyOrder;
