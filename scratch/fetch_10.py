import requests
import json
import unicodedata
import re

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

query = """
[out:json];
area["ref"="10"]["admin_level"="6"]->.searchArea;
(
  node["amenity"="fire_station"](area.searchArea);
  way["amenity"="fire_station"](area.searchArea);
  relation["amenity"="fire_station"](area.searchArea);
);
out center;
"""

try:
    response = requests.post(
        'https://overpass-api.de/api/interpreter', 
        data=query.encode('utf-8'), 
        headers={'User-Agent': 'MesManoeuvresBot/1.0'}
    )
    data = response.json()
        
    names = []
    for element in data['elements']:
        tags = element.get('tags', {})
        name = tags.get('name', tags.get('short_name', ''))
        if name:
            name = re.sub(r'^(Centre de secours principal|Centre de secours|Centre d\'Incendie et de Secours|Centre d\'incendie et de secours|C\.I\.S\.|CIS|CS|CPI|Sapeurs pompiers de|SAPEURS POMPIERS DE|Sapeurs Pompiers)\s*', '', name, flags=re.IGNORECASE)
            name = re.sub(r'^d[\'\s]', '', name, flags=re.IGNORECASE)
            name = re.sub(r'^de\s', '', name, flags=re.IGNORECASE)
            name = name.strip(" -")
            if name:
                names.append(remove_accents(name).upper())

    print(f"--- DPT 10 (Aube) : {len(set(names))} centres ---")
    for n in sorted(list(set(names))):
        print(f'"{n}"', end=", ")
    print("\n")
except Exception as e:
    print(f"Error: {e}")
