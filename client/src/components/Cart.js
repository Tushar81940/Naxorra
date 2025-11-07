// Cart component

const Cart = ({ items, total, onClose, onRemove, onUpdateQuantity, onCheckout }) => {
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/100x100/e2e8f0/718096?text=Product';
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">🛒 Shopping Cart</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>🛍️ Your cart is empty</p>
            <p>Start shopping to add some amazing products!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="cart-item-image"
                    onError={handleImageError}
                  />
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-price">₹{item.price.toFixed(2)} each</div>
                    <div className="cart-item-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button 
                        className="remove-btn"
                        onClick={() => onRemove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                      Subtotal: ₹{item.subtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-total">
              <div className="cart-total-amount">
                Total: ₹{total.toFixed(2)}
              </div>
            </div>
            
            <button 
              className="checkout-btn"
              onClick={onCheckout}
            >
              🚀 Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;