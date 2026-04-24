const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'LayerBuzz <noreply@layerbuzz.com>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email send')
    console.log('Would have sent email to:', to)
    console.log('Subject:', subject)
    return { success: true, skipped: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to send email: ${error}`)
  }

  return { success: true }
}

export function buildLicenceEmail({
  template,
  buyerName,
  buyerEmail,
  licenceKey,
  maxActivations,
  sellerName,
  productTitle,
}: {
  template: string
  buyerName: string
  buyerEmail: string
  licenceKey: string
  maxActivations: number
  sellerName: string
  productTitle: string
}): string {
  const text = template
    .replace(/{{buyer_name}}/g, buyerName || 'there')
    .replace(/{{buyer_email}}/g, buyerEmail)
    .replace(/{{licence_key}}/g, licenceKey)
    .replace(/{{max_activations}}/g, maxActivations.toString())
    .replace(/{{seller_name}}/g, sellerName)
    .replace(/{{product_title}}/g, productTitle)

  // Convert plain text to HTML with styled key
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:white;letter-spacing:-0.5px;">
        Layer<span style="opacity:0.8;">sell</span>
      </div>
      <div style="color:rgba(255,255,255,0.7);font-size:14px;margin-top:6px;">
        ${productTitle}
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      ${text
        .split('\n\n')
        .map(para => {
          // Style the licence key specially
          if (para.includes(licenceKey)) {
            return `<div style="background:#1a1a2e;border:1px solid #7c3aed40;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
              <div style="color:#a78bfa;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Your Licence Key</div>
              <div style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#e2e8f0;letter-spacing:2px;word-break:break-all;">${licenceKey}</div>
              <div style="color:#6b7280;font-size:11px;margin-top:10px;">Keep this safe — do not share it</div>
            </div>`
          }
          return `<p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 16px;">${para.replace(/\n/g, '<br>')}</p>`
        })
        .join('')}
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #222;text-align:center;">
      <p style="color:#4b5563;font-size:12px;margin:0;">
        Powered by <a href="https://layerbuzz.com" style="color:#7c3aed;text-decoration:none;">LayerBuzz</a> 
        · Part of <a href="https://ayteelabs.com" style="color:#7c3aed;text-decoration:none;">AyTee Labs</a>
      </p>
    </div>
  </div>
</body>
</html>`

  return html
}
