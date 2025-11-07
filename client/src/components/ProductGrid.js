// ProductGrid component

const ProductGrid = ({ products, onAddToCart, loading }) => {
  const getProductImage = (product) => {
    // Custom images for specific products
    const customImages = {
      'JBL Charge 5 Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop&crop=center',
      'Anker PowerCore 26800': 'https://images.unsplash.com/photo-1609592806787-3d9c1b8e5e8e?w=400&h=300&fit=crop&crop=center',
      'AirPods Pro (2nd Gen)': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop&crop=center',
      'iPhone 15 Pro Case': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop&crop=center',
      'USB-C to Lightning Cable': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop&crop=center',
      'MacBook Pro Stand': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop&crop=center',
      'Logitech MX Master 3S': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop&crop=center',
      'Screen Cleaning Kit Pro': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'
    };
    
    return customImages[product.name] || product.image || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Product';
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=Product+Image';
  };

  return (
    <div>
      <h2>✨ Premium Tech Collection</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img 
              src={getProductImage(product)} 
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={handleImageError}
            />
            <div className="product-content">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-price">₹{product.price.toFixed(2)}</div>
              <button 
                className={`add-to-cart-btn ${loading ? 'loading' : ''}`}
                onClick={() => onAddToCart(product.id)}
                disabled={loading}
              >
                {loading ? '✨ Adding...' : '🛒 Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;