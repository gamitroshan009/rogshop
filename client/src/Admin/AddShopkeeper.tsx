import { useState } from 'react';
import axios from 'axios';

interface FormData {
  shopName: string;
  email: string;
  password: string;
  address: string;
}

const AddShopkeeper = () => {
  const [formData, setFormData] = useState<FormData>({
    shopName: '',
    email: '',
    password: '',
    address: '',
  });
  const [message, setMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<{ message: string }>(
        'https://rogshop.onrender.com/api/shopkeepers',
        formData
      );
      setMessage(response.data.message);
      setFormData({ shopName: '', email: '', password: '', address: '' });
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add Shopkeeper</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="shopName"
          placeholder="Shop Name"
          value={formData.shopName}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Add Shopkeeper
        </button>
      </form>
      {message && (
        <p
          style={{
            ...styles.message,
            color: message.includes('success') ? 'green' : 'red',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center' as 'center',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  message: {
    textAlign: 'center' as 'center',
    marginTop: '1rem',
  },
};

export default AddShopkeeper;