# Tippspiel MVP

## Zielbild

Wir planen ein webbasiertes WM-Tippspiel fuer die Fussball-WM 2026 der Maenner. Das MVP soll zunaechst in einer geschuetzten Umgebung laufen, etwa im Firmen-Intranet oder Familien-LAN. Gleichzeitig soll die Architektur so gewaehlt werden, dass spaetere Turniere und ein spaeterer oeffentlicher Betrieb grundsaetzlich moeglich sind. Es soll ein echtes Backend und ein schlichtes, funktionales Browser-Frontend geben. Mobile Nutzung soll ueber responsives Webdesign gut funktionieren.

## Produktumfang im MVP

Es gibt genau einen Wettbewerb, an dem alle registrierten Nutzer teilnehmen. Nutzer registrieren sich selbst, aber nur mit einem gemeinsamen Einladungscode. Die Anmeldung erfolgt per E-Mail und Passwort. Die E-Mail ist eindeutig, wird aber im System nicht oeffentlich angezeigt. Der Anzeigename ist frei waehlbar, sichtbar und auch nach der Registrierung aenderbar. Rollen gibt es zunaechst nur `Admin` und `Nutzer`. OAuth ist nicht Teil des MVP, soll aber architektonisch vorbereitet werden.

## Sicherheit

Passwoerter sollen nach aktuellem Stand sicher gespeichert werden, also nicht reversibel und mit einem etablierten Hash-Verfahren. Das System soll trotz geschuetzter Umgebung grundlegende Sicherheitsanforderungen erfuellen und keine unnoetige Angriffsflaeche schaffen. Passwort-Reset erfolgt im MVP nur ueber den Admin. Offene Selbstregistrierung ohne Einladungscode ist nicht vorgesehen.

## Tipplogik

Im MVP werden ausschliesslich Spielergebnisse getippt, keine Bonusfragen. Tipps muessen immer vor Spielbeginn abgegeben oder geaendert werden. Wenn kein Tipp abgegeben wurde, zaehlt das als "kein Tipp" und nicht als implizites `0:0`. Andere Nutzer duerfen Tipps erst ab Spielbeginn sehen.

Fuer Gruppenspiele wird nur das Endergebnis getippt.

Fuer K.o.-Spiele wird das Ergebnis nach regulaerer Spielwertung einschliesslich Verlaengerung betrachtet, also z. B. `1:1 n.V.`. Falls dieses Ergebnis unentschieden ist, wird zusaetzlich abgefragt, welches Team weiterkommt. Diese Zusatzangabe ist nur in der K.o.-Phase relevant.

Wichtig ist dabei:

- Elfmeterschiessen zaehlt nicht als eigenes numerisches Ergebnis.
- Relevant ist das Ergebnis nach 120 Minuten plus der Sieger bzw. das weiterkommende Team.
- Das weiterkommende Team wird nur gespeichert, wenn ein K.o.-Spiel nach 120 Minuten unentschieden ist.

## Punktevergabe

Das Punkteschema gilt global fuer den gesamten Wettbewerb. Es soll vor Beginn festgelegt und danach nicht mehr geaendert werden. Im MVP gibt es drei Wertungskategorien:

- exaktes Ergebnis
- richtige Tordifferenz
- richtige Tendenz

Fuer die K.o.-Phase muss "Tendenz" fachlich als richtiger Gewinner bzw. richtiger Weiterkommer interpretiert werden, nicht nur als klassisches `1/X/2`. Das ist aus meiner Sicht der richtige Ansatz und Teil des Konzepts.

## Administration

Der Admin soll den Spielplan importieren koennen, bevorzugt per JSON. Ergebnisse sollen im MVP auf drei Arten denkbar sein:

- manuelle Eingabe
- Import per JSON
- spaeter optional Import ueber eine externe REST-API

Nach Wettbewerbsstart sollen keine strukturellen Aenderungen mehr moeglich sein. Das heisst insbesondere:

- keine Aenderung am Spielplan
- keine Aenderung an Teams
- keine Aenderung am Punkteschema
- nur noch Ergebnispflege

Sperren oder Loeschen von Nutzern ist im MVP nicht noetig.

## Frontend

Das Frontend soll schlicht und funktional sein. Technisch ist `Vue 3 + Pinia` gesetzt. Wichtige Ansichten im MVP sind mindestens:

- Registrierung / Login
- eigene Tipps
- Spiele nach sinnvollen Kategorien, insbesondere "naechster Tag" und "naechste Runde"
- Rangliste nach Gesamtpunkten
- Admin-Bereich fuer Import und Ergebnispflege

Die Rangliste wird zunaechst nur nach Punkten sortiert. E-Mail-Adressen werden dort nicht angezeigt.

## Zeitmodell

Der Spielplan wird per JSON importiert. Die Zeitzonen der Austragungslaender USA, Kanada und Mexiko muessen beim Import sauber beruecksichtigt werden. Fuer das MVP werden Zeiten im Frontend fest in `Europe/Berlin` angezeigt. Intern wuerde ich alle Spielzeiten in `UTC` speichern und nur fuer Anzeige und Import umrechnen.

## Technische Richtung

Meine Empfehlung fuer den Stack im MVP ist:

- Frontend: `Vue 3`, `Pinia`, responsives Web-UI
- Backend: schlankes REST-Backend
- Datenbank: `PostgreSQL`
- Entwicklung/Setup: ohne Docker, lokal in WSL lauffaehig, gerne mit `devbox`

`PostgreSQL` halte ich weiterhin fuer die beste Wahl, weil das Datenmodell klar relational ist und Zeit-/Constraint-Themen sauber abbildbar sind.

## Nicht im MVP

Nicht Teil des ersten Wurfs sind nach aktuellem Stand:

- mehrere Wettbewerbe parallel
- oeffentliche Instanz
- OAuth-Login
- native Apps
- private Ligen/Gruppen
- Bonusfragen
- Nutzersperre/Loeschung
- dynamische Aenderung des Regelwerks waehrend des Wettbewerbs

## Kleine Detailpunkte, die spaeter noch festgezogen werden sollten

Diese Punkte sind noch zu entscheiden, blockieren das gemeinsame Verstaendnis aber nicht:

- konkrete Punktwerte fuer `exakt`, `Differenz`, `Tendenz`
- exakte Definition, wie K.o.-Punkte bei Unentschieden und falschem Weiterkommer gezaehlt werden
- finales JSON-Schema fuer Spielplan- und Ergebnisimport
- konkrete Backend-Technologie
