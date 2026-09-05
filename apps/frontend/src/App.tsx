import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RoleBasedRoute } from './components/common/RoleBasedRoute'
import { PremiumLayout } from './components/layout/PremiumLayout'
import { ToastContainer } from './components/common/Toast'
import { CenteredSuccessModalContainer } from './components/common/CenteredSuccessModal'
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
import { SuperAdminDashboard } from './pages/SuperAdminDashboard'
import { UserManagement } from './pages/UserManagement'
import { SettingsPage } from './pages/SettingsPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { ProgressPage } from './pages/ProgressPage'
import { GoalsPage } from './pages/GoalsPage'
import { SimplePage } from './pages/SimplePage'
import { MembersPage } from './pages/MembersPage'
import { ReportsPage } from './pages/ReportsPage'
import './styles/design-system.css'
import './App.css'

function PublicOnly({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function DashboardEntry() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'USER') return <Navigate to="/member-dashboard" replace />

  return <DashboardPage />
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
          <Route path="/dashboard" element={<DashboardEntry />} />

          <Route
            path="/superadmin-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </RoleBasedRoute>
            }
          />

          {/* Role-Based Dashboards */}
          <Route
            path="/admin-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/trainer-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'TRAINER', 'ADMIN']}>
                <TrainerDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/receptionist-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'RECEPTIONIST', 'ADMIN']}>
                <ReceptionistDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/member-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER']}>
                <MemberDashboard />
              </RoleBasedRoute>
            }
          />

           {/* Feature Pages */}
           <Route
             path="/attendance"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER']}>
                 <AttendancePage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/fees"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']}>
                 <FeeCollectionPage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/membership-plans"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'USER']}>
                 <MembershipPage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/workouts"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER']}>
                 <WorkoutsPage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/progress"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER']}>
                 <ProgressPage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/goals"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER']}>
                 <GoalsPage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/settings"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER']}>
                 <SettingsPage />
               </RoleBasedRoute>
             }
           />

            <Route
              path="/members"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST']}>
                  <MembersPage />
                </RoleBasedRoute>
              }
            />
           <Route
             path="/members/new"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']}>
                 <SimplePage
                   title="New Member Registration"
                   description="Create a new member profile and membership from this page."
                 />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/trainers"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
                 <SimplePage
                   title="Trainers"
                   description="Trainer management and assignments are available here."
                 />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/classes"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST']}>
                 <SimplePage
                   title="Classes"
                   description="Class scheduling and attendance controls are available here."
                 />
               </RoleBasedRoute>
             }
           />
            <Route
              path="/reports"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <ReportsPage />
                </RoleBasedRoute>
              }
            />

           {/* Admin Only Pages */}
           <Route
             path="/user-management"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'TRAINER']}>
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
       <CenteredSuccessModalContainer />
     </>
   )
}
