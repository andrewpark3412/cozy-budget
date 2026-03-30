import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import AppShell from '@/components/common/AppShell'
import InstallPromptBanner from '@/components/common/InstallPromptBanner'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import SignUpPage from '@/pages/SignUpPage'
import BudgetPage from '@/pages/BudgetPage'
import SavingsPage from '@/pages/SavingsPage'
import DebtPage from '@/pages/DebtPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import RecurringPage from '@/pages/RecurringPage'
import NotFoundPage from '@/pages/NotFoundPage'

const App = () => {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected routes inside the app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/budget" replace />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/debt" element={<DebtPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/recurring" element={<RecurringPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
      <InstallPromptBanner />
    </>
  )
}

export default App
