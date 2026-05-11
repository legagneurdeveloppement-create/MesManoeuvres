import urllib.request
import json
import ssl
import sys
import unicodedata

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)])

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

departments = {
    '10': 'Aube',
    '52': 'Haute-Marne',
    '70': 'Haute-Saône',
    '39': 'Jura'
}

for code, dpt_name in departments.items():
    query = f"""
    [out:json];
    area["name"="{dpt_name}"]["admin_level"="6"]->.searchArea;
    (
      node["amenity"="fire_station"](area.searchArea);
      way["amenity"="fire_station"](area.searchArea);
      relation["amenity"="fire_station"](area.searchArea);
    );
    out center;
    """

    req = urllib.request.Request(
        'https://overpass-api.de/api/interpreter', 
        data=query.encode('utf-8'), 
        headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}
    )

    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            
        names = []
        for element in data['elements']:
            tags = element.get('tags', {})
            name = tags.get('name', tags.get('short_name', ''))
            if name:
                name = name.replace("Centre de secours principal", "").replace("Centre de secours", "").replace("Centre d'Incendie et de Secours", "").replace("C.I.S.", "").replace("CIS", "").replace("CS", "").replace("CPI", "").strip(" de").strip(" d'").strip("- ").strip()
                if name:
                    names.append(remove_accents(name).upper())

        print(f"--- DPT {code} ({dpt_name}) : {len(set(names))} centres ---")
        for n in sorted(list(set(names))):
            print(n)
        print("\n")
    except Exception as e:
        print(f"Error for {code}: {e}", file=sys.stderr)
