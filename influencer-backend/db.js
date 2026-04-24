import { JSONFilePreset } from 'lowdb/node'

const defaultData = {
  users: [
    {
      id: "admin-1",
      name: "Brand Admin",
      email: "admin@brand.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      role: "admin"
    }
  ],
  influencers: [
    { id: "inf-1", userId: "user-inf-1", name: "Priya Sharma", code: "PRIYA10", email: "priya@gmail.com" },
    { id: "inf-2", userId: "user-inf-2", name: "Rahul Verma", code: "RAHUL20", email: "rahul@gmail.com" },
    { id: "inf-3", userId: "user-inf-3", name: "Sneha Patel", code: "SNEHA30", email: "sneha@gmail.com" }
  ],
  sales: [
    { id: "s1", influencerId: "inf-1", amount: 2500, date: "2026-04-01", product: "Kurta Set" },
    { id: "s2", influencerId: "inf-1", amount: 1800, date: "2026-04-03", product: "Ethnic Wear" },
    { id: "s3", influencerId: "inf-2", amount: 3200, date: "2026-04-02", product: "Saree" },
    { id: "s4", influencerId: "inf-3", amount: 900,  date: "2026-04-04", product: "Dupatta" },
    { id: "s5", influencerId: "inf-1", amount: 4100, date: "2026-04-05", product: "Lehenga" },
    { id: "s6", influencerId: "inf-2", amount: 2200, date: "2026-04-06", product: "Kurta Set" },
    { id: "s7", influencerId: "inf-3", amount: 1500, date: "2026-04-07", product: "Ethnic Wear" },
    { id: "s8", influencerId: "inf-1", amount: 3800, date: "2026-04-08", product: "Saree" },
    { id: "s9", influencerId: "inf-2", amount: 2900, date: "2026-04-09", product: "Lehenga" },
    { id: "s10", influencerId: "inf-3", amount: 1100, date: "2026-04-10", product: "Dupatta" },
    { id: "s11", influencerId: "inf-1", amount: 5200, date: "2026-04-12", product: "Bridal Set" },
    { id: "s12", influencerId: "inf-2", amount: 1700, date: "2026-04-13", product: "Kurta" },
    { id: "s13", influencerId: "inf-3", amount: 2400, date: "2026-04-14", product: "Saree" },
    { id: "s14", influencerId: "inf-1", amount: 3100, date: "2026-04-15", product: "Lehenga" },
    { id: "s15", influencerId: "inf-2", amount: 4400, date: "2026-04-16", product: "Bridal Set" }
  ],
  payments: [
    { id: "p1", influencerId: "inf-1", amount: 1530, status: "paid",    date: "2026-04-10" },
    { id: "p2", influencerId: "inf-2", amount: 820,  status: "pending", date: "2026-04-11" },
    { id: "p3", influencerId: "inf-3", amount: 390,  status: "approved",date: "2026-04-12" }
  ],
  clicks: [
    { id: "c1", influencerId: "inf-1", date: "2026-04-01", count: 320 },
    { id: "c2", influencerId: "inf-2", date: "2026-04-01", count: 210 },
    { id: "c3", influencerId: "inf-3", date: "2026-04-01", count: 150 },
    { id: "c4", influencerId: "inf-1", date: "2026-04-08", count: 480 },
    { id: "c5", influencerId: "inf-2", date: "2026-04-08", count: 390 },
    { id: "c6", influencerId: "inf-3", date: "2026-04-08", count: 120 }
  ]
}

const db = await JSONFilePreset('db.json', defaultData)
export default db