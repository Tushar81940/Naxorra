import { useState, useEffect } from 'react';
import './App.css';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import ReceiptModal from './components/ReceiptModal';

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  // Try multiple possible server ports
  const POSSIBLE_PORTS = [5000, 5001, 5002, 5003, 3001, 8080, 8000];
  const [apiBase, setApiBase] = useState('');
  const [serverConnected, setServerConnected] = useState(false);

  // Find and connect to server
  useEffect(() => {
    findServer();
  }, []);

  // Fetch data when server is connected
  useEffect(() => {
    if (serverConnected && apiBase) {
      fetchProducts();
      fetchCart();
    }
  }, [serverConnected, apiBase]);

  const findServer = async () => {
    console.log('🔍 Looking for server...');
    
    for (const port of POSSIBLE_PORTS) {
      try {
        const testUrl = `http://localhost:${port}/api/products`;
        const response = await fetch(testUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        
        if (response.ok) {
          const baseUrl = `http://localhost:${port}/api`;
          setApiBase(baseUrl);
          setServerConnected(true);
          console.log(`✅ Server found at port ${port}`);
          return;
        }
      } catch (error) {
        console.log(`❌ Port ${port} not available`);
        continue;
      }
    }
    
    console.error('❌ No server found on any port');
    setServerConnected(false);
  };

  const fetchProducts = async () => {
    if (!apiBase) return;
    
    try {
      const response = await fetch(`${apiBase}/products`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setServerConnected(false);
    }
  };

  const fetchCart = async () => {
    if (!apiBase) return;
    
    try {
      const response = await fetch(`${apiBase}/cart`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setServerConnected(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!apiBase) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (response.ok) {
        await fetchCart();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setServerConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!apiBase) return;
    
    try {
      const response = await fetch(`${apiBase}/cart/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchCart();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setServerConnected(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!apiBase) return;
    
    try {
      const response = await fetch(`${apiBase}/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (response.ok) {
        await fetchCart();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setServerConnected(false);
    }
  };

  const handleCheckout = async (customerInfo) => {
    if (!apiBase) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          customerInfo,
        }),
      });
      
      if (response.ok) {
        const receiptData = await response.json();
        setReceipt(receiptData);
        setShowCheckout(false);
        setShowCart(false);
        await fetchCart(); // Refresh cart (should be empty now)
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setServerConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1>🌟 Vibe Commerce</h1>
          <div style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '20px', 
            fontSize: '0.8rem',
            backgroundColor: serverConnected ? '#48bb78' : '#f56565',
            color: 'white'
          }}>
            {serverConnected ? '🟢 Connected' : '🔴 Connecting...'}
          </div>
        </div>
        <button 
          className="cart-button"
          onClick={() => setShowCart(true)}
          disabled={!serverConnected}
        >
          🛒 Cart ({cartItems.length}) - ${cartTotal.toFixed(2)}
        </button>
      </header>

      <main>
        {!serverConnected ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            color: '#718096'
          }}>
            <h2>🔄 Connecting to server...</h2>
            <p>Please wait while we establish connection</p>
            <button 
              onClick={findServer}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 Retry Connection
            </button>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            onAddToCart={addToCart}
            loading={loading}
          />
        )}
      </main>

      {showCart && (
        <Cart
          items={cartItems}
          total={cartTotal}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartItem}
          onCheckout={() => setShowCheckout(true)}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          total={cartTotal}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleCheckout}
          loading={loading}
        />
      )}

      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}

export default App;