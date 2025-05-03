import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Bill from './pages/Bill';
import Admin from './Admin/Admin'; // Import the Admin page
import Home from './User/Home'; // Import the Home component
import Register from './pages/Register'; // Import the Register page
import Login from './pages/Login'; // Import the Login page
import AddShopkeeper from './Admin/AddShopkeeper'; // Import the AddShopkeeper page
import ShopkeeperLogin from './Shopkeeper/ShopkeeperLogin'; // Import the ShopkeeperLogin page
import ShopkeeperHome from './Shopkeeper/ShopkeeperHome'; // Import the ShopkeeperHome component
import ShopkeeperAddProduct from './Shopkeeper/ShopkeeperAddProduct'; // Import the ShopkeeperAddProduct component
import ShopkeeperDashboard from './Shopkeeper/ShopkeeperDashboard'; // Import the ShopkeeperDashboard component
import ShopView from './User/ShopView'; // Import the ShopView component
import Cart from './User/Cart'; // Import the Cart component
import MyOrder from './User/MyOrder'; // Import the MyOrder component
import ShopkeeperOrder from './Shopkeeper/ShopkeeperOrder'; // Import the ShopkeeperOrder component
import AdminDashboard from './Admin/AdminDashboard'; // Import the AdminDashboard component
import ManageProducts from './Shopkeeper/ManageProducts'; // Import ManageProducts

const App = () => {
  return (
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
        <Route path="/shop/:shopId" element={<ShopView />} /> {/* Route for ShopView */}
        <Route path="/cart" element={<Cart />} /> {/* Route for Cart */}
        <Route path="/orders" element={<MyOrder />} /> {/* Route for MyOrder */}
        <Route path="/shopkeeper-orders" element={<ShopkeeperOrder />} /> {/* Route for ShopkeeperOrder */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Route for AdminDashboard */}
        <Route path="/manage-products" element={<ManageProducts />} /> {/* Add Manage Products Route */}
      </Routes>
    </Router>
  );
};

export default App;