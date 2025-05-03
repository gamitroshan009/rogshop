import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: '#f8f9fa',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo on the left */}
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#007bff' }}>
        ShopLogo
      </div>

      {/* Centered links styled as buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/home" style={linkStyle}>
          Home
        </Link>
        <Link to="/products" style={linkStyle}>
          Products
        </Link>
        <Link to="/cart" style={linkStyle}>
          Cart
        </Link>
        <Link to="/login" style={linkStyle}>
          Login
        </Link>
      </div>
    </nav>
  );
};

// Button-like link styles
const linkStyle = {
  textDecoration: 'none',
  padding: '0.5rem 1rem',
  backgroundColor: '#007bff',
  color: '#fff',
  borderRadius: '5px',
  fontWeight: 'bold',
  transition: 'background-color 0.3s',
  textAlign: 'center' as 'center', // Explicitly cast textAlign
};

export default Navbar;
