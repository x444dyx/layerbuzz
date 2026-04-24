'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { slugify, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PRODUCT_CATEGORIES } from '@/types'
import { useToast } from '@/hooks/use-toast'
import {
  Upload, X, ImageIcon, FileIcon, Loader2,
  DollarSign, Tag, Eye, Save
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ImageCropModal } from '@/components/ui/image-crop-modal'

interface ProductFormProps {
  initialData?: any
  productId?: string
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '0')
  const [isFree, setIsFree] = useState(initialData?.is_free || false)
  const [category, setCategory] = useState(initialData?.category || 'other')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [customCta, setCustomCta] = useState(initialData?.custom_cta || '')
  const [thankYouMessage, setThankYouMessage] = useState(initialData?.thank_you_message || '')
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false)

  const [productType, setProductType] = useState<'file' | 'licence'>(initialData?.product_type || 'file')
  const [licencePrefix, setLicencePrefix] = useState(initialData?.licence_prefix || '')
  const [licenceMaxActivations, setLicenceMaxActivations] = useState(initialData?.licence_max_activations?.toString() || '1')
  const [licenceEmailSubject, setLicenceEmailSubject] = useState(initialData?.licence_email_subject || '')
  const [licenceEmailBody, setLicenceEmailBody] = useState(initialData?.licence_email_body || '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.cover_image_url || null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [productFiles, setProductFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<any[]>(initialData?.files || [])
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  const handleDeleteExistingFile = async (file: any) => {
    if (!confirm(`Remove "${file.name}"? This cannot be undone.`)) return
    setDeletingFileId(file.id)
    try {
      // Delete from storage
      await supabase.storage.from('product-files').remove([file.file_path])
      // Delete from database
      await supabase.from('product_files').delete().eq('id', file.id)
      // Remove from state
      setExistingFiles(prev => prev.filter(f => f.id !== file.id))
      toast({ title: 'File removed' })
    } catch (err: any) {
      toast({ title: 'Error removing file', description: err.message, variant: 'destructive' })
    }
    setDeletingFileId(null)
  }

  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!productId) setSlug(slugify(val))
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim()) && tags.length < 10) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const onCoverDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (file) {
      // Open crop modal instead of direct preview
      const reader = new FileReader()
      reader.onload = () => setCropImageSrc(reader.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  const handleCoverCropConfirm = (blob: Blob) => {
    const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(blob))
    setCropImageSrc(null)
  }

  const onFileDrop = useCallback((files: File[]) => {
    setProductFiles(prev => [...prev, ...files])
  }, [])

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDrag } = useDropzone({
    onDrop: onCoverDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps, isDragActive: isFileDrag } = useDropzone({
    onDrop: onFileDrop,
    maxSize: 500 * 1024 * 1024,
  })

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) {
      toast({ title: 'Missing title', description: 'Please add a product title', variant: 'destructive' })
      return
    }
    if (productFiles.length === 0 && !productId && productType === 'file') {
      toast({ title: 'No files', description: 'Please upload at least one file', variant: 'destructive' })
      return
    }

    setSaving(true)
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let coverImageUrl = initialData?.cover_image_url || null

      // Upload cover image
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${user.id}/${uuidv4()}.${ext}`
        const { error } = await supabase.storage.from('product-covers').upload(path, coverFile)
        if (error) throw error
        const { data: urlData } = supabase.storage.from('product-covers').getPublicUrl(path)
        coverImageUrl = urlData.publicUrl
      }

      setUploadProgress(30)

      const productData = {
        seller_id: user.id,
        title: title.trim(),
        slug: slug || slugify(title),
        description: description.trim(),
        price: isFree ? 0 : parseFloat(price) || 0,
        is_free: isFree,
        category,
        tags,
        cover_image_url: coverImageUrl,
        // If already published, saving always keeps it published
        // Only allow unpublishing via the explicit Unpublish button
        is_published: publish !== undefined ? publish : (productId ? isPublished : false),
        custom_cta: customCta.trim() || null,
        thank_you_message: thankYouMessage.trim() || null,
        product_type: productType,
        licence_prefix: licencePrefix.trim() || null,
        licence_max_activations: parseInt(licenceMaxActivations) || 1,
        licence_email_subject: licenceEmailSubject.trim() || null,
        licence_email_body: licenceEmailBody.trim() || null,
        updated_at: new Date().toISOString(),
      }

      let pid = productId

      if (productId) {
        const { error } = await supabase.from('products').update(productData).eq('id', productId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single()
        if (error) throw error
        pid = data.id
      }

      setUploadProgress(60)

      // Upload product files
      if (productFiles.length > 0 && pid) {
        for (let i = 0; i < productFiles.length; i++) {
          const file = productFiles[i]
          const path = `${user.id}/${pid}/${uuidv4()}-${file.name}`
          const { error: uploadError } = await supabase.storage.from('product-files').upload(path, file)
          if (uploadError) throw uploadError

          const { error: dbError } = await supabase.from('product_files').insert({
            product_id: pid,
            name: file.name,
            file_path: path,
            file_size: file.size,
            file_type: file.type,
            sort_order: existingFiles.length + i,
          })
          if (dbError) throw dbError

          setUploadProgress(60 + Math.round(((i + 1) / productFiles.length) * 35))
        }
      }

      setUploadProgress(100)

      toast({
        title: productId ? 'Product updated!' : 'Product created!',
        description: publish === true ? 'Your product is now live.' : publish === false ? 'Product unpublished.' : isPublished ? 'Changes saved — product is still live.' : 'Saved as draft.',
      })

      router.push('/dashboard/products')
      router.refresh()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Cover image crop modal */}
      {cropImageSrc && (
        <ImageCropModal
          image={cropImageSrc}
          aspect={16 / 9}
          circular={false}
          onConfirm={handleCoverCropConfirm}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{productId ? 'Edit product' : 'New product'}</h1>
          <p className="text-muted-foreground text-sm mt-1">Fill in the details below</p>
        </div>
        <div className="flex items-center gap-3">
          {/* For new products show Save draft + Publish */}
          {!productId && (
            <>
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="w-4 h-4" /> Save draft
              </Button>
              <Button variant="gradient" onClick={() => handleSave(true)} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                {saving ? `Uploading ${uploadProgress}%` : 'Publish'}
              </Button>
            </>
          )}
          {/* For existing published products show Save + Unpublish */}
          {productId && isPublished && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving} className="text-muted-foreground">
                Unpublish
              </Button>
              <Button variant="gradient" onClick={() => handleSave(undefined)} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? `Saving ${uploadProgress}%` : 'Save changes'}
              </Button>
            </>
          )}
          {/* For existing draft products show Save draft + Publish */}
          {productId && !isPublished && (
            <>
              <Button variant="outline" onClick={() => handleSave(undefined)} disabled={saving}>
                <Save className="w-4 h-4" /> Save draft
              </Button>
              <Button variant="gradient" onClick={() => handleSave(true)} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                {saving ? `Uploading ${uploadProgress}%` : 'Publish'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold">Product details</h2>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g. Ultimate UI Kit for Figma"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>URL slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">layerbuzz.com/p/</span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="your-product-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="flex w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[140px] resize-y"
                placeholder="Describe your product clearly. What does it include? Who is it for? What problem does it solve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Cover image</h2>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setCoverPreview(null); setCoverFile(null) }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                {...getCoverRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  isCoverDrag ? 'border-violet-400 bg-violet-500/10' : 'border-border hover:border-violet-300 hover:bg-muted/30'
                }`}
              >
                <input {...getCoverInputProps()} />
                <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium">Drop an image or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB — a generic cover will be used if left blank</p>
              </div>
            )}
          </div>

          {/* Product files — only for file products */}
          {productType === 'file' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Product files</h2>
            <p className="text-sm text-muted-foreground">These are the files your buyers will receive after purchase.</p>

            {/* Existing files */}
            {existingFiles.length > 0 && (
              <div className="space-y-2">
                {existingFiles.map((file: any) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <FileIcon className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate text-foreground">{file.name}</span>
                    {file.file_size && <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>}
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingFile(file)}
                      disabled={deletingFileId === file.id}
                      className="text-muted-foreground hover:text-red-400 transition-colors ml-1"
                      title="Remove file"
                    >
                      {deletingFileId === file.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <X className="w-4 h-4" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New files */}
            {productFiles.length > 0 && (
              <div className="space-y-2">
                {productFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-violet-500/30">
                    <FileIcon className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    <button onClick={() => setProductFiles(prev => prev.filter((_, idx) => idx !== i))}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              {...getFileRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isFileDrag ? 'border-violet-400 bg-violet-500/10' : 'border-border hover:border-violet-300 hover:bg-muted/30'
              }`}
            >
              <input {...getFileInputProps()} />
              <Upload className="w-9 h-9 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">Drop files or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Any file type, up to 500MB each</p>
            </div>
          </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Product type */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold">Product type</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'file', label: '📁 File', desc: 'Buyers download files' },
                { value: 'licence', label: '🔑 Licence', desc: 'Buyers get a key' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setProductType(type.value as 'file' | 'licence')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    productType === type.value
                      ? 'border-violet-500/50 bg-violet-500/10 text-foreground'
                      : 'border-border hover:border-violet-500/20 text-muted-foreground'
                  }`}
                >
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Licence settings */}
          {productType === 'licence' && (
            <div className="bg-card border border-violet-500/20 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                🔑 Licence settings
              </h3>

              <div className="space-y-2">
                <Label className="text-xs">Key prefix (optional)</Label>
                <Input
                  placeholder={title ? title.split(' ')[0].toUpperCase().slice(0, 8) : 'MYAPP'}
                  value={licencePrefix}
                  onChange={e => setLicencePrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Preview: <code className="bg-muted px-1 rounded">{licencePrefix || (title ? title.split(' ')[0].toUpperCase().slice(0, 8) : 'MYAPP')}-XXXX-XXXX-XXXX-XXXX</code>
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Max activations per key</Label>
                <select
                  value={licenceMaxActivations}
                  onChange={e => setLicenceMaxActivations(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[1, 2, 3, 5, 10].map(n => (
                    <option key={n} value={n}>{n} device{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Email subject</Label>
                <Input
                  placeholder={`Your ${title || 'product'} licence key`}
                  value={licenceEmailSubject}
                  onChange={e => setLicenceEmailSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Email body</Label>
                <textarea
                  className="flex w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[160px] resize-y font-mono text-xs"
                  placeholder={`Hi {{buyer_name}},\n\nThank you for purchasing ${title || 'the product'}!\n\nYour key: {{licence_key}}\n\nTo activate:\n1. Open the app\n2. Go to Settings → Activate\n3. Paste your key\n\nThanks,\n{{seller_name}}`}
                  value={licenceEmailBody}
                  onChange={e => setLicenceEmailBody(e.target.value)}
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Available placeholders:</p>
                  <p><code className="bg-muted px-1 rounded">{'{{buyer_name}}'}</code> — buyer's name</p>
                  <p><code className="bg-muted px-1 rounded">{'{{licence_key}}'}</code> — the generated key</p>
                  <p><code className="bg-muted px-1 rounded">{'{{max_activations}}'}</code> — activation limit</p>
                  <p><code className="bg-muted px-1 rounded">{'{{seller_name}}'}</code> — your display name</p>
                  <p><code className="bg-muted px-1 rounded">{'{{product_title}}'}</code> — product name</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Free product</span>
            </label>
            {!isFree && (
              <div className="space-y-2">
                <Label>Price (GBP)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0.50"
                    step="0.01"
                    placeholder="9.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You keep £{price ? ((parseFloat(price) || 0) * 0.97).toFixed(2) : '0.00'} after 3% fee
                </p>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold">Category</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Add tag, press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            <p className="text-xs text-muted-foreground">{tags.length}/10 tags</p>
          </div>

          {/* Customisation */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold">Customise</h3>
            <div className="space-y-2">
              <Label className="text-xs">Custom buy button text</Label>
              <Input
                placeholder="e.g. Get instant access"
                value={customCta}
                onChange={(e) => setCustomCta(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Thank you message</Label>
              <textarea
                className="flex w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
                placeholder="Thanks for buying! Here's how to get started..."
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
