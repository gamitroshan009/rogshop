import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('user');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value;
    setSelectedOption(option);
    if (option === 'register') navigate('/register');
    else if (option === 'shopkeeper') navigate('/shopkeeperlogin');
    // 'user' will stay on the login form
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email, password } = formData;

      if (email === 'roshan@gmail.com' && password === '9282@bca') {
        setLoading(false);
        navigate('/admin');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userEmail', response.data.email);

      setLoading(false);
      navigate('/home');
    } catch (error: any) {
      setLoading(false);
      setMessage(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 600px) {
            .login-form {
              width: 90% !important;
              margin: auto !important;
            }
          }
        `}
      </style>
      <div className="login-form" style={styles.container}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
          </div>
        ) : (
          <div style={styles.fadeIn}>
            <h2 style={styles.heading}>Login</h2>

            <select value={selectedOption} onChange={handleSelectChange} style={styles.select}>
              <option value="user">User Login</option>
              <option value="register">Register</option>
              <option value="shopkeeper">Shopkeeper Login</option>
            </select>

            {selectedOption === 'user' && (
              <form onSubmit={handleSubmit}>
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
                <button type="submit" style={styles.button}>
                  Login
                </button>
              </form>
            )}

            {message && <p style={{ ...styles.message, color: 'red' }}>{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
    padding: '1rem',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    animation: 'fadeIn 0.6s ease-in-out',
  },
  fadeIn: {
    animation: 'fadeIn 0.6s ease-in-out',
  },
  heading: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  input: {
    width: '100%',
    padding: '0.7rem',
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
    textAlign: 'center' as const,
    marginTop: '1rem',
  },
  select: {
    width: '100%',
    padding: '0.7rem',
    marginBottom: '1.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#f8f8f8',
    fontSize: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default Login;
