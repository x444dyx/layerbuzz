'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Profile } from '@/types'
import {
  Layers, LayoutDashboard, Package, ShoppingBag,
  BarChart3, Settings, ExternalLink, Tag, Key
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/licences', label: 'Licences', icon: Key },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/discounts', label: 'Discounts', icon: Tag },
]

export function DashboardSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card/50 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Layer<span className="text-violet-600">buzz</span></span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn('w-4 h-4', active ? 'text-violet-600' : '')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Store link */}
        {profile?.username && (
          <div className="p-4 border-t border-border">
            <Link
              href={`/store/${profile.username}`}
              target="_blank"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all group"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              View your store
            </Link>
          </div>
        )}

        {/* Profile */}
        <div className="p-4 border-t border-border">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-all group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                    {profile?.display_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || '?'}
                  </div>
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate group-hover:text-foreground transition-colors">{profile?.display_name || profile?.username}</p>
              <p className="text-xs text-muted-foreground truncate">@{profile?.username}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  )
}
