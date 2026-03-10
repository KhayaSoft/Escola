
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash, Search, UserCog } from "lucide-react";
import { useStaff } from "@/hooks/use-staff";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const roleBadge: Record<string, string> = {
  Admin:      "bg-purple-100 text-purple-700 border-purple-200",
  Secretaria: "bg-blue-100 text-blue-700 border-blue-200",
  Professor:  "bg-green-100 text-green-700 border-green-200",
};

const Staff = () => {
  const navigate = useNavigate();
  const { staff, deleteStaff } = useStaff();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole   = roleFilter   === "all" || s.role   === roleFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const confirmDelete = () => {
    if (toDelete) {
      if (toDelete === user?.id) {
        toast({ title: "Erro", description: "Não pode remover o seu próprio utilizador.", variant: "destructive" });
        setToDelete(null);
        return;
      }
      deleteStaff(toDelete);
      toast({ title: "Funcionário removido", description: "O funcionário foi removido com sucesso." });
      setToDelete(null);
    }
  };

  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Funcionários</h1>
            <Button onClick={() => navigate("/staff/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Funcionário
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Pesquisar por nome ou username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Secretaria">Secretaria</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email / Telefone</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(member => (
                    <TableRow key={member.id} className={member.id === user?.id ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium">
                        {member.name}
                        {member.id === user?.id && (
                          <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{member.username}</TableCell>
                      <TableCell>
                        <div className="text-sm">{member.email}</div>
                        <div className="text-xs text-muted-foreground">{member.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", roleBadge[member.role])}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={member.status === "Ativo"
                          ? "border-green-300 text-green-700 bg-green-50"
                          : "border-gray-300 text-gray-600 bg-gray-50"
                        }>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/staff/${member.id}`)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm" variant="destructive"
                            disabled={member.id === user?.id}
                            onClick={() => setToDelete(member.id)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserCog className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
              <h2 className="text-xl font-medium mb-2">Nenhum funcionário encontrado</h2>
              <p className="text-muted-foreground mb-6">Ajuste os filtros ou adicione um novo funcionário.</p>
              <Button onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }}>
                Limpar Filtros
              </Button>
            </div>
          )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este funcionário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Staff;
