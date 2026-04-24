import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'
import { InactivityGuard } from '@/components/dashboard/inactivity-guard'
import type { Profile } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <>
      <InactivityGuard />
      <div className="min-h-screen bg-background">
        <DashboardSidebar profile={profile as Profile} />
        <div className="lg:pl-64">
          <DashboardTopbar profile={profile as Profile} />
          <main className="p-6 md:p-8 pt-20">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
