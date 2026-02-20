import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { TrendingDown, TrendingUp, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allTransactions = [
  { id: "TXN001", type: "Electricity", provider: "EKEDC", amount: 5000, status: "success", date: "2025-02-18", debit: true },
  { id: "TXN002", type: "Data", provider: "MTN 5GB", amount: 1500, status: "success", date: "2025-02-17", debit: true },
  { id: "TXN003", type: "Wallet Top-up", provider: "Paystack", amount: 20000, status: "success", date: "2025-02-16", debit: false },
  { id: "TXN004", type: "Cable TV", provider: "DSTV Compact", amount: 9000, status: "success", date: "2025-02-15", debit: true },
  { id: "TXN005", type: "Airtime", provider: "Airtel", amount: 500, status: "pending", date: "2025-02-14", debit: true },
  { id: "TXN006", type: "Electricity", provider: "IKEDC", amount: 8000, status: "success", date: "2025-02-12", debit: true },
  { id: "TXN007", type: "Internet", provider: "Spectranet", amount: 12000, status: "failed", date: "2025-02-11", debit: true },
  { id: "TXN008", type: "Water", provider: "LSWC", amount: 3500, status: "success", date: "2025-02-10", debit: true },
  { id: "TXN009", type: "Wallet Top-up", provider: "Flutterwave", amount: 30000, status: "success", date: "2025-02-08", debit: false },
  { id: "TXN010", type: "Data", provider: "Glo 10GB", amount: 2000, status: "success", date: "2025-02-07", debit: true },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = allTransactions.filter((tx) => {
    const matchSearch =
      tx.type.toLowerCase().includes(search.toLowerCase()) ||
      tx.provider.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "debit" && tx.debit) ||
      (filter === "credit" && !tx.debit) ||
      filter === tx.status;
    return matchSearch && matchFilter;
  });

  const totalDebit = allTransactions.filter((t) => t.debit).reduce((s, t) => s + t.amount, 0);
  const totalCredit = allTransactions.filter((t) => !t.debit).reduce((s, t) => s + t.amount, 0);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground text-sm">Your complete payment history</p>
        </div>

        {/* Summary */}
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

        {/* Filters */}
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

        {/* List */}
        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">No transactions found</p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <div key={tx.id} className={`flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors cursor-default ${i !== 0 ? "border-t" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.debit ? "bg-destructive/10" : "bg-success/10"}`}>
                  {tx.debit ? <TrendingDown className="w-4 h-4 text-destructive" /> : <TrendingUp className="w-4 h-4 text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{tx.provider} · {tx.date}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{tx.id}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className={`text-sm font-bold ${tx.debit ? "text-destructive" : "text-success"}`}>
                    {tx.debit ? "-" : "+"}{formatCurrency(tx.amount)}
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
