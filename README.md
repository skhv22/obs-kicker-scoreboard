# OBS Kicker Scoreboard – GitHub Pages + Firebase

## Dateien
- `display.html` → in OBS als Browser Source
- `control.html` → auf iPhone oder Laptop zum Steuern
- `firebase-config.js` → hier trägst du deine Firebase-Daten ein

## Setup

### 1) GitHub Pages hochladen
Den kompletten Ordner in ein GitHub-Repository hochladen und GitHub Pages aktivieren.

### 2) Firebase-Projekt erstellen
In Firebase:
- neues Projekt anlegen
- eine Web-App hinzufügen
- die Web-Konfiguration kopieren
- `firebase-config.js` ausfüllen

### 3) Realtime Database aktivieren
In Firebase Realtime Database anlegen.

### 4) Regeln setzen
Für ein kleines Schulturnier kannst du testweise diese Regeln setzen:

```json
{
  "rules": {
    "scoreboards": {
      "$room": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

Hinweis: Das ist einfach, aber nicht wirklich abgesichert. Nutze deshalb eine schwer erratbare Room-ID.

### 5) firebase-config.js ausfüllen
Beispiel:

```js
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "dein-projekt.firebaseapp.com",
  databaseURL: "https://dein-projekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dein-projekt",
  storageBucket: "dein-projekt.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

## Nutzung

### Display in OBS
In OBS als Browser Source einfügen:

```text
https://DEIN-NAME.github.io/DEIN-REPO/display.html?room=kicker-finale
```

### Steuerung am Handy
Im Browser öffnen:

```text
https://DEIN-NAME.github.io/DEIN-REPO/control.html?room=kicker-finale
```

Beide Seiten müssen dieselbe `room` haben.

## Tastenkürzel
- `A` = Tor links
- `L` = Tor rechts
- `Z` = -1 links
- `M` = -1 rechts
- `R` = Reset
