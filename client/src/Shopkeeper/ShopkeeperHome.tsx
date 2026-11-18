
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ShopkeeperAddProduct from './ShopkeeperAddProduct';
import ShopkeeperDashboard from './ShopkeeperDashboard';
import ShopkeeperOrder from './ShopkeeperOrder';
import ManageProducts from './ManageProducts';

const ShopkeeperHome = () => {
  const [shopkeeperName, setShopkeeperName] = useState('Shopkeeper');
  const [shopkeeperEmail, setShopkeeperEmail] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('shopkeeperName');
    const email = localStorage.getItem('shopkeeperEmail');

    if (name) setShopkeeperName(name);
    if (email) setShopkeeperEmail(email);
  }, []);

  const firstLetter = shopkeeperName.charAt(0).toUpperCase();

  // SIDEBAR NAVIGATION
  const handleMenuClick = (option: string) => {
    setActiveTab(option);
    setShowUserMenu(false);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('shopkeeperId');
    localStorage.removeItem('shopkeeperName');
    localStorage.removeItem('shopkeeperEmail');

    navigate('/shopkeeperlogin');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'add-product', label: 'Add Product', icon: '＋' },
    { id: 'orders', label: 'Orders', icon: '▤' },
    { id: 'manage-products', label: 'Manage Products', icon: '⚙' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ShopkeeperDashboard />;

      case 'add-product':
        return <ShopkeeperAddProduct />;

      case 'orders':
        return <ShopkeeperOrder />;

      case 'manage-products':
        return <ManageProducts />;

      default:
        return <ShopkeeperDashboard />;
    }
  };

  return (
    <div style={styles.container}>

      {/* SIDEBAR OVERLAY */}
      <div
        onClick={() => setShowUserMenu(false)}
        style={{
          ...styles.overlay,
          opacity: showUserMenu ? 1 : 0,
          visibility: showUserMenu ? 'visible' : 'hidden',
        }}
      />

      {/* LEFT SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          transform: showUserMenu
            ? 'translateX(0)'
            : 'translateX(-100%)',
        }}
      >

        {/* SIDEBAR HEADER */}
        <div style={styles.sidebarHeader}>

          <div style={styles.avatarLarge}>
            {firstLetter || 'S'}
          </div>

          <h4 style={{ margin: '12px 0 5px' }}>
            My Account
          </h4>

          <p style={styles.emailText}>
            {shopkeeperEmail || shopkeeperName}
          </p>

        </div>

        {/* SIDEBAR MENU */}
        <div style={styles.menuList}>

          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.menuItem,
                ...(activeTab === item.id
                  ? styles.activeMenuItem
                  : {}),
              }}
              onClick={() => handleMenuClick(item.id)}
            >
              <span style={styles.menuIcon}>
                {item.icon}
              </span>

              {item.label}
            </div>
          ))}

          <div style={styles.menuDivider} />

          {/* LOGOUT */}
          <div
            style={{
              ...styles.menuItem,
              color: '#e53935',
            }}
            onClick={handleLogout}
          >
            <span style={styles.menuIcon}>🚪</span>
            Logout
          </div>

        </div>

        {/* SIDEBAR FOOTER */}
        <div style={styles.sidebarFooter}>
          ROG SHOP
        </div>

      </div>

      {/* HEADER */}
      <header style={styles.header}>

        <div>
          <h3 style={styles.headerTitle}>
            {shopkeeperName}'s Dashboard
          </h3>

          <p style={styles.subtitle}>
            Manage your shop easily
          </p>
        </div>

        {/* PROFILE CIRCLE */}
        <div
          style={styles.profileCircle}
          onClick={() => setShowUserMenu(!showUserMenu)}
          title="Open Profile Menu"
        >
          {firstLetter || 'S'}
        </div>

      </header>

      {/* PAGE CONTENT */}
      <main style={styles.content}>
        {renderContent()}
      </main>

    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {

  container: {
    minHeight: '100vh',
    background: '#f4f7fb',
    position: 'relative',
  },

  header: {
    background: 'linear-gradient(135deg, #0756c9, #1685ed)',
    color: '#fff',
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '0 0 20px 20px',
    boxShadow: '0 5px 18px rgba(0,80,180,0.18)',
    position: 'relative',
    zIndex: 10,
  },

  headerTitle: {
    fontSize: '22px',
    fontWeight: 700,
    margin: 0,
  },

  subtitle: {
    fontSize: '13px',
    opacity: 0.85,
    margin: '5px 0 0',
  },

  profileCircle: {
    width: '48px',
    height: '48px',
    minWidth: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ffffff, #dceeff)',
    color: '#0866d6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '21px',
    fontWeight: 700,
    cursor: 'pointer',
    border: '2px solid white',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 999,
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
  },

  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    maxWidth: '80vw',
    height: '100vh',
    backgroundColor: '#fff',
    zIndex: 1000,
    boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.35s ease',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },

  sidebarHeader: {
    padding: '35px 20px 25px',
    background: 'linear-gradient(135deg, #007bff, #00c6ff)',
    color: '#fff',
    textAlign: 'center',
  },

  avatarLarge: {
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    color: '#007bff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 auto',
    border: '3px solid rgba(255,255,255,0.7)',
  },

  emailText: {
    fontSize: '13px',
    opacity: 0.9,
    wordBreak: 'break-all',
  },

  menuList: {
    padding: '15px 0',
  },

  menuItem: {
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#333',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },

  activeMenuItem: {
    background: '#eaf3ff',
    color: '#075fc9',
    borderRight: '4px solid #075fc9',
  },

  menuIcon: {
    width: '22px',
    fontSize: '19px',
    textAlign: 'center',
  },

  menuDivider: {
    height: '1px',
    backgroundColor: '#eee',
    margin: '10px 20px',
  },

  sidebarFooter: {
    marginTop: 'auto',
    padding: '20px',
    textAlign: 'center',
    color: '#999',
    fontSize: '13px',
    fontWeight: 'bold',
  },

  content: {
    padding: '20px',
  },

};

export default ShopkeeperHome;
