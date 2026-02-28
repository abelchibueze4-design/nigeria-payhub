import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface FundWalletModalProps {
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function FundWalletModal({ onClose, onSuccess }: FundWalletModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleFund = async () => {
    const value = Number(amount);
    if (!value || value < 100) {
      toast({ title: "Enter at least ₦100", variant: "destructive" });
      return;
    }
    if (!user?.email) return;

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      // Initialize transaction via edge function
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const initResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/paystack?action=initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: value, email: user.email }),
        }
      );

      const initData = await initResponse.json();

      if (!initResponse.ok || !initData.data?.authorization_url) {
        throw new Error(initData.error || "Failed to initialize payment");
      }

      // Open Paystack in a popup
      const popup = window.open(
        initData.data.authorization_url,
        "paystack",
        "width=500,height=600,scrollbars=yes"
      );

      // Poll for popup close and verify
      const reference = initData.data.reference;
      const interval = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(interval);
          // Verify payment
          try {
            const verifyResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/paystack?action=verify`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ reference }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast({ title: "Wallet Funded! 🎉", description: `${formatCurrency(value)} added to your wallet.` });
              onSuccess(verifyData.balance);
              onClose();
            } else {
              toast({ title: "Payment not completed", description: "Try again or contact support.", variant: "destructive" });
            }
          } catch {
            toast({ title: "Verification failed", variant: "destructive" });
          }
          setLoading(false);
        }
      }, 1000);
    } catch (err: any) {
      toast({ title: "Payment error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up border shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Fund Wallet</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Amount (₦)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg h-12"
              min={100}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                onClick={() => setAmount(String(qa))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  amount === String(qa)
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-secondary text-muted-foreground border-transparent hover:border-border"
                }`}
              >
                ₦{qa.toLocaleString()}
              </button>
            ))}
          </div>

          <Button
            onClick={handleFund}
            disabled={loading || !amount || Number(amount) < 100}
            className="w-full h-12 text-base bg-success hover:bg-success/90 text-white"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Pay ${amount ? formatCurrency(Number(amount)) : "₦0"}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Secured by Paystack 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
