"use client"

import {
    Archive,
    BookOpen,
    LayoutDashboard,
    Settings,
    Users,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Plantillas",
        url: "/admin/plantillas",
        icon: BookOpen,
    },
    {
        title: "Proyectos",
        url: "/admin/proyectos",
        icon: Archive,
    },
    {
        title: "Usuarios",
        url: "/admin/usuarios",
        icon: Users,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith("/admin")

    const menuItems = isAdmin ? [
        { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Plantillas", url: "/admin/plantillas", icon: BookOpen },
        { title: "Proyectos", url: "/admin/proyectos", icon: Archive },
        { title: "Usuarios", url: "/admin/usuarios", icon: Users },
    ] : [
        { title: "Mis Proyectos", url: "/cliente/dashboard", icon: LayoutDashboard },
    ]

    return (
        <Sidebar>
            <SidebarHeader className="p-6 border-b/50">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">Comparador</h1>
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest pl-1">
                    {isAdmin ? "Panel de Gestión" : "Panel de Cliente"}
                </p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        {isAdmin ? "Administración" : "Navegación"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url} className="gap-3">
                                            <item.icon className="h-4 w-4" />
                                            <span className="font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t bg-muted/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={isAdmin ? "/admin/settings" : "/cliente/settings"} className="gap-3">
                                <Settings className="h-4 w-4" />
                                <span className="font-medium text-xs">Configuración</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
}
