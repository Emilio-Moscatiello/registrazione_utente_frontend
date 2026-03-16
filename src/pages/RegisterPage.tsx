import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersApi } from "@/lib/api";

const schema = z.object({
  username: z
    .string()
    .min(3, "Minimo 3 caratteri")
    .max(50, "Massimo 50 caratteri"),
  email: z.string().min(1, "Email obbligatoria").email("Email non valida"),
  telefono: z
    .string()
    .min(1, "Telefono obbligatorio")
    .regex(/^\+\d{6,15}$/, "Usa il formato internazionale (es. +393331234567)"),
  dataDiNascita: z.string().min(1, "Data di nascita obbligatoria"),
  password: z
    .string()
    .min(6, "Minimo 6 caratteri"),
  ruolo: z.enum(["USER", "ADMIN"] as const, {
    message: "Seleziona un ruolo",
  }),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ruolo: "USER" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await usersApi.register(values);
      toast.success("Registrazione completata! Ora puoi accedere.");
      navigate("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Errore durante la registrazione";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary text-primary-foreground rounded-2xl p-3 mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">GestioneUtenti</h1>
          <p className="text-muted-foreground mt-1">
            Sistema di gestione degli utenti
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Crea account</CardTitle>
            <CardDescription>
              Compila il modulo per registrarti nel sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="mario.rossi"
                  autoComplete="username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mario@esempio.it"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input
                    id="telefono"
                    placeholder="+393331234567"
                    autoComplete="tel"
                    {...register("telefono")}
                  />
                  {errors.telefono && (
                    <p className="text-destructive text-sm">
                      {errors.telefono.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataDiNascita">Data di nascita</Label>
                  <Input
                    id="dataDiNascita"
                    type="date"
                    {...register("dataDiNascita")}
                  />
                  {errors.dataDiNascita && (
                    <p className="text-destructive text-sm">
                      {errors.dataDiNascita.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimo 6 caratteri"
                    autoComplete="new-password"
                    {...register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ruolo</Label>
                <Controller
                  name="ruolo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona ruolo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Utente</SelectItem>
                        <SelectItem value="ADMIN">Amministratore</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.ruolo && (
                  <p className="text-destructive text-sm">
                    {errors.ruolo.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Registrazione in corso...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Registrati
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Hai già un account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Accedi
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
