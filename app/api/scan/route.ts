import { GoogleGenAI } from '@google/genai'
import { parseScannedReceipt, RECEIPT_SCHEMA, ScanParseError } from '@/lib/scan/parse'

const MAX_BYTES = 5 * 1024 * 1024
const TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const LIMIT = 10
const WINDOW_MS = 60_000

const PROMPT = `This image is a receipt screenshot from the Kopi Kenangan app.
Read every line exactly as printed and return JSON.
- Item names may be cut off with "..."; copy them as shown, including the "...".
- The small grey line under an item (e.g. "Normal Ice", "No Ice") is that item's "note".
- "qty" is the number before "×"; "lineTotal" is the price on the right of that item line.
- A "Take Away …" line is NOT an item: put it in "otherFees" with its price.
- "subtotal" is the Subtotal line, "total" is the Total line.
- "promo" is the positive amount of a "Promo" line (0 if absent). "deliveryFee" is the Delivery Fee line (0 if absent).
- "orderType" is "delivery" if there is a Delivery Fee line, otherwise "pickup".
- If you see "Voucher Cashback X% s/d YRB", set cashbackPct = X and cashbackMax = Y * 1000.
- "outlet" is the Outlet Name. "date" is the Transaction Date as yyyy-mm-dd.
- All amounts are integers in rupiah with no separators (25.000 → 25000).`

// shortcut: per-instance memory on Vercel, so the limit is per server instance; upgrade to Upstash/KV if abused.
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > LIMIT
}

const error = (status: number, message: string) => Response.json({ error: message }, { status })

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) return error(429, 'Terlalu banyak scan. Tunggu sebentar lalu coba lagi.')

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return error(503, 'Scan struk belum diatur di server (GEMINI_API_KEY kosong).')

  const form = await req.formData().catch(() => null)
  const file = form?.get('image')
  if (!(file instanceof File)) return error(400, 'Pilih gambar struk dulu.')
  if (!TYPES.has(file.type)) return error(400, 'Format gambar harus PNG, JPG, atau WEBP.')
  if (file.size > MAX_BYTES) return error(400, 'Gambar terlalu besar (maks 5 MB).')

  let text: string | undefined
  try {
    const ai = new GoogleGenAI({ apiKey })
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
      contents: [{ inlineData: { mimeType: file.type, data: Buffer.from(await file.arrayBuffer()).toString('base64') } }, { text: PROMPT }],
      config: { responseMimeType: 'application/json', responseJsonSchema: RECEIPT_SCHEMA },
    })
    text = res.text
  } catch (e) {
    console.error('gemini scan failed', e)
    return error(502, 'Layanan pembaca struk sedang bermasalah. Coba lagi sebentar lagi, atau isi manual.')
  }

  try {
    return Response.json({ receipt: parseScannedReceipt(JSON.parse(text ?? '')) })
  } catch (e) {
    const message = e instanceof ScanParseError ? e.message : 'Struk tidak terbaca. Coba foto yang lebih jelas.'
    return error(422, message)
  }
}
