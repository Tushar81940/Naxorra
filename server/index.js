const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const net = require("net");

const app = express();

// Function to find an available port
const findAvailablePort = (startPort = 5000) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, (err) => {
      if (err) {
        server.close();
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        const port = server.address().port;
        server.close();
        resolve(port);
      }
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// Middleware
app.use(cors());
app.use(express.json());

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Initialize SQLite database
const db = new sqlite3.Database("./cart.db");

// Create tables
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    description TEXT
  )`);

  // Cart items table
  db.run(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Orders table for order history
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    customer_address TEXT,
    customer_phone TEXT,
    total REAL,
    timestamp TEXT,
    status TEXT DEFAULT 'completed'
  )`);

  // Insert mock products if table is empty
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      const mockProducts = [
        {
          name: "AirPods Pro (2nd Gen)",
          price: 249.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
          description: "Active Noise Cancellation, Transparency mode, and Spatial Audio with dynamic head tracking",
        },
        {
          name: "iPhone 15 Pro Case",
          price: 59.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/71K6qQwNJeL._AC_SL1500_.jpg",
          description: "Premium leather case with MagSafe compatibility and military-grade drop protection",
        },
        {
          name: "JBL Charge 5 Speaker",
          price: 179.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/81A7JJQX9HL._AC_SL1500_.jpg",
          description: "Waterproof portable speaker with 20 hours of playtime and powerbank feature",
        },
        {
          name: "USB-C to Lightning Cable",
          price: 29.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/61Ks8wbJy8L._AC_SL1500_.jpg",
          description: "Apple MFi certified fast charging cable, 6ft braided design",
        },
        {
          name: "MacBook Pro Stand",
          price: 89.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/61Nu0UMKJNL._AC_SL1500_.jpg",
          description: "Adjustable aluminum laptop stand with cooling design and cable management",
        },
        {
          name: "Logitech MX Master 3S",
          price: 99.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg",
          description: "Advanced wireless mouse with ultra-fast scrolling and multi-device connectivity",
        },
        {
          name: "Anker PowerCore 26800",
          price: 65.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/61mJMCBUEeL._AC_SL1500_.jpg",
          description: "High-capacity portable charger with PowerIQ technology and triple USB ports",
        },
        {
          name: "Screen Cleaning Kit Pro",
          price: 24.99,
          image: "https://images-na.ssl-images-amazon.com/images/I/71QkTvZkKjL._AC_SL1500_.jpg",
          description: "Professional cleaning solution with microfiber cloths for all electronic screens",
        },
      ];

      const stmt = db.prepare(
        "INSERT INTO products (name, price, image, description) VALUES (?, ?, ?, ?)"
      );
      mockProducts.forEach((product) => {
        stmt.run(
          product.name,
          product.price,
          product.image,
          product.description
        );
      });
      stmt.finalize();
    }
  });
});

// API Routes

// GET /api/products - Get all products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/cart - Add item to cart
app.post("/api/cart", (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  // Check if item already exists in cart
  db.get(
    "SELECT * FROM cart_items WHERE product_id = ?",
    [productId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        // Update quantity if item exists
        const newQuantity = row.quantity + quantity;
        db.run(
          "UPDATE cart_items SET quantity = ? WHERE product_id = ?",
          [newQuantity, productId],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: "Cart updated successfully", id: row.id });
          }
        );
      } else {
        // Insert new item
        db.run(
          "INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)",
          [productId, quantity],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: "Item added to cart", id: this.lastID });
          }
        );
      }
    }
  );
});

// GET /api/cart - Get cart items with total
app.get("/api/cart", (req, res) => {
  const query = `
    SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image,
           (ci.quantity * p.price) as subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
  `;

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
    res.json({ items: rows, total: parseFloat(total.toFixed(2)) });
  });
});

// DELETE /api/cart/:id - Remove item from cart
app.delete("/api/cart/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM cart_items WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    res.json({ message: "Item removed from cart" });
  });
});

