const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const { z } = require('zod')
const { MongoMemoryServer } = require('mongodb-memory-server')

dotenv.config()


console.log("MONGO_URI:", process.env.MONGO_URI);



const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

const ROLES = /** @type {const} */ (['customer', 'farmer', 'admin'])
const ORDER_STATUSES = /** @type {const} */ ([
  'pending',
  'shipped',
  'delivered',
  // Backward compatibility for existing seeded/demo orders.
  'placed',
  'confirmed',
  'packed',
  'out_for_delivery',
  'cancelled',
])

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
}

function auth(req, res, next) {
  const hdr = req.headers.authorization || ''
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

// -------------------- DB --------------------
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'customer' },
  },
  { timestamps: true },
)

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Vegetables', 'Fruits', 'Dry Fruits'],
      required: true,
    },
    price: { type: Number, required: true, min: 1 },
    quantity: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true, min: 0 },
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ['mock', 'stripe', 'upi', 'cod'], default: 'cod' },
    paymentMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
    estimatedDelivery: { type: String, required: true },
  },
  { timestamps: true },
)

const User = mongoose.model('User', UserSchema)
const Product = mongoose.model('Product', ProductSchema)
const Order = mongoose.model('Order', OrderSchema)

let mongoMemory = null

async function connectMongo() {
  const uri = process.env.MONGO_URI?.trim()
  if (uri) {
    await mongoose.connect(uri)
    return { mode: 'external', uri }
  }
  mongoMemory = await MongoMemoryServer.create()
  const memUri = mongoMemory.getUri()
  await mongoose.connect(memUri)
  return { mode: 'memory', uri: memUri }
}

async function seedIfEmpty() {
  const count = await Product.countDocuments()
  if (count > 0) return

  let farmer = await User.findOne({ role: 'farmer' })
  if (!farmer) {
    const passwordHash = await bcrypt.hash('Farmer@123', 10)
    farmer = await User.create({
      name: 'Demo Farmer',
      email: 'farmer@farmax.test',
      passwordHash,
      role: 'farmer',
    })
  }

  const items = [

    { name: 'Capsicum', category: 'Vegetables', price: 40, quantity: 100 },
  ].map((p) => ({ ...p, images: [], farmerId: farmer._id }))

  await Product.insertMany(items)
}

// -------------------- Validation --------------------
const SignupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  role: z.enum(ROLES).default('customer'),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const ProductCreateSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.enum(['Vegetables', 'Fruits', 'Dry Fruits']),
  price: z.number().int().positive(),
  quantity: z.number().int().min(0),
  images: z
    .array(
      z.union([z.string().url(), z.string().startsWith('data:image/')]),
    )
    .optional()
    .default([]),
})

const ProductUpdateSchema = ProductCreateSchema.partial()

const OrderCreateSchema = z.object({
  address: z.string().min(5).max(500),
  paymentMethod: z.enum(['mock', 'stripe', 'upi', 'cod']).optional().default('cod'),
  paymentMeta: z
    .object({
      upiMode: z.enum(['any_app', 'upi_id']).optional(),
      upiId: z.string().min(3).max(80).optional(),
    })
    .optional()
    .default({}),
  products: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1),
      }),
    )
    .min(1),
})

// -------------------- App --------------------
const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.get('/',(req,res)=>{res.send('Farmax API is running🚀');});


// Auth
app.post('/api/signup', async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message })
  const { name, email, password, role } = parsed.data
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return res.status(409).json({ error: 'Email already registered' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, role })
  const token = signToken(user)
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  })
})

app.post('/api/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message })
  const { email, password } = parsed.data
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })
  const token = signToken(user)
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  })
})

// Products
app.get('/api/products', async (req, res) => {
  const mine = req.query.mine === '1'
  if (!mine) {
    const products = await Product.find().sort({ createdAt: -1 }).limit(200)
    return res.json({ products })
  }
  // mine=1 requires auth farmer/admin
  const hdr = req.headers.authorization || ''
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Missing token' })
  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
  if (!['farmer', 'admin'].includes(payload.role))
    return res.status(403).json({ error: 'Forbidden' })
  const products = await Product.find({ farmerId: payload.sub }).sort({ createdAt: -1 })
  return res.json({ products })
})

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('farmerId', 'name email role')
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json({ product })
})

app.post('/api/products', auth, requireRole(['farmer', 'admin']), async (req, res) => {
  const parsed = ProductCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message })
  const data = parsed.data
  const product = await Product.create({ ...data, farmerId: req.user.sub })
  res.status(201).json({ product })
})

app.put('/api/products/:id', auth, requireRole(['farmer', 'admin']), async (req, res) => {
  const parsed = ProductUpdateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message })
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ error: 'Not found' })
  if (req.user.role !== 'admin' && product.farmerId.toString() !== req.user.sub)
    return res.status(403).json({ error: 'Forbidden' })
  Object.assign(product, parsed.data)
  await product.save()
  res.json({ product })
})

app.delete('/api/products/:id', auth, requireRole(['farmer', 'admin']), async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ error: 'Not found' })
  if (req.user.role !== 'admin' && product.farmerId.toString() !== req.user.sub)
    return res.status(403).json({ error: 'Forbidden' })
  await product.deleteOne()
  res.json({ ok: true })
})

// Orders
function estimateDeliveryFromCategory(category) {
  if (category === 'Dry Fruits') return '12–24 hours'
  return '6–12 hours'
}

