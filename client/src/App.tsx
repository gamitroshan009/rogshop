import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Bill from './pages/Bill';
import Admin from './Admin/Admin';
import Home from './User/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AddShopkeeper from './Admin/AddShopkeeper';
import ShopkeeperLogin from './Shopkeeper/ShopkeeperLogin';
import ShopkeeperHome from './Shopkeeper/ShopkeeperHome';
import ShopkeeperAddProduct from './Shopkeeper/ShopkeeperAddProduct';
import ShopkeeperDashboard from './Shopkeeper/ShopkeeperDashboard';
import ShopView from './User/ShopView';
import Cart from './User/Cart';
import MyOrder from './User/MyOrder';
import ShopkeeperOrder from './Shopkeeper/ShopkeeperOrder';
import AdminDashboard from './Admin/AdminDashboard';
import ManageProducts from './Shopkeeper/ManageProducts';

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/add-product" element={<ShopkeeperAddProduct />} />
          <Route path="/bill" element={<Bill />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-shopkeeper" element={<AddShopkeeper />} />
          <Route path="/shopkeeperlogin" element={<ShopkeeperLogin />} />
          <Route path="/shopkeeperhome" element={<ShopkeeperHome />} />
          <Route path="/shopkeeper-dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/shop/:shopId" element={<ShopView />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<MyOrder />} />
          <Route path="/shopkeeper-orders" element={<ShopkeeperOrder />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/manage-products" element={<ManageProducts />} />
        </Routes>
      </Router>

      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontSize: '16px',
            cursor: 'pointer',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          📲 Install App
        </button>
      )}
    </>
  );
};

export default App;
