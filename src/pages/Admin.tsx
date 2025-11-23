import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Users, MapPin, Briefcase, Loader2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast.error("Nemate pristup admin panelu");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchData();
    setLoading(false);
  };

  const fetchData = async () => {
    // Fetch profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (profilesData) setProfiles(profilesData);

    // Fetch cities
    const { data: citiesData } = await supabase
      .from('cities')
      .select('*, entities(name)')
      .order('name');
    if (citiesData) setCities(citiesData);

    // Fetch service categories
    const { data: categoriesData } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    if (categoriesData) setServiceCategories(categoriesData);
  };

  const handleToggleUserActive = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error("Greška pri ažuriranju");
    } else {
      toast.success("Korisnik uspješno ažuriran");
      fetchData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Da li ste sigurni da želite obrisati ovog korisnika?")) return;

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      toast.error("Greška pri brisanju");
    } else {
      toast.success("Korisnik uspješno obrisan");
      fetchData();
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Upravljajte sadržajem i korisnicima platforme
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Korisnici
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Lokacije
            </TabsTrigger>
            <TabsTrigger value="services">
              <Briefcase className="h-4 w-4 mr-2" />
              Usluge
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Korisnici</CardTitle>
                <CardDescription>
                  Upravljajte korisnicima i njihovim profilima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {profile.company_name || `${profile.first_name} ${profile.last_name}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${profile.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                            {profile.is_active ? 'Aktivan' : 'Neaktivan'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${profile.registration_completed ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                            {profile.registration_completed ? 'Profil potpun' : 'Profil nepotpun'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={profile.is_active ? "destructive" : "default"}
                          onClick={() => handleToggleUserActive(profile.id, profile.is_active)}
                        >
                          {profile.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lokacije</CardTitle>
                <CardDescription>
                  Upravljajte gradovima i lokacijama
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  💡 Dodavanje i uređivanje gradova će biti dostupno uskoro. Trenutno možete vidjeti postojeće lokacije.
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cities.map((city) => (
                    <div key={city.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{city.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {city.postal_code} | {city.entities?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kategorije usluga</CardTitle>
                <CardDescription>
                  Upravljajte kategorijama i podkategorijama usluga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  💡 Dodavanje i uređivanje kategorija usluga će biti dostupno uskoro.
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {serviceCategories.map((category) => (
                    <div key={category.id} className="p-3 border rounded">
                      <p className="font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
