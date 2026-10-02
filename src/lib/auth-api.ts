import { api } from '@/lib/api'
import type {
  AuthPayload,
  DetailResponse,
  LoginResult,
  OtpPurpose,
  RegisterPayload,
  User,
} from '@/types/auth'

export const authApi = {
  register(payload: RegisterPayload) {
    return api.post<DetailResponse>('/auth/register/', payload).then((r) => r.data)
  },
  verifyEmail(email: string, otp: string) {
    return api.post<DetailResponse>('/auth/verify-email/', { email, otp }).then((r) => r.data)
  },
  login(email: string, password: string) {
    return api.post<LoginResult>('/auth/login/', { email, password }).then((r) => r.data)
  },
  verifyFirstLogin(email: string, otp: string) {
    return api.post<AuthPayload>('/auth/verify-first-login/', { email, otp }).then((r) => r.data)
  },
  resendOtp(email: string, purpose: OtpPurpose) {
    return api.post<DetailResponse>('/auth/resend-otp/', { email, purpose }).then((r) => r.data)
  },
  forgotPassword(email: string) {
    return api.post<DetailResponse>('/auth/password/forgot/', { email }).then((r) => r.data)
  },
  resetPassword(email: string, otp: string, newPassword: string) {
    return api
      .post<DetailResponse>('/auth/password/reset/', { email, otp, new_password: newPassword })
      .then((r) => r.data)
  },
  changePassword(currentPassword: string, newPassword: string) {
    return api
      .post<DetailResponse>('/auth/password/change/', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      .then((r) => r.data)
  },
  logout(refresh: string) {
    return api.post<DetailResponse>('/auth/logout/', { refresh }).then((r) => r.data)
  },
  me() {
    return api.get<User>('/auth/me/').then((r) => r.data)
  },
  updateProfile(payload: { first_name?: string; last_name?: string; phone_number?: string }) {
    return api.patch<User>('/auth/me/', payload).then((r) => r.data)
  },
  setInitialPassword(newPassword: string) {
    return api.post<User>('/auth/password/set-initial/', { new_password: newPassword }).then((r) => r.data)
  },
}
