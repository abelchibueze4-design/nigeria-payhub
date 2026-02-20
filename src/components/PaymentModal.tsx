import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Zap, Wifi, Tv, Phone, Database } from "lucide-react";

export type ServiceType = "electricity" | "cable" | "airtime" | "data" | "water" | "internet" | null;

interface PaymentModalProps {
  service: ServiceType;
  onClose: () => void;
  walletBalance: number;
  onSuccess: (amount: number, type: string, provider: string, accountRef: string, plan: string) => void;
}

const electricityProviders = ["IKEDC", "EKEDC", "AEDC", "IBEDC", "PHEDC", "EEDC", "BEDC"];
const cableProviders = ["DSTV", "GOtv", "StarTimes", "Showmax"];
const networks = ["MTN", "Airtel", "Glo", "9mobile"];
const dataPlans: Record<string, { label: string; price: number }[]> = {
  MTN: [
    { label: "1GB - 30 days", price: 350 },
    { label: "2GB - 30 days", price: 600 },
    { label: "5GB - 30 days", price: 1500 },
    { label: "10GB - 30 days", price: 2500 },
  ],
  Airtel: [
    { label: "1.5GB - 30 days", price: 400 },
    { label: "3GB - 30 days", price: 700 },
    { label: "6GB - 30 days", price: 1500 },
  ],
  Glo: [
    { label: "2GB - 30 days", price: 500 },
    { label: "5GB - 30 days", price: 1200 },
    { label: "10GB - 30 days", price: 2000 },
  ],
  "9mobile": [
    { label: "1GB - 30 days", price: 300 },
    { label: "2.5GB - 30 days", price: 600 },
  ],
};
const cablePlans: Record<string, { label: string; price: number }[]> = {
  DSTV: [
    { label: "Padi - ₦2,150/mo", price: 2150 },
    { label: "Yanga - ₦2,950/mo", price: 2950 },
    { label: "Confam - ₦5,300/mo", price: 5300 },
    { label: "Compact - ₦9,000/mo", price: 9000 },
    { label: "Premium - ₦24,500/mo", price: 24500 },
  ],
  GOtv: [
    { label: "Smallie - ₦1,575/mo", price: 1575 },
    { label: "Jinja - ₦2,250/mo", price: 2250 },
    { label: "Jolli - ₦3,300/mo", price: 3300 },
    { label: "Max - ₦4,850/mo", price: 4850 },
  ],
  StarTimes: [
    { label: "Nova - ₦900/mo", price: 900 },
    { label: "Basic - ₦1,700/mo", price: 1700 },
    { label: "Smart - ₦2,500/mo", price: 2500 },
  ],
  Showmax: [
    { label: "Mobile - ₦1,200/mo", price: 1200 },
    { label: "Standard - ₦2,900/mo", price: 2900 },
  ],
};

const serviceConfig = {
  electricity: { title: "Electricity Bill", icon: Zap, color: "text-warning" },
  cable: { title: "Cable TV", icon: Tv, color: "text-info" },
  airtime: { title: "Buy Airtime", icon: Phone, color: "text-success" },
  data: { title: "Buy Data", icon: Database, color: "text-accent" },
  water: { title: "Water Bill", icon: Wifi, color: "text-info" },
  internet: { title: "Internet Bill", icon: Wifi, color: "text-primary" },
};

