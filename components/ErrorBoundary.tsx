// components/ErrorBoundary.tsx
// Uygulamada meydana gelen beklenmeyen hataları yakalar ve kullanıcıya gösterir.
// Bu, beyaz ekranın görünmesini (white screen of death) önler.

import React, { ReactNode, ErrorInfo, Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  props!: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary tarafından yakalandı:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props as ErrorBoundaryProps;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-600 rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">Bir Hata Oluştu</h1>
              <p className="text-slate-300 mb-6">
                Üzgünüz, uygulamada beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenileyin.
              </p>
              {error && (
                <details className="mb-6 text-left bg-slate-700 p-4 rounded">
                  <summary className="text-red-400 cursor-pointer font-semibold mb-2">
                    Hata Detayları (Geliştirici İçin)
                  </summary>
                  <pre className="text-xs text-slate-300 overflow-auto max-h-48">
                    {error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
