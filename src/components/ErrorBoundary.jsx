import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#fff7f5] px-6">
          <div className="max-w-lg rounded-3xl border border-[#f0d5d0] bg-white p-8 text-center shadow-[0_18px_40px_rgba(128,0,32,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#800020]">Bloomwell</p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-gray-800">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              We hit an unexpected error while loading this page. Please refresh and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-[#800020] px-4 py-2.5 text-sm font-semibold text-[#fff5f5] transition hover:bg-[#660018]"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
