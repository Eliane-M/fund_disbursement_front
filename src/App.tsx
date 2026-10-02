import { Navigate, Route, Routes } from 'react-router-dom'

import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { VerifyFirstLoginPage } from '@/pages/auth/VerifyFirstLoginPage'
import { MembersPage } from '@/pages/assessment/MembersPage'
import { ModuleDashboardPage } from '@/pages/assessment/ModuleDashboardPage'
import { ModuleSettingsPage } from '@/pages/assessment/ModuleSettingsPage'
import { ReportDetailPage } from '@/pages/assessment/ReportDetailPage'
import { ReportsListPage } from '@/pages/assessment/ReportsListPage'
import { RespondentsPage } from '@/pages/assessment/RespondentsPage'
import { AssessmentBuilderPage } from '@/pages/assessment/builder/AssessmentBuilderPage'
import { OrganizationDetailPage } from '@/pages/platform/OrganizationDetailPage'
import { OrganizationsPage } from '@/pages/platform/OrganizationsPage'
import { UsersPage } from '@/pages/platform/UsersPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'
import { RequireOrganization } from '@/routes/RequireOrganization'
import { RequirePlatformAdmin } from '@/routes/RequirePlatformAdmin'

function HomeRedirect() {
  const { user } = useAuth()
  const hasOrg = (user?.memberships.length ?? 0) > 0
  if (!hasOrg && user?.is_platform_admin) {
    return <Navigate to="/platform/organizations" replace />
  }
  return <Navigate to="/assessment" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-first-login" element={<VerifyFirstLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        <Route element={<RequireOrganization />}>
          <Route path="/assessment" element={<ModuleDashboardPage />} />
          <Route path="/assessment/builder/:assessmentId" element={<AssessmentBuilderPage />} />
          <Route path="/assessment/respondents" element={<RespondentsPage />} />
          <Route path="/assessment/reports" element={<ReportsListPage />} />
          <Route path="/assessment/reports/:reportId" element={<ReportDetailPage />} />
          <Route path="/assessment/members" element={<MembersPage />} />
          <Route path="/assessment/settings" element={<ModuleSettingsPage />} />
        </Route>

        <Route element={<RequirePlatformAdmin />}>
          <Route path="/platform" element={<Navigate to="/platform/organizations" replace />} />
          <Route path="/platform/organizations" element={<OrganizationsPage />} />
          <Route path="/platform/organizations/:organizationId" element={<OrganizationDetailPage />} />
          <Route path="/platform/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
