'use client';

import React, { useState, useEffect } from 'react';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  requireConfirmText?: string; // Text user must type to confirm dangerous actions
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

let confirmDialog: {
  show: (options: ConfirmDialogOptions) => Promise<boolean>;
} | null = null;

export const useConfirmDialog = () => {
  return {
    confirm: (options: ConfirmDialogOptions): Promise<boolean> => {
      if (!confirmDialog) {
        throw new Error('ConfirmDialogProvider not found');
      }
      return confirmDialog.show(options);
    }
  };
};

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    confirmDialog = {
      show: (options: ConfirmDialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
          setDialog({
            ...options,
            isOpen: true,
            onConfirm: () => {
              setDialog(prev => ({ ...prev, isOpen: false }));
              setConfirmText('');
              resolve(true);
            },
            onCancel: () => {
              setDialog(prev => ({ ...prev, isOpen: false }));
              setConfirmText('');
              resolve(false);
            }
          });
        });
      }
    };
  }, []);

  const getIcon = () => {
    switch (dialog.type) {
      case 'danger':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getButtonColors = () => {
    switch (dialog.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      default:
        return 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500';
    }
  };

  const canConfirm = !dialog.requireConfirmText || confirmText === dialog.requireConfirmText;

  if (!dialog.isOpen) return <>{children}</>;

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[10000] overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={dialog.onCancel}
          />
          
          {/* Modal */}
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center sm:mx-0 sm:h-10 sm:w-10">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {dialog.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {dialog.message}
                  </p>
                </div>
                
                {dialog.requireConfirmText && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gõ <span className="font-bold text-red-600">"{dialog.requireConfirmText}"</span> để xác nhận:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={dialog.requireConfirmText}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                disabled={!canConfirm}
                onClick={dialog.onConfirm}
                className={`
                  inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm
                  sm:ml-3 sm:w-auto transition-all duration-200
                  ${canConfirm 
                    ? `${getButtonColors()} focus:outline-none focus:ring-2 focus:ring-offset-2` 
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                {dialog.confirmText || 'Xác nhận'}
              </button>
              <button
                type="button"
                onClick={dialog.onCancel}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all duration-200"
              >
                {dialog.cancelText || 'Hủy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialogProvider;