import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface ProfileMapProps {
  latitude: number;
  longitude: number;
  name: string;
  googleMapsUrl?: string;
}

const ProfileMap = ({ latitude, longitude, name, googleMapsUrl }: ProfileMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    // Initialize map only once
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

      // Create map
      mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 15);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add marker
      L.marker([latitude, longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(name);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, name]);

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Lokacija nije dostupna</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg z-0"
        style={{ background: '#f0f0f0' }}
      />

      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full"
        >
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Navigacija → Google Maps
          </button>
        </a>
      )}
    </div>
  );
};

export default ProfileMap;
