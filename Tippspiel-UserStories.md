# Tippspiel MVP User Stories

Diese User Stories beschreiben den fachlichen Umfang des MVP. Sie sind so formuliert, dass sie spaeter in Tickets oder Epics ueberfuehrt werden koennen.

## Umsetzungszuschnitt fuer die ersten Stories

Fuer die initiale Umsetzung werden `US-01` bis `US-05` ausschliesslich im Backend realisiert. Die dazugehoerige Oberflaeche wird in der separaten Frontend-Story `US-29` beschrieben.

## Nutzerkonto und Zugriff

### US-01 Registrierung mit Einladungscode im Backend

Als neuer Nutzer moechte ich mich mit E-Mail, Anzeigename, Passwort und Einladungscode registrieren koennen, damit ich am Tippspiel teilnehmen kann.

Akzeptanzkriterien:

- Das Backend stellt einen Registrierungs-Endpunkt fuer E-Mail, Anzeigename, Passwort und Einladungscode bereit.
- Eine Registrierung ist nur mit gueltigem gemeinsamem Einladungscode moeglich.
- Die E-Mail-Adresse muss eindeutig sein.
- Der Anzeigename ist frei waehlbar.
- Das Passwort wird nicht im Klartext gespeichert, sondern mit einem etablierten Verfahren wie `Argon2id` gehasht.
- Eine erfolgreiche Registrierung legt den Nutzer persistent an.

### US-02 Anmeldung mit E-Mail und Passwort im Backend

Als registrierter Nutzer moechte ich mich mit meiner E-Mail-Adresse und meinem Passwort anmelden koennen, damit ich meine Tipps verwalten kann.

Akzeptanzkriterien:

- Das Backend stellt einen Login-Endpunkt mit E-Mail und Passwort bereit.
- Bei falschen Zugangsdaten wird der Zugriff verweigert.
- Nach erfolgreicher Anmeldung wird eine gueltige serverseitige Sitzung erstellt.
- Die Antwort setzt die Sitzung ueber ein `httpOnly` Cookie.

### US-03 Abmeldung im Backend

Als angemeldeter Nutzer moechte ich mich abmelden koennen, damit niemand nach mir auf mein Konto zugreifen kann.

Akzeptanzkriterien:

- Das Backend stellt einen Logout-Endpunkt zum aktiven Beenden der aktuellen Sitzung bereit.
- Nach der Abmeldung sind geschuetzte Endpunkte nicht mehr ohne erneute Anmeldung erreichbar.
- Die serverseitige Sitzung ist nach der Abmeldung ungueltig.

### US-04 Anzeigename im Backend aendern

Als Nutzer moechte ich meinen Anzeigenamen nach der Registrierung aendern koennen, damit mein oeffentlich sichtbarer Name aktuell bleibt.

Akzeptanzkriterien:

- Das Backend stellt einen authentifizierten Endpunkt zum Aendern des Anzeigenamens bereit.
- Die Aenderung wird persistent gespeichert und bei nachfolgenden Abfragen ausgeliefert.
- Die E-Mail-Adresse bleibt in oeffentlichen Nutzerdaten fuer andere Nutzer unsichtbar.

### US-05 Passwort durch Admin im Backend zuruecksetzen

Als Admin moechte ich das Passwort eines Nutzers zuruecksetzen koennen, damit ich bei verlorenen Zugangsdaten helfen kann.

Akzeptanzkriterien:

- Das Backend stellt einen nur fuer Admins verfuegbaren Endpunkt fuer Passwort-Reset oder Passwort-Neuvergabe bereit.
- Der Nutzer kann sich danach mit dem neuen Passwort anmelden.
- Die Funktion ist nur fuer Admins verfuegbar.

### US-37 Initialen Admin per Bootstrap-Token anlegen

Als Betreiber moechte ich beim erstmaligen System-Setup einen initialen Admin ueber einen einmaligen Bootstrap-Token anlegen koennen, damit Admin-Funktionen sicher aktiviert werden koennen, ohne dass normale Nutzer Admin-Rechte vergeben duerfen.

Akzeptanzkriterien:

- Das System kann in einem Zustand ohne vorhandenen Admin starten.
- Fuer diesen Initialzustand wird ein einmaliger Bootstrap-Token erzeugt oder ueber einen sicheren Deployment-Prozess bereitgestellt.
- Der Bootstrap-Token wird nicht dauerhaft im Klartext gespeichert.
- Falls der Token serverseitig persistiert wird, wird nur ein Hash gespeichert.
- Der Token darf nicht in Git-Repositories, Container-Images oder dauerhaft gueltigen Logs landen.
- Das Backend stellt einen Setup-Endpunkt zum Anlegen des ersten Admins bereit, z. B. `POST /setup/initial-admin`.
- Der Setup-Endpunkt akzeptiert den Bootstrap-Token nur ueber einen expliziten Authorization-Header, z. B. `Authorization: Bootstrap <one-time-token>`.
- Der Setup-Endpunkt ist nur nutzbar, solange noch kein initialer Admin angelegt wurde und das Bootstrap-Setup nicht abgeschlossen ist.
- Bei gueltigem Bootstrap-Token kann genau ein Admin mit mindestens E-Mail-Adresse und Passwort angelegt werden.
- Der angelegte Nutzer erhaelt die Rolle `ADMIN`.
- Nach erfolgreicher Admin-Anlage wird das Bootstrap-Setup dauerhaft als abgeschlossen markiert.
- Nach erfolgreicher Admin-Anlage wird der gespeicherte Bootstrap-Token-Hash entfernt oder unbrauchbar gemacht.
- Nach erfolgreicher Admin-Anlage lehnt der Setup-Endpunkt weitere Aufrufe ab.
- Selbstregistrierung erzeugt weiterhin ausschliesslich normale Nutzer mit Rolle `USER`.
- Ungueltige, fehlende oder bereits verwendete Bootstrap-Token werden mit einer generischen Fehlermeldung abgelehnt.

## Spielplan und Turnierdaten

### US-06 Spielplan per JSON importieren

Als Admin moechte ich einen Spielplan per JSON importieren koennen, damit das Turnier nicht manuell angelegt werden muss.

Akzeptanzkriterien:

- Der Import enthaelt mindestens Wettbewerb, Teams, Runden, Spiele und Anstosszeiten.
- Ungueltige Dateien werden mit einer nachvollziehbaren Fehlermeldung abgewiesen.
- Importierte Spiele stehen den Nutzern anschliessend fuer Tipps zur Verfuegung.

### US-07 Spielzeiten in Berlin anzeigen

Als Nutzer moechte ich alle Spielzeiten in Berliner Zeit sehen, damit ich weiss, bis wann ich tippen muss.

Akzeptanzkriterien:

- Spielzeiten werden intern konsistent gespeichert.
- Spielzeiten werden im Backend in `UTC` persistiert.
- Im Frontend werden alle Spielzeiten in `Europe/Berlin` angezeigt.
- Zeitangaben aus dem Import werden korrekt in die Anzeigezeit ueberfuehrt.

### US-08 Wettbewerb nach Start einfrieren

Als Admin moechte ich nach Wettbewerbsstart keine Struktur mehr aendern koennen, damit Regeln und Spielplan fuer alle stabil bleiben.

Akzeptanzkriterien:

- Nach Wettbewerbsstart koennen Spielplan, Teams und Punkteschema nicht mehr geaendert werden.
- Nach Wettbewerbsstart duerfen nur noch Ergebnisse gepflegt werden.

### US-38 K.o.-Spielteilnehmer nach Turnierverlauf festlegen

Als Admin moechte ich Platzhalter in K.o.-Spielen durch die tatsaechlich qualifizierten Teams ersetzen koennen, damit der Spielplan nach der Gruppenphase und nach jeder K.o.-Runde dem realen Turnierverlauf entspricht.

Akzeptanzkriterien:

