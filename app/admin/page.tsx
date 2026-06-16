// 인증 체크는 미들웨어에서 처리.
// 이 페이지는 항상 로그인 폼만 렌더링.
import AdminLogin from '@/components/admin/AdminLogin'

export default function AdminPage() {
  return <AdminLogin />
}
