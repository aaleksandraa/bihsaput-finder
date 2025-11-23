import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
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

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapView = () => {
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, []);

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

  // Center map on BiH
  const center: [number, number] = [43.9159, 17.6791];

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
          <MapContainer
            center={center}
            zoom={8}
            className="w-full h-[700px] z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {profiles.map((profile) => (
              profile.latitude && profile.longitude && (
                <Marker
                  key={profile.id}
                  position={[parseFloat(profile.latitude), parseFloat(profile.longitude)]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-1">
                        {profile.company_name || `${profile.first_name} ${profile.last_name}`}
                      </h3>
                      {profile.short_description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {profile.short_description}
                        </p>
                      )}
                      <Link to={`/profil/${profile.slug}`}>
                        <Button size="sm" className="w-full">
                          Pogledaj profil
                        </Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Prikazano {profiles.length} profila na mapi
        </div>
      </div>
    </div>
  );
};

export default MapView;
