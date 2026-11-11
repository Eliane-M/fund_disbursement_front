import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { VerifyFirstLoginPage } from '@/pages/auth/VerifyFirstLoginPage'
import { AssessmentsListPage } from '@/pages/assessment/AssessmentsListPage'
import { MembersPage } from '@/pages/assessment/MembersPage'
import { ModuleDashboardPage } from '@/pages/assessment/ModuleDashboardPage'
import { ModuleSettingsPage } from '@/pages/assessment/ModuleSettingsPage'
import { ReportDetailPage } from '@/pages/assessment/ReportDetailPage'
import { ReportsListPage } from '@/pages/assessment/ReportsListPage'
import { RespondentsPage } from '@/pages/assessment/RespondentsPage'
import { SubmissionsPage } from '@/pages/assessment/SubmissionsPage'
import { AssessmentBuilderPage } from '@/pages/assessment/builder/AssessmentBuilderPage'
import { OrganizationDetailPage } from '@/pages/platform/OrganizationDetailPage'
import { OrganizationsPage } from '@/pages/platform/OrganizationsPage'
import { UsersPage } from '@/pages/platform/UsersPage'
import { DashboardPage as FundDashboardPage } from '@/pages/fund-disbursement/DashboardPage'
import { FundDetailPage } from '@/pages/fund-disbursement/FundDetailPage'
import { FundsListPage } from '@/pages/fund-disbursement/FundsListPage'
import { InstallmentDetailPage } from '@/pages/fund-disbursement/InstallmentDetailPage'
import { MilestoneReviewPage } from '@/pages/fund-disbursement/MilestoneReviewPage'
import { ModuleSettingsPage as FundModuleSettingsPage } from '@/pages/fund-disbursement/ModuleSettingsPage'
import { NewFundPage } from '@/pages/fund-disbursement/NewFundPage'
import { RecipientsPage } from '@/pages/fund-disbursement/RecipientsPage'
import { FillAssessmentPage } from '@/pages/respondent/FillAssessmentPage'
import { MyAssessmentsPage } from '@/pages/respondent/MyAssessmentsPage'
import { MyFundDetailPage } from '@/pages/respondent/MyFundDetailPage'
import { MyFundsPage } from '@/pages/respondent/MyFundsPage'
import { MyMilestonesPage } from '@/pages/respondent/MyMilestonesPage'
import { MyReportPage } from '@/pages/respondent/MyReportPage'
import { MyResponsesPage } from '@/pages/respondent/MyResponsesPage'
import { MyReviewPage } from '@/pages/respondent/MyReviewPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { hasStaffMembership } from '@/lib/memberships'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'
import { RequireOrganization } from '@/routes/RequireOrganization'
import { RequirePlatformAdmin } from '@/routes/RequirePlatformAdmin'

const LandingPage = lazy(() =>
  import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
)

function HomeRedirect() {
  const { user } = useAuth()
  const hasOrg = (user?.memberships.length ?? 0) > 0
  if (!hasOrg && user?.is_platform_admin) {
    return <Navigate to="/platform/organizations" replace />
  }
  if (hasOrg && !hasStaffMembership(user)) {
    return <Navigate to="/my" replace />
  }
  return <Navigate to="/assessment" replace />
}

// "/" is the public landing page for visitors and the dashboard redirect for
// signed-in users.
function RootRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  if (isInitializing) return null
  if (isAuthenticated) return <HomeRedirect />
  return (
    <Suspense fallback={null}>
      <LandingPage />
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-first-login" element={<VerifyFirstLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/my" element={<MyAssessmentsPage />} />
        <Route path="/my/funds" element={<MyFundsPage />} />
        <Route path="/my/funds/:fundId" element={<MyFundDetailPage />} />
        <Route path="/my/milestones" element={<MyMilestonesPage />} />
        <Route path="/my/responses" element={<MyResponsesPage />} />
        <Route path="/my/review" element={<MyReviewPage />} />
        <Route path="/my/review/:reportId" element={<MyReportPage />} />
        <Route path="/my/assessments/:invitationId" element={<FillAssessmentPage />} />

        <Route element={<RequireOrganization />}>
          <Route path="/assessment" element={<ModuleDashboardPage />} />
          <Route path="/assessment/builder" element={<AssessmentsListPage />} />
          <Route path="/assessment/builder/:assessmentId" element={<AssessmentBuilderPage />} />
          <Route path="/assessment/respondents" element={<RespondentsPage />} />
          <Route path="/assessment/submissions" element={<SubmissionsPage />} />
          <Route path="/assessment/reports" element={<ReportsListPage />} />
          <Route path="/assessment/reports/:reportId" element={<ReportDetailPage />} />
          <Route path="/assessment/members" element={<MembersPage />} />
          <Route path="/assessment/settings" element={<ModuleSettingsPage />} />

          <Route path="/fund-disbursement" element={<FundDashboardPage />} />
          <Route path="/fund-disbursement/funds" element={<FundsListPage />} />
          <Route path="/fund-disbursement/funds/new" element={<NewFundPage />} />
          <Route path="/fund-disbursement/funds/:fundId" element={<FundDetailPage />} />
          <Route path="/fund-disbursement/installments/:installmentId" element={<InstallmentDetailPage />} />
          <Route path="/fund-disbursement/review-queue" element={<MilestoneReviewPage />} />
          <Route path="/fund-disbursement/recipients" element={<RecipientsPage />} />
          <Route path="/fund-disbursement/settings" element={<FundModuleSettingsPage />} />
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
