
"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChartOfAccountsLookup } from "@/lib/api/hooks"

type InstallationItemRecord = {
  id: string
  kodeItem: string
  name: string
  accOmzet: string
  accPiutang: string
  cofOmzet: string
  cofPiutang: string
}

const installationItemsMaster = [
  { code: "1", name: "HARDWARE", accRevenue: "", accReceivable: "", cofRevenue: "", cofReceivable: "" },
  { code: "2", name: "LICENSE", accRevenue: "", accReceivable: "", cofRevenue: "", cofReceivable: "" },
  { code: "3", name: "SOFTWARE", accRevenue: "", accReceivable: "", cofRevenue: "", cofReceivable: "" },
  { code: "4", name: "SERVICE", accRevenue: "", accReceivable: "", cofRevenue: "", cofReceivable: "" },
]

const initialData: InstallationItemRecord[] = installationItemsMaster.map((item) => ({
  id: item.code,
  kodeItem: item.code,
  name: item.name,
  accOmzet: item.accRevenue,
  accPiutang: item.accReceivable,
  cofOmzet: item.cofRevenue,
  cofPiutang: item.cofReceivable,
}))

export function ItemModule() {
  const [activeTab, setActiveTab] = useState("detail")
  const [searchCode, setSearchCode] = useState("")
  const [searchName, setSearchName] = useState("")
  const [items, setItems] = useState<InstallationItemRecord[]>(initialData)
  const [formData, setFormData] = useState<InstallationItemRecord>({
    id: "",
    kodeItem: "",
    name: "",
    accOmzet: "",
    accPiutang: "",
    cofOmzet: "",
    cofPiutang: "",
  })

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.kodeItem.toLowerCase().includes(searchCode.toLowerCase()) &&
          item.name.toLowerCase().includes(searchName.toLowerCase()),
      ),
    [items, searchCode, searchName],
  )

  const setField = (field: keyof InstallationItemRecord, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      id: "",
      kodeItem: "",
      name: "",
      accOmzet: "",
      accPiutang: "",
      cofOmzet: "",
      cofPiutang: "",
    })
  }

  const save = () => {
    if (!formData.kodeItem || !formData.name) return
    const exists = items.some((item) => item.id === formData.id || item.kodeItem === formData.kodeItem)
    if (exists) {
      setItems((prev) =>
        prev.map((item) => (item.id === formData.id || item.kodeItem === formData.kodeItem ? { ...formData } : item)),
      )
    } else {
      setItems((prev) => [...prev, { ...formData, id: formData.kodeItem }])
    }
  }

  const remove = () => {
    if (!formData.id) return
    setItems((prev) => prev.filter((item) => item.id !== formData.id))
    resetForm()
  }

  const { data: chartOfAccounts } = useChartOfAccountsLookup()
  const coaName = (code: string) => chartOfAccounts?.find((item) => item.code === code)?.name || ""

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">ITEM INSTALASI</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="detail" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kode Item</Label>
                <Input value={formData.kodeItem} onChange={(e) => setField("kodeItem", e.target.value)} />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Acc. Omzet</Label>
                <Input value={formData.accOmzet} onChange={(e) => setField("accOmzet", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{coaName(formData.accOmzet)}</p>
              </div>
              <div>
                <Label>Acc. Piutang</Label>
                <Input value={formData.accPiutang} onChange={(e) => setField("accPiutang", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{coaName(formData.accPiutang)}</p>
              </div>
              <div>
                <Label>Cof. Omzet</Label>
                <Input value={formData.cofOmzet} onChange={(e) => setField("cofOmzet", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{coaName(formData.cofOmzet)}</p>
              </div>
              <div>
                <Label>Cof. Piutang</Label>
                <Input value={formData.cofPiutang} onChange={(e) => setField("cofPiutang", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{coaName(formData.cofPiutang)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="outline" onClick={resetForm}>
                New
              </Button>
              <Button variant="destructive" onClick={remove}>
                Delete
              </Button>
              <Button variant="outline">Close</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Search kode..." value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
              <Input placeholder="Search name..." value={searchName} onChange={(e) => setSearchName(e.target.value)} />
              <Select value="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-3 py-2 text-left">Kode Item</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-3 py-2">{item.kodeItem}</td>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFormData(item)
                            setActiveTab("detail")
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Find</Button>
              <Button variant="outline">Print</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