- Der importierte Spielplan darf K.o.-Spiele mit Platzhaltern wie `Sieger Gruppe A`, `Zweiter Gruppe B`, `Bester Gruppendritter (...)`, `Sieger Spiel 74` oder `Verlierer Spiel 101` enthalten.
- Ein Admin kann fuer ein noch nicht begonnenes K.o.-Spiel die Platzhalter fuer Heimteam und Auswaertsteam durch echte Teams des Wettbewerbs ersetzen.
- Das Ersetzen von Platzhaltern gilt auch nach Wettbewerbsstart nicht als verbotene Strukturaenderung im Sinne von `US-08`.
- Bereits begonnene oder abgeschlossene Spiele koennen auf diesem Weg nicht mehr geaendert werden.
- Ein K.o.-Spiel ist fuer Nutzer erst dann tippbar, wenn beide Spielteilnehmer als echte Teams feststehen.
- Die Anzeige des Spielplans zeigt vor der Festlegung die Platzhalter und nach der Festlegung die echten Teams.

### US-39 Verfuegbare Wettbewerbe im Backend abrufen

Als angemeldeter Nutzer moechte ich alle verfuegbaren Wettbewerbe abrufen koennen, damit ich einen Wettbewerb auswaehlen und anschliessend dessen Spiele anzeigen kann.

Akzeptanzkriterien:

- Das Backend stellt einen geschuetzten Endpunkt zum Abrufen der verfuegbaren Wettbewerbe bereit, z. B. `GET /competitions`.
- Der Endpunkt ist nur fuer angemeldete Nutzer erreichbar.
- Pro Wettbewerb werden mindestens `id`, `name` und `slug` ausgeliefert.
- Die Antwort enthaelt keine unnoetigen Detaildaten wie Teams, Runden oder Spiele.
- Die Wettbewerbe werden in einer stabilen Reihenfolge ausgeliefert, z. B. nach `createdAt` oder `name`.
- Wenn noch keine Wettbewerbe vorhanden sind, liefert der Endpunkt eine leere Liste.
- Die ausgelieferte `id` kann vom Frontend fuer den bestehenden Spielabruf `GET /competitions/:competitionId/games` verwendet werden.

### US-40 Competition im Backend umbenennen und loeschen

Als Admin moechte ich den Namen einer importierten Competition nachtraeglich aendern und eine falsch importierte Competition loeschen koennen, damit Importfehler korrigierbar bleiben.

Akzeptanzkriterien:

- Das Backend stellt einen nur fuer Admins verfuegbaren Endpunkt zum Aendern des Competition-Namens bereit, z. B. `PATCH /admin/competitions/:competitionId`.
- Der neue Name muss eine nicht-leere Zeichenkette sein und wird getrimmt gespeichert.
- Die `id` und der `slug` der Competition bleiben bei einer Namensaenderung unveraendert.
- Nach der Aenderung liefert `GET /competitions` den neuen Namen aus.
- Das Backend stellt einen nur fuer Admins verfuegbaren Endpunkt zum Loeschen einer Competition bereit, z. B. `DELETE /admin/competitions/:competitionId`.
- Beim Loeschen werden die zur Competition gehoerenden importierten Teams, Runden und Spiele konsistent entfernt.
- Eine geloeschte Competition erscheint nicht mehr in `GET /competitions`.
- Der Abruf von Spielen fuer eine geloeschte oder unbekannte Competition liefert eine nachvollziehbare Fehlermeldung.
- Das Loeschen einer Competition ist nur erlaubt, solange noch kein Spiel der Competition begonnen hat.
- Normale Nutzer duerfen weder Competition-Namen aendern noch Competitions loeschen.

## Tipps abgeben und verwalten

### US-09 Gruppenspiel tippen

Als Nutzer moechte ich fuer ein Gruppenspiel ein Ergebnis tippen koennen, damit mein Tipp gewertet werden kann.

Akzeptanzkriterien:

- Der Nutzer kann Tore fuer beide Teams eingeben.
- Fuer Gruppenspiele wird kein weiterkommendes Team abgefragt.
- Ein gespeicherter Tipp ist dem richtigen Spiel und Nutzer zugeordnet.

### US-10 K.o.-Spiel tippen

Als Nutzer moechte ich fuer ein K.o.-Spiel ein Ergebnis tippen koennen, damit auch Spiele mit Verlaengerung und Elfmeterschiessen korrekt abgebildet werden.

Akzeptanzkriterien:

- Der Nutzer tippt das Ergebnis nach regulaerer Wertung inklusive Verlaengerung.
- Nur wenn dieses Ergebnis unentschieden ist, muss zusaetzlich das weiterkommende Team angegeben werden.
- Bei nicht unentschiedenem Ergebnis wird kein weiterkommendes Team abgefragt.

### US-11 Tipp vor Anpfiff aendern

Als Nutzer moechte ich meinen Tipp bis zum Spielbeginn aendern koennen, damit ich auf neue Informationen reagieren kann.

Akzeptanzkriterien:

- Ein bestehender Tipp kann vor dem Anpfiff aktualisiert werden.
- Massgeblich ist die in Berlin angezeigte Anstosszeit des Spiels.
- Nach der Aenderung gilt nur die letzte gespeicherte Version.

### US-12 Tippabgabe nach Anpfiff verhindern

Als System moechte ich Tippabgabe und Tippaenderung nach Spielbeginn blockieren, damit alle Nutzer unter denselben Bedingungen spielen.

Akzeptanzkriterien:

- Ab dem Anpfiff koennen keine neuen Tipps mehr gespeichert werden.
- Ab dem Anpfiff koennen bestehende Tipps nicht mehr geaendert werden.
- Der Nutzer erhaelt eine klare Rueckmeldung, wenn die Frist abgelaufen ist.

### US-13 Kein Tipp bedeutet kein Tipp

Als Nutzer moechte ich, dass ein fehlender Tipp nicht als `0:0` oder anderer Standardwert behandelt wird, damit ich fuer nicht abgegebene Tipps keine ungewollte Wertung erhalte.

Akzeptanzkriterien:

- Nicht abgegebene Tipps werden als fehlend gespeichert oder interpretiert.
- Fehlende Tipps erhalten keine Punkte.
- Das System legt keinen automatischen Default-Tipp an.

### US-14 Meine offenen Tipps schnell finden

Als Nutzer moechte ich anstehende Spiele nach Kategorien wie "naechster Tag" und "naechste Runde" sehen, damit ich offene Tipps schnell erfassen kann.

Akzeptanzkriterien:

- Das Frontend bietet mindestens die Sichten "naechster Tag" und "naechste Runde".
- In diesen Sichten sind noch nicht begonnene Spiele gut erkennbar.
- Der Nutzer kann aus diesen Sichten direkt zur Tippabgabe gelangen.

## Sichtbarkeit und Transparenz

### US-15 Tipps anderer Nutzer erst ab Spielbeginn sehen

Als Nutzer moechte ich Tipps anderer Nutzer erst ab Spielbeginn sehen koennen, damit niemand vorab beeinflusst wird.

Akzeptanzkriterien:

- Vor Anpfiff sind fremde Tipps nicht sichtbar.
- Ab Spielbeginn werden fremde Tipps fuer dieses Spiel sichtbar.
- Die Regel gilt fuer Gruppen- und K.o.-Spiele gleichermassen.

### US-16 Rangliste nach Punkten sehen

Als Nutzer moechte ich eine Rangliste nach Gesamtpunkten sehen, damit ich den aktuellen Stand des Wettbewerbs verfolgen kann.

Akzeptanzkriterien:

- Die Rangliste zeigt mindestens Anzeigename und Gesamtpunkte.
- Die Sortierung erfolgt nach Gesamtpunkten absteigend.
- E-Mail-Adressen werden nicht angezeigt.

## Ergebnispflege

### US-17 Ergebnis manuell eintragen

Als Admin moechte ich Spielergebnisse manuell pflegen koennen, damit das Tippspiel auch ohne externe Datenquelle betrieben werden kann.

Akzeptanzkriterien:

- Der Admin kann fuer jedes Spiel ein Ergebnis erfassen.
- Bei K.o.-Spielen kann zusaetzlich ein weiterkommendes Team gesetzt werden, falls das Ergebnis unentschieden ist.
- Nach dem Speichern wird das Spiel als ausgewertet oder auswertbar markiert.

### US-18 Ergebnisse per JSON importieren

Als Admin moechte ich Ergebnisse per JSON importieren koennen, damit die manuelle Pflege vereinfacht wird.

Akzeptanzkriterien:

- Ergebnisse koennen fuer bestehende Spiele per JSON eingespielt werden.
- Der Import aktualisiert nur Ergebnisdaten, nicht Spielplan oder Regeln.
- Fehlerhafte Importdaten werden nachvollziehbar gemeldet.

