import { useState } from 'react';

const CheckoutModal = ({ cartItems, total, onClose, onSubmit, loading }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in required fields (Name and Email)');
      return;
    }
    onSubmit(customerInfo);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">💳 Secure Checkout</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="order-summary">
          <h3>📋 Order Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="order-item">
              <span>{item.name} × {item.quantity}</span>
              <span>${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="order-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              value={customerInfo.address}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Processing...' : `🎉 Complete Order - $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;