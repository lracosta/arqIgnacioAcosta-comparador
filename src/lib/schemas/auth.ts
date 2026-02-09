import * as z from "zod";

export const loginSchema = z.object({
    email: z.string().email({
        message: "Por favor ingrese un email válido.",
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
});

export const registerSchema = z.object({
    full_name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Por favor ingrese un email válido.",
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
    confirmPassword: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email({
        message: "Por favor ingrese un email válido.",
    }),
});

export const updatePasswordSchema = z.object({
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
    confirmPassword: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