### US-19 Externe Ergebnisquelle spaeter anbinden koennen

Als Betreiber moechte ich das Backend spaeter an eine externe REST-API anbinden koennen, damit Ergebnisse kuenftig automatisiert uebernommen werden koennen.

Akzeptanzkriterien:

- Die Architektur trennt Ergebnisquelle und fachliche Auswertung.
- Manuelle Pflege und Import bleiben trotz spaeterer API-Anbindung moeglich.
- OAuth oder externe APIs muessen fuer das MVP noch nicht implementiert sein.

## Backend, API und Persistenz

### US-20 REST-Backend fuer das Tippspiel bereitstellen

Als Betreiber moechte ich ein schlankes REST-Backend haben, damit Frontend, Admin-Funktionen und spaetere externe Clients ueber klare HTTP-Schnittstellen arbeiten koennen.

Akzeptanzkriterien:

- Das Backend wird mit `TypeScript` und `Fastify` umgesetzt.
- Fachliche Funktionen werden ueber nachvollziehbare REST-Endpunkte bereitgestellt.
- Frontend und Backend sind logisch getrennt.

### US-21 Relationales Datenmodell mit Migrationen verwalten

Als Entwickler moechte ich ein versioniertes Datenbankschema haben, damit Aenderungen am Datenmodell kontrolliert und reproduzierbar ausgerollt werden koennen.

Akzeptanzkriterien:

- Das relationale Datenmodell wird in `PostgreSQL` gespeichert.
- Schema und Migrationen werden mit `Prisma` verwaltet.
- Das Datenmodell deckt mindestens Nutzer, Einladungscode, Wettbewerb, Team, Runde, Spiel, Tipp, Ergebnis und Punkte ab.

### US-22 Sichere Passwort- und Session-Verwaltung umsetzen

Als Betreiber moechte ich sichere Passwort- und Session-Verwaltung im Backend haben, damit das System im Intranet keine triviale Schwachstelle darstellt.

Akzeptanzkriterien:

- Passwoerter werden mit `Argon2id` oder gleichwertig sicher gehasht.
- Sitzungen werden serverseitig verwaltet.
- Session-Cookies sind mindestens `httpOnly` und fuer den Einsatzzweck passend konfiguriert.

### US-23 Backend fuer spaetere OAuth-Anbindung vorbereiten

Als Betreiber moechte ich die Authentifizierung spaeter um OAuth erweitern koennen, damit neben E-Mail und Passwort spaeter weitere Login-Verfahren moeglich sind.

Akzeptanzkriterien:

- Die Authentifizierungslogik ist von fachlichen Nutzerfunktionen getrennt.
- Lokale Anmeldung mit E-Mail und Passwort bleibt der MVP-Standard.
- Eine spaetere OAuth-Integration erfordert keine komplette Neustrukturierung des Nutzer- oder Sessionmodells.

## Punkte und Auswertung

### US-24 Punkteschema vor Wettbewerbsstart festlegen

Als Admin moechte ich das Punkteschema vor Wettbewerbsstart festlegen koennen, damit die Wertungsregeln fuer alle klar und stabil sind.

Akzeptanzkriterien:

- Fuer `exaktes Ergebnis`, `Tordifferenz` und `Tendenz` koennen Punktwerte gesetzt werden.
- Das Schema gilt fuer den gesamten Wettbewerb.
- Nach Wettbewerbsstart ist das Schema nicht mehr aenderbar.

## Frontend-Ergaenzung

### US-29 Frontend fuer Nutzerkonto und Zugriff

Als Nutzer oder Admin moechte ich eine Weboberflaeche fuer Registrierung, Anmeldung, Abmeldung, Profilpflege und Admin-Passwort-Reset haben, damit ich die Backend-Funktionen aus `US-01` bis `US-05` ohne direkte API-Nutzung verwenden kann.

Akzeptanzkriterien:

- Das Frontend bietet Formulare fuer Registrierung und Anmeldung auf Basis der Backend-Endpunkte aus `US-01` und `US-02`.
- Angemeldete Nutzer koennen ihren Anzeigenamen aendern und sich aktiv abmelden.
- Admins koennen einen Passwort-Reset oder eine Passwort-Neuvergabe fuer Nutzer ueber die Oberflaeche ausloesen, sofern das Backend dies bereitstellt.
- Erfolgs- und Fehlermeldungen aus dem Backend werden im Frontend nachvollziehbar angezeigt.
- Nicht angemeldete Nutzer sehen keine geschuetzten Profil- oder Admin-Bereiche.

Die breite Frontend-Story `US-29` kann fuer die erste Umsetzung in kleinere Stories mit direktem Bezug zu den bereits vorhandenen Backend-Endpunkten geschnitten werden:

### US-30 Frontend-Grundgeruest fuer Navigation und geschuetzte Bereiche

Als Nutzer moechte ich im Frontend klare Bereiche fuer oeffentliche Seiten, geschuetzte Nutzerseiten und Admin-Funktionen haben, damit ich mich in der Anwendung orientieren und nur fuer mich erlaubte Funktionen sehen kann.

Akzeptanzkriterien:

- Das Frontend bietet mindestens Routen oder Ansichten fuer Startseite, Registrierung, Anmeldung, Spielliste und Admin-Import.
- Nicht angemeldete Nutzer koennen Registrierungs- und Anmeldeseite aufrufen.
- Geschuetzte Nutzerbereiche sind ohne gueltigen Login im Frontend nicht regulaer erreichbar.
- Admin-Bereiche sind fuer normale Nutzer im Frontend nicht sichtbar oder nicht erreichbar.
- Fehlermeldungen aus Backend-Aufrufen koennen zentral und nachvollziehbar angezeigt werden.

### US-31 Registrierung im Frontend

Als neuer Nutzer moechte ich mich ueber ein Webformular mit E-Mail, Anzeigename, Passwort und Einladungscode registrieren koennen, damit ich ohne direkte API-Nutzung ein Konto anlegen kann.

Akzeptanzkriterien:

- Das Frontend bietet ein Formular fuer E-Mail, Anzeigename, Passwort und Einladungscode.
- Das Formular nutzt den Backend-Endpunkt aus `US-01`.
- Eine erfolgreiche Registrierung wird fuer den Nutzer klar bestaetigt.
- Validierungs- und Fachfehler aus dem Backend werden im Frontend nachvollziehbar angezeigt.
- Die Registrierung ist ohne technische Hilfsmittel wie `curl` oder Postman moeglich.

### US-32 Anmeldung und Abmeldung im Frontend

Als registrierter Nutzer moechte ich mich ueber das Frontend anmelden und aktiv wieder abmelden koennen, damit ich geschuetzte Funktionen sicher nutzen kann.

Akzeptanzkriterien:

- Das Frontend bietet ein Login-Formular fuer E-Mail und Passwort.
- Das Formular nutzt den Backend-Endpunkt aus `US-02`.
- Nach erfolgreicher Anmeldung wechselt das Frontend in einen angemeldeten Zustand und zeigt geschuetzte Nutzerbereiche an.
- Das Frontend bietet eine sichtbare Moeglichkeit zur aktiven Abmeldung ueber den Backend-Endpunkt aus `US-03`.
- Nach der Abmeldung behandelt das Frontend den Nutzer wieder als nicht angemeldet und zeigt geschuetzte Bereiche nicht mehr an.

### US-33 Wettbewerb auswaehlen und importierte Spiele im Frontend anzeigen

Als angemeldeter Nutzer moechte ich im Frontend einen verfuegbaren Wettbewerb auswaehlen und dessen importierte Spiele sehen, damit ich die passenden Partien spaeter fuer meine Tipps vor Augen habe.

Akzeptanzkriterien:

- Das Frontend ruft die verfuegbaren Wettbewerbe ueber den geschuetzten Backend-Endpunkt aus `US-39` ab.
- Der Nutzer kann einen der verfuegbaren Wettbewerbe auswaehlen.
- Nach Auswahl eines Wettbewerbs ruft das Frontend dessen Spielliste ueber `GET /competitions/:competitionId/games` ab.
- Das Frontend verwendet keine fest verdrahtete Demo-Competition-ID.
- Pro Spiel werden mindestens Runde, Heimteam, Auswaertsteam und Anstosszeit angezeigt.
- Die Spiele werden in aufsteigender Reihenfolge nach Anstoss dargestellt.
- Falls noch keine Wettbewerbe vorhanden sind, zeigt das Frontend einen klaren Leerzustand.
- Falls noch keine Spiele vorhanden sind, zeigt das Frontend einen klaren Leerzustand.
- Falls der Wettbewerbs- oder Spielabruf mit `401` antwortet, behandelt das Frontend den Nutzer als nicht angemeldet.

