import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import L from 'leaflet';
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { MapPin, List } from "lucide-react";
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const MapView = () => {
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Fix default icon
      const DefaultIcon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Center map on BiH
      mapInstanceRef.current = L.map(mapRef.current).setView([43.9159, 17.6791], 8);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when profiles change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    profiles.forEach((profile) => {
      if (profile.latitude && profile.longitude) {
        const marker = L.marker([parseFloat(profile.latitude), parseFloat(profile.longitude)])
          .addTo(mapInstanceRef.current!);

        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">
              ${profile.company_name || `${profile.first_name} ${profile.last_name}`}
            </h3>
            ${profile.short_description ? `
              <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
                ${profile.short_description}
              </p>
            ` : ''}
            <a href="/profil/${profile.slug}" style="
              display: inline-block;
              width: 100%;
              padding: 6px 12px;
              background: hsl(222.2 47.4% 11.2%);
              color: white;
              text-align: center;
              border-radius: 6px;
              text-decoration: none;
              font-size: 14px;
            ">
              Pogledaj profil
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      }
    });
  }, [profiles]);

  const fetchProfiles = async (filters?: any) => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .eq('registration_completed', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (filters?.searchTerm) {
      query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,company_name.ilike.%${filters.searchTerm}%`);
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

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mapa knjigovođa</h1>
            <p className="text-muted-foreground">
              Pronađite knjigovođe u vašoj blizini
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">
              <List className="h-4 w-4 mr-2" />
              Lista prikaz
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <SearchFilters onSearch={handleSearch} />
        </div>

        <div className="rounded-lg overflow-hidden shadow-large">
          <div 
            ref={mapRef} 
            className="w-full h-[700px] z-0"
            style={{ background: '#f0f0f0' }}
          />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Prikazano {profiles.length} profila na mapi
        </div>
      </div>
    </div>
  );
};

export default MapView;
