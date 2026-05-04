"use client"

import { Clock, Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type TopBarUser = {
  name: string
  username?: string
}

export function TopBar({ user }: { user: TopBarUser }) {
  const currentTime = new Date().toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-card/75 px-6 py-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="space-y-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary/70">PT. FITART</p>
        <h2 className="text-lg font-semibold text-foreground/95">FitnessPlus System</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          {currentTime}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full border border-transparent bg-muted/40 hover:bg-muted/70">
          <Bell className="w-5 h-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive shadow-[0_0_0_4px_rgba(239,68,68,0.18)]" />
        </Button>

        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-muted/25 px-4 py-2 pl-4">
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.username ?? "-"}</p>
          </div>
          <Avatar className="h-10 w-10 border border-primary/20 bg-primary/15">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