### US-34 Spielzeiten im Frontend in Berliner Zeit anzeigen

Als Nutzer moechte ich die Anstosszeiten der Spiele des ausgewaehlten Wettbewerbs im Frontend in `Europe/Berlin` sehen, damit ich weiss, bis wann ich tippen muss.

Akzeptanzkriterien:

- Zeitangaben aus dem Backend werden im Frontend mit der Zeitzone `Europe/Berlin` formatiert.
- Die Anzeige verwendet nicht den rohen UTC-ISO-String aus der API.
- Sommer- und Winterzeit werden bei der Darstellung korrekt beruecksichtigt.
- Die Formatierung wird fuer alle angezeigten Spiele konsistent angewendet.
- Die Frontend-Darstellung erfuellt damit die Anzeigeanforderung aus `US-07`.

### US-35 Admin-Import fuer Spielplan im Frontend

Als Admin moechte ich einen Spielplan als JSON ueber das Frontend importieren koennen, damit ich das Turnier ohne direkte API-Nutzung anlegen kann.

Akzeptanzkriterien:

- Das Frontend bietet einen nur fuer Admins sichtbaren Bereich fuer den Spielplanimport.
- Der Importbereich erlaubt mindestens das Einfuegen eines JSON-Payloads fuer Wettbewerb, Teams, Runden und Spiele.
- Das Frontend nutzt den Admin-Endpunkt aus `US-06`.
- Eine erfolgreiche Verarbeitung wird im Frontend klar bestaetigt.
- Validierungs- und Berechtigungsfehler aus dem Backend werden fuer den Admin nachvollziehbar angezeigt.

### US-41 Competition-Verwaltung im Frontend

Als Admin moechte ich im Frontend den Namen einer importierten Competition aendern und eine falsch importierte Competition loeschen koennen, damit ich diese Verwaltungsaufgaben ohne direkte API-Nutzung erledigen kann.

Akzeptanzkriterien:

- Das Frontend zeigt Admins in der Competition-Auswahl oder in einem Admin-Bereich Verwaltungsaktionen fuer Competitions an.
- Admins koennen den Namen einer Competition ueber ein Formular oder einen Inline-Dialog aendern.
- Das Frontend nutzt dafuer den Backend-Endpunkt aus `US-40`.
- Nach erfolgreicher Namensaenderung wird der neue Name in der Competition-Auswahl angezeigt.
- Admins koennen eine Competition loeschen.
- Vor dem Loeschen zeigt das Frontend eine klare Bestaetigung, weil die Aktion nicht rueckgaengig gemacht werden kann.
- Nach erfolgreichem Loeschen verschwindet die Competition aus der Auswahl.
- Wenn die aktuell ausgewaehlte Competition geloescht wurde, navigiert das Frontend in einen stabilen Zustand, z. B. zur allgemeinen Competition-Uebersicht.
- Validierungs-, Berechtigungs- und Fachfehler aus dem Backend werden nachvollziehbar angezeigt.
- Normale Nutzer sehen keine Verwaltungsaktionen fuer Umbenennen oder Loeschen.

### US-25 Punkte fuer Gruppenspiele automatisch berechnen

Als Nutzer moechte ich, dass Punkte fuer Gruppenspiele automatisch aus meinem Tipp und dem echten Ergebnis berechnet werden, damit die Rangliste ohne manuelle Nacharbeit aktuell ist.

Akzeptanzkriterien:

- Exaktes Ergebnis, Tordifferenz und Tendenz werden gemaess Regelwerk geprueft.
- Pro Tipp wird die passende Punktzahl eindeutig bestimmt.
- Die berechneten Punkte fliessen in die Rangliste ein.

### US-26 Punkte fuer K.o.-Spiele automatisch berechnen

