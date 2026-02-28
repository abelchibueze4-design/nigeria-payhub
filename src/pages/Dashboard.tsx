import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import PaymentModal, { ServiceType } from "@/components/PaymentModal";
import FundWalletModal from "@/components/FundWalletModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Zap, Wifi, Tv, Phone, Database, Droplets, Eye, EyeOff,
  Plus, TrendingUp, TrendingDown, ArrowUpRight, Bell, Loader2
} from "lucide-react";

const services = [
  { id: "electricity", label: "Electricity", icon: Zap, color: "text-warning", bg: "bg-warning/10" },
  { id: "airtime", label: "Airtime", icon: Phone, color: "text-success", bg: "bg-success/10" },
  { id: "data", label: "Data", icon: Database, color: "text-info", bg: "bg-info/10" },
  { id: "cable", label: "Cable TV", icon: Tv, color: "text-accent", bg: "bg-accent/10" },
  { id: "internet", label: "Internet", icon: Wifi, color: "text-primary", bg: "bg-primary/10" },
  { id: "water", label: "Water", icon: Droplets, color: "text-info", bg: "bg-info/10" },
];

interface Transaction {
  id: string;
  type: string;
  provider: string | null;
  amount: number;
  status: string;
  created_at: string;
  is_debit: boolean;
  transaction_ref: string | null;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [hideBalance, setHideBalance] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [monthlyFunded, setMonthlyFunded] = useState(0);
  const [showFundModal, setShowFundModal] = useState(false);

  const firstName = profile?.full_name?.split(" ")[0] || "User";

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    if (data) setWalletBalance(Number(data.balance));
    setLoadingWallet(false);
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) {
      setTransactions(data as Transaction[]);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const debits = data.filter((t) => t.is_debit && new Date(t.created_at) >= new Date(startOfMonth));
      const credits = data.filter((t) => !t.is_debit && new Date(t.created_at) >= new Date(startOfMonth));
      setMonthlySpent(debits.reduce((s, t) => s + Number(t.amount), 0));
      setMonthlyFunded(credits.reduce((s, t) => s + Number(t.amount), 0));
    }
  }, [user]);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const handlePaymentSuccess = async (amount: number, type: string, provider: string, accountRef: string, plan: string) => {
    if (!user) return;

    // Deduct from wallet
    const newBalance = walletBalance - amount;
    const { error: walletErr } = await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    if (walletErr) {
      toast({ title: "Failed to update wallet", variant: "destructive" });
      return;
    }

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type,
      provider,
      account_ref: accountRef,
      plan,
      amount,
      status: "success",
      is_debit: true,
    });

    setWalletBalance(newBalance);
    await fetchTransactions();
    toast({ title: "Payment Successful ✅", description: `${formatCurrency(amount)} deducted from wallet.` });
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-slide-up">
        {/* Header */}
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
              <button onClick={() => setHideBalance(!hideBalance)} className="text-white/70 hover:text-white transition-colors">
                {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="mb-6">
              {loadingWallet ? (
                <Loader2 className="w-6 h-6 animate-spin text-white/60" />
              ) : hideBalance ? (
                <div className="flex gap-1.5 mt-1">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-6 h-4 rounded-sm bg-white/30" />)}
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
                  <p className="text-sm font-medium">{user?.email?.split("@")[0]} ••••</p>
                </div>
              </div>
              <Button size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 gap-1.5"
                onClick={() => setShowFundModal(true)}>
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
            <p className="text-lg font-bold text-foreground">{formatCurrency(monthlySpent)}</p>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </div>
          <div className="bg-card rounded-xl p-4 border" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              </div>
              <span className="text-xs text-muted-foreground">Total Funded</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(monthlyFunded)}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>

        {/* Quick Pay */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Quick Pay</h2>
          <div className="grid grid-cols-3 gap-3">
            {services.map(({ id, label, icon: Icon, color, bg }) => (
              <button key={id} onClick={() => setActiveService(id as ServiceType)} className="service-btn text-center">
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
            <a href="/transactions" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            {transactions.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <p className="text-3xl mb-2">💸</p>
                <p className="text-sm">No transactions yet. Make your first payment!</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((tx, i) => (
                <div key={tx.id} className={`transaction-item ${i !== 0 ? "border-t" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.is_debit ? "bg-destructive/10" : "bg-success/10"}`}>
                    {tx.is_debit ? <TrendingDown className="w-4 h-4 text-destructive" /> : <TrendingUp className="w-4 h-4 text-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.provider || "—"} · {new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${tx.is_debit ? "text-destructive" : "text-success"}`}>
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
      </div>

      {activeService && (
        <PaymentModal
          service={activeService}
          onClose={() => setActiveService(null)}
          walletBalance={walletBalance}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {showFundModal && (
        <FundWalletModal
          onClose={() => setShowFundModal(false)}
          onSuccess={(newBalance) => {
            setWalletBalance(newBalance);
            fetchTransactions();
          }}
        />
      )}
    </AppLayout>
  );
}
