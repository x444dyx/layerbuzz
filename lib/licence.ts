/**
 * Generates a unique licence key with a product-based prefix
 * Format: PREFIX-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenceKey(productTitle: string, customPrefix?: string): string {
  const prefix = customPrefix
    ? customPrefix.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    : productTitle
        .toUpperCase()
        .split(' ')[0]
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8)

  const segment = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(4, '0').slice(0, 4)

  return `${prefix}-${segment()}-${segment()}-${segment()}-${segment()}`
}

/**
 * Default licence email template
 */
export function getDefaultLicenceEmailBody(productTitle: string): string {
  return `Hi {{buyer_name}},

Thank you for purchasing ${productTitle}!

Your licence key is:

{{licence_key}}

To activate your licence:
1. Open the application
2. Navigate to Settings → Activate Licence
3. Paste your key and click Activate

Your licence allows up to {{max_activations}} activation(s).

If you have any issues, please reply to this email.

Thanks,
{{seller_name}}`
}

export function getDefaultLicenceEmailSubject(productTitle: string): string {
  return `Your ${productTitle} licence key`
}
