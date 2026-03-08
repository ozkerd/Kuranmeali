import urllib.request
import json
import ssl

def check_langs():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    url = "https://api.quran.com/api/v4/resources/translations"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, context=ctx)
        data = json.loads(resp.read().decode())
    except Exception as e:
        print("Error fetching translations:", e)
        return

    langs_dict = {}
    for t in data['translations']:
        ln = t['language_name'].lower()
        if ln not in langs_dict:
            langs_dict[ln] = t['id']

    test_langs = [
        'english', 'turkish', 'urdu', 'bengali', 'japanese', 'chinese', 'german', 'spanish', 
        'french', 'russian', 'indonesian', 'malay', 'hindi', 'farsi', 'kurdish', 'pashto', 'tamil'
    ]
    
    codes = {
        'english': 'en', 'turkish': 'tr', 'urdu': 'ur', 'bengali': 'bn',
        'japanese': 'ja', 'chinese': 'zh', 'german': 'de', 'spanish': 'es',
        'french': 'fr', 'russian': 'ru', 'indonesian': 'id', 'malay': 'ms',
        'hindi': 'hi', 'farsi': 'fa', 'kurdish': 'ku', 'pashto': 'ps', 'tamil': 'ta'
    }
    
    valid_langs = []
    
    for lang in test_langs:
        if lang not in langs_dict:
            continue
            
        trans_id = langs_dict[lang]
        iso = codes.get(lang)
        if not iso:
            continue
            
        test_url = f"https://api.quran.com/api/v4/verses/by_chapter/1?language={iso}&words=true&word_translation_language={iso}&translations={trans_id}&per_page=1"
        req = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            r = urllib.request.urlopen(req, context=ctx)
            d = json.loads(r.read().decode())
            verse = d['verses'][0]
            
            has_verse_trans = len(verse.get('translations', [])) > 0
            has_word_trans = False
            if verse.get('words'):
                wt = verse['words'][0].get('translation')
                if wt and wt.get('text') and wt.get('language_name') == lang:
                    has_word_trans = True
                    
            print(f"{lang} ({iso}): verse={has_verse_trans}, word={has_word_trans}")
            if has_verse_trans and has_word_trans:
                valid_langs.append((iso, lang, trans_id))
        except Exception as e:
            print(f"{lang} ({iso}): ERROR - {e}")

    print("VALID:", valid_langs)

check_langs()
