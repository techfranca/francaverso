import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ChatButton from '@/components/ChatButton'

export default function DashboardLayout({ children }) {
  const session = cookies().get('francaverso_session')?.value

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-franca-green-light to-franca-blue-light">
      <Sidebar />
      <div className="flex-1 relative">
        {children}
        <ChatButton />
      </div>
    </div>
  )
}