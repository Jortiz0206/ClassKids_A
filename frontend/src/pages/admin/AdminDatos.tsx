import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import PageHeader from "@/components/layout/PageHeader";
import { Database } from "lucide-react";
import { aLista } from "@/lib/listas";
import type { Alerta, Estudiante, Grupo } from "@/types";

// Nombres en español de los estados de alerta (mismos textos que la pantalla Alertas).
const ESTADO_ALERTA: Record<string, string> = { active: "Activa", reviewed: "En revisión", resolved: "Resuelta" };

const useAll = <T,>(endpoint: string) => {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    api.get(endpoint)
      .then((data) => setRows(aLista<T>(data)))
      .catch((err) => {
        console.error(`Error al cargar ${endpoint}:`, err);
        setRows([]);
      });
  }, [endpoint]);
  return rows;
};

const AdminDatos = () => {
  const grupos = useAll<Grupo>("/grupos");
  const estudiantes = useAll<Estudiante>("/estudiantes");
  const alertas = useAll<Alerta>("/alertas");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administración" title="Datos globales" description="Vista de solo lectura sobre la información de toda la plataforma" icon={Database} tono="bg-cielo" />

      <Tabs defaultValue="grupos">
        <TabsList>
          <TabsTrigger value="grupos">Grupos ({grupos.length})</TabsTrigger>
          <TabsTrigger value="estudiantes">Estudiantes ({estudiantes.length})</TabsTrigger>
          <TabsTrigger value="alertas">Alertas ({alertas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="grupos">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Grado</TableHead><TableHead>Turno</TableHead><TableHead>Año lectivo</TableHead></TableRow></TableHeader>
              <TableBody>
                {grupos.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.nombre}</TableCell>
                    <TableCell>{g.grado}</TableCell>
                    <TableCell>{g.turno}</TableCell>
                    {/* H-26: la tabla `grupos` no tiene fecha de creación; se muestra el año lectivo, que sí existe. */}
                    <TableCell className="text-sm text-muted-foreground">{g.ano_lectivo ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="estudiantes">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Apellido</TableHead><TableHead>Documento</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {estudiantes.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nombre}</TableCell>
                    <TableCell>{e.apellido}</TableCell>
                    <TableCell>{e.documento}</TableCell>
                    <TableCell>{e.activo ? "Activo" : "Inactivo"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="alertas">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Mensaje</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {alertas.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.tipo}</TableCell>
                    <TableCell className="text-sm">{a.mensaje}</TableCell>
                    <TableCell>{ESTADO_ALERTA[a.estado] ?? a.estado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDatos;