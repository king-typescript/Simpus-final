import { useEffect, useState } from "react";

export function useProfileName(fallback = "Pustakawan") {
  const [profileName, setProfileName] = useState(() => {
    const savedProfile = localStorage.getItem("perpustakaan_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        return profile.name || fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  });

  useEffect(() => {
    const updateProfile = () => {
      const savedProfile = localStorage.getItem("perpustakaan_profile");
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          setProfileName(profile.name || fallback);
        } catch {
          setProfileName(fallback);
        }
      }
    };

    window.addEventListener("profileUpdated", updateProfile);
    return () => window.removeEventListener("profileUpdated", updateProfile);
  }, [fallback]);

  return profileName;
}
