import urllib.request
import json
import sys

def get_translations():
    url = "https://api.quran.com/api/v4/resources/translations"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        langs = ['english', 'turkish', 'urdu', 'bengali', 'japanese', 'chinese', 'german', 'spanish']
        res = {}
        for t in data['translations']:
            ln = t['language_name'].lower()
            if ln in langs and ln not localized:
                if ln not in res:
                    res[ln] = []
                res[ln].append({"id": t['id'], "name": t['translated_name']['name']})
        for k, v in res.items():
            print(f"{k}: {v[0]}")
    except Exception as e:
        print(e)
        
get_translations()
