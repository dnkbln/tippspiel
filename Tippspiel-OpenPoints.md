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

### US-09 Gruppenspiel im Backend tippen

### US-10 K.o.-Spiel im Backend tippen

### US-11 Tipp im Backend vor Anpfiff aendern

### US-12 Tippabgabe im Backend nach Anpfiff verhindern

### US-13 Kein Tipp bedeutet backendseitig kein Tipp

### US-49 Eigene Tipps im Backend abrufen

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

- Das Akzeptanzkriterium "Die berechneten Punkte fliessen in die Rangliste ein" ist erst mit `US-16` vollstaendig nachweisbar.
  Die Punkte werden bereits persistent am `Tip` gespeichert und koennen von der spaeteren Rangliste aggregiert werden.

### US-26 Punkte fuer K.o.-Spiele automatisch berechnen

- Das Akzeptanzkriterium "Die berechneten Punkte fliessen in die Rangliste ein" ist erst mit `US-16` vollstaendig nachweisbar.
  Die Punkte werden bereits persistent am `Tip` gespeichert und koennen von der spaeteren Rangliste aggregiert werden.

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

### US-48 Tipps im Frontend abgeben und aendern

- Vollstaendiger manueller Nachweis fuer K.o.-Tipps mit festgelegten echten Teams steht noch aus.
  K.o.-Spiele mit Platzhaltern werden korrekt als nicht tippbar angezeigt; die Tippabgabe inklusive Weiterkommer-Auswahl kann erst mit einem K.o.-Spiel geprueft werden, dessen Heim- und Auswaertsteam festgelegt sind.

### US-50 K.o.-Spielteilnehmer im Frontend festlegen

- Fuer die Team-Auswahl im Frontend fehlt noch eine klare Datenquelle fuer alle Teams einer Competition.
  `GET /competitions/:competitionId/games` liefert aktuell nur Teams aus den einzelnen Spielen; fuer Platzhalter-Spiele braucht die Oberflaeche entweder einen Teamlisten-Endpunkt oder eine bewusst erweiterte bestehende Response.

## Betrieb und technische Anforderungen

### US-27 Anwendung ohne Docker in WSL betreiben

- Produktiver Zielsystem-Nachweis fuer `scripts/prod-setup.sh` und `scripts/prod-deploy.sh` steht noch aus.
  Die Scripts sind vorhanden, aber noch nicht auf einem Ubuntu-22.04-/WSL-Zielsystem mit Caddy, PostgreSQL-Dienst und Intranet-Zugriff durchgespielt.
- Windows-Firewall-Regel oder WSL-Portweiterleitung muss je nach Zielrechner noch konkret festgelegt werden.
- Backup-Konzept fuer die PostgreSQL-Datenbank fehlt noch.

### US-28 Sichere Basis fuer spaetere Erweiterungen schaffen

## Offene Detailentscheidungen fuer spaetere Verfeinerung

- exakte Sortier- und Tie-Breaker-Regeln fuer Gruppentabellen
- globales Default-Punkteschema fuer Competitions ohne eigenes gespeichertes Schema
- finales JSON-Schema fuer Spielplan- und Ergebnisimport
