import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setLoading(false);

    if (error && error.code !== 'PGRST116') {
      toast.error("Greška pri učitavanju profila");
    } else {
      setProfile(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              Dobrodošli, {profile?.first_name || 'Korisniče'}!
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Moj profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <div className="space-y-2">
                  <p><strong>Ime:</strong> {profile.first_name} {profile.last_name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  {profile.phone && <p><strong>Telefon:</strong> {profile.phone}</p>}
                  
                  {!profile.registration_completed && (
                    <div className="mt-4 p-4 bg-accent rounded-lg">
                      <p className="text-sm mb-2">Vaš profil nije potpun. Dovršite registraciju da biste postali vidljivi u pretragama.</p>
                      <Button size="sm" className="bg-hero-gradient" onClick={() => navigate("/registracija")}>
                        Dovrši profil
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Nemate profil. Kreirajte ga sada!</p>
                  <Button className="bg-hero-gradient" onClick={() => navigate("/registracija")}>
                    Kreiraj profil
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
