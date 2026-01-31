from urllib.request import Request, urlopen
from urllib.parse import urlencode
import json

base_url = 'https://moddedminecraftservers.com/api/v2/07809AA4-E857-44B4-A154-0CC6686EF33D/server/60779/votes'
params = {
    'username': 'xNickDE',
    'claimed': 'true'
}
full_url = f"{base_url}?{urlencode(params)}"
request = Request(full_url)

try:
    response_body = urlopen(request).read()
    # KORREKTUR: Fehlende Klammer hinzugefügt
    response_text = response_body.decode('utf-8')
    print("Raw Response:", response_text)
    
    # Parse JSON
    data = json.loads(response_text)
    print("Parsed JSON:", data)
    
    # Prüfe Vote-Status
    if data['data']:
        vote = data['data'][0]  # Neuester Vote
        print(f"Vote ID: {vote['id']}")
        print(f"Username: {vote['username']}")
        print(f"Timestamp: {vote['timestamp']}")
        print(f"Claimed: {vote['claimed']}")
        
        if vote['claimed'] == 0:
            print("Vote kann geclaimed werden!")
        else:
            print("Vote bereits geclaimed")
    else:
        print("Kein Vote gefunden")
        
except Exception as e:
    print(f"Fehler: {e}")

# Halte Konsole offen
input("Drücke Enter zum Beenden...")