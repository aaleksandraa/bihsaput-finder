import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProfiles = (filters?: {
  search?: string;
  serviceId?: string;
  entityId?: string;
  cityId?: string;
}) => {
  return useQuery({
    queryKey: ["profiles", filters],
    queryFn: async () => {
      let query = supabase
        .from("public_profiles")
        .select(`
          id,
          first_name,
          last_name,
          company_name,
          short_description,
          profile_image_url,
          slug,
          latitude,
          longitude,
          business_city_id,
          email,
          phone,
          website
        `)
        .eq("is_active", true)
        .eq("registration_completed", true);

      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
        );
      }

      if (filters?.cityId && filters.cityId !== "all") {
        query = query.eq("business_city_id", filters.cityId);
      }

      if (filters?.serviceId) {
        const { data: profileServices } = await supabase
          .from("profile_services")
          .select("profile_id")
          .eq("service_id", filters.serviceId);

        if (profileServices) {
          const profileIds = profileServices.map((ps) => ps.profile_id);
          if (profileIds.length > 0) {
            query = query.in("id", profileIds);
          } else {
            return [];
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};

export const useProfile = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["profile", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug provided");

      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      return data;
    },
    enabled: !!slug,
  });
};

export const useProfileGallery = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["gallery", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("profile_id", profileId)
        .order("display_order", { ascending: true });

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useProfileServices = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["profile-services", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("profile_services")
        .select(`
          service_id,
          service_categories (
            id,
            name,
            parent_id
          )
        `)
        .eq("profile_id", profileId);

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useProfileReferences = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["references", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("client_references")
        .select("*")
        .eq("profile_id", profileId);

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useProfileCertificates = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["certificates", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("profile_id", profileId);

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useWorkingHours = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["working-hours", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("working_hours")
        .select("*")
        .eq("profile_id", profileId)
        .order("day_of_week", { ascending: true });

      return data || [];
    },
    enabled: !!profileId,
  });
};
