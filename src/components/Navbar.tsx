
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  MessageSquare,
  LogOut,
  ClipboardList,
  CalendarCheck,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}

const NavLink = ({ to, icon, label, active, onNavigate }: NavLinkProps) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start gap-2',
        active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
      )}
      onClick={() => { navigate(to); onNavigate?.(); }}
    >
      {icon}
      {label}
    </Button>
  );
};

const roleBadgeColor: Record<string, string> = {
  Admin:      "bg-purple-100 text-purple-700 border-purple-200",
  Secretaria: "bg-blue-100 text-blue-700 border-blue-200",
  Professor:  "bg-green-100 text-green-700 border-green-200",
};

interface NavbarProps {
  activePath: string;
  onNavigate?: () => void;
}

const Navbar = ({ activePath, onNavigate }: NavbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role ?? "Admin";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin     = role === "Admin";
  const isSecretary = role === "Secretaria";
  const isTeacher   = role === "Professor";

  return (
    <div className="h-full bg-background border-r border-border p-4 flex flex-col">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold leading-tight">Escola Pagamentos</h1>
        {user && (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <Badge variant="outline" className={cn("text-xs", roleBadgeColor[role])}>
              {role}
            </Badge>
          </div>
        )}
      </div>

      <nav className="space-y-1 flex-1">
        {/* Dashboard — all roles */}
        <NavLink
          to="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Painel de Controle"
          active={activePath === '/dashboard'}
          onNavigate={onNavigate}
        />

        {/* Students — Admin + Secretary */}
        {(isAdmin || isSecretary) && (
          <NavLink
            to="/students"
            icon={<Users className="h-4 w-4" />}
            label="Estudantes"
            active={activePath === '/students' || activePath.startsWith('/student/')}
            onNavigate={onNavigate}
          />
        )}

        {/* Teachers — Admin only */}
        {isAdmin && (
          <NavLink
            to="/teachers"
            icon={<GraduationCap className="h-4 w-4" />}
            label="Professores"
            active={activePath === '/teachers' || activePath.startsWith('/teacher/')}
            onNavigate={onNavigate}
          />
        )}

        {/* Grades — Admin + Teacher */}
        {(isAdmin || isTeacher) && (
          <NavLink
            to="/grades"
            icon={<ClipboardList className="h-4 w-4" />}
            label="Notas"
            active={activePath === '/grades'}
            onNavigate={onNavigate}
          />
        )}

        {/* Exams — Admin + Teacher */}
        {(isAdmin || isTeacher) && (
          <NavLink
            to="/exams"
            icon={<CalendarCheck className="h-4 w-4" />}
            label="Exames"
            active={activePath === '/exams'}
            onNavigate={onNavigate}
          />
        )}

        {/* Payments — Admin + Secretary */}
        {(isAdmin || isSecretary) && (
          <NavLink
            to="/payments"
            icon={<FileText className="h-4 w-4" />}
            label="Histórico de Pagamentos"
            active={activePath === '/payments'}
            onNavigate={onNavigate}
          />
        )}

        {/* Webhook SMS — Admin only */}
        {isAdmin && (
          <NavLink
            to="/webhook"
            icon={<MessageSquare className="h-4 w-4" />}
            label="Webhook SMS"
            active={activePath === '/webhook'}
            onNavigate={onNavigate}
          />
        )}

        {/* Staff — Admin only */}
        {isAdmin && (
          <NavLink
            to="/staff"
            icon={<UserCog className="h-4 w-4" />}
            label="Funcionários"
            active={activePath === '/staff' || activePath.startsWith('/staff/')}
            onNavigate={onNavigate}
          />
        )}
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );
};

export default Navbar;
