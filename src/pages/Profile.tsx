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

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {profile.profile_image_url ? (
              <img 
                src={profile.profile_image_url} 
                alt={displayName}
                className="h-32 w-32 rounded-full object-cover flex-shrink-0 border-4 border-primary/20"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
              {profile.short_description && (
                <p className="text-xl text-muted-foreground mb-4">
                  {profile.short_description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.works_online && <Badge variant="secondary">Online</Badge>}
                {profile.has_physical_office && <Badge variant="secondary">Fizička kancelarija</Badge>}
                {profile.years_experience > 0 && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {profile.years_experience} god. iskustva
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-hero-gradient">
                  <Mail className="h-4 w-4 mr-2" />
                  Kontaktirajte
                </Button>
                {(profile.latitude && profile.longitude) && (
                  <Button size="lg" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Pogledaj na mapi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Osnovni podaci
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                          {profile.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {profile.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefon</p>
                        <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
                          {profile.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Web stranica</p>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {(profile.business_street || profile.business_city) && (
                  <div className="flex items-start gap-3 pt-4 border-t">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Poslovna adresa</p>
                      <p>
                        {profile.business_street}
                        {profile.business_city && `, ${profile.business_city.name}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            {services.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Usluge
                  </h2>
                  
                  <div className="space-y-4">
                    {(() => {
                      // Group services by parent category
                      const grouped = services.reduce((acc: any, service: any) => {
                        const category = service.service_categories;
                        const parentId = category.parent_id || 'main';
                        if (!acc[parentId]) {
                          acc[parentId] = [];
                        }
                        acc[parentId].push(category);
                        return acc;
                      }, {});

                      // Render main categories with their subcategories
                      return Object.entries(grouped).map(([parentId, items]: [string, any]) => {
                        const mainCategories = items.filter((cat: any) => !cat.parent_id);
                        const subCategories = items.filter((cat: any) => cat.parent_id);
                        
                        if (mainCategories.length > 0) {
                          return mainCategories.map((mainCat: any) => {
                            const subs = services
                              .map((s: any) => s.service_categories)
                              .filter((cat: any) => cat.parent_id === mainCat.id);
                            
                            return (
                              <div key={mainCat.id} className="border-l-4 border-primary pl-4">
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
                          });
                        } else if (subCategories.length > 0) {
                          return (
                            <div key={parentId} className="flex flex-wrap gap-2">
                              {subCategories.map((cat: any) => (
                                <Badge key={cat.id} variant="secondary" className="text-sm">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Long Description */}
            {profile.long_description && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">O meni</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="whitespace-pre-wrap">{profile.long_description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Galerija</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((image: any) => (
                      <img
                        key={image.id}
                        src={image.image_url}
                        alt="Gallery"
                        className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(image.image_url, '_blank')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map */}
            {(profile.latitude && profile.longitude) && (
              <Card>
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
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                    <Award className="h-6 w-6 text-primary" />
                    Reference i klijenti
                  </h2>
                  
                  <div className="space-y-4">
                    {references.map((ref: any) => (
                      <div key={ref.id} className="p-4 bg-muted/50 rounded-lg">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Working Hours */}
            {workingHours.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    Radno vrijeme
                  </h3>
                  
                  <div className="space-y-2">
                    {workingHours.map((hour: any) => (
                      <div key={hour.id} className="flex justify-between text-sm">
                        <span className="font-medium">{DAYS[hour.day_of_week]}</span>
                        <span className="text-muted-foreground">
                          {hour.is_closed
                            ? 'Ne radim'
                            : `${hour.start_time?.slice(0, 5)} - ${hour.end_time?.slice(0, 5)}`
                          }
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
                  <h3 className="text-lg font-bold mb-4">Društvene mreže</h3>
                  
                  <div className="flex gap-3">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      >
                        <Linkedin className="h-5 w-5 text-primary" />
                      </a>
                    )}
                    {profile.facebook_url && (
                      <a
                        href={profile.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      >
                        <Facebook className="h-5 w-5 text-primary" />
                      </a>
                    )}
                    {profile.instagram_url && (
                      <a
                        href={profile.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      >
                        <Instagram className="h-5 w-5 text-primary" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Organizations */}
            {profile.professional_organizations && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-primary" />
                    Članstvo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.professional_organizations}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
