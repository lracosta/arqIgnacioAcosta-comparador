"use client";

import { Download, Loader2, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ExportButtonProps {
    proyectoId: string;
    projectName: string;
}

export default function ExportButton({ proyectoId, projectName }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex gap-2 print:hidden">
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2 border-primary/20 hover:bg-primary/5"
            >
                <Printer className="h-4 w-4" />
                Imprimir / PDF
            </Button>

            {/* We could add logic for Excel export here too */}
        </div>
    );
}