export default function PaymentModal({ service, onClose, walletBalance, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    provider: "",
    accountNumber: "",
    amount: "",
    phone: "",
    plan: "",
    network: "",
  });

  if (!service) return null;
  const config = serviceConfig[service];
  const Icon = config.icon;

  const getAmount = () => {
    if (service === "data" && form.network && form.plan) {
      const plans = dataPlans[form.network] || [];
      const selected = plans.find((p) => p.label === form.plan);
      return selected?.price || 0;
    }
    if (service === "cable" && form.provider && form.plan) {
      const plans = cablePlans[form.provider] || [];
      const selected = plans.find((p) => p.label === form.plan);
      return selected?.price || 0;
    }
    return parseFloat(form.amount) || 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = getAmount();
    if (amount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (amount > walletBalance) {
      toast({ title: "Insufficient wallet balance", description: "Please fund your wallet.", variant: "destructive" });
      return;
    }
    setStep("confirm");
  };

  const handleConfirmPay = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setStep("success");
    const amount = getAmount();
    onSuccess(
      amount,
      service || "",
      form.provider || form.network || "",
      form.accountNumber || form.phone || "",
      form.plan || ""
    );
  };


  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            {config.title}
          </DialogTitle>
        </DialogHeader>

        {/* FORM */}
        {step === "form" && (
          <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
            {/* Electricity */}
            {service === "electricity" && (
              <>
                <div className="space-y-1.5">
                  <Label>Provider</Label>
                  <Select onValueChange={(v) => setForm({ ...form, provider: v })}>
                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      {electricityProviders.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Meter Number</Label>
                  <Input placeholder="Enter meter number" value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount (₦)</Label>
                  <Input type="number" min="500" placeholder="Min. ₦500" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
              </>
            )}

            {/* Cable TV */}
            {service === "cable" && (
              <>
                <div className="space-y-1.5">
                  <Label>Provider</Label>
                  <Select onValueChange={(v) => setForm({ ...form, provider: v, plan: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      {cableProviders.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Smart Card Number</Label>
                  <Input placeholder="Enter smart card number" value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
                </div>
                {form.provider && (
                  <div className="space-y-1.5">
                    <Label>Subscription Plan</Label>
                    <Select onValueChange={(v) => setForm({ ...form, plan: v })}>
                      <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                      <SelectContent>
                        {(cablePlans[form.provider] || []).map((p) => (
                          <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* Airtime */}
            {service === "airtime" && (
              <>
                <div className="space-y-1.5">
                  <Label>Network</Label>
                  <Select onValueChange={(v) => setForm({ ...form, network: v })}>
                    <SelectTrigger><SelectValue placeholder="Select network" /></SelectTrigger>
                    <SelectContent>
                      {networks.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input placeholder="08012345678" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount (₦)</Label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[100, 200, 500, 1000].map((a) => (
                      <button
                        key={a} type="button"
                        onClick={() => setForm({ ...form, amount: String(a) })}
                        className={`py-1.5 text-sm rounded-lg border transition-all ${form.amount === String(a) ? "border-accent bg-accent/10 text-accent font-medium" : "border-border hover:border-accent/50"}`}
                      >
                        ₦{a}
                      </button>
                    ))}
                  </div>
                  <Input type="number" min="50" placeholder="Or enter amount" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
              </>
            )}

            {/* Data */}
            {service === "data" && (
              <>
                <div className="space-y-1.5">
                  <Label>Network</Label>
                  <Select onValueChange={(v) => setForm({ ...form, network: v, plan: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select network" /></SelectTrigger>
                    <SelectContent>
                      {networks.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input placeholder="08012345678" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                {form.network && (
                  <div className="space-y-1.5">
                    <Label>Data Plan</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {(dataPlans[form.network] || []).map((p) => (
                        <button
                          key={p.label} type="button"
                          onClick={() => setForm({ ...form, plan: p.label })}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${form.plan === p.label ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"}`}
                        >
                          <span>{p.label}</span>
                          <span className="font-semibold">{formatCurrency(p.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Water / Internet */}
            {(service === "water" || service === "internet") && (
              <>
                <div className="space-y-1.5">
                  <Label>Account Number / ID</Label>
                  <Input placeholder="Enter account number" value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount (₦)</Label>
                  <Input type="number" min="100" placeholder="Enter amount" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
              </>
            )}

            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-3">
                Wallet balance: <span className="font-semibold text-foreground">{formatCurrency(walletBalance)}</span>
              </p>
              <Button type="submit" className="w-full">Continue</Button>
            </div>
          </form>
        )}

        {/* CONFIRM */}
        {step === "confirm" && (
          <div className="space-y-4 pt-2 animate-slide-up">
            <div className="rounded-xl border bg-secondary p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{config.title}</span>
              </div>
              {(form.provider || form.network) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{form.provider || form.network}</span>
                </div>
              )}
              {form.plan && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{form.plan}</span>
                </div>
              )}
              {(form.accountNumber || form.phone) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account / Phone</span>
                  <span className="font-medium">{form.accountNumber || form.phone}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-accent">{formatCurrency(getAmount())}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Back</Button>
              <Button className="flex-1" onClick={handleConfirmPay} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Confirm & Pay"}
              </Button>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="text-center py-6 space-y-4 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto animate-pulse-green">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {formatCurrency(getAmount())} paid for {config.title}
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-secondary rounded-lg p-3">
              Transaction ID: TXN{Date.now().toString().slice(-8)}
            </div>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
