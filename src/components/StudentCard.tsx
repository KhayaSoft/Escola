
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { Edit, Trash } from "lucide-react";
import { getCurrentMonthKey } from "@/lib/mockData";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
}

const StudentCard = ({ student, onEdit, onDelete }: StudentCardProps) => {
  const currentMonthKey = getCurrentMonthKey();
  const currentMonthStatus = student.paymentStatus[currentMonthKey] || "Em Falta";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="text-lg font-medium">{student.name}</h3>
          <p className="text-sm text-muted-foreground">Classe {student.class}, Sala {student.room}</p>
        </div>
        <PaymentStatusBadge status={currentMonthStatus} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Telefones dos Pais</h4>
            <ul className="mt-1 space-y-1">
              {student.parentPhones.map((phone) => (
                <li key={phone} className="text-sm">{phone}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8" 
              onClick={() => onEdit(student)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Editar
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="h-8" 
              onClick={() => onDelete(student.id)}
            >
              <Trash className="h-3.5 w-3.5 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
