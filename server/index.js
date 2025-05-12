const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
// For password hashing
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const multer = require('multer'); // For file uploads
const path = require('path'); // For handling file paths
const Product = require('./models/Product'); // Import the Product model
const User = require('./models/User'); // Assuming User model is in 'models/User.js'
const Shopkeeper = require('./models/Shopkeeper'); // Import the Shopkeeper model
const ShopkeeperProducts = require('./models/ShopkeeperProducts'); // Import the ShopkeeperProducts model
const ProductsCategories = require('./models/ProductsCategories'); // Import the ProductsCategories model
const Cart = require('./models/Cart'); // Import the Cart model
const Order = require('./models/Order'); // Import the Order model
const { v4: uuidv4 } = require('uuid'); // Import uuid

// Define Category model
const Category = mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
}));

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

// Configure multer for file uploads (use memory storage for Base64 conversion)
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect('mongodb+srv://roshangamit009:92827262@cluster0.vvp3jit.mongodb.net/shivdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Add a new product with image upload (Base64)
app.post('/api/products', upload.single('productImage'), async (req, res) => {
  const { shopkeeperId, shopName, productName, price, quantity, category } = req.body;

  if (!shopkeeperId || !shopName || !productName || !price || !quantity || !category || !req.file) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Convert the uploaded image to Base64
    const productImage = req.file.buffer.toString('base64');

    const newProduct = new ShopkeeperProducts({
      shopkeeperId,
      shopName,
      productImage, // Save Base64 string in the database
      productName,
      price,
      quantity,
      category, // Save category in the database
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

// Get products by shopkeeperId, shopName, or productName
app.get('/api/products', async (req, res) => {
  const { shopkeeperId, shopName, productName } = req.query;

  const query = {};
  if (shopkeeperId) query.shopkeeperId = shopkeeperId;
  if (shopName) query.shopName = shopName;
  if (productName) query.productName = productName;

  try {
    const products = await ShopkeeperProducts.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Update a product by ID
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { productName, price, quantity } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { productName, price, quantity },
      { new: true }
    );
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Update a product by productName
app.put('/api/products', async (req, res) => {
  const { productName, newProductName, price, quantity } = req.body;

  if (!productName || !newProductName || !price || !quantity) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updatedProduct = await ShopkeeperProducts.findOneAndUpdate(
      { productName }, // Find the product by productName
      { productName: newProductName, price: Number(price), quantity: Number(quantity) }, // Update fields
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Update a product by shopName and productName in ShopkeeperProducts table
app.put('/api/products', async (req, res) => {
  const { shopName, productName, newProductName, price, quantity } = req.body;

  if (!shopName || !productName || !newProductName || !price || !quantity) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updatedProduct = await ShopkeeperProducts.findOneAndUpdate(
      { shopName, productName }, // Find the product by shopName and productName
      { productName: newProductName, price: Number(price), quantity: Number(quantity) }, // Update fields
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete a product by ID
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Delete a product by productName
app.delete('/api/products', async (req, res) => {
  const { productName } = req.body;

  if (!productName) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  try {
    const deletedProduct = await ShopkeeperProducts.findOneAndDelete({ productName });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Delete a product by shopName and productName
app.delete('/api/products', async (req, res) => {
  const { shopName, productName } = req.body;

  if (!shopName || !productName) {
    return res.status(400).json({ message: 'Shop name and product name are required' });
  }

  try {
    const deletedProduct = await ShopkeeperProducts.findOneAndDelete({ shopName, productName });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Add a new category
app.post('/api/categories', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json({ message: 'Category added successfully', category: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Update a category
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
    res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userId: uuidv4(), // Generate a unique userId
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser.userId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login a user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // Find user by email
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Send email and username in the response
    res.status(200).json({
      token: 'your_generated_token', // Replace with actual token logic
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new shopkeeper
app.post('/api/shopkeepers', async (req, res) => {
  const { shopName, email, password, address } = req.body;

  if (!shopName || !email || !password || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingShopkeeper = await Shopkeeper.findOne({ email });
    if (existingShopkeeper) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newShopkeeper = new Shopkeeper({ shopName, email, password: hashedPassword, address });
    await newShopkeeper.save();

    res.status(201).json({ message: 'Shopkeeper added successfully', shopkeeper: newShopkeeper });
  } catch (error) {
    console.error('Error adding shopkeeper:', error);
    res.status(500).json({ message: 'Error adding shopkeeper', error: error.message });
  }
});

// Get all shopkeepers
app.get('/api/shopkeepers', async (req, res) => {
  try {
    const shopkeepers = await Shopkeeper.find();
    res.status(200).json(shopkeepers);
  } catch (error) {
    console.error('Error fetching shopkeepers:', error);
    res.status(500).json({ message: 'Error fetching shopkeepers', error: error.message });
  }
});

// Shopkeeper login
app.post('/api/auth/shopkeeper-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const shopkeeper = await Shopkeeper.findOne({ email });
    if (!shopkeeper) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, shopkeeper.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Shopkeeper login successful',
      shopkeeperId: shopkeeper._id, // Include shopkeeper ID
      shopName: shopkeeper.shopName, // Include shopkeeper name
    });
  } catch (error) {
    console.error('Error logging in shopkeeper:', error);
    res.status(500).json({ message: 'Error logging in shopkeeper', error: error.message });
  }
});

// Add categories for a shop
app.post('/api/products-categories', async (req, res) => {
  const { shopkeeperId, shopName, categories } = req.body;

  if (!shopkeeperId || !shopName || !categories || !Array.isArray(categories)) {
    return res.status(400).json({ message: 'Shopkeeper ID, Shop Name, and categories are required' });
  }

  try {
    // Check if categories already exist for the shop
    let shopCategories = await ProductsCategories.findOne({ shopkeeperId, shopName });

    if (shopCategories) {
      // Update existing categories
      shopCategories.categories = [...new Set([...shopCategories.categories, ...categories])]; // Merge and remove duplicates
      await shopCategories.save();
    } else {
      // Create new categories
      shopCategories = new ProductsCategories({ shopkeeperId, shopName, categories });
      await shopCategories.save();
    }

    res.status(201).json({ message: 'Categories added successfully', shopCategories });
  } catch (error) {
    console.error('Error adding categories:', error);
    res.status(500).json({ message: 'Error adding categories', error: error.message });
  }
});

// Get categories for a shop
app.get('/api/products-categories', async (req, res) => {
  const { shopkeeperId, shopName } = req.query;

  if (!shopkeeperId || !shopName) {
    return res.status(400).json({ message: 'Shopkeeper ID and Shop Name are required' });
  }

  try {
    const shopCategories = await ProductsCategories.findOne({ shopkeeperId, shopName });
    res.status(200).json(shopCategories || { categories: [] });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Add a product to the cart
app.post('/api/cart', async (req, res) => {
  const { userEmail, shopId, shopName, product, quantity, totalBill } = req.body;

  if (!userEmail || !shopId || !shopName || !product || !quantity || !totalBill) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newCartItem = new Cart({
      userEmail,
      shopId,
      shopName,
      product,
      quantity,
      totalBill,
    });

    await newCartItem.save();
    res.status(201).json({ message: 'Product added to cart', cartItem: newCartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// Get cart items for a user by email
app.get('/api/cart', async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const cartItems = await Cart.find({ userEmail });
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Error fetching cart items', error: error.message });
  }
});

// Remove an item from the cart
app.delete('/api/cart/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Cart.findByIdAndDelete(id);
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  const { shopId, shopName, email, mobileNo, address, products } = req.body;

  if (!shopId || !shopName || !email || !mobileNo || !address || !products || products.length === 0) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Fetch product categories and include them in the order
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        const dbProduct = await ShopkeeperProducts.findOne({
          shopkeeperId: shopId,
          shopName,
          productName: product.productName,
        });

        if (!dbProduct) {
          throw new Error(`Product "${product.productName}" not found`);
        }

        return {
          productName: product.productName,
          quantity: product.quantity,
          price: product.price,
          category: dbProduct.category, // Include the category from the database
        };
      })
    );

    // Create a new order
    const newOrder = new Order({
      shopId,
      shopName,
      email,
      mobileNo,
      address,
      products: productsWithCategories, // Use the products with categories
    });

    await newOrder.save();

    // Delete items from the cart for the user
    await Cart.deleteMany({ userEmail: email });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Get orders for a specific user by email
app.get('/api/orders', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const orders = await Order.find({ email }); // Fetch orders by user email
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});



// Get all orders (Admin Dashboard)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
});


// Get orders for a specific shop by shopName and shopId
app.get('/api/orders/shop', async (req, res) => {
  const { shopName, shopId } = req.query;

  if (!shopName || !shopId) {
    return res.status(400).json({ message: 'Shop Name and Shop ID are required' });
  }

  try {
    const orders = await Order.find({ shopName, shopId }); // Fetch orders by shopName and shopId
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});



// Update product stock when an order is placed
app.put('/api/products/update-stock', async (req, res) => {
  const { products } = req.body;

  try {
    for (const product of products) {
      const dbProduct = await Product.findOne({ productName: product.productName });
      if (dbProduct.quantity < product.quantity) {
        return res.status(400).json({ message: `Product "${product.productName}" is out of stock` });
      }
      dbProduct.quantity -= product.quantity;
      await dbProduct.save();
    }
    res.status(200).json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { received } = req.body;

  if (!received) {
    return res.status(400).json({ message: 'Order status is required' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, { received }, { new: true });
    res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

app.delete('/api/delete-category', async (req, res) => {
  const { shopkeeperId, shopName, category } = req.body;

  if (!shopkeeperId || !shopName || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const shopCategories = await ProductsCategories.findOneAndUpdate(
      { shopkeeperId, shopName },
      { $pull: { categories: category } },
      { new: true }
    );
    res.status(200).json({ message: 'Category deleted successfully', shopCategories });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});