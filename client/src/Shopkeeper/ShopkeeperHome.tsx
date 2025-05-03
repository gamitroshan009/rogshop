import { useState, useEffect } from 'react';
import ShopkeeperAddProduct from './ShopkeeperAddProduct'; // Import the Add Product form component
import ShopkeeperDashboard from './ShopkeeperDashboard'; // Import the Dashboard component
import ShopkeeperOrder from './ShopkeeperOrder'; // Import the ShopkeeperOrder component
import ManageProducts from './ManageProducts'; // Import the ManageProducts component

const ShopkeeperHome = () => {
  const [shopkeeperName, setShopkeeperName] = useState('Shopkeeper'); // Default name
  const [shopkeeperEmail, setShopkeeperEmail] = useState(''); // State to store shopkeeper email

  // Fetch shopkeeper name and email from localStorage
  useEffect(() => {
    const name = localStorage.getItem('shopkeeperName');
    const email = localStorage.getItem('shopkeeperEmail');
    if (name) {
      setShopkeeperName(name);
    }
    if (email) {
      setShopkeeperEmail(email);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard'); // Manage active tab state

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ShopkeeperDashboard />; // Render the Dashboard to display products
      case 'add-product':
        return <ShopkeeperAddProduct />; // Render the Add Product form
      case 'orders':
        return <ShopkeeperOrder />; // Render the ShopkeeperOrder component
      case 'manage-products':
        return <ManageProducts />; // Render the ManageProducts component
      default:
        return <p>Select a tab to view content.</p>;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>{shopkeeperName}'s Dashboard</h1>
        <span style={styles.email}>{shopkeeperEmail}</span>
      </header>

      <div style={styles.main}>
        {/* List Box for Navigation */}
        <div style={styles.listBoxContainer}>
          <label htmlFor="navigationSelect" style={styles.listBoxLabel}>
            Navigate:
          </label>
          <select
            id="navigationSelect"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            style={styles.listBox}
          >
            <option value="dashboard">Dashboard</option>
            <option value="add-product">Add Product</option>
            <option value="orders">Orders</option>
            <option value="manage-products">Manage Products</option>
          </select>
        </div>

        {/* Main Content */}
        <main style={styles.content}>{renderContent()}</main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: '100vh',
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.5rem',
  },
  email: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  main: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column' as 'column', // Adjusted for list box
  },
  listBoxContainer: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ddd',
  },
  listBoxLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  listBox: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  content: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#fff',
  },
};

export default ShopkeeperHome;