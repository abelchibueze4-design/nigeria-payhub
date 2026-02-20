import AppLayout from "@/components/AppLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

const monthlyData = [
  { month: "Sep", revenue: 124000 },
  { month: "Oct", revenue: 198000 },
  { month: "Nov", revenue: 167000 },
  { month: "Dec", revenue: 243000 },
  { month: "Jan", revenue: 312000 },
  { month: "Feb", revenue: 289000 },
];

const serviceBreakdown = [
  { name: "Electricity", value: 38, color: "hsl(38,92%,50%)" },
  { name: "Airtime", value: 22, color: "hsl(152,68%,40%)" },
  { name: "Cable TV", value: 18, color: "hsl(210,90%,54%)" },
  { name: "Data", value: 14, color: "hsl(222,72%,45%)" },
  { name: "Other", value: 8, color: "hsl(215,16%,65%)" },
];

const recentUsers = [
  { name: "Adebayo Okafor", email: "adebayo@gmail.com", joined: "2025-02-18", status: "active", balance: 45000 },
  { name: "Chisom Eze", email: "chisom@yahoo.com", joined: "2025-02-17", status: "active", balance: 12500 },
  { name: "Ibrahim Musa", email: "ibrahim@outlook.com", joined: "2025-02-16", status: "active", balance: 78900 },
  { name: "Ngozi Peters", email: "ngozi@gmail.com", joined: "2025-02-15", status: "suspended", balance: 3200 },
  { name: "Emeka Obi", email: "emeka@gmail.com", joined: "2025-02-14", status: "active", balance: 56700 },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function Admin() {
  const stats = [
    { label: "Total Users", value: "12,847", change: "+234 this week", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Monthly Revenue", value: "₦289K", change: "+12% vs last month", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "Transactions", value: "48,201", change: "1,204 today", icon: CreditCard, color: "text-info", bg: "bg-info/10" },
    { label: "Failed Payments", value: "127", change: "0.3% failure rate", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform overview and analytics</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ label, value, change, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card rounded-xl p-4 border" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs text-success mt-1">{change}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-card rounded-xl p-5 border" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-semibold text-foreground mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215,16%,47%)" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-card rounded-xl p-5 border" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-semibold text-foreground mb-4">Service Split</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {serviceBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {serviceBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="p-4 border-b">
            <h3 className="font-semibold text-foreground">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Balance</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, i) => (
                  <tr key={user.email} className={`hover:bg-secondary/50 transition-colors ${i !== 0 ? "border-t" : ""}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{user.joined}</td>
                    <td className="px-4 py-3 font-medium hidden lg:table-cell">{formatCurrency(user.balance)}</td>
                    <td className="px-4 py-3">
                      <span className={user.status === "active" ? "badge-success" : "badge-failed"}>
                        {user.status === "active" ? (
                          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Active</span>
                        ) : (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Suspended</span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