// PUT /api/cart/:id - Update cart item quantity
app.put("/api/cart/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  db.run(
    "UPDATE cart_items SET quantity = ? WHERE id = ?",
    [quantity, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: "Cart item not found" });
        return;
      }

      res.json({ message: "Cart item updated" });
    }
  );
});

// POST /api/checkout - Process checkout
app.post("/api/checkout", (req, res) => {
  const { cartItems, customerInfo } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  if (!customerInfo || !customerInfo.name || !customerInfo.email) {
    return res
      .status(400)
      .json({ error: "Customer name and email are required" });
  }

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Generate mock receipt
  const receipt = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    customerInfo,
    items: cartItems,
    total: parseFloat(total.toFixed(2)),
    status: "completed",
  };

  // Save order to database
  db.run(`INSERT INTO orders (id, customer_name, customer_email, customer_address, customer_phone, total, timestamp, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [receipt.id, customerInfo.name, customerInfo.email, customerInfo.address || '', customerInfo.phone || '', total, receipt.timestamp, 'completed'],
    (err) => {
      if (err) {
        console.error('Error saving order:', err);
      }
    }
  );

  // Clear cart after successful checkout
  db.run("DELETE FROM cart_items", (err) => {
    if (err) {
      console.error("Error clearing cart:", err);
    }
  });

  res.json(receipt);
});

// GET /api/orders - Get all orders (for admin/debugging)
app.get('/api/orders', (req, res) => {
  db.all("SELECT * FROM orders ORDER BY timestamp DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET /api/test-images - Test if product images are accessible
app.get('/api/test-images', async (req, res) => {
  try {
    const products = await new Promise((resolve, reject) => {
      db.all("SELECT id, name, image FROM products", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const imageTests = await Promise.all(
      products.map(async (product) => {
        try {
          const response = await fetch(product.image, { method: 'HEAD' });
          return {
            id: product.id,
            name: product.name,
            image: product.image,
            status: response.ok ? 'OK' : 'FAILED',
            statusCode: response.status
          };
        } catch (error) {
          return {
            id: product.id,
            name: product.name,
            image: product.image,
            status: 'ERROR',
            error: error.message
          };
        }
      })
    );

    res.json(imageTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/update-products - Update product images (for admin)
app.post('/api/update-products', (req, res) => {
  const updates = [
    { 
      id: 7, 
      name: "Anker PowerCore 26800",
      image: "https://cdn.shopify.com/s/files/1/0057/8938/4802/products/A1277011_TD01_600x.jpg"
    },
    { 
      id: 3, 
      name: "JBL Charge 5 Speaker",
      image: "https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw7c537c5b/JBL_Charge5_Hero_Blue_0148_x1.png"
    },
    { 
      id: 6, 
      name: "Logitech MX Master 3S",
      image: "https://resource.logitech.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png"
    },
    {
      id: 1,
      name: "AirPods Pro (2nd Gen)",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1660803972361"
    },
    {
      id: 2,
      name: "iPhone 15 Pro Case",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT223?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1693340489013"
    },
    {
      id: 4,
      name: "USB-C to Lightning Cable",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQGH3?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1661957814407"
    },
    {
      id: 5,
      name: "MacBook Pro Stand",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 8,
      name: "Screen Cleaning Kit Pro",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center"
    }
  ];

  let completed = 0;
  updates.forEach(update => {
    db.run("UPDATE products SET image = ? WHERE id = ?", [update.image, update.id], (err) => {
      if (err) {
        console.error('Error updating product:', err);
      } else {
        console.log(`✅ Updated ${update.name} image`);
      }
      completed++;
      if (completed === updates.length) {
        res.json({ message: 'All product images updated successfully', count: updates.length });
      }
    });
  });
});

// Start server with automatic port detection
const startServer = async () => {
  try {
    const PORT = await findAvailablePort(5000);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at: http://localhost:${PORT}/api`);
      console.log(`🛍️ Frontend should connect to: http://localhost:${PORT}`);
      
      // Write the port to a file so frontend can read it
      const fs = require('fs');
      fs.writeFileSync('./server-port.txt', PORT.toString());
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
