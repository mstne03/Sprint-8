import unicodedata

def create_driver_id(full_name):
    full_name = unicodedata.normalize("NFKD", full_name).encode("ascii", "ignore").decode("utf-8")
    full_name = full_name.lower().strip()
    parts = full_name.split()
    if len(parts) < 2:
        raise ValueError("Error in create_driver_id, name and surname needed")
    first, last = parts[0], parts[-1]
    driver_id = first[:3] + last[:3] + "01"

    return driver_id
