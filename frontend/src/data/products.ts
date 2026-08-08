import type { Category, Product, ProductStatus } from '@/types'

interface Spec {
  name: string
  category: Category
  price: number
  originalPrice: number
  commissionPct: number
  hue: number
}

const SPECS: Spec[] = [
  // Electronics
  { name: 'Fone Bluetooth XYZ Pro', category: 'Electronics', price: 89.9, originalPrice: 129.9, commissionPct: 12, hue: 222 },
  { name: 'Smart Watch Série 8', category: 'Electronics', price: 149.9, originalPrice: 249.9, commissionPct: 10, hue: 214 },
  { name: 'Caixa de Som Bluetooth Mini', category: 'Electronics', price: 59.9, originalPrice: 89.9, commissionPct: 14, hue: 204 },
  { name: 'Carregador Turbo 65W GaN', category: 'Electronics', price: 79.9, originalPrice: 119.9, commissionPct: 11, hue: 226 },
  { name: 'Webcam Full HD 1080p', category: 'Electronics', price: 99.9, originalPrice: 149.9, commissionPct: 12, hue: 218 },
  // Beauty
  { name: 'Kit Skincare Vitamina C', category: 'Beauty', price: 69.9, originalPrice: 99.9, commissionPct: 15, hue: 326 },
  { name: 'Sérum Facial Ácido Hialurônico', category: 'Beauty', price: 49.9, originalPrice: 79.9, commissionPct: 16, hue: 312 },
  { name: 'Secador Profissional 2200W', category: 'Beauty', price: 159.9, originalPrice: 219.9, commissionPct: 10, hue: 300 },
  { name: 'Máscara de Argila Verde', category: 'Beauty', price: 39.9, originalPrice: 59.9, commissionPct: 18, hue: 332 },
  { name: 'Modelador de Cachos 32mm', category: 'Beauty', price: 89.9, originalPrice: 129.9, commissionPct: 12, hue: 318 },
  // Home
  { name: 'Luminária LED Stick', category: 'Home', price: 45.9, originalPrice: 69.9, commissionPct: 14, hue: 36 },
  { name: 'Organizador 12 Gavetas', category: 'Home', price: 99.9, originalPrice: 149.9, commissionPct: 11, hue: 28 },
  { name: 'Aspirador Robô Inteligente', category: 'Home', price: 599.9, originalPrice: 899.9, commissionPct: 8, hue: 20 },
  { name: 'Jogo de Panelas Antiaderente', category: 'Home', price: 179.9, originalPrice: 259.9, commissionPct: 9, hue: 32 },
  { name: 'Purificador de Ar 3 em 1', category: 'Home', price: 249.9, originalPrice: 349.9, commissionPct: 10, hue: 44 },
  // Fashion
  { name: 'Camiseta Oversize Premium', category: 'Fashion', price: 39.9, originalPrice: 59.9, commissionPct: 15, hue: 268 },
  { name: 'Jaqueta Corta-Vento', category: 'Fashion', price: 129.9, originalPrice: 189.9, commissionPct: 12, hue: 256 },
  { name: 'Bolsa Transversal Feminina', category: 'Fashion', price: 79.9, originalPrice: 119.9, commissionPct: 13, hue: 280 },
  { name: 'Tênis Casual Sneaker', category: 'Fashion', price: 149.9, originalPrice: 229.9, commissionPct: 11, hue: 244 },
  { name: 'Cinto de Couro Unissex', category: 'Fashion', price: 34.9, originalPrice: 49.9, commissionPct: 14, hue: 292 },
  // Accessories
  { name: 'Smartband Fitness Pro', category: 'Accessories', price: 59.9, originalPrice: 89.9, commissionPct: 13, hue: 192 },
  { name: 'Óculos de Sol Polarizado', category: 'Accessories', price: 49.9, originalPrice: 79.9, commissionPct: 12, hue: 184 },
  { name: 'Carteira RFID Bloqueadora', category: 'Accessories', price: 44.9, originalPrice: 69.9, commissionPct: 15, hue: 200 },
  { name: 'Relógio Minimalista Aço', category: 'Accessories', price: 109.9, originalPrice: 159.9, commissionPct: 11, hue: 176 },
  // Gaming
  { name: 'Mouse Gamer 12000 DPI', category: 'Gaming', price: 69.9, originalPrice: 99.9, commissionPct: 12, hue: 262 },
  { name: 'Headset Gamer 7.1', category: 'Gaming', price: 119.9, originalPrice: 179.9, commissionPct: 12, hue: 250 },
  { name: 'Controle Gamepad Sem Fio', category: 'Gaming', price: 99.9, originalPrice: 149.9, commissionPct: 13, hue: 274 },
  { name: 'Microfone Condensador USB', category: 'Gaming', price: 89.9, originalPrice: 139.9, commissionPct: 14, hue: 238 },
  // Fitness
  { name: 'Tapete de Yoga Antiderrapante', category: 'Fitness', price: 59.9, originalPrice: 89.9, commissionPct: 14, hue: 152 },
  { name: 'Garrafa Térmica 1L', category: 'Fitness', price: 49.9, originalPrice: 69.9, commissionPct: 15, hue: 140 },
  { name: 'Kit Halteres Ajustáveis 20kg', category: 'Fitness', price: 199.9, originalPrice: 289.9, commissionPct: 10, hue: 164 },
  { name: 'Corda de Pular Speed', category: 'Fitness', price: 29.9, originalPrice: 44.9, commissionPct: 16, hue: 128 },
  { name: 'Faixa Elástica de Resistência', category: 'Fitness', price: 39.9, originalPrice: 59.9, commissionPct: 15, hue: 116 },
  // Gadgets
  { name: 'Mini Projetor Portátil', category: 'Gadgets', price: 299.9, originalPrice: 449.9, commissionPct: 9, hue: 12 },
  { name: 'Fita LED RGB 5m', category: 'Gadgets', price: 34.9, originalPrice: 54.9, commissionPct: 14, hue: 0 },
  { name: 'Esterilizador UV Portátil', category: 'Gadgets', price: 89.9, originalPrice: 129.9, commissionPct: 12, hue: 24 },
  { name: 'Suporte Magnético para Celular', category: 'Gadgets', price: 24.9, originalPrice: 39.9, commissionPct: 17, hue: 348 },
  { name: 'Power Bank 20000mAh', category: 'Gadgets', price: 119.9, originalPrice: 169.9, commissionPct: 12, hue: 16 },
  { name: 'Pulseira Massageadora TENS', category: 'Gadgets', price: 79.9, originalPrice: 119.9, commissionPct: 13, hue: 8 },
]

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function statusFor(i: number): ProductStatus {
  if (i % 17 === 0) return 'inactive'
  if (i % 6 === 0) return 'paused'
  return 'active'
}

