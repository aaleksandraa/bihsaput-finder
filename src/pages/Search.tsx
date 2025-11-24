import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import ProfileCard from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft } from "lucide-react";

const Search = () => {
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    const filters = {
      searchTerm: searchParams.get('q') || '',
      entity: searchParams.get('entity') || '',
      services: searchParams.getAll('service'),
    };
    fetchProfiles(filters);
  }, [searchParams]);

  const fetchProfiles = async (filters: any) => {
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
      .eq('registration_completed', true);

    if (filters?.searchTerm) {
      query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,company_name.ilike.%${filters.searchTerm}%`);
    }
    
    if (filters?.entity && filters.entity !== 'all' && filters.entity !== '') {
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

    if (!error && data) {
      let filteredProfiles = data;

      // Filter by services if selected
      if (filters?.services && filters.services.length > 0) {
        filteredProfiles = data.filter((profile: any) => {
          const profileServiceIds = profile.profile_services?.map((ps: any) => ps.service_id) || [];
          return filters.services.some((serviceId: string) => profileServiceIds.includes(serviceId));
        });
      }

      setProfiles(filteredProfiles);
    }

    setLoading(false);
  };

  const handleSearch = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.set('q', filters.searchTerm);
    if (filters.entity) params.set('entity', filters.entity);
    filters.services?.forEach((service: string) => params.append('service', service));
    
    window.history.pushState({}, '', `/search?${params.toString()}`);
    fetchProfiles(filters);
  };

  const hasActiveFilters = searchParams.get('q') || searchParams.get('entity') || searchParams.has('service');

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      {/* Search Section */}
      <section className="py-10 bg-muted/30">
        <div className="container max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" />
            Nazad na početnu
          </Link>
          
          <div className="bg-card rounded-2xl shadow-lg p-6 md:p-10 border border-border/50">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">Pretraga knjigovođa</h1>
            <SearchFilters onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16">
        <div className="container max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">
              {hasActiveFilters ? 'Rezultati pretrage' : 'Svi profili'}
            </h2>
            <p className="text-base text-muted-foreground font-medium">
              {loading ? 'Pretraga u toku...' : `Pronađeno ${profiles.length} profil${profiles.length !== 1 ? 'a' : ''}`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            </div>
          ) : profiles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/mapa">
                  <Button variant="outline" size="lg" className="font-semibold">
                    <MapPin className="h-5 w-5 mr-2" />
                    Prikaži na mapi
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-border/50">
              <p className="text-xl font-semibold mb-2">Nema pronađenih rezultata</p>
              <p className="text-muted-foreground mb-8 text-base">
                Pokušajte promijeniti filtere pretrage
              </p>
              <Link to="/">
                <Button variant="outline" size="lg" className="font-semibold">
                  Nazad na početnu
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Search;
