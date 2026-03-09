import React from 'react';

type ToastProps = {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
};

export function Toast({ message, variant = 'info' }: ToastProps) {
  const colors: Record<NonNullable<ToastProps['variant']>, string> = {
    info: '#1e40af',
    success: '#065f46',
    warning: '#92400e',
    error: '#7f1d1d'
  };
  return (
    <div role="status" style={{
      position: 'fixed', bottom: 16, right: 16,
      color: 'white', background: colors[variant],
      padding: '8px 12px', borderRadius: 6
    }}>
      {message}
    </div>
  );
}

export default Toast;
