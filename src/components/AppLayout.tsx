import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, History, Settings, LogOut, Zap, Shield, Users,
  BarChart3, Menu, X, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const userNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: History, label: "Transactions", href: "/transactions" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Shield, label: "Security", href: "/admin/security" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = localStorage.getItem("utilipay_role") || "user";
  const userRaw = localStorage.getItem("utilipay_user");
  const user = userRaw ? JSON.parse(userRaw) : { name: "User", email: "user@utilipay.ng" };
  const navItems = role === "admin" ? adminNavItems : userNavItems;

  const handleLogout = () => {
    localStorage.removeItem("utilipay_role");
    localStorage.removeItem("utilipay_user");
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "UP";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-accent-foreground" />
        </div>
        <span className="text-lg font-bold text-white">UtiliPay</span>
        {role === "admin" && (
          <span className="ml-auto text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Admin</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest px-3 py-2" style={{ color: "hsl(213, 30%, 55%)" }}>
          {role === "admin" ? "Admin Panel" : "Menu"}
        </p>
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            to={href}
            onClick={() => setMobileOpen(false)}
            className={`nav-item ${location.pathname === href ? "active" : ""}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {location.pathname === href && <ChevronRight className="w-3 h-3 ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs truncate" style={{ color: "hsl(213, 30%, 55%)" }}>{user.email}</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-white transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0"
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-foreground/60" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col animate-slide-up"
            style={{ background: "hsl(var(--sidebar-background))" }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">UtiliPay</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