Als Nutzer moechte ich, dass Punkte fuer K.o.-Spiele nach den speziellen Regeln der K.o.-Phase berechnet werden, damit Unentschieden nach 120 Minuten und Weiterkommer korrekt bewertet werden.

Akzeptanzkriterien:

- Bewertet wird das Ergebnis nach regulaerer Wertung inklusive Verlaengerung.
- Falls das Ergebnis unentschieden ist, wird zusaetzlich das weiterkommende Team beruecksichtigt.
- Die genaue Bewertungsregel fuer `exakt`, `Differenz` und `Tendenz` wird im Fachkonzept fest definiert.

## Betrieb und technische Anforderungen

### US-27 Anwendung ohne Docker in WSL betreiben

Als Betreiber moechte ich das System ohne Docker in einer WSL-Umgebung starten und deployen koennen, damit der Betrieb einfach bleibt.

Akzeptanzkriterien:

- Frontend, Backend und Datenbank lassen sich lokal ohne Docker entwickeln.
- Die benoetigten Werkzeuge sind klar dokumentiert.
- Ein Setup mit `devbox` ist moeglich oder vorgesehen.
- Die API kann als normaler `Node.js` Prozess betrieben werden.

### US-28 Sichere Basis fuer spaetere Erweiterungen schaffen

Als Betreiber moechte ich eine Architektur mit sauber getrenntem Frontend, Backend und Authentifizierung haben, damit spaetere Erweiterungen wie OAuth, weitere Wettbewerbe oder Apps moeglich bleiben.

Akzeptanzkriterien:

- Authentifizierung ist von spaeteren Login-Verfahren erweiterbar.
- Das Datenmodell ist nicht fest auf genau ein Turnierformat der WM 2026 verdrahtet.
- Die Schnittstellen zwischen Frontend und Backend sind klar definiert.
- Das Backend verwendet `Fastify`, `Prisma` und `PostgreSQL` als technische Basis des MVP.

### US-36 Frontend und Backend produktionsnah hinter Reverse Proxy betreiben

Als Betreiber moechte ich Frontend und Backend produktionsnah ueber einen gemeinsamen oeffentlichen Einstiegspunkt betreiben, damit das Backend nicht direkt aus dem Netzwerk erreichbar ist und Browser, API und Session-Cookies unter einer kontrollierten Origin laufen.

Akzeptanzkriterien:

- Das gebaute Frontend wird produktionsnah als statische Anwendung ausgeliefert und nicht ueber den Vite-Dev-Server betrieben.
- Ein Reverse Proxy, z. B. `Caddy` oder `nginx`, nimmt die oeffentlichen HTTP(S)-Anfragen entgegen.
- Der Reverse Proxy liefert das Frontend fuer `/` aus und leitet API-Pfade wie `/auth`, `/competitions` und `/admin` intern an das Backend weiter.
- Das Backend lauscht im produktionsnahen Betrieb nur auf einer internen Adresse, z. B. `127.0.0.1:3000`, und ist nicht direkt oeffentlich erreichbar.
- Die Frontend-API-Aufrufe verwenden relative Pfade, damit keine Backend-Hostnamen im Frontend hart codiert werden.
- Session-Cookies sind fuer den produktionsnahen Betrieb passend konfiguriert, insbesondere `HttpOnly`, `Secure`, `SameSite` und ohne unnoetig breites `Domain`-Attribut.
- CORS wird im produktionsnahen Zielbetrieb nicht als Ersatz fuer den Reverse Proxy verwendet; falls CORS benoetigt wird, ist es explizit auf erlaubte Origins begrenzt.
- Die lokale Entwicklung bleibt ueber den Vite-Proxy gegen `localhost:3000` moeglich.

## Offene Detailentscheidungen fuer spaetere Verfeinerung

Diese Punkte sind bewusst noch nicht als umsetzungsreife User Story ausformuliert und muessen im Fachkonzept konkretisiert werden:

- konkrete Punktwerte fuer `exaktes Ergebnis`, `Differenz` und `Tendenz`
- exakte Bewertungslogik fuer K.o.-Spiele bei Unentschieden nach 120 Minuten
- finales JSON-Schema fuer Spielplan- und Ergebnisimport
