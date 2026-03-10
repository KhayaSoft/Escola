
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SearchBar from "@/components/SearchBar";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { monthNames } from "@/lib/mockData";
import { useStudents } from "@/hooks/use-students";
import { FileDown } from "lucide-react";

// Helper function to get month-year string from a month key (M-YYYY)
const getMonthYearFromKey = (monthKey: string): string => {
  const [month, year] = monthKey.split("-");
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// Payment history data based on student data
const generatePaymentHistory = (students: { id: string; name: string; parentPhones: string[]; paymentStatus: { [key: string]: "Pago" | "Em Falta" } }[]) => {
  const history: {
    id: string;
    studentId: string;
    studentName: string;
    parentPhone: string;
    month: string;
    monthKey: string;
    status: "Pago" | "Em Falta";
    date: string;
  }[] = [];

  students.forEach(student => {
    // Get payment status entries
    Object.entries(student.paymentStatus).forEach(([monthKey, status]) => {
      // Add entry to history
      history.push({
        id: `${student.id}-${monthKey}`,
        studentId: student.id,
        studentName: student.name,
        parentPhone: student.parentPhones[0] || "-",
        month: getMonthYearFromKey(monthKey),
        monthKey,
        status,
        date: status === "Pago" ? "15/05/2025" : "-"
      });
    });
  });

  return history;
};

const PaymentHistory = () => {
  const { students } = useStudents();
  const history = generatePaymentHistory(students);
  
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Filtered history
  const filteredHistory = history.filter(item => {
    // Check search query (matches student name)
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check status filter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Mock export function
  const handleExportCSV = () => {
    alert("Esta funcionalidade exportaria os dados para CSV em um aplicativo real.");
  };
  
  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Histórico de Pagamentos</h1>
            
            <Button variant="outline" onClick={handleExportCSV}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Pesquisar por nome de estudante..."
              />
            </div>
            
            <div className="md:w-1/4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pago">Pagos</SelectItem>
                  <SelectItem value="Em Falta">Em Falta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Estudante</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>Data de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.studentName}</TableCell>
                      <TableCell>{item.parentPhone}</TableCell>
                      <TableCell>{item.month}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={item.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
      </div>
    </PageLayout>
  );
};

export default PaymentHistory;
