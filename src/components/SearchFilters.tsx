import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
}

const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entity, setEntity] = useState("");
  const [service, setService] = useState("");

  const handleSearch = () => {
    onSearch({
      searchTerm,
      entity,
      service,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po imenu ili nazivu firme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-full md:w-[200px]">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Entitet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi entiteti</SelectItem>
            <SelectItem value="fbih">Federacija BiH</SelectItem>
            <SelectItem value="rs">Republika Srpska</SelectItem>
            <SelectItem value="brcko">Brčko Distrikt</SelectItem>
          </SelectContent>
        </Select>

        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Briefcase className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Usluga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve usluge</SelectItem>
            <SelectItem value="accounting">Knjigovodstvo</SelectItem>
            <SelectItem value="audit">Revizija</SelectItem>
            <SelectItem value="tax">Porezi</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} size="lg" className="bg-hero-gradient">
          <Search className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Pretraži</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
