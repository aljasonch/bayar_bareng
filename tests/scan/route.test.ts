import { beforeEach, expect, test, vi } from 'vitest'
import { receipt2 } from './fixtures'

const generateContent = vi.fn()
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent }
  },
}))

const { POST } = await import('@/app/api/scan/route')

let ip = 0
function req(file: File, fromIp = `10.0.0.${++ip}`) {
  const form = new FormData()
  form.append('image', file)
  return new Request('http://localhost/api/scan', { method: 'POST', body: form, headers: { 'x-forwarded-for': fromIp } })
}
const png = (bytes = 10) => new File([new Uint8Array(bytes)], 'struk.png', { type: 'image/png' })

beforeEach(() => {
  generateContent.mockReset()
  process.env.GEMINI_API_KEY = 'test-key'
})

test('rejects a non-image file with 400', async () => {
  const res = await POST(req(new File(['hi'], 'a.txt', { type: 'text/plain' })))
  expect(res.status).toBe(400)
  expect(generateContent).not.toHaveBeenCalled()
})

test('rejects images over 4 MB with 400', async () => {
  const res = await POST(req(png(4.2 * 1024 * 1024)))
  expect(res.status).toBe(400)
})

test('returns the parsed receipt on success', async () => {
  generateContent.mockResolvedValue({ text: JSON.stringify(receipt2) })
  const res = await POST(req(png()))
  expect(res.status).toBe(200)
  expect((await res.json()).receipt).toEqual(receipt2)
  const call = generateContent.mock.calls[0][0]
  expect(call.config.responseMimeType).toBe('application/json')
  expect(call.contents[0].inlineData.mimeType).toBe('image/png')
})

test('unreadable model output is 422', async () => {
  generateContent.mockResolvedValue({ text: '{}' })
  expect((await POST(req(png()))).status).toBe(422)
  generateContent.mockResolvedValue({ text: 'not json' })
  expect((await POST(req(png()))).status).toBe(422)
})

test('a Gemini failure is 502', async () => {
  generateContent.mockRejectedValue(new Error('boom'))
  expect((await POST(req(png()))).status).toBe(502)
})

test('missing API key is 503', async () => {
  delete process.env.GEMINI_API_KEY
  expect((await POST(req(png()))).status).toBe(503)
})

test('the 11th request from one IP within a minute is 429', async () => {
  generateContent.mockResolvedValue({ text: JSON.stringify(receipt2) })
  const codes: number[] = []
  for (let i = 0; i < 11; i++) codes.push((await POST(req(png(), '9.9.9.9'))).status)
  expect(codes.slice(0, 10).every((c) => c === 200)).toBe(true)
  expect(codes[10]).toBe(429)
})

test('a busy model (503) falls back to the backup model once', async () => {
  generateContent
    .mockRejectedValueOnce(Object.assign(new Error('high demand'), { status: 503 }))
    .mockResolvedValueOnce({ text: JSON.stringify(receipt2) })
  const res = await POST(req(png()))
  expect(res.status).toBe(200)
  expect(generateContent).toHaveBeenCalledTimes(2)
  expect(generateContent.mock.calls[1][0].model).toBe('gemini-2.5-flash-lite')
})

test('a non-overload error does not retry', async () => {
  generateContent.mockRejectedValue(Object.assign(new Error('bad request'), { status: 400 }))
  expect((await POST(req(png()))).status).toBe(502)
  expect(generateContent).toHaveBeenCalledTimes(1)
})
