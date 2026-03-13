
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentForm from "./pages/StudentForm";
import PaymentHistory from "./pages/PaymentHistory";
import SMSWebhook from "./pages/SMSWebhook";
import Teachers from "./pages/Teachers";
import TeacherForm from "./pages/TeacherForm";
import Grades from "./pages/Grades";
import Exams from "./pages/Exams";
import Staff from "./pages/Staff";
import StaffForm from "./pages/StaffForm";
import Mensalidades from "./pages/Mensalidades";
import NotFound from "./pages/NotFound";

import { StudentsProvider } from "./hooks/use-students";
import { AuthProvider } from "./hooks/use-auth";
import { TeachersProvider } from "./hooks/use-teachers";
import { GradesProvider } from "./hooks/use-grades";
import { ExamsProvider } from "./hooks/use-exams";
import { StaffProvider } from "./hooks/use-staff";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLoader from "./components/AppLoader";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppLoader>
    <StaffProvider>
      <AuthProvider>
        <StudentsProvider>
          <TeachersProvider>
            <GradesProvider>
              <ExamsProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<Index />} />

                      {/* All authenticated */}
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                      {/* Admin + Secretaria */}
                      <Route path="/students"    element={<ProtectedRoute allowedRoles={["Admin","Secretaria"]}><Students /></ProtectedRoute>} />
                      <Route path="/student/:id" element={<ProtectedRoute allowedRoles={["Admin","Secretaria"]}><StudentForm /></ProtectedRoute>} />
                      <Route path="/mensalidades" element={<ProtectedRoute allowedRoles={["Admin","Secretaria"]}><Mensalidades /></ProtectedRoute>} />
                      <Route path="/payments"    element={<ProtectedRoute allowedRoles={["Admin","Secretaria"]}><PaymentHistory /></ProtectedRoute>} />

                      {/* Admin + Professor */}
                      <Route path="/grades" element={<ProtectedRoute allowedRoles={["Admin","Professor"]}><Grades /></ProtectedRoute>} />
                      <Route path="/exams"  element={<ProtectedRoute allowedRoles={["Admin","Professor"]}><Exams /></ProtectedRoute>} />

                      {/* Admin only */}
                      <Route path="/teachers"    element={<ProtectedRoute allowedRoles={["Admin"]}><Teachers /></ProtectedRoute>} />
                      <Route path="/teacher/:id" element={<ProtectedRoute allowedRoles={["Admin"]}><TeacherForm /></ProtectedRoute>} />
                      <Route path="/staff"       element={<ProtectedRoute allowedRoles={["Admin"]}><Staff /></ProtectedRoute>} />
                      <Route path="/staff/:id"   element={<ProtectedRoute allowedRoles={["Admin"]}><StaffForm /></ProtectedRoute>} />
                      <Route path="/webhook"     element={<ProtectedRoute allowedRoles={["Admin"]}><SMSWebhook /></ProtectedRoute>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </ExamsProvider>
            </GradesProvider>
          </TeachersProvider>
        </StudentsProvider>
      </AuthProvider>
    </StaffProvider>
    </AppLoader>
  </QueryClientProvider>
);

export default App;
