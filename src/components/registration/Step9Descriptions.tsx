import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Step9Props {
  data: any;
  onChange: (data: any) => void;
}

const Step9Descriptions = ({ data, onChange }: Step9Props) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Opisi i prezentacija</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Opišite sebe i svoje usluge - ovo je prilika da se predstavite potencijalnim klijentima
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Kratki opis (jedna rečenica) *</Label>
        <Input
          id="shortDescription"
          value={data.short_description || ''}
          onChange={(e) => handleChange('short_description', e.target.value)}
          placeholder="Npr: Certificirani knjigovođa sa 15 godina iskustva u vođenju knjiga malih i srednjih preduzeća"
          maxLength={150}
          required
        />
        <p className="text-xs text-muted-foreground">
          {data.short_description?.length || 0}/150 karaktera
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="longDescription">Detaljan opis *</Label>
        <Textarea
          id="longDescription"
          value={data.long_description || ''}
          onChange={(e) => handleChange('long_description', e.target.value)}
          placeholder="Opišite detaljnije vaše usluge, pristup radu, specijalizacije i ono što vas izdvaja od drugih..."
          rows={10}
          required
        />
        <p className="text-xs text-muted-foreground">
          Minimum 100 karaktera, trenutno: {data.long_description?.length || 0}
        </p>
      </div>

      <div className="p-4 bg-accent rounded-lg space-y-2">
        <p className="text-sm font-medium">✍️ Savjeti za pisanje dobrog opisa:</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Istaknite vaše ključne vještine i specijalizacije</li>
          <li>Opišite kako pomažete klijentima da riješe njihove probleme</li>
          <li>Spomenite licence, certifikate ili posebna priznanja</li>
          <li>Budite konkretni - brojevi i primjeri su uvjerljiviji od općenitosti</li>
          <li>Pišite jasno i profesionalno, ali i pristupačno</li>
        </ul>
      </div>

      <div className="p-4 border-l-4 border-success bg-success/5 rounded">
        <p className="text-sm font-medium text-success">🎉 Zadnji korak!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Nakon ovog koraka vaš profil će biti kreiran i bit ćete vidljivi u pretragama.
        </p>
      </div>
    </div>
  );
};

export default Step9Descriptions;
