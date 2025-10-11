import os
import unicodedata

class DriversBusiness:
    @staticmethod
    def create_driver_id(full_name) -> str:
        full_name = unicodedata.normalize("NFKD", full_name).encode("ascii", "ignore").decode("utf-8")
        full_name = full_name.lower().strip()
        parts = full_name.split()
        if len(parts) < 2:
            raise ValueError("Error in create_driver_id, name and surname needed")
        first, last = parts[0], parts[-1]
        driver_id = first[:3] + last[:3] + "01"

        return driver_id

    @staticmethod
    def get_driver_headshot_url(year,team_name,driver_id):
        base = os.environ.get("HEADSHOT_URL_BASE")
        path = f"/common/f1/{year}/{team_name}/{driver_id}/{year}{team_name}{driver_id}right.webp"
        final_url = f"{base}{path}"
        
        return final_url