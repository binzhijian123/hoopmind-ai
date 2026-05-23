import BottomNav from './BottomNav'

type LayoutProps = {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen text-orange-50">
      <main className="mx-auto min-h-screen w-full max-w-[430px] px-4 pb-24 pt-5">{children}</main>
      <BottomNav />
    </div>
  )
}

export default Layout
