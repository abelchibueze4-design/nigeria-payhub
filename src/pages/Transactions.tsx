import AppLayout from "@/components/AppLayout";
import { useState, useEffect, useCallback } from "react";
import { TrendingDown, TrendingUp, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Transaction {
  id: string;
  type: string;
  provider: string | null;
  amount: number;
  status: string;
  created_at: string;
  is_debit: boolean;
  transaction_ref: string | null;
  plan: string | null;
  account_ref: string | null;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function Transactions() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setTransactions(data as Transaction[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.type.toLowerCase().includes(search.toLowerCase()) ||
      (tx.provider || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.transaction_ref || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "debit" && tx.is_debit) ||
      (filter === "credit" && !tx.is_debit) ||
      filter === tx.status;
    return matchSearch && matchFilter;
  });

  const totalDebit = transactions.filter((t) => t.is_debit).reduce((s, t) => s + Number(t.amount), 0);
  const totalCredit = transactions.filter((t) => !t.is_debit).reduce((s, t) => s + Number(t.amount), 0);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground text-sm">Your complete payment history</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Total Debits</span>
            </div>
            <p className="text-lg font-bold text-destructive">{formatCurrency(totalDebit)}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Total Credits</span>
            </div>
            <p className="text-lg font-bold text-success">{formatCurrency(totalCredit)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="debit">Debits</SelectItem>
              <SelectItem value="credit">Credits</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-4xl mb-3">{transactions.length === 0 ? "💸" : "🔍"}</p>
              <p className="font-medium">{transactions.length === 0 ? "No transactions yet" : "No transactions found"}</p>
              {transactions.length === 0 && <p className="text-sm mt-1">Make your first payment from the dashboard!</p>}
            </div>
          ) : (
            filtered.map((tx, i) => (
              <div key={tx.id} className={`flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors ${i !== 0 ? "border-t" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.is_debit ? "bg-destructive/10" : "bg-success/10"}`}>
                  {tx.is_debit ? <TrendingDown className="w-4 h-4 text-destructive" /> : <TrendingUp className="w-4 h-4 text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground capitalize">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {[tx.provider, tx.plan].filter(Boolean).join(" · ")} · {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                  {tx.transaction_ref && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{tx.transaction_ref}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className={`text-sm font-bold ${tx.is_debit ? "text-destructive" : "text-success"}`}>
                    {tx.is_debit ? "-" : "+"}{formatCurrency(Number(tx.amount))}
                  </p>
                  <span className={tx.status === "success" ? "badge-success" : tx.status === "pending" ? "badge-pending" : "badge-failed"}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
