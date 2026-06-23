/**
 * PolicyRaj — Quote API
 * Paste your API Gateway URL here after running aws/lambda/quote/deploy.sh
 */
const QUOTE_API_URL = 'PASTE_YOUR_API_GATEWAY_URL_HERE';

/**
 * Submit a quote lead to Lambda (email + WhatsApp to Sachin).
 * Falls back to WhatsApp redirect if API is not configured.
 *
 * @param {object} data  - { type, name, mobile, email, ...formFields }
 * @returns {Promise<{success:boolean, leadId?:string}>}
 */
async function submitQuoteLead(data) {
  // If API not configured yet — fall back to WhatsApp
  if (QUOTE_API_URL.includes('PASTE_YOUR')) {
    _whatsappFallback(data);
    return { success: true, fallback: true };
  }

  const res = await fetch(QUOTE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // On API failure, fall back to WhatsApp so lead is never lost
    _whatsappFallback(data);
    return { success: true, fallback: true };
  }

  return await res.json();
}

function _whatsappFallback(data) {
  const lines = [`*New ${data.type || 'Quote'} Request — PolicyRaj*`, ''];
  Object.entries(data).forEach(([k, v]) => {
    if (v && k !== 'type') lines.push(`• *${k}:* ${v}`);
  });
  const msg = lines.join('\n');
  window.open('https://wa.me/919013976999?text=' + encodeURIComponent(msg), '_blank');
}
