
import React from 'react';

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
  email?: string;
}

interface Props {
  order: Order;
}



const OrderPDF: React.FC<Props> = ({ order }) => {

  const totalPrice = order.products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );

  const totalQuantity = order.products.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  const totalProfit = order.products.reduce(
    (sum, p) => sum + (p.profit || 0) * p.quantity,
    0
  );

  // Category Wise Sorting (Category name hidden)
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

  const sortedCategories = Object.keys(groupedProducts).sort(
    (a, b) => a.localeCompare(b)
  );

  const sortedProducts = sortedCategories.flatMap(
    category => groupedProducts[category]
  );

  // Split products into two sides
  const middleIndex = Math.ceil(sortedProducts.length / 2);

  const leftProducts = sortedProducts.slice(0, middleIndex);
  const rightProducts = sortedProducts.slice(middleIndex);



  const headerCell: React.CSSProperties = {
    border: '1px solid #333',
    padding: '7px 4px',
    fontWeight: 'bold',
    backgroundColor: '#eaf4ff',
    textAlign: 'center',
    fontSize: '11px',
  };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '8px 4px',
    fontSize: '10px',
    textAlign: 'center',
    wordBreak: 'break-word',
  };

  const renderProduct = (product?: Product, serialNumber?: number) => (
    <>
      <td style={cellStyle}>
        {serialNumber ?? ''}
      </td>
      <td style={{ ...cellStyle, textAlign: 'left' }}>
        {product?.productName || ''}
      </td>

      <td style={cellStyle}>
        {product?.quantity ?? ''}
      </td>

      <td style={cellStyle}>
        {product ? `₹${Number(product.price).toFixed(2)}` : ''}
      </td>

      <td style={cellStyle}>
        {product ? `₹${Number(product.profit || 0).toFixed(2)}` : ''}
      </td>

      <td style={cellStyle}>
        {product
          ? `₹${(product.price * product.quantity).toFixed(2)}`
          : ''}
      </td>
    </>
  );

  return (
    <div>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }

            body {
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .no-print {
              display: none !important;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              break-inside: avoid;
            }
          }
        `}
      </style>

      <div
        id={`pdf-content-${order._id}`}
        style={{
          maxWidth: '900px',
          margin: 'auto',
          backgroundColor: '#fff',
          padding: '25px',
          fontFamily: '"Segoe UI", sans-serif',
          color: '#333',
          border: '1px solid #ddd',
          boxSizing: 'border-box',
        }}
      >

        {/* Header */}
        <div
          style={{
            borderBottom: '3px solid #007bff',
            paddingBottom: '15px',
            marginBottom: '20px',
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

          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            <strong>Invoice ID:</strong> {order._id}
          </p>
        </div>

        {/* Order Information */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          <div>
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

          <div style={{ textAlign: 'right', maxWidth: '300px' }}>
            <p><strong>Delivery Address:</strong></p>
            <p>{order.address}</p>
          </div>
        </div>

        
{/* Two Separate Product Tables */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    alignItems: 'start',
  }}
>
  {/* Left Table */}
  <table
    style={{
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    }}
  >
    <thead>
      <tr>
        <th style={headerCell}>Sr. No.</th>
        <th style={headerCell}>Product Name</th>
        <th style={headerCell}>Qty</th>
        <th style={headerCell}>Price</th>
        <th style={headerCell}>Profit</th>
        <th style={headerCell}>Total</th>
      </tr>
    </thead>

    <tbody>
      {leftProducts.map((product, index) => (
        <tr key={index}>
          {renderProduct(product, index + 1)}
        </tr>
      ))}
    </tbody>
  </table>

  {/* Right Table */}
  <table
    style={{
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    }}
  >
    <thead>
      <tr>
        <th style={headerCell}>Sr. No.</th>
        <th style={headerCell}>Product Name</th>
        <th style={headerCell}>Qty</th>
        <th style={headerCell}>Price</th>
        <th style={headerCell}>Profit</th>
        <th style={headerCell}>Total</th>
      </tr>
    </thead>

    <tbody>
      {rightProducts.map((product, index) => (
        <tr key={index}>
          {renderProduct(product, middleIndex + index + 1)}
        </tr>
      ))}
    </tbody>
  </table>
</div>

        {/* Grand Total */}
        <div
          style={{
            marginTop: '25px',
            padding: '14px',
            backgroundColor: '#eaf4ff',
            border: '1px solid #007bff',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          <div>
            <div>GRAND TOTAL</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#555' }}>
              TOTAL PROFIT: ₹{totalProfit.toFixed(2)}
            </div>
          </div>

          <span style={{ color: '#007bff' }}>₹{totalPrice.toFixed(2)}</span>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '30px',
            fontSize: '12px',
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

export default OrderPDF;
