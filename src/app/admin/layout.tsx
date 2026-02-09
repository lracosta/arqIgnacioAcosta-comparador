"use client"

import { AppSidebar } from "@/components/admin/app-sidebar"
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 items-center justify-between rounded-xl border-b bg-background px-6">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <h1 className="text-sm font-bold tracking-tight uppercase text-muted-foreground/80">Admin</h1>
                    </div>
                    <UserNav />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
