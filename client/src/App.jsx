import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ReadingFormPage = lazy(() => import('./pages/ReadingFormPage'));
const ReadingsPage = lazy(() => import('./pages/ReadingsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

export default function App() {
  const { isLoading } = useAuth();
  if (isLoading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="readings" element={<ReadingsPage />} />
            <Route path="readings/new" element={<ReadingFormPage />} />
            <Route path="readings/:id/edit" element={<ReadingFormPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
