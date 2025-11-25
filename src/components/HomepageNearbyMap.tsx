import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  business_type: string | null;
  slug: string;
  latitude: number;
  longitude: number;
}

const HomepageNearbyMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  // Fetch profiles with location data
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, company_name, business_type, slug, latitude, longitude')
        .eq('is_active', true)
        .eq('registration_completed', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (data) {
        setProfiles(data);
      }
    };

    fetchProfiles();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          setLocationError(true);
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !userLocation || profiles.length === 0) return;

    if (!mapInstanceRef.current) {
      // Create map centered on user location
      mapInstanceRef.current = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 10);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 20px;
              height: 20px;
              background: #3b82f6;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<strong>Vaša lokacija</strong>');
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each profile
    profiles.forEach((profile) => {
      if (!mapInstanceRef.current) return;

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, hsl(222.2 47.4% 11.2%) 0%, hsl(217.2 32.6% 17.5%) 100%);
              border-radius: 50% 50% 50% 0;
              transform: translateX(-50%) rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              border: 3px solid white;
            "></div>
            <div style="
              position: absolute;
              top: 6px;
              left: 50%;
              transform: translateX(-50%);
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
              z-index: 1;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const displayName = profile.business_type === 'company' && profile.company_name 
        ? profile.company_name 
        : `${profile.first_name} ${profile.last_name}`;

      const popupContent = `
        <div style="padding: 8px; font-family: system-ui;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
            ${displayName}
          </div>
          <a href="/profil/${profile.slug}" style="
            display: inline-block;
            padding: 4px 12px;
            background: hsl(222.2 47.4% 11.2%);
            color: white;
            border-radius: 4px;
            font-size: 12px;
            text-decoration: none;
            font-weight: 500;
          ">Pogledaj profil</a>
        </div>
      `;

      const marker = L.marker([profile.latitude, profile.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popupContent);

      markersRef.current.push(marker);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, profiles]);

  if (loading) {
    return (
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Učitavanje lokacije...</p>
          </div>
        </div>
      </section>
    );
  }

  if (locationError) {
    return (
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
              Mapa
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Profesionalci u vašoj blizini</h2>
          </div>
          <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
            <div className="max-w-md mx-auto space-y-4">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-xl font-semibold">Omogućite pristup lokaciji</p>
              <p className="text-muted-foreground">
                Da bismo vam prikazali profesionalce u vašoj blizini, potreban nam je pristup vašoj lokaciji.
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                <Navigation className="mr-2 h-4 w-4" />
                Pokušaj ponovo
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-24 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
            Mapa
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Profesionalci u vašoj blizini</h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            Plavi pin prikazuje vašu trenutnu lokaciju
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div 
            ref={mapRef} 
            className="w-full h-[500px] rounded-2xl shadow-large z-0"
            style={{ background: '#f0f0f0' }}
          />
          
          <div className="mt-8 text-center">
            <Link to="/mapa">
              <Button size="lg" variant="outline" className="font-semibold">
                <MapPin className="h-5 w-5 mr-2" />
                Pogledaj punu mapu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageNearbyMap;
