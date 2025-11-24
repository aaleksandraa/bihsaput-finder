import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProfileMap from "@/components/ProfileMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Briefcase,
  Award,
  Linkedin,
  Facebook,
  Instagram,
  Building2,
  Calendar,
} from "lucide-react";
import { Loader2 } from "lucide-react";

const DAYS = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];

const Profile = () => {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [references, setReferences] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (slug) {
      fetchProfile();
    }
  }, [slug]);

  const fetchProfile = async () => {
    setLoading(true);

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select(`
        *,
        personal_city:cities!profiles_personal_city_id_fkey(name, postal_code),
        business_city:cities!profiles_business_city_id_fkey(name, postal_code)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('registration_completed', true)
      .single();

    if (error || !profileData) {
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Fetch services
    const { data: servicesData } = await supabase
      .from('profile_services')
      .select('service_id, service_categories(*)')
      .eq('profile_id', profileData.id);
    
    if (servicesData) {
      setServices(servicesData);
    }

    // Fetch working hours
    const { data: hoursData } = await supabase
      .from('working_hours')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('day_of_week');
    
    if (hoursData) {
      setWorkingHours(hoursData);
    }

    // Fetch references
    const { data: refsData } = await supabase
      .from('client_references')
      .select('*')
      .eq('profile_id', profileData.id);
    
    if (refsData) {
      setReferences(refsData);
    }

    // Fetch certificates
    const { data: certsData } = await supabase
      .from('certificates')
      .select('*')
      .eq('profile_id', profileData.id);
    
    if (certsData) {
      setCertificates(certsData);
    }

    // Fetch gallery
    const { data: galleryData } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('display_order');
    
    if (galleryData) {
      setGallery(galleryData);
    }

    setLoading(false);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Profil nije pronađen</h1>
          <Link to="/">
            <Button>Nazad na početnu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.company_name || `${profile.first_name} ${profile.last_name}`;

  // Group services by parent category
  const mainCategories = services
    .map(s => s.service_categories)
    .filter(cat => !cat.parent_id)
    .reduce((acc: any[], cat) => {
      if (!acc.find(c => c.id === cat.id)) acc.push(cat);
      return acc;
    }, []);

  const getSubcategories = (parentId: string) =>
    services
      .map(s => s.service_categories)
      .filter(cat => cat.parent_id === parentId);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      {/* Hero Section with Gallery */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Gallery Background */}
        {gallery.length > 0 && (
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-3 h-full">
              {gallery.slice(0, 6).map((image: any, idx) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <img
                    src={image.image_url}
                    alt=""
                    className="w-full h-full object-cover animate-fade-in"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="container relative py-12 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profile.profile_image_url ? (
                  <img 
                    src={profile.profile_image_url} 
                    alt={displayName}
                    className="h-32 w-32 md:h-40 md:w-40 rounded-2xl object-cover shadow-xl border-4 border-background animate-scale-in"
                  />
                ) : (
                  <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-xl animate-scale-in">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 space-y-4 animate-fade-in">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-2">{displayName}</h1>
                  {profile.short_description && (
                    <p className="text-lg md:text-xl text-muted-foreground">
                      {profile.short_description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {profile.works_online && (
                    <Badge variant="secondary" className="text-sm py-1.5 px-3">
                      💻 Online
                    </Badge>
                  )}
                  {profile.has_physical_office && (
                    <Badge variant="secondary" className="text-sm py-1.5 px-3">
                      🏢 Fizička kancelarija
                    </Badge>
                  )}
                  {profile.years_experience > 0 && (
                    <Badge variant="outline" className="text-sm py-1.5 px-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      {profile.years_experience} god. iskustva
                    </Badge>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {profile.email && (
                    <Button size="lg" className="bg-hero-gradient hover-scale">
                      <Mail className="h-4 w-4 mr-2" />
                      Kontaktirajte
                    </Button>
                  )}
                  {profile.phone && (
                    <Button size="lg" variant="outline" asChild className="hover-scale">
                      <a href={`tel:${profile.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Pozovite
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 animate-fade-in">
                {gallery.map((image: any) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover-scale shadow-lg"
                    onClick={() => window.open(image.image_url, '_blank')}
                  >
                    <img
                      src={image.image_url}
                      alt="Gallery"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* About */}
              {profile.long_description && (
                <Card className="animate-fade-in">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-primary" />
                      O meni
                    </h2>
                    <div className="prose prose-slate max-w-none">
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {profile.long_description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Services */}
              {services.length > 0 && (
                <Card className="animate-fade-in">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Briefcase className="h-6 w-6 text-primary" />
                      Usluge
                    </h2>
                    
                    <div className="space-y-4">
                      {mainCategories.map((mainCat: any) => {
                        const subs = getSubcategories(mainCat.id);
                        
                        return (
                          <div key={mainCat.id} className="border-l-4 border-primary pl-4 py-2">
                            <h3 className="font-semibold text-lg mb-2">{mainCat.name}</h3>
                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {subs.map((sub: any) => (
                                  <Badge key={sub.id} variant="secondary" className="text-sm">
                                    {sub.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              {(profile.latitude && profile.longitude) && (
                <Card className="animate-fade-in">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                      <MapPin className="h-6 w-6 text-primary" />
                      Lokacija
                    </h2>
                    
                    <ProfileMap
                      latitude={profile.latitude}
                      longitude={profile.longitude}
                      name={displayName}
                      googleMapsUrl={profile.google_maps_url}
                    />
                  </CardContent>
                </Card>
              )}

              {/* References */}
              {references.length > 0 && (
                <Card className="animate-fade-in">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                      <Award className="h-6 w-6 text-primary" />
                      Reference i klijenti
                    </h2>
                    
                    <div className="space-y-3">
                      {references.map((ref: any) => (
                        <div key={ref.id} className="p-4 bg-muted/50 rounded-lg hover-scale">
                          <h3 className="font-semibold mb-1">{ref.client_name}</h3>
                          {ref.description && (
                            <p className="text-sm text-muted-foreground">{ref.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="animate-fade-in sticky top-4">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-bold text-lg mb-4">Kontakt informacije</h3>
                  
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm truncate font-medium">{profile.email}</p>
                      </div>
                    </a>
                  )}
                  
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Telefon</p>
                        <p className="text-sm font-medium">{profile.phone}</p>
                      </div>
                    </a>
                  )}
                  
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Globe className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Web stranica</p>
                        <p className="text-sm truncate font-medium">Posjetite</p>
                      </div>
                    </a>
                  )}

                  {(profile.business_street || profile.business_city) && (
                    <div className="flex items-start gap-3 p-3 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Adresa</p>
                        <p className="text-sm font-medium">
                          {profile.business_street}
                          {profile.business_city && `, ${profile.business_city.name}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Social Media */}
                  {(profile.linkedin_url || profile.facebook_url || profile.instagram_url) && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-center gap-4">
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors hover-scale"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {profile.facebook_url && (
                          <a
                            href={profile.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors hover-scale"
                          >
                            <Facebook className="h-5 w-5" />
                          </a>
                        )}
                        {profile.instagram_url && (
                          <a
                            href={profile.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors hover-scale"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Working Hours */}
              {workingHours.length > 0 && (
                <Card className="animate-fade-in">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Radno vrijeme
                    </h3>
                    
                    <div className="space-y-2">
                      {workingHours.map((hour: any) => (
                        <div key={hour.id} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                          <span className="font-medium">{DAYS[hour.day_of_week]}</span>
                          <span className="text-muted-foreground">
                            {hour.is_closed ? 'Neradni dan' : `${hour.start_time} - ${hour.end_time}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
