"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { Dashboard } from "@/components/modules/dashboard"
import { TeamModule } from "@/components/modules/team-module"
import { ProductsModule } from "@/components/modules/products-module"
import { ItemsModule } from "@/components/modules/items-module"
import { ProductGroupsModule } from "@/components/modules/product-groups-module"
import { InvoiceTypesModule } from "@/components/modules/invoice-types-module"
import { ChartOfAccountsModule } from "@/components/modules/chart-of-accounts-module"
import { CompaniesModule } from "@/components/modules/companies-module"
import { UsersModule } from "@/components/modules/users-module"
import { MasterItemProductsModule } from "@/components/modules/master-item-products-module"
import { InvoiceModule } from "@/components/modules/invoice-module"
import { InvoiceItemsModule } from "@/components/modules/invoice-items-module"
import { InvoiceLicenseModule } from "@/components/modules/invoice-license-module"
import { WorkOrderModule } from "@/components/modules/work-order-module"
import {
  BankModule,
  SetupModule,
  ProteksiModule,
  InstallationModule,
  StopLicenseModule,
  ClientsModule,
  ReceivablesModule,
  InvoiceRegisterModule,
  FiscalReportsModule,
  PaymentModule,
  PaymentPostingModule,
  InvoiceHistoryModule,
  BankReportModule,
  BankRegisterModule,
  ClientReceivablesDetailModule,
  ReceivablesCardModule,
  ReceivablesByItemCodeModule,
  InvoiceProductNonLicenseModule,
  NotaDebetKreditModule,
  JournalsModule,
  SalesReportsModule,
  ArLedgerModule,
  PrintModule,
  RecurringModule,
} from "@/components/modules"
import { useAuth } from "@/lib/api/hooks"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const currentModuleKey = "fitart_current_module"
  const [currentModule, setCurrentModuleState] = useState(() => {
    if (typeof window === "undefined") return "dashboard"
    return window.localStorage.getItem(currentModuleKey) || "dashboard"
  })

  const setCurrentModule = (moduleId: string) => {
    setCurrentModuleState(moduleId)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(currentModuleKey, moduleId)
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Show loading state only while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Memulihkan sesi dan halaman terakhir...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  const renderModule = () => {
    switch (currentModule) {
      case "products":
        return <ProductsModule />
      case "team":
        return <TeamModule />
      case "items":
        return <ItemsModule />
      case "product-groups":
        return <ProductGroupsModule />
      case "invoice-types":
        return <InvoiceTypesModule />
      case "chart-of-accounts":
        return <ChartOfAccountsModule />
      case "companies":
        return <CompaniesModule />
      case "users":
        return <UsersModule />
      case "master-item-products":
        return <MasterItemProductsModule />
      case "work-order":
        return <WorkOrderModule />
      case "invoices":
        return <InvoiceModule />
      case "invoice-items":
        return <InvoiceItemsModule />
      case "invoice-license":
        return <InvoiceLicenseModule />
      case "invoice-produk":
        return <InvoiceProductNonLicenseModule />
      case "receivables":
        return <ReceivablesModule />
      case "invoice-register":
        return <InvoiceRegisterModule />
      case "reports":
        return <FiscalReportsModule />
      case "sales-reports":
        return <SalesReportsModule />
      case "ar-ledger":
        return <ArLedgerModule />
      case "journals":
        return <JournalsModule />
      case "print":
        return <PrintModule />
      case "recurring":
        return <RecurringModule />
      case "payments":
        return <PaymentModule />
      case "payment":
        return <PaymentPostingModule />
      case "bank":
        return <BankModule />
      case "setup":
        return <SetupModule />
      case "proteksi":
        return <ProteksiModule />
      case "installation":
        return <InstallationModule />
      case "stoplicense":
        return <StopLicenseModule />
      case "clients":
        return <ClientsModule />
      case "invoice-history":
        return <InvoiceHistoryModule />
      case "bank-report":
        return <BankReportModule />
      case "bank-register":
        return <BankRegisterModule />
      case "client-receivables-detail":
        return <ClientReceivablesDetailModule />
      case "receivables-card":
        return <ReceivablesCardModule />
      case "receivables-by-item":
        return <ReceivablesByItemCodeModule />
      case "nota-debet-kredit":
        return <NotaDebetKreditModule />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.06),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))] text-foreground">
      <Sidebar currentModule={currentModule} setCurrentModule={setCurrentModule} />
      <div className="ml-72 flex min-h-screen flex-col">
        <TopBar user={user} />
        <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.96))]">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}
