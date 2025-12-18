import ChatButton from '@/components/ChatButton'

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <ChatButton />
    </>
  )
}