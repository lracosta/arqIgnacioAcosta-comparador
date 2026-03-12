"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, GripVertical, Edit, Trash2, MapPin, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { createLoteCliente, updateLoteCliente, deleteLoteCliente, updateLoteOrderCliente } from "@/app/cliente/actions";
import GoogleMapSelector from "./google-map-selector";

interface LotEditorClienteProps {
    proyectoId: string;
    initialLotes: any[];
}

export default function LotEditorCliente({ proyectoId, initialLotes }: LotEditorClienteProps) {
    const [lotes, setLotes] = useState(initialLotes);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [nombre, setNombre] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [direccionFormateada, setDireccionFormateada] = useState<string | null>(null);
    const [imagen, setImagen] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLotes(initialLotes);
    }, [initialLotes]);

    const handleCreateLote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !ubicacion.trim()) {
            toast.error("Nombre y ubicación son obligatorios");
            return;
        }

        const nombreNorm = nombre.trim().toLowerCase();
        if (lotes.some(l => l.nombre.trim().toLowerCase() === nombreNorm)) {
            toast.error("Ya existe un lote con ese nombre en este proyecto");
            return;
        }

        setIsLoading(true);
        try {
            await createLoteCliente(
                proyectoId,
                nombre,
                ubicacion,
                descripcion,
                lat || undefined,
                lng || undefined,
                direccionFormateada || undefined,
                imagen || undefined
            );
            toast.success("Lote agregado");
            resetForm();
            setIsAddDialogOpen(false);
        } catch (error) {
            toast.error("Error al crear lote");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;

        const nombreNorm = nombre.trim().toLowerCase();
        if (lotes.some(l => l.id !== isEditing && l.nombre.trim().toLowerCase() === nombreNorm)) {
            toast.error("Ya existe un lote con ese nombre en este proyecto");
            return;
        }

        setIsLoading(true);
        try {
            await updateLoteCliente(
                isEditing,
                nombre,
                ubicacion,
                descripcion,
                proyectoId,
                lat || undefined,
                lng || undefined,
                direccionFormateada || undefined,
                imagen || undefined
            );
            toast.success("Lote actualizado");
            setIsEditing(null);
            resetForm();
        } catch (error) {
            toast.error("Error al actualizar lote");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLote = async (id: string) => {
        setIsLoading(true);
        try {
            await deleteLoteCliente(id, proyectoId);
            toast.success("Lote eliminado");
        } catch (error) {
            toast.error("Error al eliminar lote");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setNombre("");
        setUbicacion("");
        setDescripcion("");
        setLat(null);
        setLng(null);
        setDireccionFormateada(null);
        setImagen(null);
    };

    const startEditing = (lote: any) => {
        setNombre(lote.nombre);
        setUbicacion(lote.ubicacion);
        setDescripcion(lote.descripcion || "");
        setLat(lote.lat || null);
        setLng(lote.lng || null);
        setDireccionFormateada(lote.direccion_formateada || null);
        setImagen(lote.imagen || null);
        setIsEditing(lote.id);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith("image/")) {
            toast.error("Por favor seleccione un archivo de imagen");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("La imagen no debe superar los 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('fotos-lote')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('fotos-lote')
                .getPublicUrl(filePath);

            setImagen(publicUrl);
            toast.success("Imagen subida correctamente");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Error al subir la imagen");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = () => {
        setImagen(null);
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;

        const newItems = Array.from(lotes);
        const [removed] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, removed);

        setLotes(newItems);

        const updates = newItems.map((item, index) => ({
            id: item.id,
            orden: index,
        }));

        await updateLoteOrderCliente(proyectoId, updates);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Lotes a Comparar</h2>
                <Sheet open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <SheetTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 border-dashed hover:border-primary hover:text-primary transition-all">
                            <Plus className="mr-1 h-3.5 w-3.5" /> Agregar Lote
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full" onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('.pac-container')) {
                            e.preventDefault();
                        }
                    }}>
                        <SheetHeader className="px-6 py-4 border-b">
                            <SheetTitle>Agregar Nuevo Lote</SheetTitle>
                            <SheetDescription>Ingrese los detalles del nuevo lote para comparar.</SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <form id="add-lote-form" onSubmit={handleCreateLote} className="space-y-6 pb-20">
                                <div className="grid gap-2">
                                    <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</Label>
                                    <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Lote A - Los Alisos" className="h-10" />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Foto de Portada</Label>
                                    <div className="flex flex-col gap-3">
                                        {imagen ? (
                                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                                                <img src={imagen} alt="Portada" className="h-full w-full object-cover" />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute right-2 top-2 h-6 w-6 rounded-full"
                                                    onClick={removeImage}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 p-8 transition-colors hover:border-primary/50 hover:bg-muted/10"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                                                </div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {isUploading ? "Subiendo..." : "Click para subir foto de portada"}
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ubicacion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ubicación</Label>
                                    <div className="h-[300px] w-full rounded-md overflow-hidden border">
                                        <GoogleMapSelector
                                            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                                            initialLat={null}
                                            initialLng={null}
                                            initialAddress={""}
                                            onLocationSelect={(lat, lng, address) => {
                                                setLat(lat);
                                                setLng(lng);
                                                setUbicacion(address);
                                                setDireccionFormateada(address);
                                            }}
                                        />
                                    </div>
                                    <input type="hidden" value={ubicacion} />
                                    <p className="text-[10px] text-muted-foreground mt-1">Busque la dirección o mueva el marcador en el mapa.</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="descripcion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas (opcional)</Label>
                                    <Textarea id="descripcion" className="min-h-[80px] text-sm resize-none" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Superficie, orientación, servicios..." />
                                </div>
                            </form>
                        </div>

                        <SheetFooter className="px-6 py-4 border-t bg-muted/5 mt-auto">
                            <div className="flex gap-2 w-full">
                                <SheetClose asChild>
                                    <Button variant="outline" className="flex-1">Cancelar</Button>
                                </SheetClose>
                                <Button type="submit" form="add-lote-form" disabled={isLoading} className="flex-1">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Lote
                                </Button>
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="lotes-cliente">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {lotes.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-muted/5 group hover:bg-muted/10 transition-colors">
                                    <p className="text-xs font-medium text-muted-foreground">Aún no ha agregado lotes para comparar.</p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">Presione "Agregar Lote" para comenzar.</p>
                                </div>
                            ) : (
                                lotes.map((lote, index) => (
                                    <Draggable key={lote.id} draggableId={lote.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="group relative bg-card rounded-xl border border-border/60 hover:border-primary/30 shadow-sm hover:shadow-md transition-all p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div {...provided.dragHandleProps} className="text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
                                                        <GripVertical className="h-4 w-4" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm truncate">{lote.nombre}</h3>
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                                            <MapPin className="h-2.5 w-2.5" />
                                                            {lote.ubicacion}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); startEditing(lote); }}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Eliminar Lote?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Se eliminará permanentemente el lote "{lote.nombre}".
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteLote(lote.id)} className="bg-destructive hover:bg-destructive/90">
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Edit Dialog */}
            {/* Edit Sheet (formerly Dialog) */}
            <Sheet open={!!isEditing} onOpenChange={(open) => {
                if (!open) {
                    setIsEditing(null);
                    resetForm();
                }
            }}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full" onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.pac-container')) {
                        e.preventDefault();
                    }
                }}>
                    <SheetHeader className="px-6 py-4 border-b">
                        <SheetTitle>Editar Lote</SheetTitle>
                        <SheetDescription>Modifique los detalles del lote.</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <form id="edit-lote-form" onSubmit={handleUpdateLote} className="space-y-6 pb-20">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</Label>
                                <Input id="edit-nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="h-10" />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Foto de Portada</Label>
                                <div className="flex flex-col gap-3">
                                    {imagen ? (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                                            <img src={imagen} alt="Portada" className="h-full w-full object-cover" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute right-2 top-2 h-6 w-6 rounded-full"
                                                onClick={removeImage}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 p-8 transition-colors hover:border-primary/50 hover:bg-muted/10"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {isUploading ? "Subiendo..." : "Click para subir foto de portada"}
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-ubicacion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ubicación</Label>
                                <div className="h-[300px] w-full rounded-md overflow-hidden border">
                                    <GoogleMapSelector
                                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                                        initialLat={lat}
                                        initialLng={lng}
                                        initialAddress={ubicacion}
                                        onLocationSelect={(lat, lng, address) => {
                                            setLat(lat);
                                            setLng(lng);
                                            setUbicacion(address);
                                            setDireccionFormateada(address);
                                        }}
                                    />
                                </div>
                                <input type="hidden" value={ubicacion} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-descripcion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas</Label>
                                <Textarea id="edit-descripcion" className="min-h-[80px] text-sm resize-none" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                            </div>
                        </form>
                    </div>

                    <SheetFooter className="px-6 py-4 border-t bg-muted/5 mt-auto">
                        <div className="flex gap-2 w-full">
                            <SheetClose asChild>
                                <Button variant="outline" className="flex-1">Cancelar</Button>
                            </SheetClose>
                            <Button type="submit" form="edit-lote-form" disabled={isLoading} className="flex-1">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
