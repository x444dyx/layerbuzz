import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Key, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { RevokeLicenceButton } from '@/components/dashboard/revoke-licence-button'

export const metadata = { title: 'Licences' }


export default async function LicencesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: licences } = await supabase
    .from('licence_keys')
    .select('*, product:products(title, licence_prefix)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const active = licences?.filter(l => l.status === 'active').length || 0
  const revoked = licences?.filter(l => l.status === 'revoked').length || 0

  const statusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    if (status === 'revoked') return <XCircle className="w-3.5 h-3.5 text-red-400" />
    return <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
  }

  const statusStyle = (status: string) => {
    if (status === 'active') return 'bg-emerald-500/10 text-emerald-400'
    if (status === 'revoked') return 'bg-red-500/10 text-red-400'
    return 'bg-yellow-500/10 text-yellow-400'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Licence Keys</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage all issued licence keys across your products</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total issued', value: licences?.length || 0 },
          { label: 'Active', value: active },
          { label: 'Revoked', value: revoked },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {!licences || licences.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Key className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No licence keys yet</h3>
          <p className="text-sm text-muted-foreground">Licence keys will appear here once buyers purchase your licence products</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Key</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Buyer</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden lg:table-cell">Activations</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden lg:table-cell">Issued</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {licences.map((licence: any) => (
                <tr key={licence.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded-lg font-mono tracking-wider">
                      {licence.key}
                    </code>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{licence.product?.title}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium">{licence.buyer_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{licence.buyer_email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm">{licence.activation_count}/{licence.max_activations}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyle(licence.status)}`}>
                      {statusIcon(licence.status)}
                      {licence.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{formatDate(licence.created_at)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RevokeLicenceButton
                      licenceId={licence.id}
                      isRevoked={licence.status === 'revoked'}
                      buyerEmail={licence.buyer_email}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
