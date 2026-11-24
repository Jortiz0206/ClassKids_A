import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { UserPlus, Trash2, Mail, ShieldCheck, UserCog } from "lucide-react";
import ConfirmarAccion from "@/components/common/ConfirmarAccion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { aLista } from "@/lib/listas";
import { useIsMobile } from "@/hooks/use-mobile";
import { mensajeDeError } from "@/lib/utils";

type Row = { user_id: string; email: string; nombre?: string; apellido?: string; role: "admin" | "docente"; created_at: string; last_sign_in_at: string | null };

const AdminUsuarios = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "docente">("docente");
  const [submitting, setSubmitting] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get("/usuarios");
      const list = aLista(data);
      setRows(list);
    } catch (error) {
      toast.error(mensajeDeError(error, "Error al cargar los usuarios"));
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!email) return;
    setSubmitting(true);
    try {
      const response = await api.post<{ email_sent: boolean; invitation_url: string }>("/usuarios/invitar", { email, role });
      setInvitationUrl(response.invitation_url);
      if (response.email_sent) {
        toast.success(`Invitación enviada a ${email}`);
      } else {
        toast.success("Invitación creada en modo de prueba", { description: "Usa el enlace mostrado para activarla." });
      }
      setEmail(""); 
      load();
    } catch (error) {
      toast.error(mensajeDeError(error, "Error al enviar la invitación"));
    }
    setSubmitting(false);
  };

  const changeRole = async (target_user_id: string, newRole: "admin" | "docente") => {
    try {
      await api.put(`/usuarios/${target_user_id}/rol`, { role: newRole });
      toast.success("Rol actualizado");
      load();
    } catch (error) {
      toast.error(mensajeDeError(error, "Error al actualizar el rol"));
    }
  };

  // El endpoint DELETE /usuarios/{id} desactiva la cuenta (activo = FALSE); no la borra.
  // Antes el texto decía «Eliminar… no se puede deshacer» y usaba el confirm() del navegador.
  const [porDesactivar, setPorDesactivar] = useState<null | { id: string; email: string }>(null);
  const [desactivando, setDesactivando] = useState(false);

  const removeUser = async () => {
    if (!porDesactivar) return;
    setDesactivando(true);
    try {
      await api.delete(`/usuarios/${porDesactivar.id}`);
      toast.success("Usuario desactivado");
      load();
    } catch (error) {
      toast.error(mensajeDeError(error, "No se pudo desactivar el usuario"));
    } finally {
      setDesactivando(false);
      setPorDesactivar(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="mt-1 hidden h-12 w-12 flex-none place-items-center rounded-2xl bg-lavanda sm:grid"><UserCog className="h-6 w-6" aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Administración</p>
            <h1 className="mt-0.5 text-[28px] font-bold leading-tight text-foreground sm:text-3xl">Usuarios</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">Gestiona docentes y administradores de la plataforma.</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Invitar docente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar nuevo usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input type="email" placeholder="docente@escuela.edu" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Row["role"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="docente">Docente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground flex gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Se enviará un correo al usuario con un enlace para crear su contraseña y acceder a ClassKids.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={invite} disabled={submitting || !email}>
                {submitting ? "Enviando..." : "Enviar invitación"}
              </Button>
            </DialogFooter>
            {invitationUrl && (
              <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Label htmlFor="invitation-url">Enlace de prueba</Label>
                <Input id="invitation-url" value={invitationUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
                <Button type="button" variant="outline" className="w-full" onClick={() => navigator.clipboard.writeText(invitationUrl)}>
                  Copiar enlace
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Celular: una tarjeta por usuario con el rol y la acción visibles (antes la tabla
          obligaba a desplazarse de lado: H-40). Misma lógica y mismos controles que la tabla. */}
      {isMobile && (
        <ul className="space-y-2.5" aria-label="Usuarios">
          {loading ? (
            <li className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">Cargando…</li>
          ) : rows.length === 0 ? (
            <li className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">Sin usuarios</li>
          ) : rows.map(r => {
            const isSelf = String(r.user_id) === String(user?.id); // la API da el id como texto y la sesión como número
            const nombreCompleto = [r.nombre, r.apellido].filter(Boolean).join(" ");
            return (
              <li key={r.user_id} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[15px] font-semibold">{nombreCompleto || "—"} {isSelf && <span className="text-xs font-normal text-muted-foreground">(tú)</span>}</p>
                <p className="break-all text-sm text-muted-foreground">{r.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">Última conexión: {r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleString("es") : "Nunca"}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Select value={r.role} onValueChange={(v) => changeRole(r.user_id, v as Row["role"])} disabled={isSelf}>
                    <SelectTrigger className="h-10 w-[160px] rounded-xl" aria-label={`Rol de ${r.email}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docente">Docente</SelectItem>
                      <SelectItem value="admin"><span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Admin</span></SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" disabled={isSelf} aria-label={`Desactivar a ${r.email}`} onClick={() => setPorDesactivar({ id: r.user_id, email: r.email })} className="h-10 gap-1.5 rounded-xl text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Desactivar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!isMobile && (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Última conexión</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Cargando...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin usuarios</TableCell></TableRow>
            ) : rows.map(r => {
              const isSelf = String(r.user_id) === String(user?.id); // la API da el id como texto y la sesión como número
              const nombreCompleto = [r.nombre, r.apellido].filter(Boolean).join(" ");
              return (
                <TableRow key={r.user_id}>
                  <TableCell className="text-sm text-muted-foreground">{nombreCompleto || "—"}</TableCell>
                  <TableCell className="font-medium">
                    {r.email} {isSelf && <span className="text-xs text-muted-foreground ml-1">(tú)</span>}
                  </TableCell>
                  <TableCell>
                    <Select value={r.role} onValueChange={(v) => changeRole(r.user_id, v as Row["role"])} disabled={isSelf}>
                      <SelectTrigger className="w-[150px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docente">Docente</SelectItem>
                        <SelectItem value="admin"><span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Admin</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleString("es") : <span className="italic">Nunca</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleDateString("es") : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled={isSelf} aria-label={`Desactivar a ${r.email}`} onClick={() => setPorDesactivar({ id: r.user_id, email: r.email })} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      )}
      <ConfirmarAccion
        abierto={!!porDesactivar}
        titulo={`¿Desactivar a ${porDesactivar?.email ?? ""}?`}
        descripcion="La persona no podrá iniciar sesión. Su información y su historial se conservan en la base de datos."
        textoConfirmar="Desactivar usuario"
        onConfirmar={removeUser}
        onCancelar={() => setPorDesactivar(null)}
        procesando={desactivando}
      />
    </div>
  );
};

export default AdminUsuarios;