import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const GASettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gaId, setGaId] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('google_analytics_id')
        .single();

      if (error) throw error;

      setGaId(data?.google_analytics_id || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Greška pri učitavanju postavki');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ google_analytics_id: gaId || null })
        .eq('id', (await supabase.from('site_settings').select('id').single()).data?.id);

      if (error) throw error;

      toast.success('Postavke sačuvane');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Greška pri čuvanju postavki');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Analytics</CardTitle>
        <CardDescription>
          Podesite Google Analytics tracking ID za praćenje posjeta sajtu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ga-id">Google Analytics ID</Label>
          <Input
            id="ga-id"
            placeholder="G-XXXXXXXXXX ili UA-XXXXXXXXX-X"
            value={gaId}
            onChange={(e) => setGaId(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Unesite vaš Google Analytics Measurement ID (npr. G-XXXXXXXXXX)
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Čuvam...
            </>
          ) : (
            'Sačuvaj'
          )}
        </Button>

        <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
          <p><strong>Kako dobiti Google Analytics ID:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Idite na <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics</a></li>
            <li>Kreirajte nalog ili se prijavite</li>
            <li>Dodajte novu Property</li>
            <li>Kopirajte Measurement ID (G-XXXXXXXXXX)</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
