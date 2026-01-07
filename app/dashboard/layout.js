import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }) {
  const session = cookies().get('francaverso_session')?.value

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-franca-green-light to-franca-blue-light">
      <Sidebar />
      <div className="ml-64">
        {children}
      </div>
    </div>
  )
}