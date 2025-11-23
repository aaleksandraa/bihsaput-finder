import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import ProfileCard from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { MapPin, Search, TrendingUp } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async (filters?: any) => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select(`
        *,
        personal_city:cities!profiles_personal_city_id_fkey(name, entity_id),
        business_city:cities!profiles_business_city_id_fkey(name, entity_id),
        profile_services(service_id, service_categories(name))
      `)
      .eq('is_active', true)
      .eq('registration_completed', true)
      .limit(12);

    if (filters?.searchTerm) {
      query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,company_name.ilike.%${filters.searchTerm}%`);
    }
    
    if (filters?.entity && filters.entity !== 'all') {
      const { data: entityData } = await supabase
        .from('entities')
        .select('id')
        .eq('code', filters.entity)
        .single();
      
      if (entityData) {
        query = query.or(`personal_city.entity_id.eq.${entityData.id},business_city.entity_id.eq.${entityData.id}`);
      }
    }

    const { data, error } = await query;
    setLoading(false);

    if (!error && data) {
      setProfiles(data);
    }
  };

  const handleSearch = (filters: any) => {
    fetchProfiles(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient text-white py-20">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Pronađite pouzdanog knjigovоđu u BiH
            </h1>
            <p className="text-xl text-white/90">
              Online baza certificiranih knjigovođa, računovođa i revizora širom Bosne i Hercegovine
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
      </section>

      {/* Search Section */}
      <section className="py-12 -mt-8 relative z-20">
        <div className="container">
          <div className="bg-card rounded-2xl shadow-large p-8 animate-slide-in-right">
            <SearchFilters onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Brza pretraga</h3>
              <p className="text-muted-foreground">
                Filtrirajte po lokaciji, uslugama i dostupnosti
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-fade-in [animation-delay:100ms]">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Lokalna podrška</h3>
              <p className="text-muted-foreground">
                Pronađite stručnjake u vašem gradu ili entitetu
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-fade-in [animation-delay:200ms]">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Provjereni profesionalci</h3>
              <p className="text-muted-foreground">
                Svi profili su provjereni i verifikovani
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Preporučeni profili</h2>
            <p className="text-muted-foreground">
              Pronađite odgovarajućeg knjigovоđu za vaše potrebe
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            </div>
          ) : profiles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/mapa">
                  <Button variant="outline" size="lg">
                    <MapPin className="h-4 w-4 mr-2" />
                    Prikaži na mapi
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Trenutno nema dostupnih profila. Budite prvi koji će se registrovati!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold">Jeste li knjigovođa?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pridružite se našoj platformi i povećajte svoju vidljivost. Besplatna registracija!
          </p>
          <Button size="lg" className="bg-hero-gradient text-lg px-8" onClick={() => window.location.href = '/auth?mode=register'}>
            Registrujte se besplatno
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
