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

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-background to-muted/20">
        <div className="container px-4 py-6 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Layout */}
            <div className="sm:hidden">
              {/* Image with Name and Subtitle */}
              <div className="flex gap-3 mb-3">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {profile.profile_image_url ? (
                    <img 
                      src={profile.profile_image_url} 
                      alt={displayName}
                      className="h-20 w-20 rounded-lg object-cover shadow-lg border-2 border-border"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                  )}
                </div>
                
                {/* Name and Description */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h1 className="text-lg font-bold leading-tight mb-1">{displayName}</h1>
                  {profile.short_description && (
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                      {profile.short_description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* First Row: Badges and Social Media */}
              <div className="flex items-center justify-between gap-3 mb-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {profile.has_physical_office && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <Building2 className="h-3 w-3 mr-1" />
                      Kancelarija
                    </Badge>
                  )}
                  {profile.years_experience > 0 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <Award className="h-3 w-3 mr-1" />
                      {profile.years_experience} god.
                    </Badge>
                  )}
                  {profile.works_online && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <Globe className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  )}
                </div>
                
                {/* Social Media Icons */}
                {(profile.linkedin_url || profile.facebook_url || profile.instagram_url) && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {profile.facebook_url && (
                      <a
                        href={profile.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {profile.instagram_url && (
                      <a
                        href={profile.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {/* Second Row: Contact Buttons */}
              <div className="flex gap-2">
                {profile.email && (
                  <Button size="sm" className="flex-1" asChild>
                    <a href={`mailto:${profile.email}`}>
                      <Mail className="h-4 w-4 mr-1.5" />
                      Kontakt
                    </a>
                  </Button>
                )}
                {profile.phone && (
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={`tel:${profile.phone}`}>
                      <Phone className="h-4 w-4 mr-1.5" />
                      Pozovi
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profile.profile_image_url ? (
                  <img 
                    src={profile.profile_image_url} 
                    alt={displayName}
                    className="h-32 w-32 rounded-lg object-cover shadow-lg border-2 border-border"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-lg">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">{displayName}</h1>
                  {profile.short_description && (
                    <p className="text-base md:text-lg text-muted-foreground">
                      {profile.short_description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {profile.works_online && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1.5" />
                      Online
                    </Badge>
                  )}
                  {profile.has_physical_office && (
                    <Badge variant="secondary" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1.5" />
                      Fizička kancelarija
                    </Badge>
                  )}
                  {profile.years_experience > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Award className="h-3 w-3 mr-1.5" />
                      {profile.years_experience} god. iskustva
                    </Badge>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.email && (
                    <Button size="sm" asChild>
                      <a href={`mailto:${profile.email}`}>
                        <Mail className="h-4 w-4 mr-1.5" />
                        Kontakt
                      </a>
                    </Button>
                  )}
                  {profile.phone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${profile.phone}`}>
                        <Phone className="h-4 w-4 mr-1.5" />
                        Pozovi
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 py-8 md:py-12 max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* About */}
              {profile.long_description && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {profile.long_description}
                    </p>
                  </CardContent>
                </Card>
              )}
              {/* Contact Info Card */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Kontakt
                  </h2>
                  
                  <div className="space-y-3">
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{profile.email}</span>
                      </a>
                    )}
                    
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </a>
                    )}
                    
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">Web stranica</span>
                      </a>
                    )}

                    {(profile.business_street || profile.business_city) && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">
                          {profile.business_street}
                          {profile.business_city && `, ${profile.business_city.name}`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              {services.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Usluge
                    </h2>
                    
                    <div className="space-y-4">
                      {mainCategories.map((mainCat: any) => {
                        const subs = getSubcategories(mainCat.id);
                        
                        return (
                          <div key={mainCat.id}>
                            <h3 className="font-medium text-sm mb-2">{mainCat.name}</h3>
                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {subs.map((sub: any) => (
                                  <Badge key={sub.id} variant="secondary" className="text-xs font-normal">
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
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
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

              {/* Gallery */}
              {gallery.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Galerija</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {gallery.map((image: any) => (
                        <div
                          key={image.id}
                          className="aspect-square rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
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
                  </CardContent>
                </Card>
              )}

              {/* References */}
              {references.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-primary" />
                      Reference
                    </h2>
                    
                    <div className="space-y-3">
                      {references.map((ref: any) => (
                        <div key={ref.id} className="p-3 bg-muted/30 rounded-lg">
                          <h3 className="font-medium text-sm mb-1">{ref.client_name}</h3>
                          {ref.description && (
                            <p className="text-xs text-muted-foreground">{ref.description}</p>
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
              {/* Working Hours */}
              {workingHours.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      Radno vrijeme
                    </h2>
                    
                    <div className="space-y-2">
                      {workingHours.map((hour: any) => (
                        <div key={hour.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{DAYS[hour.day_of_week]}</span>
                          <span className="font-medium">
                            {hour.is_closed ? 'Zatvoreno' : `${hour.start_time} - ${hour.end_time}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Media */}
              {(profile.linkedin_url || profile.facebook_url || profile.instagram_url) && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Društvene mreže</h2>
                    <div className="flex gap-3">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {profile.facebook_url && (
                        <a
                          href={profile.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {profile.instagram_url && (
                        <a
                          href={profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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
