import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Globe, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileCardProps {
  profile: any;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold truncate">
              {profile.company_name || `${profile.first_name} ${profile.last_name}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile.business_type === 'company' ? 'Firma' : 'Samostalni knjigovođa'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {profile.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profile.short_description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.works_online && (
            <Badge variant="secondary">Online</Badge>
          )}
          {profile.has_physical_office && (
            <Badge variant="secondary">Fizička kancelarija</Badge>
          )}
          {profile.years_experience > 0 && (
            <Badge variant="outline">{profile.years_experience} god. iskustva</Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {profile.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{profile.email}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                Web stranica
              </a>
            </div>
          )}
        </div>

        <Link to={`/profil/${profile.slug}`}>
          <Button className="w-full" variant="outline">
            Pogledaj profil <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
