import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
  Calendar,
  Phone,
  Mail,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { usersApi, type User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const createSchema = z.object({
  username: z.string().min(3, "Min 3 caratteri").max(50, "Max 50 caratteri"),
  email: z.string().min(1, "Obbligatorio").email("Email non valida"),
  telefono: z
    .string()
    .min(1, "Obbligatorio")
    .regex(/^\+\d{6,15}$/, "Formato: +393331234567"),
  dataDiNascita: z.string().min(1, "Obbligatorio"),
  password: z.string().min(6, "Min 6 caratteri"),
  ruolo: z.enum(["USER", "ADMIN"] as const, { message: "Seleziona un ruolo" }),
});

const editSchema = z.object({
  username: z.string().min(3, "Min 3 caratteri").max(50).optional().or(z.literal("")),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  telefono: z
    .string()
    .regex(/^\+\d{6,15}$/, "Formato: +393331234567")
    .optional()
    .or(z.literal("")),
  dataDiNascita: z.string().optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Min 6 caratteri")
    .optional()
    .or(z.literal("")),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("it-IT").format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

type SortField = keyof User;
type SortDir = "asc" | "desc";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { ruolo: "USER" },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.getAll();
      setUsers(data);
    } catch {
      toast.error("Errore nel caricamento degli utenti");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 ml-1" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 ml-1" />
    );
  };

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.telefono.toLowerCase().includes(q) ||
        u.ruolo.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortField] ?? "");
      const bv = String(b[sortField] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.ruolo === "ADMIN").length;
  const userCount = users.filter((u) => u.ruolo === "USER").length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreate = async (values: CreateValues) => {
    setActionLoading(true);
    try {
      await usersApi.register(values);
      toast.success("Utente creato con successo");
      setCreateOpen(false);
      createForm.reset({ ruolo: "USER" });
      await fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Errore nella creazione dell'utente";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      telefono: user.telefono,
      dataDiNascita: user.dataDiNascita,
      password: "",
    });
    setEditOpen(true);
  };

  const handleEdit = async (values: EditValues) => {
    if (!selectedUser) return;
    setActionLoading(true);

    const payload: Record<string, string> = {};
    (Object.keys(values) as (keyof EditValues)[]).forEach((k) => {
      const v = values[k];
      if (v && v.trim() !== "") payload[k] = v;
    });

    try {
      await usersApi.update(selectedUser.id, payload);
      toast.success("Utente aggiornato con successo");
      setEditOpen(false);
      await fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Errore nell'aggiornamento";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await usersApi.delete(selectedUser.id);
      toast.success("Utente eliminato");
      setDeleteOpen(false);
      await fetchUsers();
    } catch {
      toast.error("Errore nell'eliminazione");
    } finally {
      setActionLoading(false);
    }
  };

  const Field = ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold text-lg">GestioneUtenti</span>
              <span className="hidden sm:inline text-muted-foreground text-sm ml-2">
                Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authUser && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{authUser.email}</span>
                <Badge variant={authUser.ruolo === "ADMIN" ? "default" : "secondary"}>
                  {authUser.ruolo}
                </Badge>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utenti totali</p>
                  <p className="text-3xl font-bold mt-1">{totalUsers}</p>
                </div>
                <div className="bg-primary/10 text-primary rounded-xl p-3">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Amministratori</p>
                  <p className="text-3xl font-bold mt-1">{adminCount}</p>
                </div>
                <div className="bg-amber-500/10 text-amber-600 rounded-xl p-3">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utenti standard</p>
                  <p className="text-3xl font-bold mt-1">{userCount}</p>
                </div>
                <div className="bg-blue-500/10 text-blue-600 rounded-xl p-3">
                  <UserIcon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Elenco utenti</CardTitle>
                <CardDescription>
                  Gestisci gli utenti registrati nel sistema
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
                  />
                  Aggiorna
                </Button>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nuovo utente
                </Button>
              </div>
            </div>

            <Separator />

            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Cerca per nome, email, telefono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      className="cursor-pointer select-none w-12"
                      onClick={() => handleSort("id")}
                    >
                      <span className="flex items-center">
                        ID <SortIcon field="id" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("username")}
                    >
                      <span className="flex items-center">
                        Username <SortIcon field="username" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("email")}
                    >
                      <span className="flex items-center">
                        Email <SortIcon field="email" />
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> Telefono
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Nascita
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("ruolo")}
                    >
                      <span className="flex items-center">
                        Ruolo <SortIcon field="ruolo" />
                      </span>
                    </TableHead>
                    <TableHead>Registrato il</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span>Caricamento utenti...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Users className="h-8 w-8 opacity-40" />
                          <span>
                            {search
                              ? "Nessun utente corrisponde alla ricerca"
                              : "Nessun utente registrato"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => (
                      <TableRow key={u.id} className="group">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{u.id}
                        </TableCell>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {u.email}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{u.telefono}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(u.dataDiNascita)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.ruolo === "ADMIN" ? "default" : "secondary"
                            }
                            className="gap-1"
                          >
                            {u.ruolo === "ADMIN" ? (
                              <ShieldCheck className="h-3 w-3" />
                            ) : (
                              <UserIcon className="h-3 w-3" />
                            )}
                            {u.ruolo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(u.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(u)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDelete(u)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && filtered.length > 0 && (
              <div className="px-4 py-3 border-t text-sm text-muted-foreground">
                {search
                  ? `${filtered.length} di ${totalUsers} utenti`
                  : `${totalUsers} utenti totali`}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuovo utente
            </DialogTitle>
            <DialogDescription>
              Compila i campi per creare un nuovo utente nel sistema
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={createForm.handleSubmit(handleCreate)}
            className="space-y-4 mt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Username"
                error={createForm.formState.errors.username?.message}
              >
                <Input
                  placeholder="mario.rossi"
                  {...createForm.register("username")}
                />
              </Field>
              <Field
                label="Ruolo"
                error={createForm.formState.errors.ruolo?.message}
              >
                <Controller
                  name="ruolo"
                  control={createForm.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Ruolo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Utente</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field
              label="Email"
              error={createForm.formState.errors.email?.message}
            >
              <Input
                type="email"
                placeholder="mario@esempio.it"
                {...createForm.register("email")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Telefono"
                error={createForm.formState.errors.telefono?.message}
              >
                <Input
                  placeholder="+393331234567"
                  {...createForm.register("telefono")}
                />
              </Field>
              <Field
                label="Data di nascita"
                error={createForm.formState.errors.dataDiNascita?.message}
              >
                <Input
                  type="date"
                  {...createForm.register("dataDiNascita")}
                />
              </Field>
            </div>

            <Field
              label="Password"
              error={createForm.formState.errors.password?.message}
            >
              <Input
                type="password"
                placeholder="Minimo 6 caratteri"
                {...createForm.register("password")}
              />
            </Field>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={actionLoading}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creazione...
                  </span>
                ) : (
                  "Crea utente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Modifica utente
            </DialogTitle>
            <DialogDescription>
              Modifica i dati di{" "}
              <strong>{selectedUser?.username}</strong>. I campi lasciati
              vuoti non verranno modificati.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editForm.handleSubmit(handleEdit)}
            className="space-y-4 mt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Username"
                error={editForm.formState.errors.username?.message}
              >
                <Input
                  placeholder="mario.rossi"
                  {...editForm.register("username")}
                />
              </Field>
              <Field
                label="Email"
                error={editForm.formState.errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="mario@esempio.it"
                  {...editForm.register("email")}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Telefono"
                error={editForm.formState.errors.telefono?.message}
              >
                <Input
                  placeholder="+393331234567"
                  {...editForm.register("telefono")}
                />
              </Field>
              <Field
                label="Data di nascita"
                error={editForm.formState.errors.dataDiNascita?.message}
              >
                <Input
                  type="date"
                  {...editForm.register("dataDiNascita")}
                />
              </Field>
            </div>

            <Field
              label="Nuova password (lascia vuoto per non cambiare)"
              error={editForm.formState.errors.password?.message}
            >
              <Input
                type="password"
                placeholder="••••••••"
                {...editForm.register("password")}
              />
            </Field>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={actionLoading}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Salvataggio...
                  </span>
                ) : (
                  "Salva modifiche"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Elimina utente
            </DialogTitle>
            <DialogDescription className="pt-2">
              Stai per eliminare l'utente{" "}
              <strong className="text-foreground">
                {selectedUser?.username}
              </strong>{" "}
              ({selectedUser?.email}). Questa azione è{" "}
              <strong className="text-destructive">irreversibile</strong>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={actionLoading}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Eliminazione...
                </span>
              ) : (
                "Sì, elimina"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
