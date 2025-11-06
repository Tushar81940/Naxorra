import React from 'react';

const ReceiptModal = ({ receipt, onClose }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">🎉 Order Confirmation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="receipt">
          <div className="receipt-success">
            🎊 Order Completed Successfully! 🎊
          </div>
          
          <div className="receipt-id">
            Order ID: {receipt.id}
          </div>
          
          <div className="order-summary" style={{ textAlign: 'left' }}>
            <h3>👤 Customer Information:</h3>
            <p><strong>Name:</strong> {receipt.customerInfo.name}</p>
            <p><strong>Email:</strong> {receipt.customerInfo.email}</p>
            {receipt.customerInfo.address && (
              <p><strong>Address:</strong> {receipt.customerInfo.address}</p>
            )}
            {receipt.customerInfo.phone && (
              <p><strong>Phone:</strong> {receipt.customerInfo.phone}</p>
            )}
          </div>
          
          <div className="order-summary" style={{ textAlign: 'left' }}>
            <h3>📦 Items Ordered:</h3>
            {receipt.items.map(item => (
              <div key={item.id} className="order-item">
                <span>{item.name} × {item.quantity}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="receipt-total">
            ${receipt.total.toFixed(2)}
          </div>
          
          <div className="receipt-timestamp">
            Order placed on {formatDate(receipt.timestamp)}
          </div>
          
          <button 
            className="submit-btn"
            onClick={onClose}
            style={{ marginTop: '2rem' }}
          >
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;