import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error, errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: '#1a1a1a', 
            color: '#ff5555', 
            padding: '20px', 
            zIndex: 9999, 
            overflow: 'auto',
            fontFamily: 'monospace'
        }}>
          <h1>💥 CRASH REPORT</h1>
          
          <div style={{ background: '#000', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Error Message:</h3>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {this.state.error && this.state.error.toString()}
            </p>
          </div>

          <details>
            <summary style={{ cursor: 'pointer', color: '#888' }}>Tap to see Stack Trace</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px', color: '#ccc' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>

          <button 
            onClick={() => window.location.reload()} 
            style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#00d4ff',
                border: 'none',
                borderRadius: '5px',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '16px'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;