import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = {
    '10': 'https://www.annuaire-sdis.fr/sdis-10-aube.html',
    '52': 'https://www.annuaire-sdis.fr/sdis-52-haute-marne.html',
    '70': 'https://www.annuaire-sdis.fr/sdis-70-haute-saone.html',
    '39': 'https://www.annuaire-sdis.fr/sdis-39-jura.html'
}

for dpt, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # The CIS names are usually in <li> or <td> or in specific div classes on annuaire-sdis.fr
            # Let's extract all text that looks like "CIS [Name]" or "Centre de Secours [Name]"
            # Or we can look for links to CIS pages
            matches = re.findall(r'<a href="cis-[^>]+>([^<]+)</a>', html)
            if not matches:
                matches = re.findall(r'CIS ([A-Z \-]+)', html)
            
            names = []
            for name in matches:
                name = name.replace("CIS", "").replace("CS", "").replace("CPI", "").strip()
                if name:
                    names.append(name.upper())
            print(f"--- DPT {dpt} ---")
            print(", ".join(sorted(list(set(names)))))
    except Exception as e:
        print(f"Error for {dpt}: {e}")

