import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
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
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const fetchServiceCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (data) {
      const mainCategories = data.filter(cat => !cat.parent_id);
      const withSubcategories = mainCategories.map(main => ({
        ...main,
        subcategories: data.filter(cat => cat.parent_id === main.id)
      }));
      setServiceCategories(withSubcategories);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSearch = () => {
    onSearch({
      searchTerm,
      entity,
      services: selectedServices,
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

        <Button onClick={handleSearch} size="lg" className="bg-hero-gradient">
          <Search className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Pretraži</span>
        </Button>
      </div>

      {/* Service Categories Filter */}
      <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Usluge {selectedServices.length > 0 && `(${selectedServices.length})`}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="border rounded-lg p-4 bg-muted/50 max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {serviceCategories.map((mainCategory) => (
                <div key={mainCategory.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={mainCategory.id}
                      checked={selectedServices.includes(mainCategory.id)}
                      onCheckedChange={() => handleServiceToggle(mainCategory.id)}
                    />
                    <Label htmlFor={mainCategory.id} className="font-semibold cursor-pointer">
                      {mainCategory.name}
                    </Label>
                  </div>
                  {mainCategory.subcategories?.length > 0 && (
                    <div className="ml-6 space-y-2">
                      {mainCategory.subcategories.map((sub: any) => (
                        <div key={sub.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={sub.id}
                            checked={selectedServices.includes(sub.id)}
                            onCheckedChange={() => handleServiceToggle(sub.id)}
                          />
                          <Label htmlFor={sub.id} className="text-sm cursor-pointer">
                            {sub.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SearchFilters;
