import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RoleBasedRoute } from './components/common/RoleBasedRoute'
import { PremiumLayout } from './components/layout/PremiumLayout'
import { ToastContainer } from './components/common/Toast'
import { useAuth } from './context/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AccessDeniedPage } from './pages/AccessDeniedPage'
import { AttendancePage } from './pages/AttendancePage'
import { FeeCollectionPage } from './pages/FeeCollectionPage'
import { MembershipPage } from './pages/MembershipPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { MemberDashboard } from './pages/MemberDashboard'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { ReceptionistDashboard } from './pages/ReceptionistDashboard'
import { UserManagement } from './pages/UserManagement'
import './styles/design-system.css'
import './App.css'

function PublicOnly({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
        <Route path="/reset-password" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />

        {/* Protected Routes with Premium Layout */}
        <Route
          element={
            <ProtectedRoute>
              <PremiumLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Role-Based Dashboards */}
          <Route
            path="/admin-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/trainer-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['TRAINER', 'ADMIN']}>
                <TrainerDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/receptionist-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                <ReceptionistDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/member-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['USER']}>
                <MemberDashboard />
              </RoleBasedRoute>
            }
          />

           {/* Feature Pages */}
           <Route path="/attendance" element={<AttendancePage />} />
           <Route
             path="/fees"
             element={
               <RoleBasedRoute requiredRoles={['ADMIN', 'RECEPTIONIST']}>
                 <FeeCollectionPage />
               </RoleBasedRoute>
             }
           />
           <Route path="/membership-plans" element={<MembershipPage />} />

           {/* Admin Only Pages */}
           <Route
             path="/user-management"
             element={
               <RoleBasedRoute requiredRoles={['ADMIN']}>
                 <UserManagement />
               </RoleBasedRoute>
             }
           />
         </Route>

        {/* Access Denied */}
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer />
    </>
  )
}
