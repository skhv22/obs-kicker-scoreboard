# OBS Kicker Scoreboard – GitHub Pages + Firebase

## Dateien
- `display.html` → in OBS als Browser Source
- `clock.html` → in OBS als Browser Source für Uhr/Datum
- `control.html` → auf iPhone oder Laptop zum Steuern
- `firebase-config.js` → Platzhalter im Repo (keine echten Werte)
- `firebase-config.template.js` → wird in CI mit Secrets nach `firebase-config.js` gerendert
- `styles/base.css` → globale Basis-Styles (inkl. Inter Font)
- `screens/control/control.css` → Control-spezifische Styles
- `screens/display/display.css` → Display-spezifische Styles
- `screens/clock/clock.css` → Clock-spezifische Styles

## Setup

### 1) GitHub Pages hochladen
Den kompletten Ordner in ein GitHub-Repository hochladen und GitHub Pages aktivieren.

### 2) Firebase-Projekt erstellen
In Firebase:
- neues Projekt anlegen
- eine Web-App hinzufügen
- die Web-Konfiguration kopieren
- Werte als GitHub Repository Secrets setzen

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

### 5) GitHub Secrets setzen
Lege in GitHub unter `Settings -> Secrets and variables -> Actions` diese Secrets an:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

Die Workflow-Datei `.github/workflows/pages.yml` erzeugt daraus bei jedem Push automatisch `firebase-config.js`.

### 6) Lokal testen (optional)
Wenn du lokal testen willst, kannst du die Vorlage manuell in `firebase-config.js` kopieren und ausfüllen:

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

Empfohlene Größe (laut deinem Layout `stream preview.png`): `650 x 300`

### Steuerung am Handy
Im Browser öffnen:

```text
https://DEIN-NAME.github.io/DEIN-REPO/control.html?room=kicker-finale
```

### Uhr/Datum in OBS
In OBS als Browser Source einfügen:

```text
https://DEIN-NAME.github.io/DEIN-REPO/clock.html?room=kicker-finale
```

Empfohlene Größe für den Platzhalter neben dem Titel: `636 x 140`
Optional kannst du Zeitzone/Locale setzen, z. B.:

```text
https://DEIN-NAME.github.io/DEIN-REPO/clock.html?room=kicker-finale&tz=Europe/Berlin&locale=de-DE
```

Beide Seiten müssen dieselbe `room` haben.

## Tastenkürzel
- `A` = Tor links
- `L` = Tor rechts
- `Z` = -1 links
- `M` = -1 rechts
- `R` = Reset
