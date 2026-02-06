import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
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
            backgroundColor: '#1a1a1a', 
            color: '#ff5555', 
            padding: '20px', 
            zIndex: 9999, 
            overflow: 'auto',
            fontFamily: 'monospace',
            boxSizing: 'border-box'
        }}>
          <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
            💥 CRASH REPORT
          </h1>
          
          <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Error:</h3>
            <p style={{ fontSize: '14px', color: '#ff5555' }}>
              {this.state.error && this.state.error.toString()}
            </p>
          </div>

          <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Stack Trace:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#aaa' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            style={{
                marginTop: '30px',
                padding: '12px 24px',
                backgroundColor: '#00d4ff',
                border: 'none',
                borderRadius: '6px',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                width: '100%'
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