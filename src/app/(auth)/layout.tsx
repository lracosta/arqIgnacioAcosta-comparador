
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-muted/50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                    Comparador Arq. Ignacio Acosta
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Ingresa a tu cuenta para gestionar tus proyectos
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
                    {children}
                </div>
            </div>
        </div>
    );
}
