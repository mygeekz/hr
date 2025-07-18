// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { DashboardLayout } from "@/components/ui/layout/DashboardLayout";
import { useAuth } from "@/lib/auth"; // ★ Import the custom hook

// --- Import all your page components ---
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import Tasks from "./pages/Tasks";
import Requests from "./pages/Requests";
import Sales from "./pages/Sales";
import Salary from "./pages/Salary";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Branches from "./pages/Branches";

const queryClient = new QueryClient();

// ★ A simple component to protect routes that require authentication
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // While checking for user status, show a loading indicator
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  // If there is a user, render the DashboardLayout which contains all the nested pages.
  // Otherwise, redirect them to the login page.
  return user ? <DashboardLayout /> : <Navigate to="/login" replace />;
};

const App = () => {
  const { user, loading } = useAuth();
  
  // A wrapper to prevent a flicker while the auth status is being determined.
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Initializing Application...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              {/* --- Public Routes --- */}
              {/* The login page should only be accessible to logged-out users. */}
              {/* If a logged-in user tries to access it, redirect them to the dashboard. */}
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
              
              {/* The index page might be public or you might want to redirect */}
              <Route path="/" element={<Index />} />

              {/* --- Protected Routes --- */}
              {/* All routes nested inside this element will require authentication. */}
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="employees/add" element={<AddEmployee />} />
                <Route path="employees/edit/:id" element={<EditEmployee />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="requests" element={<Requests />} />
                <Route path="sales" element={<Sales />} />
                <Route path="salary" element={<Salary />} />
                <Route path="settings" element={<Settings />} />
                <Route path="branches" element={<Branches />} />
              </Route>

              {/* --- Not Found Route --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;