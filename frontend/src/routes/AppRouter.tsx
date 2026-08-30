import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout }  from '@/components/layout/MainLayout';
import { AuthLayout }  from '@/components/layout/AuthLayout';
import { FullPageLoader, PageLoader } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts';

// ── Auth pages ─────────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// ── Dashboard ─────────────────────────────────────────────────────────────
const DashboardPage      = lazy(() => import('@/pages/dashboard/DashboardPage'));

// ── Tasks ────────────────────────────────────────────────────────────────
const TaskListPage       = lazy(() => import('@/pages/tasks/TaskListPage'));
const TaskDetailPage     = lazy(() => import('@/pages/tasks/TaskDetailPage'));
const CreateTaskPage     = lazy(() => import('@/pages/tasks/CreateTaskPage'));
const EditTaskPage       = lazy(() => import('@/pages/tasks/EditTaskPage'));
const MyTasksPage        = lazy(() => import('@/pages/tasks/MyTasksPage'));
const FavoritesPage      = lazy(() => import('@/pages/tasks/FavoritesPage'));
const CalendarPage       = lazy(() => import('@/pages/tasks/CalendarPage'));

// ── People ────────────────────────────────────────────────────────────────
const EmployeesPage      = lazy(() => import('@/pages/employees/EmployeesPage'));
const EmployeeDetailPage = lazy(() => import('@/pages/employees/EmployeeDetailPage'));

// ── Org structure ─────────────────────────────────────────────────────────
const TeamsPage          = lazy(() => import('@/pages/organization/TeamsPage'));
const TeamDetailPage     = lazy(() => import('@/pages/teams/TeamDetailPage'));
const DepartmentsPage    = lazy(() => import('@/pages/organization/DepartmentsPage'));

// ── Notifications ─────────────────────────────────────────────────────────
const NotificationsPage  = lazy(() => import('@/pages/notifications/NotificationsPage'));

// ── Reports & Logs ────────────────────────────────────────────────────────
const ReportsPage        = lazy(() => import('@/pages/reports/ReportsPage'));
const ActivityLogPage    = lazy(() => import('@/pages/activity/ActivityLogPage'));
const AuditLogPage       = lazy(() => import('@/pages/activity/AuditLogPage'));

// ── Profile & Settings ────────────────────────────────────────────────────
const ProfilePage        = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage       = lazy(() => import('@/pages/settings/SettingsPage'));

// ── 404 ───────────────────────────────────────────────────────────────────
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage'));

// Smart default redirect: send authenticated users to /dashboard
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

const SuspenseWrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Root ── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Auth routes ─────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"            element={<SuspenseWrap><LoginPage /></SuspenseWrap>} />
          <Route path="/forgot-password"  element={<SuspenseWrap><ForgotPasswordPage /></SuspenseWrap>} />
          <Route path="/reset-password"   element={<SuspenseWrap><ResetPasswordPage /></SuspenseWrap>} />
        </Route>

        {/* ── Protected app routes ────────────────────────────────── */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<SuspenseWrap><DashboardPage /></SuspenseWrap>} />

          {/* Tasks */}
          <Route path="/tasks"           element={<SuspenseWrap><TaskListPage /></SuspenseWrap>} />
          <Route path="/tasks/new"       element={<SuspenseWrap><CreateTaskPage /></SuspenseWrap>} />
          <Route path="/tasks/:id"       element={<SuspenseWrap><TaskDetailPage /></SuspenseWrap>} />
          <Route path="/tasks/:id/edit"  element={<SuspenseWrap><EditTaskPage /></SuspenseWrap>} />
          <Route path="/my-tasks"        element={<SuspenseWrap><MyTasksPage /></SuspenseWrap>} />
          <Route path="/favorites"       element={<SuspenseWrap><FavoritesPage /></SuspenseWrap>} />
          <Route path="/calendar"        element={<SuspenseWrap><CalendarPage /></SuspenseWrap>} />

          {/* People — Commander only */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute roles={['COMMANDER']}>
                <SuspenseWrap><EmployeesPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute roles={['COMMANDER']}>
                <SuspenseWrap><EmployeeDetailPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />

          {/* Teams — Commander + Team Lead */}
          <Route
            path="/teams"
            element={
              <ProtectedRoute roles={['COMMANDER', 'TEAM_LEAD']}>
                <SuspenseWrap><TeamsPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute roles={['COMMANDER', 'TEAM_LEAD']}>
                <SuspenseWrap><TeamDetailPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />

          {/* Departments — Commander only */}
          <Route
            path="/departments"
            element={
              <ProtectedRoute roles={['COMMANDER']}>
                <SuspenseWrap><DepartmentsPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />

          {/* Notifications — all */}
          <Route path="/notifications" element={<SuspenseWrap><NotificationsPage /></SuspenseWrap>} />

          {/* Reports — Commander + Team Lead */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['COMMANDER', 'TEAM_LEAD']}>
                <SuspenseWrap><ReportsPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />

          {/* Activity & Audit — Commander + Team Lead */}
          <Route
            path="/activity"
            element={
              <ProtectedRoute roles={['COMMANDER', 'TEAM_LEAD']}>
                <SuspenseWrap><ActivityLogPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute roles={['COMMANDER']}>
                <SuspenseWrap><AuditLogPage /></SuspenseWrap>
              </ProtectedRoute>
            }
          />

          {/* Profile & Settings — all */}
          <Route path="/profile"  element={<SuspenseWrap><ProfilePage /></SuspenseWrap>} />
          <Route path="/settings" element={<SuspenseWrap><SettingsPage /></SuspenseWrap>} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<SuspenseWrap><NotFoundPage /></SuspenseWrap>} />
      </Routes>
    </BrowserRouter>
  );
}
