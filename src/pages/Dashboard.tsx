import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import PaymentModal, { ServiceType } from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Zap, Wifi, Tv, Phone, Database, Droplets, Eye, EyeOff,
  Plus, TrendingUp, TrendingDown, ArrowUpRight, Bell
} from "lucide-react";

const services = [
  { id: "electricity", label: "Electricity", icon: Zap, color: "text-warning", bg: "bg-warning/10" },
  { id: "airtime", label: "Airtime", icon: Phone, color: "text-success", bg: "bg-success/10" },
  { id: "data", label: "Data", icon: Database, color: "text-info", bg: "bg-info/10" },
  { id: "cable", label: "Cable TV", icon: Tv, color: "text-accent", bg: "bg-accent/10" },
  { id: "internet", label: "Internet", icon: Wifi, color: "text-primary", bg: "bg-primary/10" },
  { id: "water", label: "Water", icon: Droplets, color: "text-info", bg: "bg-info/10" },
];

const mockTransactions = [
  { id: "TXN001", type: "Electricity", provider: "EKEDC", amount: 5000, status: "success", date: "2025-02-18", debit: true },
  { id: "TXN002", type: "Data", provider: "MTN 5GB", amount: 1500, status: "success", date: "2025-02-17", debit: true },
  { id: "TXN003", type: "Wallet Top-up", provider: "Paystack", amount: 20000, status: "success", date: "2025-02-16", debit: false },
  { id: "TXN004", type: "Cable TV", provider: "DSTV Compact", amount: 9000, status: "success", date: "2025-02-15", debit: true },
  { id: "TXN005", type: "Airtime", provider: "Airtel", amount: 500, status: "pending", date: "2025-02-14", debit: true },
];

const INITIAL_BALANCE = 45680;

export default function Dashboard() {
  const [walletBalance, setWalletBalance] = useState(INITIAL_BALANCE);
  const [hideBalance, setHideBalance] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType>(null);
  const [transactions, setTransactions] = useState(mockTransactions);

  const userRaw = localStorage.getItem("utilipay_user");
  const user = userRaw ? JSON.parse(userRaw) : { name: "User" };
  const firstName = user.name?.split(" ")[0] || "User";

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

  const handlePaymentSuccess = (amount: number, details: string) => {
    setWalletBalance((prev) => prev - amount);
    const newTx = {
      id: `TXN${Date.now().toString().slice(-6)}`,
      type: details.split(" ")[1] || "Payment",
      provider: details,
      amount,
      status: "success",
      date: new Date().toISOString().split("T")[0],
      debit: true,
    };
    setTransactions((prev) => [newTx, ...prev]);
    toast({ title: "Payment Successful ✅", description: `${formatCurrency(amount)} deducted from wallet.` });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-slide-up">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{getGreeting()},</p>
            <h1 className="text-xl font-bold text-foreground">{firstName} 👋</h1>
          </div>
          <button className="relative p-2 rounded-xl bg-card shadow-sm border hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>
        </div>

        {/* Wallet Card */}
        <div className="wallet-card rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(152,68%,40%), transparent)", transform: "translate(-30%, 30%)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg glass flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-white/80 text-sm font-medium">Wallet Balance</span>
              </div>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="text-white/70 hover:text-white transition-colors"
              >
                {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="mb-6">
              {hideBalance ? (
                <div className="flex gap-1.5 mt-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-6 h-4 rounded-sm bg-white/30" />
                  ))}
                </div>
              ) : (
                <h2 className="text-3xl font-bold">{formatCurrency(walletBalance)}</h2>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full glass flex items-center justify-center">
                  <span className="text-xs font-bold">UP</span>
                </div>
                <div>
                  <p className="text-xs text-white/60">Account</p>
                  <p className="text-sm font-medium">**** **** 4821</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 gap-1.5"
                onClick={() => toast({ title: "Fund Wallet", description: "Payment gateway coming soon! Connect Cloud to enable." })}
              >
                <Plus className="w-3.5 h-3.5" />
                Fund Wallet
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              </div>
              <span className="text-xs text-muted-foreground">This Month</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(16000)}</p>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </div>
          <div className="bg-card rounded-xl p-4 border" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              </div>
              <span className="text-xs text-muted-foreground">Total Funded</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(20000)}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>

        {/* Quick Pay */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Quick Pay</h2>
          <div className="grid grid-cols-3 gap-3">
            {services.map(({ id, label, icon: Icon, color, bg }) => (
              <button
                key={id}
                onClick={() => setActiveService(id as ServiceType)}
                className="service-btn text-center"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Recent Transactions</h2>
            <button
              className="text-xs text-accent hover:underline flex items-center gap-1"
              onClick={() => window.location.href = "/transactions"}
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            {transactions.slice(0, 5).map((tx, i) => (
              <div key={tx.id} className={`transaction-item ${i !== 0 ? "border-t" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.debit ? "bg-destructive/10" : "bg-success/10"}`}>
                  {tx.debit ? (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{tx.provider} · {tx.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${tx.debit ? "text-destructive" : "text-success"}`}>
                    {tx.debit ? "-" : "+"}{formatCurrency(tx.amount)}
                  </p>
                  <span className={tx.status === "success" ? "badge-success" : tx.status === "pending" ? "badge-pending" : "badge-failed"}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {activeService && (
        <PaymentModal
          service={activeService}
          onClose={() => setActiveService(null)}
          walletBalance={walletBalance}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </AppLayout>
  );
}
