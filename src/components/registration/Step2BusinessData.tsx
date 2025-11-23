import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Step2Props {
  data: any;
  onChange: (data: any) => void;
}

const Step2BusinessData = ({ data, onChange }: Step2Props) => {
  const [entities, setEntities] = useState<any[]>([]);
  const [cantons, setCantons] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    if (data.business_entity) {
      fetchCantons(data.business_entity);
    }
  }, [data.business_entity]);

  useEffect(() => {
    if (data.business_entity) {
      fetchCities(data.business_entity, data.business_canton);
    }
  }, [data.business_entity, data.business_canton]);

  const fetchEntities = async () => {
    const { data: entitiesData } = await supabase.from('entities').select('*');
    if (entitiesData) setEntities(entitiesData);
  };

  const fetchCantons = async (entityId: string) => {
    const { data: cantonsData } = await supabase
      .from('cantons')
      .select('*')
      .eq('entity_id', entityId);
    if (cantonsData) setCantons(cantonsData);
  };

  const fetchCities = async (entityId: string, cantonId?: string) => {
    let query = supabase.from('cities').select('*').eq('entity_id', entityId);
    if (cantonId) {
      query = query.eq('canton_id', cantonId);
    }
    const { data: citiesData } = await query;
    if (citiesData) setCities(citiesData);
  };

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Tip poslovanja *</Label>
        <RadioGroup value={data.business_type} onValueChange={(value) => handleChange('business_type', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual">Samostalno poslujem</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company">Poslujem kroz firmu</Label>
          </div>
        </RadioGroup>
      </div>

      {data.business_type && (
        <>
          <div className="space-y-2">
            <Label htmlFor="companyName">
              {data.business_type === 'company' ? 'Naziv firme *' : 'Naziv pod kojim poslujete'}
            </Label>
            <Input
              id="companyName"
              value={data.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Web stranica</Label>
              <Input
                id="website"
                type="url"
                value={data.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://primjer.ba"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxId">JIB/PDV broj</Label>
              <Input
                id="taxId"
                value={data.tax_id || ''}
                onChange={(e) => handleChange('tax_id', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Poslovna adresa</h3>
            
            <div className="space-y-2">
              <Label htmlFor="businessStreet">Ulica i broj *</Label>
              <Input
                id="businessStreet"
                value={data.business_street || ''}
                onChange={(e) => handleChange('business_street', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessEntity">Entitet *</Label>
                <Select value={data.business_entity} onValueChange={(value) => handleChange('business_entity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {data.business_entity && cantons.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="businessCanton">Kanton/Opština</Label>
                  <Select value={data.business_canton} onValueChange={(value) => handleChange('business_canton', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      {cantons.map((canton) => (
                        <SelectItem key={canton.id} value={canton.id}>
                          {canton.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="businessCity">Grad *</Label>
                <Select value={data.business_city_id} onValueChange={(value) => handleChange('business_city_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name} ({city.postal_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Step2BusinessData;
