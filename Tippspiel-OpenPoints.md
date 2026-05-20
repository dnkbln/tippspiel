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

### US-37 Initialen Admin per Bootstrap-Token anlegen

- Sicherer Provisionierungsprozess fuer den initialen Bootstrap-Token-Hash fehlt noch.
  Der Setup-Endpunkt erwartet einen gespeicherten Token-Hash in `BootstrapSetup.tokenHash`, aber es gibt noch keinen dokumentierten oder implementierten Betriebsweg, der diesen Datensatz erzeugt, ohne den Klartext-Token in Git, Container-Images oder dauerhafte Logs zu schreiben.

## Spielplan und Turnierdaten

### US-06 Spielplan per JSON importieren

- Echter DB-Integrationstest fuer Import und anschliessenden Spielabruf fehlt noch.
  Aktuell sind Import-Service, Admin-Route, Spielabruf-Service und Spielabruf-Route testnah mit Mocks abgesichert. Ein Test mit realer Testdatenbank sollte noch nachweisen, dass ein Spielplan importiert und danach ueber den Backend-Abruf fuer Spiele wieder ausgeliefert wird.

### US-07 Spielzeiten in Berlin anzeigen

### US-08 Wettbewerb nach Start einfrieren

### US-38 K.o.-Spielteilnehmer nach Turnierverlauf festlegen

- Abgeschlossene Spiele koennen noch nicht separat vom Spielbeginn blockiert werden.
  Das Backend verhindert aktuell Aenderungen ab `startsAt`, aber ein eigener Ergebnis- oder Spielstatus existiert noch nicht.
- Das Akzeptanzkriterium "Ein K.o.-Spiel ist fuer Nutzer erst dann tippbar, wenn beide Spielteilnehmer als echte Teams feststehen" ist backendseitig noch nicht vollstaendig nachweisbar.
  Die Tippabgabe ist in den spaeteren Tipp-Stories noch nicht umgesetzt.

### US-39 Verfuegbare Wettbewerbe im Backend abrufen

### US-40 Competition im Backend umbenennen und loeschen

### US-42 Gruppen und Gruppenspieltage im Backend importieren und ausliefern

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

### US-43 Gruppentabelle im Backend berechnen und ausliefern

- Exakte Sortier- und Tie-Breaker-Regeln fuer Gruppentabellen sind noch fachlich festzulegen.
  Bis dahin kann eine erste Backend-Implementierung nur eine einfache stabile Sortierung, z. B. nach Punkten, Tordifferenz, erzielten Toren und Teamname, nachweisen.

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

- Spaeter entscheiden, ob es ein globales Default-Punkteschema gibt, das fuer Competitions ohne eigenes gespeichertes Punkteschema wirksam ist.
  Bis dahin ist eine Competition ohne gespeichertes Punkteschema erlaubt, aber Punkte koennen fuer diese Competition noch nicht berechnet werden.

### US-25 Punkte fuer Gruppenspiele automatisch berechnen

- Technische Strategie fuer die Neuberechnung bei Ergebnis-Aenderungen festlegen.
  Fachlich muessen Ergebnis-Aenderungen die Punkte der betroffenen Tipps aktualisieren; offen ist nur, ob das synchron beim Speichern, ueber einen separaten Service-Schritt oder durch Berechnung beim Abruf erfolgt.

### US-26 Punkte fuer K.o.-Spiele automatisch berechnen

- Technische Strategie fuer die Neuberechnung bei Ergebnis-Aenderungen analog zu `US-25` festlegen.

## Frontend-Ergaenzung

### US-29 Frontend fuer Nutzerkonto und Zugriff

### US-30 Frontend-Grundgeruest fuer Navigation und geschuetzte Bereiche

- Der Frontend-Authzustand wird beim App-Start noch nicht aus einer bestehenden serverseitigen Session rekonstruiert.
  Aktuell arbeiten Navigation und Router-Guard gegen den lokalen `auth`-Store. Ohne vorheriges explizites Setzen des Stores behandelt das Frontend den Nutzer nach einem Reload zunaechst als Gast, auch wenn backendseitig bereits eine gueltige Session existiert.
- Das Akzeptanzkriterium zur zentralen Anzeige von Backend-Fehlermeldungen ist erst architektonisch vorbereitet, aber noch nicht mit echten API-Aufrufen nachgewiesen.
  `App.vue`, `app`-Store und `read-api-error-message.ts` sind vorhanden, aber die Verbindung zu realen Frontend-Requests folgt erst mit `US-31` und `US-32`.

### US-31 Registrierung im Frontend

### US-32 Anmeldung und Abmeldung im Frontend

### US-33 Wettbewerb auswaehlen und importierte Spiele im Frontend anzeigen

### US-34 Spielzeiten im Frontend in Berliner Zeit anzeigen

### US-35 Admin-Import fuer Spielplan im Frontend

### US-41 Competition-Verwaltung im Frontend

### US-47 Punkteschema im Frontend verwalten

- Die Story haengt vom Backend-Endpunkt aus `US-24` ab.
  Die Frontend-Umsetzung kann erst vollstaendig nachgewiesen werden, wenn das Punkteschema im Backend persistent verwaltet werden kann.

## Betrieb und technische Anforderungen

### US-27 Anwendung ohne Docker in WSL betreiben

### US-28 Sichere Basis fuer spaetere Erweiterungen schaffen

## Offene Detailentscheidungen fuer spaetere Verfeinerung

- exakte Sortier- und Tie-Breaker-Regeln fuer Gruppentabellen
- globales Default-Punkteschema fuer Competitions ohne eigenes gespeichertes Schema
- finales JSON-Schema fuer Spielplan- und Ergebnisimport
