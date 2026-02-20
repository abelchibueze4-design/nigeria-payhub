import AppLayout from "@/components/AppLayout";
import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PIE_COLORS = [
  "hsl(38,92%,50%)",
  "hsl(152,68%,40%)",
  "hsl(210,90%,54%)",
  "hsl(222,72%,45%)",
  "hsl(215,16%,65%)",
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function Admin() {
  const [users, setUsers] = useState<{ id: string; full_name: string | null; phone: string | null; created_at: string }[]>([]);
  const [transactions, setTransactions] = useState<{ type: string; amount: number; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: profileData }, { data: txData }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }).limit(20),
      supabase.from("transactions").select("type, amount, status, created_at").order("created_at", { ascending: false }).limit(200),
    ]);
    if (profileData) setUsers(profileData);
    if (txData) setTransactions(txData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRevenue = transactions.filter((t) => t.status === "success").reduce((s, t) => s + Number(t.amount), 0);
  const failedCount = transactions.filter((t) => t.status === "failed").length;

  // Monthly bar chart (last 6 months)
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString("default", { month: "short" });
    const revenue = transactions
      .filter((t) => {
        const td = new Date(t.created_at);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.status === "success";
      })
      .reduce((s, t) => s + Number(t.amount), 0);
    return { month: label, revenue };
  });

  // Service breakdown
  const typeCounts: Record<string, number> = {};
  transactions.forEach((t) => { typeCounts[t.type] = (typeCounts[t.type] || 0) + 1; });
  const total = transactions.length || 1;
  const serviceBreakdown = Object.entries(typeCounts).slice(0, 5).map(([name, count], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((count / total) * 100),
    color: PIE_COLORS[i] || PIE_COLORS[4],
  }));

  const stats = [
    { label: "Total Users", value: users.length.toLocaleString(), change: "Registered accounts", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), change: "All successful payments", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "Transactions", value: transactions.length.toLocaleString(), change: "All time", icon: CreditCard, color: "text-info", bg: "bg-info/10" },
    { label: "Failed Payments", value: failedCount.toString(), change: `${transactions.length ? ((failedCount / transactions.length) * 100).toFixed(1) : 0}% failure rate`, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform overview and analytics</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map(({ label, value, change, icon: Icon, color, bg }) => (
                <div key={label} className="bg-card rounded-xl p-4 border" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-xl font-bold text-foreground">{value}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{change}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
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

              <div className="bg-card rounded-xl p-5 border" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="font-semibold text-foreground mb-4">Service Split</h3>
                {serviceBreakdown.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">No data yet</div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="p-4 border-b">
                <h3 className="font-semibold text-foreground">Recent Users</h3>
              </div>
              {users.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">No users yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">Joined</th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">Phone</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} className={`hover:bg-secondary/50 transition-colors ${i !== 0 ? "border-t" : ""}`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{u.phone || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="badge-success flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
