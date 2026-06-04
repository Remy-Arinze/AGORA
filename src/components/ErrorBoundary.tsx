'use client';

import React from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // openobserveLogs forwards uncaught errors automatically via forwardErrorsToLogs
    // Log structured context here for additional breadcrumbs
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--dark-bg)] text-white text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="opacity-70 mb-6">
              Our team has been notified. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2 bg-agora-blue rounded-lg hover:bg-agora-blue-dark transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