function daysAgo(days: number, hour = 10): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
  return d.toISOString()
}

function pad(id: number): string {
  return String(id).padStart(3, '0')
}

export const mockProducts: Product[] = SPECS.map((spec, i) => {
  const rnd = mulberry32(i * 7 + 13)
  const rating = Math.round((3.9 + rnd() * 0.9) * 10) / 10
  const sales = Math.round(220 + rnd() * 1900)
  const clicks = Math.round(sales * (3 + rnd() * 7))
  const conversions = Math.round(clicks * (0.028 + rnd() * 0.042))
  const revenue = Math.round(conversions * spec.price * (spec.commissionPct / 100) * 100) / 100

  return {
    id: `PRD-${pad(i + 1)}`,
    name: spec.name,
    category: spec.category,
    price: spec.price,
    originalPrice: spec.originalPrice,
    discountPct: Math.round(((spec.originalPrice - spec.price) / spec.originalPrice) * 100),
    commissionPct: spec.commissionPct,
    status: statusFor(i),
    affiliateUrl: `https://aff.tiktokshop.com/item/${pad(i + 1)}`,
    clicks,
    conversions,
    revenue,
    rating,
    sales,
    createdAt: daysAgo(10 + Math.floor(rnd() * 110)),
  }
})

export const CATEGORY_META: Record<Category, { hue: number }> = {
  Electronics: { hue: 222 },
  Beauty: { hue: 326 },
  Home: { hue: 30 },
  Fashion: { hue: 268 },
  Accessories: { hue: 192 },
  Gaming: { hue: 262 },
  Fitness: { hue: 150 },
  Gadgets: { hue: 12 },
}
