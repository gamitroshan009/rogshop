import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the Product interface
interface Product {
  _id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

const ShopkeeperDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]); // Type the products state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get shopkeeper details from localStorage
  const shopkeeperId = localStorage.getItem('shopkeeperId'); // Assuming shopkeeperId is stored in localStorage during login
  const shopName = localStorage.getItem('shopkeeperName'); // Assuming shopName is stored in localStorage during login

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(
          `http://localhost:5000/api/products?shopkeeperId=${shopkeeperId}&shopName=${shopName}`
        );
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopkeeperId, shopName]);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{shopName}'s Products</h2>
      <div style={styles.productList}>
        {products.map((product) => (
          <div key={product._id} style={styles.productCard}>
            <img
              src={`data:image/jpeg;base64,${product.productImage}`} // Display Base64 image
              alt={product.productName}
              style={styles.productImage}
            />
            <h3 style={styles.productName}>{product.productName}</h3>
            <p style={styles.productDetail}>
              <strong>Price:</strong> ₹{product.price}
            </p>
            <p style={styles.productDetail}>
              <strong>Quantity:</strong> {product.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    textAlign: 'center' as 'center', // Explicitly cast textAlign
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '2rem',
    color: '#007bff',
    marginBottom: '1rem',
  },
  productList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  productCard: {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'left' as 'left', // Explicitly cast textAlign
  },
  productImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover' as 'cover', // Explicitly cast objectFit
    borderRadius: '5px',
    marginBottom: '1rem',
  },
  productName: {
    fontSize: '1.2rem',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  productDetail: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '0.5rem',
  },
};

export default ShopkeeperDashboard;