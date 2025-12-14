import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import companyReducer from '@/features/company/companySlice';
import applicationReducer from '@/features/application/applicationSlice';
import jobReducer from '@/features/job/jobSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
    application: applicationReducer,
    job: jobReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
