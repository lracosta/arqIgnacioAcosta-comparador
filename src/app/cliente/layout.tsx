import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ClienteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Role check
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "cliente" && profile?.role !== "admin") {
        redirect("/login");
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-secondary/30">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto">
                    <header className="h-16 border-b bg-background/50 backdrop-blur-md flex items-center px-6 sticky top-0 z-10 justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-sm font-bold tracking-tight uppercase text-muted-foreground/80">Cliente</h1>
                        </div>
                        <UserNav />
                    </header>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
