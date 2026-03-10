
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentMonthKey, getFormattedMonthYear } from "@/lib/mockData";
import { useStudents } from "@/hooks/use-students";
import { Student, PaymentStatus } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, addStudent, updateStudent } = useStudents();
  
  const isEditing = id !== "new";
  const title = isEditing ? "Editar Estudante" : "Novo Estudante";
  
  // Initialize form state
  const [formData, setFormData] = useState<{
    name: string;
    class: string;
    room: string;
    gender: "M" | "F" | undefined;
    situation: "Antigo" | "Novo Ingresso";
    parentPhones: string[];
    newPhone: string;
    paymentStatus: { [key: string]: PaymentStatus };
  }>({
    name: "",
    class: "",
    room: "",
    gender: undefined,
    situation: "Antigo",
    parentPhones: [],
    newPhone: "",
    paymentStatus: {}
  });
  
  // Get current month key
  const currentMonthKey = getCurrentMonthKey();
  const currentMonthLabel = getFormattedMonthYear(
    new Date().getMonth(),
    new Date().getFullYear()
  );
  
  // Next month key and label
  const nextMonth = new Date().getMonth() + 1 > 11 ? 0 : new Date().getMonth() + 1;
  const nextYear = new Date().getMonth() + 1 > 11 ? new Date().getFullYear() + 1 : new Date().getFullYear();
  const nextMonthKey = `${nextMonth + 1}-${nextYear}`;
  const nextMonthLabel = getFormattedMonthYear(nextMonth, nextYear);
  
  // Load student data if editing
  useEffect(() => {
    if (isEditing) {
      const student = students.find((s) => s.id === id);

      if (student) {
        setFormData({
          name: student.name,
          class: student.class,
          room: student.room,
          gender: student.gender,
          situation: student.situation ?? "Antigo",
          parentPhones: [...student.parentPhones],
          newPhone: "",
          paymentStatus: { ...student.paymentStatus }
        });
      } else {
        toast({
          title: "Erro",
          description: "Estudante não encontrado.",
          variant: "destructive"
        });
        navigate("/students");
      }
    } else {
      // Initialize default payment status for new student
      setFormData(prev => ({
        ...prev,
        paymentStatus: {
          [currentMonthKey]: "Em Falta",
          [nextMonthKey]: "Em Falta"
        }
      }));
    }
  }, [id, isEditing]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle adding a phone number
  const handleAddPhone = () => {
    if (!formData.newPhone) return;
    
    // Validate phone number format (Mozambican format)
    const phoneRegex = /^8[245678]\d{7}$/;
    if (!phoneRegex.test(formData.newPhone)) {
      toast({
        title: "Erro",
        description: "Formato de número inválido. Use formato moçambicano (ex: 84xxxxxxx).",
        variant: "destructive"
      });
      return;
    }
    
    // Check for duplicate
    if (formData.parentPhones.includes(formData.newPhone)) {
      toast({
        title: "Erro",
        description: "Este número já foi adicionado.",
        variant: "destructive"
      });
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      parentPhones: [...prev.parentPhones, prev.newPhone],
      newPhone: ""
    }));
  };
  
  // Handle removing a phone number
  const handleRemovePhone = (phone: string) => {
    setFormData((prev) => ({
      ...prev,
      parentPhones: prev.parentPhones.filter((p) => p !== phone)
    }));
  };
  
  // Handle payment status toggle
  const handleTogglePaymentStatus = (monthKey: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentStatus: {
        ...prev.paymentStatus,
        [monthKey]: prev.paymentStatus[monthKey] === "Pago" ? "Em Falta" : "Pago"
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.class || !formData.room) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.parentPhones.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um número de telefone.",
        variant: "destructive"
      });
      return;
    }
    
    const studentData = {
      name: formData.name,
      class: formData.class,
      room: formData.room,
      gender: formData.gender,
      situation: formData.situation,
      parentPhones: formData.parentPhones,
      paymentStatus: formData.paymentStatus,
    };
    if (isEditing) {
      updateStudent({ id: id!, ...studentData });
    } else {
      addStudent(studentData);
    }

    toast({
      title: "Sucesso",
      description: isEditing
        ? "Estudante atualizado com sucesso."
        : "Estudante adicionado com sucesso."
    });

    navigate("/students");
  };
  
  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/students")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Estudante</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class">Classe</Label>
                        <Select value={formData.class} onValueChange={v => setFormData(p => ({ ...p, class: v }))}>
                          <SelectTrigger><SelectValue placeholder="Classe" /></SelectTrigger>
                          <SelectContent>
                            {["1","2","3","4","5","6","7","8","9","10","11","12"].map(c => (
                              <SelectItem key={c} value={c}>{c}ª Classe</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="room">Sala</Label>
                        <Select value={formData.room} onValueChange={v => setFormData(p => ({ ...p, room: v }))}>
                          <SelectTrigger><SelectValue placeholder="Sala" /></SelectTrigger>
                          <SelectContent>
                            {["A","B","C","D"].map(r => (
                              <SelectItem key={r} value={r}>Sala {r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sexo</Label>
                        <Select value={formData.gender ?? ""} onValueChange={v => setFormData(p => ({ ...p, gender: v as "M" | "F" }))}>
                          <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Situação</Label>
                        <Select value={formData.situation} onValueChange={v => setFormData(p => ({ ...p, situation: v as "Antigo" | "Novo Ingresso" }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Antigo">Aluno Antigo</SelectItem>
                            <SelectItem value="Novo Ingresso">Novo Ingresso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{currentMonthLabel}</h3>
                          <p className="text-sm text-muted-foreground">Mês Atual</p>
                        </div>
                        
                        <div 
                          className={cn(
                            "px-4 py-2 rounded-full cursor-pointer transition-colors",
                            formData.paymentStatus[currentMonthKey] === "Pago" 
                              ? "bg-paid text-paid-foreground"
                              : "bg-unpaid text-unpaid-foreground"
                          )}
                          onClick={() => handleTogglePaymentStatus(currentMonthKey)}
                        >
                          {formData.paymentStatus[currentMonthKey]}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{nextMonthLabel}</h3>
                          <p className="text-sm text-muted-foreground">Próximo Mês</p>
                        </div>
                        
                        <div 
                          className={cn(
                            "px-4 py-2 rounded-full cursor-pointer transition-colors",
                            formData.paymentStatus[nextMonthKey] === "Pago" 
                              ? "bg-paid text-paid-foreground"
                              : "bg-unpaid text-unpaid-foreground"
                          )}
                          onClick={() => handleTogglePaymentStatus(nextMonthKey)}
                        >
                          {formData.paymentStatus[nextMonthKey]}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Telefones dos Pais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Adicionar telefone (ex: 841234567)"
                          value={formData.newPhone}
                          onChange={(e) => setFormData((prev) => ({ ...prev, newPhone: e.target.value }))}
                        />
                      </div>
                      <Button type="button" onClick={handleAddPhone}>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Telefones Registrados</Label>
                      {formData.parentPhones.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.parentPhones.map((phone) => (
                            <Badge key={phone} variant="secondary" className="flex items-center gap-1">
                              {phone}
                              <button
                                type="button"
                                onClick={() => handleRemovePhone(phone)}
                                className="ml-1 rounded-full hover:bg-muted p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum telefone adicionado
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p>
                        Os números de telefone serão usados para combinar com mensagens SMS
                        de pagamento recebidas das carteiras eletrônicas (e-wallets).
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/students")}
                  >
                    Cancelar
                  </Button>
                  
                  <Button type="submit">
                    {isEditing ? "Salvar Alterações" : "Adicionar Estudante"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
      </div>
    </PageLayout>
  );
};

export default StudentForm;
