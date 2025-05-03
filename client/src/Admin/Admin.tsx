import { useState } from 'react';
import AddShopkeeper from './AddShopkeeper';
import AdminDashboard from './AdminDashboard';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'add-shopkeeper':
        return <AddShopkeeper />;
      default:
        return <p>Select a tab to view content.</p>;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <div style={styles.container}>
      {/* Header with Hamburger */}
      <header style={styles.header}>
        <span style={styles.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
          &#9776;
        </span>
        <h1 style={styles.headerTitle}>Admin Panel</h1>
      </header>

      <div style={styles.main}>
        {/* Sidebar */}
        <aside
          style={{
            ...styles.sidebar,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSidebarOpen(false);
            }}
            style={{
              ...styles.sidebarButton,
              backgroundColor: activeTab === 'dashboard' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'dashboard' ? '#fff' : '#000',
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('add-shopkeeper');
              setSidebarOpen(false);
            }}
            style={{
              ...styles.sidebarButton,
              backgroundColor: activeTab === 'add-shopkeeper' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'add-shopkeeper' ? '#fff' : '#000',
            }}
          >
            Add Shopkeeper
          </button>
          <button onClick={handleLogout} style={{ ...styles.sidebarButton, backgroundColor: '#dc3545', color: '#fff' }}>
            Logout
          </button>
        </aside>

        {/* Content */}
        <main style={styles.content}>{renderContent()}</main>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  hamburger: {
    fontSize: '1.5rem',
    cursor: 'pointer',
    marginRight: '1rem',
    display: 'block',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.5rem',
  },
  main: {
    display: 'flex',
    flex: 1,
    position: 'relative',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '250px',
    height: '100%',
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRight: '1px solid #ddd',
    zIndex: 1000,
    transition: 'transform 0.3s ease',
  },
  sidebarButton: {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    textAlign: 'left',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  content: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#fff',
    marginLeft: '0px',
    width: '100%',
  },
};

export default Admin;
