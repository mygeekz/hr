import { FC, ReactNode } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './lib/auth';
import LoginPage from './pages/Login';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import Settings from './pages/Settings';
import Requests from './pages/Requests';
import Tasks from './pages/Tasks';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import FullPageLoader from './components/shared/FullPageLoader';

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

const PublicRoute: FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  return user ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

const App: FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/add" element={<AddEmployee />} />
                <Route path="/employees/:id" element={<EmployeeProfile />} />
                <Route path="/employees/:id/edit" element={<EditEmployee />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;