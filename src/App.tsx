import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthProvider';
import { StripeProvider } from '@/contexts/StripeProvider';
import { Billing } from '@/pages/Billing';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import IndexSimple from './pages/IndexSimple';
import Auth from './pages/Auth';
import AuthCallback from './pages/auth/callback';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import QuizEditor from './pages/QuizEditor';
import QuizRunner from './pages/QuizRunner';
import ResultPage from './pages/ResultPage';
import WebhooksPage from './pages/webhooks';
import PlansPage from './pages/plans';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StripeProvider>
          <TooltipProvider delayDuration={0}>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<IndexSimple />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/q/:publicId" element={<QuizRunner />} />
          <Route path="/r/:resultId" element={<ResultPage />} />
          
          {/* Protected routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/app/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/app/edit/:id" element={
            <ProtectedRoute>
              <QuizEditor />
            </ProtectedRoute>
          } />
          <Route path="/app/webhooks" element={
            <ProtectedRoute>
              <WebhooksPage />
            </ProtectedRoute>
          } />
          <Route path="/app/plans" element={
            <ProtectedRoute>
              <PlansPage />
            </ProtectedRoute>
          } />
          <Route path="/app/billing" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/app/billing/success" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/app/billing/cancel" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
        </Routes>
          <Toaster />
          </TooltipProvider>
        </StripeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;