app.post('/api/orders', auth, async (req, res) => {
  const parsed = OrderCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message })
  const { address, paymentMethod, paymentMeta, products } = parsed.data

  if (paymentMethod === 'upi') {
    const upiMode = String(paymentMeta?.upiMode || 'any_app')
    const upiId = String(paymentMeta?.upiId || '').trim()
    if (upiMode === 'upi_id' && !upiId)
      return res.status(400).json({ error: 'UPI ID required for this option' })
  }

  const ids = products.map((p) => p.productId)
  const dbProducts = await Product.find({ _id: { $in: ids } })
  const map = new Map(dbProducts.map((p) => [p._id.toString(), p]))

  const lines = []
  let total = 0
  for (const item of products) {
    const p = map.get(item.productId)
    if (!p) return res.status(400).json({ error: `Unknown product ${item.productId}` })
    if (p.quantity < item.qty) return res.status(400).json({ error: `Insufficient stock: ${p.name}` })
    lines.push({
      productId: p._id,
      qty: item.qty,
      priceAtPurchase: p.price,
      farmerId: p.farmerId,
    })
    total += p.price * item.qty
  }

  for (const ln of lines) {
    await Product.updateOne({ _id: ln.productId }, { $inc: { quantity: -ln.qty } })
  }

  const categories = new Set(
    dbProducts.map((p) => p.category),
  )
  const eta = categories.has('Dry Fruits') && categories.size === 1
    ? estimateDeliveryFromCategory('Dry Fruits')
    : '6–24 hours'

  const order = await Order.create({
    userId: req.user.sub,
    products: lines,
    totalPrice: total,
    status: 'pending',
    address,
    paymentMethod,
    paymentMeta: paymentMeta || {},
    estimatedDelivery: eta,
  })

  res.status(201).json({ order })
})

app.get('/api/orders', auth, async (req, res) => {
  if (req.user.role === 'customer') {
    const orders = await Order.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(100)
    return res.json({ orders })
  }

  // Farmer/admin: see orders that include their products (or all for admin)
  if (req.user.role === 'admin') {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200)
    return res.json({ orders })
  }
  const orders = await Order.find({ 'products.farmerId': req.user.sub }).sort({ createdAt: -1 }).limit(200)
  return res.json({ orders })
})

app.put('/api/orders/:id', auth, requireRole(['farmer', 'admin']), async (req, res) => {
  const status = String(req.body?.status || '').trim()
  const allowed = ['pending', 'shipped', 'delivered', 'cancelled']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Not found' })

  if (req.user.role === 'farmer') {
    const hasLine = order.products.some((p) => p.farmerId.toString() === req.user.sub)
    if (!hasLine) return res.status(403).json({ error: 'Forbidden' })
  }

  order.status = status
  await order.save()
  res.json({ order })
})

// -------------------- AI (NO pricing) --------------------
// Simple association rules for demo recommendations.
// In production, you'd replace this with real history-based models.
const ASSOCIATIONS = [
  { a: 'Apples', b: 'Bananas' },
  { a: 'Tomatoes', b: 'Onions' },
  { a: 'Cashews', b: 'Almonds' },
  { a: 'Mangoes', b: 'Bananas' },
]

app.get('/api/ai/recommendations', async (req, res) => {
  const seedProductId = String(req.query.seedProductId || '').trim()
  const userId = String(req.query.userId || '').trim()

  let seedProduct = null
  if (seedProductId) seedProduct = await Product.findById(seedProductId)

  // If we have a seed product, try association by name.
  if (seedProduct) {
    const hits = ASSOCIATIONS.filter(
      (x) => x.a === seedProduct.name || x.b === seedProduct.name,
    )
    const otherNames = hits
      .map((x) => (x.a === seedProduct.name ? x.b : x.a))
      .slice(0, 5)
    const recommendations = await Product.find({ name: { $in: otherNames } }).limit(10)
    return res.json({ seed: seedProductId, userId: userId || null, recommendations })
  }

  // Fallback: top products by stock (proxy for supply) - just a demo.
  const recommendations = await Product.find().sort({ quantity: -1 }).limit(8)
  res.json({ seed: null, userId: userId || null, recommendations })
})

app.get('/api/ai/demand', async (req, res) => {
  // Basic rule-based demand: low stock => high demand risk.
  const products = await Product.find().limit(200)
  const prediction = products
    .map((p) => {
      let label = 'normal'
      if (p.quantity <= 25) label = 'high'
      else if (p.quantity <= 60) label = 'medium'
      return { productId: p._id, name: p.name, category: p.category, stock: p.quantity, demand: label }
    })
    .sort((a, b) => (a.demand < b.demand ? 1 : -1))
    .slice(0, 20)
  res.json({ prediction })
})

app.post('/api/ai/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim()
  if (!message) return res.status(400).json({ error: 'Message required' })

  const lower = message.toLowerCase()
  let reply =
    'I can help with products, orders, delivery ETA, and account questions. What do you need?'

  if (lower.includes('delivery') || lower.includes('eta')) {
    reply =
      'Orders are delivered directly from farms. Typical ETA is 6–24 hours depending on category and route.'
  } else if (lower.includes('payment') || lower.includes('stripe')) {
    reply =
      'This demo uses mock payments. If you choose Stripe, it is also mocked for local testing.'
  } else if (lower.includes('return') || lower.includes('refund')) {
    reply =
      'For the demo, refunds/returns are not automated. Please contact support with your order ID.'
  } else if (lower.includes('pricing')) {
    reply =
      'Smart pricing is disabled in this build as requested. Product prices are set manually by farmers.'
  }

  res.json({ reply })
})

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }))





// -------------------- Boot --------------------
async function boot() {
  const info = await connectMongo()
  await seedIfEmpty()
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Farmax API running on http://localhost:${PORT}`)
    console.log(`Mongo mode: ${info.mode}`)
  })
}

boot().catch((err) => {
  console.error(err)
  process.exit(1)
})

