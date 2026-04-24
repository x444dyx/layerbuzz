'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Camera, User, Plus, X, ChevronDown } from 'lucide-react'
import { Profile } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { ImageCropModal } from '@/components/ui/image-crop-modal'

const SOCIAL_PLATFORMS = [
  { id: 'twitter', label: 'Twitter / X', placeholder: 'yourhandle', prefix: '@' },
  { id: 'instagram', label: 'Instagram', placeholder: 'yourhandle', prefix: '@' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'yourhandle', prefix: '@' },
  { id: 'youtube', label: 'YouTube', placeholder: 'channel URL or handle', prefix: '' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname', prefix: '' },
  { id: 'facebook', label: 'Facebook', placeholder: 'facebook.com/yourpage', prefix: '' },
  { id: 'twitch', label: 'Twitch', placeholder: 'yourhandle', prefix: '@' },
  { id: 'discord', label: 'Discord', placeholder: 'discord.gg/invite', prefix: '' },
  { id: 'spotify', label: 'Spotify', placeholder: 'open.spotify.com/artist/...', prefix: '' },
  { id: 'soundcloud', label: 'SoundCloud', placeholder: 'soundcloud.com/yourname', prefix: '' },
  { id: 'github', label: 'GitHub', placeholder: 'yourhandle', prefix: '@' },
  { id: 'threads', label: 'Threads', placeholder: 'yourhandle', prefix: '@' },
]

interface SocialLink {
  platform: string
  value: string
}

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [website, setWebsite] = useState(profile?.website || '')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    (profile as any)?.social_links || []
  )
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Max size is 10MB', variant: 'destructive' })
      return
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCropImageSrc(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropConfirm = (blob: Blob) => {
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(blob))
    setCropImageSrc(null)
  }

  const addSocial = (platformId: string) => {
    if (socialLinks.find(s => s.platform === platformId)) return
    setSocialLinks(prev => [...prev, { platform: platformId, value: '' }])
    setSelectedPlatform('')
    setDropdownOpen(false)
  }

  const updateSocial = (platform: string, value: string) => {
    setSocialLinks(prev => prev.map(s => s.platform === platform ? { ...s, value } : s))
  }

  const removeSocial = (platform: string) => {
    setSocialLinks(prev => prev.filter(s => s.platform !== platform))
  }

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    p => !socialLinks.find(s => s.platform === p.id)
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: 'Not authenticated', variant: 'destructive' })
      setLoading(false)
      return
    }

    let finalAvatarUrl = avatarUrl

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/${uuidv4()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (uploadError) {
        toast({ title: 'Avatar upload failed', description: uploadError.message, variant: 'destructive' })
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      finalAvatarUrl = urlData.publicUrl
      setAvatarUrl(finalAvatarUrl)
    }

    // Extract twitter from social links for backwards compatibility
    const twitterLink = socialLinks.find(s => s.platform === 'twitter')

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: displayName.trim(),
        username: username.toLowerCase().trim(),
        bio: bio.trim(),
        website: website.trim(),
        twitter: twitterLink?.value?.trim() || null,
        social_links: socialLinks.filter(s => s.value.trim()),
        avatar_url: finalAvatarUrl || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      if (error.code === '23505' || error.message?.includes('unique')) {
        toast({ title: 'Username already taken', description: 'Please choose a different username', variant: 'destructive' })
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
      }
    } else {
      toast({ title: 'Settings saved!' })
      setAvatarFile(null)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 space-y-6">
      <h2 className="font-semibold">Profile</h2>

      {cropImageSrc && (
        <ImageCropModal
          image={cropImageSrc}
          aspect={1}
          circular={true}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-border flex items-center justify-center flex-shrink-0">
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              : <User className="w-8 h-8 text-muted-foreground/40" />
            }
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
        <div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
            {avatarPreview ? 'Change photo' : 'Upload photo'}
          </button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 10MB.</p>
          {avatarPreview && (
            <button type="button" onClick={() => { setAvatarPreview(null); setAvatarFile(null); setAvatarUrl('') }} className="text-xs text-red-400 hover:text-red-300 transition-colors mt-1 block">
              Remove photo
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Display name</Label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label>Username *</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">@</span>
            <Input
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="yourname"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">layerbuzz.com/store/{username || 'yourname'}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bio</Label>
        <textarea
          className="flex w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[90px] resize-none"
          placeholder="Tell buyers a bit about you and what you create..."
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
      </div>

      <div className="space-y-2">
        <Label>Website</Label>
        <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" type="url" />
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <Label>Social links</Label>

        {/* Added socials */}
        {socialLinks.map(social => {
          const platform = SOCIAL_PLATFORMS.find(p => p.id === social.platform)
          if (!platform) return null
          return (
            <div key={social.platform} className="flex items-center gap-2">
              <div className="w-28 flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">{platform.label}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                {platform.prefix && <span className="text-sm text-muted-foreground">{platform.prefix}</span>}
                <Input
                  value={social.value}
                  onChange={e => updateSocial(social.platform, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSocial(social.platform)}
                className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}

        {/* Add social dropdown */}
        {availablePlatforms.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add social link
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                {availablePlatforms.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addSocial(p.id)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Button type="submit" variant="gradient" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save changes
      </Button>
    </form>
  )
}