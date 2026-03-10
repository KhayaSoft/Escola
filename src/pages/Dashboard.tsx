
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertCircle, ArrowRight } from "lucide-react";
import {
  getCurrentMonthYear,
  monthNames,
  getPaymentStatistics,
  getCurrentMonthKey
} from "@/lib/mockData";
import { useStudents } from "@/hooks/use-students";
import { useNavigate } from "react-router-dom";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";

const Dashboard = () => {
  const navigate = useNavigate();
  const { students } = useStudents();

  // Get the current month/year
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Create month key for looking up payment status
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  
  // Get payment statistics
  const [stats, setStats] = useState(() => getPaymentStatistics(students, monthKey));

  // Update month key when month or year changes
  useEffect(() => {
    const newMonthKey = `${selectedMonth + 1}-${selectedYear}`;
    setMonthKey(newMonthKey);
    setStats(getPaymentStatistics(students, newMonthKey));
  }, [selectedMonth, selectedYear, students]);

  // Get recent unpaid students
  const unpaidStudents = students
    .filter(student => student.paymentStatus[monthKey] !== "Pago")
    .slice(0, 5);

  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Painel de Controle</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedMonth.toString()} onValueChange={value => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedYear.toString()} onValueChange={value => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => navigate("/student/new")}>
                Adicionar Estudante
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Estudantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-paid to-paid/80 text-paid-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pagamentos Recebidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.paid}</div>
                <div className="text-sm mt-1">
                  <Check className="w-4 h-4 inline mr-1" />
                  {stats.paidPercentage.toFixed(0)}% concluído
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-unpaid to-unpaid/80 text-unpaid-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pagamentos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.unpaid}</div>
                <div className="text-sm mt-1">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Necessita atenção
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Status de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">Progresso do Mês</div>
                      <Progress value={stats.paidPercentage} className="h-2" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold">{stats.paidPercentage.toFixed(0)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Pagos</div>
                      <div className="text-xl font-bold flex items-center">
                        <div className="w-3 h-3 bg-paid rounded-full mr-2"></div>
                        {stats.paid}
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Pendentes</div>
                      <div className="text-xl font-bold flex items-center">
                        <div className="w-3 h-3 bg-unpaid rounded-full mr-2"></div>
                        {stats.unpaid}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pagamentos Pendentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/students")}>
                  Ver Todos <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {unpaidStudents.length > 0 ? (
                  <div className="space-y-2">
                    {unpaidStudents.map(student => (
                      <div 
                        key={student.id} 
                        className="p-3 border rounded-lg flex justify-between items-center hover:bg-accent cursor-pointer"
                        onClick={() => navigate(`/student/${student.id}`)}
                      >
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">Classe {student.class}, Sala {student.room}</div>
                        </div>
                        <PaymentStatusBadge status="Em Falta" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Todos os pagamentos foram efetuados!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
