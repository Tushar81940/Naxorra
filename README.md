# Vibe Commerce - Full Stack E-Commerce Cart

A full-stack shopping cart application built for Vibe Commerce screening. Features product browsing, cart management, and mock checkout functionality.

## Tech Stack

- **Frontend**: React.js with responsive design
- **Backend**: Node.js with Express.js
- **Database**: SQLite for data persistence
- **API**: RESTful API architecture

## Features

### Backend APIs
- `GET /api/products` - Fetch 8 mock products with id, name, price, image, description
- `POST /api/cart` - Add items to cart with productId and quantity
- `DELETE /api/cart/:id` - Remove specific item from cart
- `PUT /api/cart/:id` - Update item quantity in cart
- `GET /api/cart` - Get all cart items with calculated total
- `POST /api/checkout` - Process checkout and generate mock receipt

### Frontend Features
- **Product Grid**: Responsive grid displaying products with "Add to Cart" functionality
- **Shopping Cart**: Modal view showing cart items, quantities, totals with update/remove options
- **Checkout Form**: Customer information form (name, email, address, phone)
- **Receipt Modal**: Order confirmation with receipt details and timestamp
- **Responsive Design**: Mobile-friendly interface

### Bonus Features Implemented
- ✅ Database persistence with SQLite
- ✅ Comprehensive error handling
- ✅ Quantity management (increase/decrease)
- ✅ Real-time cart total calculation
- ✅ Order history with unique receipt IDs

## Project Structure

```
vibe-commerce-cart/
├── server/
│   ├── package.json
│   ├── index.js          # Express server with API routes
│   └── cart.db           # SQLite database (auto-generated)
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductGrid.js
│   │   │   ├── Cart.js
│   │   │   ├── CheckoutModal.js
│   │   │   └── ReceiptModal.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── package.json          # Root package with scripts
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe-commerce-cart
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   This will install dependencies for root, server, and client.

3. **Start the development servers**
   ```bash
   npm run dev
   ```
   This starts both backend (port 5000) and frontend (port 3000) concurrently.

### Manual Setup (Alternative)

If the automated setup doesn't work:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start backend server**
   ```bash
   cd server
   npm run dev
   ```

5. **Start frontend (in new terminal)**
   ```bash
   cd client
   npm start
   ```

## Usage

1. **Browse Products**: View the product grid on the homepage
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Click the cart button in the header to see cart contents
4. **Manage Cart**: Update quantities or remove items in the cart modal
5. **Checkout**: Click "Proceed to Checkout" and fill in customer information
6. **Receipt**: View order confirmation with receipt details

## API Endpoints

### Products
- **GET** `/api/products`
  - Returns array of products with id, name, price, image, description

### Cart Management
- **POST** `/api/cart`
  - Body: `{ productId: number, quantity: number }`
  - Adds item to cart or updates quantity if exists

- **GET** `/api/cart`
  - Returns cart items with calculated totals
  - Response: `{ items: [...], total: number }`

- **PUT** `/api/cart/:id`
  - Body: `{ quantity: number }`
  - Updates specific cart item quantity

- **DELETE** `/api/cart/:id`
  - Removes specific item from cart

### Checkout
- **POST** `/api/checkout`
  - Body: `{ cartItems: [...], customerInfo: {...} }`
  - Processes order and returns receipt with unique ID

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT,
  description TEXT
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  quantity INTEGER DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products (id)
);
```

## Development Notes

- SQLite database is automatically created and populated with mock data on first run
- CORS is enabled for cross-origin requests between frontend and backend
- Error handling implemented for all API endpoints
- Responsive design works on mobile and desktop
- Cart persists in database until checkout completion

## Future Enhancements

- User authentication and multiple user carts
- Product categories and search functionality
- Real payment integration
- Order history tracking
- Inventory management
- Product reviews and ratings

## License

This project is created for Vibe Commerce screening purposes.