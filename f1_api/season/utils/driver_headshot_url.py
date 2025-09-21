import os
from dotenv import load_dotenv

load_dotenv(r'C:/Users/Marc/Documents/ITA/Sprint 8/f1_api/.env')

def get_driver_headshot_url(year,team,driver_id):
    base = os.environ.get("HEADSHOT_URL_BASE")
    path = f"/common/f1/{year}/{team}/{driver_id}/{year}{team}{driver_id}right.webp"
    final_url = f"{base}{path}"
    
    return final_url
