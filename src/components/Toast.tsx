'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeNotification } from '@/features/ui/uiSlice';

export default function Toast() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const bgColor =
          notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : notification.type === 'warning'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-blue-50 border-blue-200 text-blue-800';

        const iconColor =
          notification.type === 'error'
            ? 'text-red-600'
            : notification.type === 'success'
            ? 'text-green-600'
            : notification.type === 'warning'
            ? 'text-yellow-600'
            : 'text-blue-600';

        return (
          <div
            key={notification.id}
            className={`${bgColor} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md flex items-start gap-3 animate-slide-in`}
          >
            <div className={`flex-shrink-0 ${iconColor}`}>
              {notification.type === 'error' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'success' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className={`flex-shrink-0 ${iconColor} hover:opacity-70 transition-opacity`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
