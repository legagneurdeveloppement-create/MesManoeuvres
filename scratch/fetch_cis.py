import urllib.request
import json

query = """
[out:json];
area["name"="Nièvre"]->.searchArea;
(
  node["amenity"="fire_station"](area.searchArea);
  way["amenity"="fire_station"](area.searchArea);
  relation["amenity"="fire_station"](area.searchArea);
);
out center;
"""

url = "https://overpass-api.de/api/interpreter"
req = urllib.request.Request(url, data=query.encode('utf-8'))
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    
names = []
for element in data['elements']:
    tags = element.get('tags', {})
    name = tags.get('name', tags.get('short_name', ''))
    if name:
        names.append(name)

print("Found", len(names), "fire stations")
for name in sorted(names):
    print(name)
