
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  includeAll?: boolean;
}

const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  includeAll = true,
}: FilterDropdownProps) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Selecionar ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {includeAll && <SelectItem value="all">Todos</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterDropdown;
