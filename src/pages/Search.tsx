import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import ProfileCard from "@/components/ProfileCard";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Search = () => {
  const [user, setUser] = useState<any>(null);
  const [searchParams] = useSearchParams();

  const filters = {
    searchTerm: searchParams.get('q') || '',
    entity: searchParams.get('entity') || '',
    city: searchParams.get('city') || '',
    services: searchParams.getAll('service'),
    onlyAvailable: searchParams.get('available') === 'true',
    onlyVerified: searchParams.get('verified') === 'true',
    nearMe: searchParams.get('nearMe') === 'true',
    userLat: parseFloat(searchParams.get('userLat') || '0'),
    userLng: parseFloat(searchParams.get('userLng') || '0'),
  };

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['search-profiles', filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          company_name,
          business_type,
          business_city_id,
          short_description,
          profile_image_url,
          slug,
          email,
          phone,
          website,
          years_experience,
          works_online,
          has_physical_office,
          latitude,
          longitude,
          accepting_new_clients,
          is_license_verified
        `)
        .eq('is_active', true)
        .eq('registration_completed', true);

      if (filters?.onlyAvailable) {
        query = query.eq('accepting_new_clients', true);
      }

      if (filters?.onlyVerified) {
        query = query.eq('is_license_verified', true);
      }

      if (filters?.searchTerm) {
        query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,company_name.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters?.entity && filters.entity !== 'all' && filters.entity !== '') {
        const { data: entityData } = await supabase
          .from('entities')
          .select('id')
          .eq('code', filters.entity as any)
          .single();
        
        if (entityData) {
          const { data: cities } = await supabase
            .from('cities')
            .select('id')
            .eq('entity_id', entityData.id);
          
          if (cities && cities.length > 0) {
            const cityIds = cities.map(c => c.id);
            query = query.in('business_city_id', cityIds);
          }
        }
      }

      if (filters?.city && filters.city !== 'all' && filters.city !== '') {
        query = query.eq('business_city_id', filters.city);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredProfiles = data || [];

      // Filter by services if selected
      if (filters?.services && filters.services.length > 0) {
        const { data: profileServices } = await supabase
          .from('profile_services')
          .select('profile_id')
          .in('service_id', filters.services);
        
        if (profileServices) {
          const profileIds = profileServices.map(ps => ps.profile_id);
          filteredProfiles = filteredProfiles.filter(profile => profileIds.includes(profile.id));
        }
      }

      // Sort by distance if nearMe is enabled
      if (filters?.nearMe && filters?.userLat && filters?.userLng) {
        filteredProfiles = filteredProfiles
          .filter((profile: any) => profile.latitude && profile.longitude)
          .map((profile: any) => {
            const distance = calculateDistance(
              filters.userLat,
              filters.userLng,
              profile.latitude,
              profile.longitude
            );
            return { ...profile, distance };
          })
          .sort((a: any, b: any) => a.distance - b.distance);
      }

      return filteredProfiles;
    },
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = (newFilters: any) => {
    const params = new URLSearchParams();
    if (newFilters.searchTerm) params.set('q', newFilters.searchTerm);
    if (newFilters.entity && newFilters.entity !== 'all') params.set('entity', newFilters.entity);
    if (newFilters.city && newFilters.city !== 'all') params.set('city', newFilters.city);
    newFilters.services?.forEach((service: string) => params.append('service', service));
    if (newFilters.onlyAvailable) params.set('available', 'true');
    if (newFilters.nearMe) {
      params.set('nearMe', 'true');
      params.set('userLat', newFilters.userLat.toString());
      params.set('userLng', newFilters.userLng.toString());
    }
    
    window.history.pushState({}, '', `/search?${params.toString()}`);
    window.location.search = params.toString();
  };

  const hasActiveFilters = searchParams.get('q') || searchParams.get('entity') || searchParams.has('service');
  
  const searchTerm = searchParams.get('q') || '';
  const seoTitle = searchTerm ? `Pretraga: ${searchTerm}` : 'Pretraga knjigovođa';
  const seoDescription = `Pronađite certificiranog knjigovođu u Bosni i Hercegovini. ${profiles.length} rezultata pretrage. Filtrirajte po lokaciji, uslugama i dostupnosti.`;

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords="pretraga knjigovođa, računovođa bih, računovodstvene usluge, pretraga"
        url={`/search?${searchParams.toString()}`}
      />
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
              {isLoading ? 'Pretraga u toku...' : `Pronađeno ${profiles.length} profil${profiles.length !== 1 ? 'a' : ''}`}
            </p>
          </div>

          {isLoading ? (
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
