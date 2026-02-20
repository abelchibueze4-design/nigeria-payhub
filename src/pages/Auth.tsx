import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Zap, Shield, Globe } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

export default function Auth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // Mock: admin check
    if (loginForm.email === "admin@utilipay.ng") {
      localStorage.setItem("utilipay_role", "admin");
    } else {
      localStorage.setItem("utilipay_role", "user");
    }
    localStorage.setItem("utilipay_user", JSON.stringify({ email: loginForm.email, name: "Demo User" }));
    toast({ title: "Welcome back! 👋", description: "Login successful." });
    navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.email || !registerForm.phone || !registerForm.password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    localStorage.setItem("utilipay_role", "user");
    localStorage.setItem("utilipay_user", JSON.stringify({ email: registerForm.email, name: registerForm.fullName }));
    toast({ title: "Account created! 🎉", description: "Welcome to UtiliPay." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Hero */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <img
          src={heroBg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-white font-display">UtiliPay</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Pay All Your Bills<br />
            <span className="text-accent">In One Place</span>
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-sm" style={{ color: "hsl(213, 40%, 75%)" }}>
            Electricity, internet, cable TV, airtime, data — pay instantly and securely from your wallet.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: Shield, text: "Bank-grade security & encryption" },
            { icon: Zap, text: "Instant payment processing" },
            { icon: Globe, text: "All Nigerian service providers" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
              <Icon className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-sm text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">UtiliPay</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Get Started</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in or create your account</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <button type="button" className="text-sm text-accent hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Demo: any email/password. Admin: admin@utilipay.ng
                </p>
              </form>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="you@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      placeholder="+234..."
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
