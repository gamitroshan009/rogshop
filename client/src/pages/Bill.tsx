import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BillProduct {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
}

const Bill = () => {
  const [bill, setBill] = useState<BillProduct[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('bill');
    if (stored) setBill(JSON.parse(stored));
  }, []);

  const updateBill = (updated: BillProduct[]) => {
    setBill(updated);
    localStorage.setItem('bill', JSON.stringify(updated));
  };

  const changeQty = (index: number, amount: number) => {
    const updated = [...bill];
    updated[index].quantity += amount;
    if (updated[index].quantity <= 0) updated.splice(index, 1);
    updateBill(updated);
  };

  const removeProduct = (index: number) => {
    const updated = [...bill];
    updated.splice(index, 1);
    updateBill(updated);
  };

  const totalAmount = bill.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>🧾 Bill</h2>
      
      <table width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Price (₹)</th>
            <th style={thStyle}>Quantity</th>
            <th style={thStyle}>Total (₹)</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {bill.map((item, index) => (
            <tr key={index}>
              <td style={tdStyle}>{item.name}</td>
              <td style={tdStyle}>₹{item.price}</td>
              <td style={tdStyle}>
                <button onClick={() => changeQty(index, -1)} style={qtyBtn}>-</button>
                <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                <button onClick={() => changeQty(index, 1)} style={qtyBtn}>+</button>
              </td>
              <td style={tdStyle}>₹{item.price * item.quantity}</td>
              <td style={tdStyle}>
                <button onClick={() => removeProduct(index)} style={removeBtn}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {bill.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Total Amount: ₹{totalAmount}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button onClick={() => navigate('/add')} style={addBtn}>
          ➕ Add More Products to Bill
        </button>
      </div>
    </div>
  );
};

const thStyle = {
  padding: '10px',
  borderBottom: '2px solid #ccc',
  textAlign: 'left' as const,
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee',
};

const qtyBtn = {
  padding: '4px 10px',
  fontSize: '1rem',
  cursor: 'pointer',
};

const removeBtn = {
  backgroundColor: 'red',
  color: 'white',
  padding: '5px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const addBtn = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};

export default Bill;
