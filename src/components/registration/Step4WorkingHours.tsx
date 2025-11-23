import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Step4Props {
  data: any;
  onChange: (data: any) => void;
}

const DAYS = [
  { value: 1, label: 'Ponedjeljak' },
  { value: 2, label: 'Utorak' },
  { value: 3, label: 'Srijeda' },
  { value: 4, label: 'Četvrtak' },
  { value: 5, label: 'Petak' },
  { value: 6, label: 'Subota' },
  { value: 0, label: 'Nedjelja' },
];

const Step4WorkingHours = ({ data, onChange }: Step4Props) => {
  const workingHours = data.working_hours || {};

  const handleDayChange = (day: number, field: string, value: any) => {
    const dayData = workingHours[day] || { is_closed: false };
    onChange({
      ...data,
      working_hours: {
        ...workingHours,
        [day]: { ...dayData, [field]: value }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Radno vrijeme</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Unesite svoje radno vrijeme za svaki dan u sedmici (evropski format 24h)
        </p>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const dayData = workingHours[day.value] || { is_closed: false };
          
          return (
            <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-32">
                <Label className="font-semibold">{day.label}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`closed-${day.value}`}
                  checked={dayData.is_closed}
                  onCheckedChange={(checked) => handleDayChange(day.value, 'is_closed', checked)}
                />
                <Label htmlFor={`closed-${day.value}`} className="text-sm cursor-pointer">
                  Ne radim
                </Label>
              </div>

              {!dayData.is_closed && (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={dayData.start_time || ''}
                    onChange={(e) => handleDayChange(day.value, 'start_time', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="time"
                    value={dayData.end_time || ''}
                    onChange={(e) => handleDayChange(day.value, 'end_time', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step4WorkingHours;
