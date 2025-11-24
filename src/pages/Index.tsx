import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import ProfileCard from "@/components/ProfileCard";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, TrendingUp, Briefcase, ChevronRight } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [heroGradient, setHeroGradient] = useState("");

  useEffect(() => {
    // Generate random gradient on mount
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Blue to purple
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink to red
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Light blue to cyan
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Green to turquoise
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Pink to yellow
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", // Cyan to deep purple
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Mint to pink
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", // Coral to light pink
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", // Peach gradient
      "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", // Green to blue
    ];
    
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    setHeroGradient(randomGradient);

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
    fetchMainCategories();
  }, []);

  const fetchProfiles = async () => {
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

    const { data, error } = await query;
    setLoading(false);

    if (!error && data) {
      setProfiles(data);
    }
  };

  const fetchMainCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .is('parent_id', null)
      .order('name')
      .limit(6);

    if (data) {
      setMainCategories(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Pronađite certificiranog knjigovođu u BiH"
        description="Najveća baza knjigovođa, računovođa i revizora u Bosni i Hercegovini. Pretražite po lokaciji, uslugama i dostupnosti. Brz i siguran kontakt sa profesionalcima."
        keywords="knjigovođa, računovođa, revizor, bosna i hercegovina, bih, računovodstvo, knjigovodstvene usluge"
        url="/"
      />
      <Header user={user} />
      
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden text-white py-24 md:py-32 pb-64" 
        style={{ background: heroGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border border-white/20">
              🇧🇦 Najveća baza knjigovođa u BiH
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Pronađite pouzdanog knjigovоđu u BiH
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              Online baza certificiranih knjigovođa, računovođa i revizora širom Bosne i Hercegovine
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-large" asChild>
                <a href="#search">
                  <Search className="mr-2 h-5 w-5" />
                  Započni pretragu
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm" asChild>
                <a href="#usluge">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Pregledaj usluge
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Search Section */}
      <section id="search" className="py-12 -mt-52 relative z-20">
        <div className="container max-w-5xl">
          <div className="bg-card rounded-3xl shadow-large p-8 md:p-10 border border-border/50 backdrop-blur-sm animate-slide-in-right">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="usluge" className="py-20 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
              Usluge
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Usluge knjigovođa</h2>
            <p className="text-lg md:text-xl text-muted-foreground font-light">
              Pronađite stručnjaka za vašu specifičnu potrebu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {mainCategories.map((category, index) => (
              <Link key={category.id} to={`/usluge/${category.id}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="space-y-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription className="line-clamp-2 text-base">
                        {category.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
                      Saznaj više
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/search">
              <Button variant="outline" size="lg" className="font-semibold">
                Pregledaj sve usluge
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <div className="text-center space-y-6 animate-fade-in group">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-soft group-hover:shadow-medium transition-all group-hover:scale-110 duration-300">
                <Search className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Brza pretraga</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Filtrirajte po lokaciji, uslugama i dostupnosti sa naprednim filterima
              </p>
            </div>
            
            <div className="text-center space-y-6 animate-fade-in group" style={{ animationDelay: '100ms' }}>
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mx-auto shadow-soft group-hover:shadow-medium transition-all group-hover:scale-110 duration-300">
                <MapPin className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Lokalna podrška</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Pronađite stručnjake u vašem gradu ili entitetu sa preciznim mapama
              </p>
            </div>
            
            <div className="text-center space-y-6 animate-fade-in group" style={{ animationDelay: '200ms' }}>
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center mx-auto shadow-soft group-hover:shadow-medium transition-all group-hover:scale-110 duration-300">
                <TrendingUp className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Provjereni profesionalci</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Svi profili su provjereni i verifikovani sa detaljnim informacijama
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-20 md:py-24">
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
              Profesionalci
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Preporučeni profili</h2>
            <p className="text-lg md:text-xl text-muted-foreground font-light">
              Pronađite odgovarajućeg knjigovоđu za vaše potrebe
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Učitavanje profila...</p>
            </div>
          ) : profiles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
              
              <div className="mt-12 flex gap-4 justify-center flex-wrap">
                <Link to="/search">
                  <Button size="lg" variant="default" className="font-semibold">
                    <Search className="h-5 w-5 mr-2" />
                    Pretraži sve profile
                  </Button>
                </Link>
                <Link to="/mapa">
                  <Button size="lg" variant="outline" className="font-semibold">
                    <MapPin className="h-5 w-5 mr-2" />
                    Prikaži na mapi
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-3xl border border-border/50">
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-xl font-semibold">Trenutno nema dostupnih profila</p>
                <p className="text-muted-foreground">
                  Budite prvi koji će se registrovati i proširiti svoju klijentelu!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-primary to-primary/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="container text-center space-y-8 relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
              Za profesionalce
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">Jeste li knjigovođa?</h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              Pridružite se našoj platformi i povećajte svoju vidljivost. Besplatna registracija za sve profesionalce!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-large font-semibold" onClick={() => window.location.href = '/auth?mode=register'}>
              Registrujte se besplatno
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-10 py-6 bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm font-semibold" asChild>
              <Link to="/search">
                Pregledaj profile
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
