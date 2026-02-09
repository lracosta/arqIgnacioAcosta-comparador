"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteUser(id: string) {
    const supabase = await createClient();

    // Note: This only deletes from public.users. 
    // If we want to delete from auth.users, we need service role key.
    // However, the schema says: id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
    // This means we should probably delete from auth.users to clean up everything.
    // But since we can't easily do it without the key, we'll just handle the public part 
    // or report the limitation.

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/usuarios");
}

export async function updateUserRole(id: string, role: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/usuarios");
}
