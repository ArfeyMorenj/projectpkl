"use client"

import {
  type LucideIcon,
  BarChart3,
  Users,
  Package,
  Layers3,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Building2,
  Cog,
  CreditCard,
  Wrench,
  AlertCircle,
  Users2,
  TrendingUp,
  Receipt,
  History,
  Landmark,
  Wallet,
  User,
  Shield,
  BookOpen,
  Printer,
  Repeat,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { clearDemoSession } from "@/lib/api/demo-store"

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

interface SidebarProps {
  currentModule: string
  setCurrentModule: (moduleId: string) => void
}

const currentModuleKey = "fitart_current_module"

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "items", label: "Item Product", icon: FileText },
  { id: "product-groups", label: "Product Groups", icon: Layers3 },
  { id: "invoice-types", label: "Invoice Types", icon: FileText },
  { id: "chart-of-accounts", label: "Chart of Accounts", icon: BookOpen },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "master-item-products", label: "Master Item Products", icon: Layers3 },
  { id: "work-order", label: "Work Order", icon: Receipt },
  { id: "clients", label: "Clients", icon: Users2 },
  { id: "team", label: "Team Member", icon: Users },
  { id: "installation", label: "Installation", icon: Wrench },
  { id: "proteksi", label: "Proteksi", icon: Shield },
  { id: "receivables", label: "Manajemen Piutang", icon: TrendingUp },
  { id: "invoice-register", label: "Register Invoice", icon: Receipt },
  { id: "invoice-history", label: "Historis Invoice", icon: History },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "payment", label: "Posting Pembayaran Invoice", icon: Receipt },
  { id: "reports", label: "Laporan Fiskal", icon: BarChart3 },
  { id: "sales-reports", label: "Sales Reports", icon: FileText },
  { id: "ar-ledger", label: "AR Ledger", icon: BookOpen },
  { id: "journals", label: "Journals", icon: BookOpen },
  { id: "print", label: "Print Center", icon: Printer },
  { id: "recurring", label: "Recurring Invoices", icon: Repeat },
  { id: "bank-report", label: "Laporan KAS/BANK", icon: Landmark },
  { id: "bank-register", label: "Register KAS/BANK", icon: Wallet },
  { id: "client-receivables-detail", label: "Detail Piutang Klien", icon: FileText },
  { id: "receivables-card", label: "Kartu Piutang", icon: User },
  { id: "receivables-by-item", label: "Piutang Dasar Item", icon: Package },
  { id: "invoices", label: "Invoices", icon: DollarSign },
  { id: "invoice-license", label: "Invoice License", icon: FileText },
  { id: "invoice-produk", label: "Invoice Produk / Non License", icon: FileText },
  { id: "invoice-items", label: "Invoice Items", icon: FileText },
  { id: "nota-debet-kredit", label: "Nota Debit/Kredit", icon: Receipt },
  { id: "stoplicense", label: "Stop License", icon: AlertCircle },
  { id: "bank", label: "Bank Master", icon: Building2 },
  { id: "setup", label: "Setup", icon: Cog },
]

export function Sidebar({ currentModule, setCurrentModule }: SidebarProps) {
  const handleLogout = () => {
    clearDemoSession()
    localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "auth_token")
    localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_USER_KEY || "auth_user")
    localStorage.removeItem(currentModuleKey)
    sessionStorage.removeItem("isAuthenticated")
    sessionStorage.removeItem("user")
    window.location.href = "/auth/login"
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white shadow-[12px_0_40px_rgba(0,0,0,0.4)]">
      {/* Logo */}
      <div className="z-10 border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 shadow-inner shadow-cyan-500/10">
            <Package className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-white">JPAS</h1>
            <p className="text-xs text-slate-400">FitnessPlus System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentModule === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/20 shadow-[0_10px_30px_-18px_rgba(34,211,238,0.55)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
