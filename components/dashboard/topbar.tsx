'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { LogOut, Plus } from 'lucide-react'
import Link from 'next/link'

export function DashboardTopbar({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="lg:hidden font-semibold">LayerBuzz</div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <Button size="sm" variant="gradient" asChild>
          <Link href="/dashboard/products/new">
            <Plus className="w-4 h-4" />
            New product
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
