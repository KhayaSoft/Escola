
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import StudentCard from "@/components/StudentCard";
import SearchBar from "@/components/SearchBar";
import FilterDropdown from "@/components/FilterDropdown";
import { Button } from "@/components/ui/button";
import {
  getUniqueClasses,
  getUniqueRooms
} from "@/lib/mockData";
import { Student } from "@/lib/types";
import { useStudents } from "@/hooks/use-students";
import { PlusCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Students = () => {
  const navigate = useNavigate();
  
  const { students, deleteStudent } = useStudents();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");

  // Get unique classes and rooms for filters
  const classes = getUniqueClasses(students);
  const rooms = getUniqueRooms(students);
  
  // State for delete confirmation dialog
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  
  // Filter students based on search query and filters
  const filteredStudents = students.filter(student => {
    // Check search query
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check class filter
    const matchesClass = classFilter === "all" || student.class === classFilter;
    
    // Check room filter
    const matchesRoom = roomFilter === "all" || student.room === roomFilter;
    
    return matchesSearch && matchesClass && matchesRoom;
  });
  
  // Handle editing a student
  const handleEditStudent = (student: Student) => {
    navigate(`/student/${student.id}`);
  };
  
  // Handle deleting a student
  const handleDeleteStudent = (studentId: string) => {
    setStudentToDelete(studentId);
  };
  
  // Confirm student deletion
  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete);
      toast({
        title: "Estudante excluído",
        description: "O estudante foi excluído com sucesso.",
      });
      setStudentToDelete(null);
    }
  };
  
  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Estudantes</h1>
            
            <Button onClick={() => navigate("/student/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Estudante
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Pesquisar estudantes..."
              />
            </div>
            
            <div className="flex gap-4 md:w-1/2">
              <div className="w-1/2">
                <FilterDropdown
                  label="Classe"
                  value={classFilter}
                  onChange={setClassFilter}
                  options={classes}
                />
              </div>
              
              <div className="w-1/2">
                <FilterDropdown
                  label="Sala"
                  value={roomFilter}
                  onChange={setRoomFilter}
                  options={rooms}
                />
              </div>
            </div>
          </div>
          
          {filteredStudents.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Nenhum estudante encontrado</h2>
              <p className="text-muted-foreground mb-6">
                Nenhum estudante corresponde aos seus filtros ou pesquisa.
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setClassFilter("all");
                setRoomFilter("all");
              }}>
                Limpar Filtros
              </Button>
            </div>
          )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este estudante? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Students;
