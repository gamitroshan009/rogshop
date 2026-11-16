
import React from 'react';

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
  email?: string;
}

interface Props {
  order: Order;
}

const OrderPDF: React.FC<Props> = ({ order }) => {

  // Grand Total
  const totalPrice = order.products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );

  // Total Quantity
  const totalQuantity = order.products.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  // Group Products Category Wise
  const groupedProducts = order.products.reduce<
    Record<string, Product[]>
  >((groups, product) => {
    const category = product.category?.trim() || 'Other';

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(product);

    return groups;
  }, {});

  // Sort Categories
  const sortedCategories = Object.keys(groupedProducts).sort(
    (a, b) => a.localeCompare(b)
  );

  return (
    <div>
      <style>
        {`
          @media print {
            body {
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .no-print {
              display: none;
            }

            .category-row {
              break-after: avoid;
            }

            tr {
              break-inside: avoid;
            }
          }
        `}
      </style>

      {/* Invoice Container */}
      <div
        id={`pdf-content-${order._id}`}
        style={{
          maxWidth: '900px',
          margin: 'auto',
          backgroundColor: '#fff',
          padding: '30px',
          fontFamily: '"Segoe UI", sans-serif',
          color: '#333',
          border: '1px solid #ddd',
        }}
      >

        {/* Header */}
        <div
          style={{
            borderBottom: '3px solid #007bff',
            paddingBottom: '15px',
            marginBottom: '25px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              color: '#007bff',
            }}
          >
            {order.shopName}
          </h1>

          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            <strong>Invoice ID:</strong> {order._id}
          </p>
        </div>

        {/* Order Information */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: '25px',
            gap: '15px',
          }}
        >
          <div style={{ fontSize: '14px' }}>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <p>
              <strong>Email:</strong> {order.email || 'N/A'}
            </p>

            <p>
              <strong>Total Quantity:</strong> {totalQuantity}
            </p>
          </div>

          <div
            style={{
              fontSize: '14px',
              textAlign: 'right',
              maxWidth: '300px',
            }}
          >
            <p><strong>Delivery Address:</strong></p>
            <p>{order.address}</p>
          </div>
        </div>

        {/* Category Wise Product Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#eaf4ff' }}>
              <th style={cellHeaderStyle}>Product Name</th>
              <th style={cellHeaderStyle}>Quantity</th>
              <th style={cellHeaderStyle}>Unit Price</th>
              <th style={cellHeaderStyle}>Total</th>
            </tr>
          </thead>

          <tbody>
            {sortedCategories.map((category) => {

              const products = groupedProducts[category];

              const categoryTotal = products.reduce(
                (sum, p) => sum + p.quantity * p.price,
                0
              );

              return (
                <React.Fragment key={category}>

                  {/* Category Heading */}
                  <tr className="category-row">
                    <td
                      colSpan={4}
                      style={{
                        padding: '12px',
                        backgroundColor: '#e9ecef',
                        color: '#007bff',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        border: '1px solid #ddd',
                        textAlign: 'left',
                      }}
                    >
                      {category}
                    </td>
                  </tr>

                  {/* Products */}
                  {products.map((p, index) => (
                    <tr key={`${category}-${index}`}>
                      <td style={cellStyle}>
                        {p.productName}
                      </td>

                      <td style={cellStyle}>
                        {p.quantity}
                      </td>

                      <td style={cellStyle}>
                        ₹{Number(p.price).toFixed(2)}
                      </td>

                      <td style={cellStyle}>
                        ₹{(p.price * p.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Category Subtotal */}
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        ...cellStyle,
                        textAlign: 'right',
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      {category} Subtotal
                    </td>

                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      ₹{categoryTotal.toFixed(2)}
                    </td>
                  </tr>

                </React.Fragment>
              );
            })}

            {/* Grand Total */}
            <tr>
              <td
                colSpan={3}
                style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  backgroundColor: '#eaf4ff',
                }}
              >
                GRAND TOTAL
              </td>

              <td
                style={{
                  ...cellStyle,
                  fontWeight: 'bold',
                  fontSize: '15px',
                  color: '#007bff',
                  backgroundColor: '#eaf4ff',
                }}
              >
                ₹{totalPrice.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '40px',
            fontSize: '13px',
            color: '#888',
            borderTop: '1px solid #ddd',
            paddingTop: '15px',
          }}
        >
          <p>Thank you for your purchase!</p>
          <strong>@roshanshopforall</strong>
        </div>

      </div>
    </div>
  );
};

// Table Styles
const cellStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '10px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const cellHeaderStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 'bold',
  backgroundColor: '#eaf4ff',
  borderBottom: '2px solid #007bff',
};

export default OrderPDF;
