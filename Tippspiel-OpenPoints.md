# Tippspiel Open Points

Diese Datei sammelt offene Punkte getrennt nach User Story.

## Nutzerkonto und Zugriff

### US-01 Registrierung mit Einladungscode

- Frontend-Registrierungsmaske ist noch nicht umgesetzt.
  Es gibt aktuell noch keine Seite und kein Formular, ueber das ein Nutzer die Registrierung selbst ausloesen kann.
- Service-Test fuer den Prisma-`P2002`-Pfad fehlt noch.
  Damit waere der Parallelitaetsfall bei doppelter E-Mail auch testseitig abgesichert.
- Route-Test fuer den generischen `500`-Fallback fehlt noch.
  Damit waere geprueft, dass unerwartete Fehler ohne interne Details an den Client zurueckgegeben werden.

### US-02 Anmeldung mit E-Mail und Passwort

### US-03 Abmeldung

- Das Akzeptanzkriterium "geschuetzte Endpunkte sind nach Logout nicht mehr ohne erneute Anmeldung erreichbar" ist noch nicht vollstaendig nachweisbar.
  In der aktuellen Codebasis gibt es noch keinen Auth-Guard und keinen bestehenden geschuetzten Endpoint, ueber den dieses Verhalten getestet werden kann.

### US-04 Anzeigename aendern

### US-05 Passwort durch Admin zuruecksetzen

## Spielplan und Turnierdaten

### US-06 Spielplan per JSON importieren

- Echter DB-Integrationstest fuer Import und anschliessenden Spielabruf fehlt noch.
  Aktuell sind Import-Service, Admin-Route, Spielabruf-Service und Spielabruf-Route testnah mit Mocks abgesichert. Ein Test mit realer Testdatenbank sollte noch nachweisen, dass ein Spielplan importiert und danach ueber den Backend-Abruf fuer Spiele wieder ausgeliefert wird.

### US-07 Spielzeiten in Berlin anzeigen

- Frontend-Anzeige in `Europe/Berlin` ist noch nicht umgesetzt.
  Das Backend liefert Spielzeiten als UTC-ISO-Strings aus; die nutzerseitige Formatierung muss spaeter im Frontend explizit mit der Zeitzone `Europe/Berlin` erfolgen.

### US-08 Wettbewerb nach Start einfrieren

## Tipps abgeben und verwalten

### US-09 Gruppenspiel tippen

### US-10 K.o.-Spiel tippen

### US-11 Tipp vor Anpfiff aendern

### US-12 Tippabgabe nach Anpfiff verhindern

### US-13 Kein Tipp bedeutet kein Tipp

### US-14 Meine offenen Tipps schnell finden

## Sichtbarkeit und Transparenz

### US-15 Tipps anderer Nutzer erst ab Spielbeginn sehen

### US-16 Rangliste nach Punkten sehen

## Ergebnispflege

### US-17 Ergebnis manuell eintragen

### US-18 Ergebnisse per JSON importieren

### US-19 Externe Ergebnisquelle spaeter anbinden koennen

## Backend, API und Persistenz

### US-20 REST-Backend fuer das Tippspiel bereitstellen

### US-21 Relationales Datenmodell mit Migrationen verwalten

### US-22 Sichere Passwort- und Session-Verwaltung umsetzen

### US-23 Backend fuer spaetere OAuth-Anbindung vorbereiten

## Punkte und Auswertung

### US-24 Punkteschema vor Wettbewerbsstart festlegen

### US-25 Punkte fuer Gruppenspiele automatisch berechnen

### US-26 Punkte fuer K.o.-Spiele automatisch berechnen

## Frontend-Ergaenzung

### US-29 Frontend fuer Nutzerkonto und Zugriff

### US-30 Frontend-Grundgeruest fuer Navigation und geschuetzte Bereiche

- Der Frontend-Authzustand wird beim App-Start noch nicht aus einer bestehenden serverseitigen Session rekonstruiert.
  Aktuell arbeiten Navigation und Router-Guard gegen den lokalen `auth`-Store. Ohne vorheriges explizites Setzen des Stores behandelt das Frontend den Nutzer nach einem Reload zunaechst als Gast, auch wenn backendseitig bereits eine gueltige Session existiert.
- Das Akzeptanzkriterium zur zentralen Anzeige von Backend-Fehlermeldungen ist erst architektonisch vorbereitet, aber noch nicht mit echten API-Aufrufen nachgewiesen.
  `App.vue`, `app`-Store und `read-api-error-message.ts` sind vorhanden, aber die Verbindung zu realen Frontend-Requests folgt erst mit `US-31` und `US-32`.

### US-31 Registrierung im Frontend

### US-32 Anmeldung und Abmeldung im Frontend

### US-33 Importierte Spiele im Frontend anzeigen

### US-34 Spielzeiten im Frontend in Berliner Zeit anzeigen

### US-35 Admin-Import fuer Spielplan im Frontend

## Betrieb und technische Anforderungen

### US-27 Anwendung ohne Docker in WSL betreiben

### US-28 Sichere Basis fuer spaetere Erweiterungen schaffen

## Offene Detailentscheidungen fuer spaetere Verfeinerung

- konkrete Punktwerte fuer `exaktes Ergebnis`, `Differenz` und `Tendenz`
- exakte Bewertungslogik fuer K.o.-Spiele bei Unentschieden nach 120 Minuten
- finales JSON-Schema fuer Spielplan- und Ergebnisimport
