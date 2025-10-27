"use client";

/**
 * @file components/common/error-boundary.tsx
 * @description Error boundary component for graceful error handling
 * @created 2025-10-18
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  /**
  * React error boundary that catches JavaScript errors anywhere in its child component tree and renders a graceful fallback UI instead of crashing the whole application.
  * @component
  * @example
  *   <ErrorBoundary>
  *     <App />
  *   </ErrorBoundary>
  * @prop {React.ReactNode} children - Child elements that the boundary should wrap and monitor for errors.
  * @state {boolean} hasError - Flag that becomes true when an error is caught.
  * @state {Error|null} error - Stores the actual Error object for optional display in the fallback UI.
  * @lifecycle getDerivedStateFromError - Static method that sets hasError to true when an error is encountered.
  * @lifecycle componentDidCatch - Lifecycle method that captures the error and stores it in state.
  * @render Displays a themed fallback interface with error details and recovery actions (page refresh or retry) when hasError is true; otherwise renders this.props.children.
  **/
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We&apos;re sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left text-sm p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">
                  Error details
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
