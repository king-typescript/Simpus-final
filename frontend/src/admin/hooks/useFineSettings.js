import { useEffect, useState } from "react";
import { LibrarySettingService } from "../../services/api";

export function useFineSettings() {
  const [finePerDay, setFinePerDay] = useState(1000);

  useEffect(() => {
    let mounted = true;
    const loadFineSettings = async () => {
      try {
        const res = await LibrarySettingService.get();
        if (mounted && res.data?.data?.fineRatePerDay) {
          const rate = Number(res.data.data.fineRatePerDay);
          if (!isNaN(rate) && rate > 0) {
            setFinePerDay(rate);
            return;
          }
        }
      } catch {
        // Fallback ke localStorage jika request gagal
      }

      try {
        const savedFine = localStorage.getItem("perpustakaan_fine_settings");
        if (savedFine && mounted) {
          const fineData = JSON.parse(savedFine);
          setFinePerDay(Number(fineData.finePerDay) || 1000);
        }
      } catch {
        if (mounted) setFinePerDay(1000);
      }
    };
    
    loadFineSettings();
    window.addEventListener("profileUpdated", loadFineSettings);
    
    return () => {
      mounted = false;
      window.removeEventListener("profileUpdated", loadFineSettings);
    };
  }, []);

  return finePerDay;
}
