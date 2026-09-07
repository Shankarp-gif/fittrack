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
import { GymOperationsDashboard } from './pages/ReceptionistDashboard'
import { SuperAdminDashboard } from './pages/SuperAdminDashboard'
import { UserManagement } from './pages/UserManagement'
import { SettingsPage } from './pages/SettingsPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { ProgressPage } from './pages/ProgressPage'
import { GoalsPage } from './pages/GoalsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SimplePage } from './pages/SimplePage'
import { MembersPage } from './pages/MembersPage'
import { MemberDetailPage } from './pages/MemberDetailPage'
import { MemberEditPage } from './pages/MemberEditPage'
import { MemberNewPage } from './pages/MemberNewPage'
import { ReportsPage } from './pages/ReportsPage'
import { PlansPage } from './pages/PlansPage'
import { SupervisorHierarchyPage } from './pages/SupervisorHierarchyPage'
import { OrganizationManagement } from './pages/OrganizationManagement'
import { SuperAdminOrganizationHierarchy } from './pages/SuperAdminOrganizationHierarchy'
import { AdminRoleManagement } from './pages/AdminRoleManagement'
import './styles/design-system.css'
import './styles/auto-adjustment.css'
import './App.css'
import { getDashboardPathForRole } from './utils/roleAccess'

function PublicOnly({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function DashboardEntry() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  const roleDashboardPath = getDashboardPathForRole(user.role)
  if (roleDashboardPath !== '/dashboard') {
    return <Navigate to={roleDashboardPath} replace />
  }

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
            path="/gym-operations-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'GYM_MAINTENANCE_MANAGER', 'ADMIN']}>
                <GymOperationsDashboard />
              </RoleBasedRoute>
            }
          />

          {/* Legacy dashboard route kept for backward compatibility */}
          <Route path="/receptionist-dashboard" element={<Navigate to="/gym-operations-dashboard" replace />} />
          <Route
            path="/member-dashboard"
            element={
              <RoleBasedRoute requiredRoles={['USER']}>
                <MemberDashboard />
              </RoleBasedRoute>
            }
          />

           {/* Feature Pages */}
           <Route
             path="/attendance"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER']}>
                 <AttendancePage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/fees"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER']}>
                 <FeeCollectionPage />
               </RoleBasedRoute>
             }
           />
           <Route
             path="/membership-plans"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER', 'USER']}>
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
              path="/notifications"
              element={
                 <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER']}>
                  <NotificationsPage />
                </RoleBasedRoute>
              }
            />
           <Route
             path="/settings"
             element={
               <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER']}>
                 <SettingsPage />
               </RoleBasedRoute>
             }
           />

            <Route
              path="/members"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER']}>
                  <MembersPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER']}>
                  <MemberDetailPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/members/:id/edit"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER']}>
                  <MemberEditPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/members/new"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER']}>
                  <MemberNewPage />
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
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER']}>
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

            <Route
              path="/plans"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER']}>
                  <PlansPage />
                </RoleBasedRoute>
              }
            />

           {/* Admin Only Pages */}
           <Route
             path="/user-management"
             element={
                 <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER']}>
                 <UserManagement />
               </RoleBasedRoute>
             }
           />
            <Route
              path="/hierarchy"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <SupervisorHierarchyPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN']}>
                  <OrganizationManagement />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/organizations-hierarchy"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN']}>
                  <SuperAdminOrganizationHierarchy />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/role-management"
              element={
                <RoleBasedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <AdminRoleManagement />
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
