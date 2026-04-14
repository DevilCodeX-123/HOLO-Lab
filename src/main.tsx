import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("Global App Crash:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#ff4444', background: '#111', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ marginBottom: '1rem' }}>⚠️ Application Error</h2>
          <p style={{ marginBottom: '1rem', color: '#aaa' }}>Something went wrong. Check the error below:</p>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ff8888', fontSize: '12px' }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
