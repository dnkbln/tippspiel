# Workflow

## Ziel

Diese Datei beschreibt, wie die weitere Entwicklung des Tippspiels organisiert wird, damit einzelne Chats uebersichtlich bleiben und wichtige Projektentscheidungen nicht im Chatverlauf verloren gehen.

## Grundprinzip

- Dauerhaft relevantes Wissen wird im Repository gepflegt.
- Einzelne Implementierungen werden in kurzen, fokussierten Chats bearbeitet.
- Pro User Story wird ein neuer Chat verwendet.
- Der Chatverlauf ist nicht die langfristige Wissensquelle, sondern nur das Arbeitsmedium fuer die aktuelle Aufgabe.
- Die Implementierung erfolgt in kleinen, testnahen Inkrementen.
- Offene fachliche oder technische Restpunkte werden in [Tippspiel-OpenPoints.md](/home/dirk/so/2026/tipspiel/Tippspiel-OpenPoints.md) festgehalten.

## Verbindliche Projektquellen

Diese Dateien gelten als zentrale fachliche und technische Grundlage:

- [Tippspiel-MVP.md](/home/dirk/so/2026/tipspiel/Tippspiel-MVP.md)
- [Tippspiel-UserStories.md](/home/dirk/so/2026/tipspiel/Tippspiel-UserStories.md)
- [Tippspiel-OpenPoints.md](/home/dirk/so/2026/tipspiel/Tippspiel-OpenPoints.md)
- [README.md](/home/dirk/so/2026/tipspiel/README.md)
- [docs/DEPLOYMENT.md](/home/dirk/so/2026/tipspiel/docs/DEPLOYMENT.md)
- [docs/WORKFLOW.md](/home/dirk/so/2026/tipspiel/docs/WORKFLOW.md)

Das agile Board wird ausserhalb des Repositories gepflegt und nicht mehr ueber CSV-Dateien im Projekt abgebildet.

## Empfohlene Aufteilung der Arbeit

### 1. Planung und Grundlagen

Fachliche Anforderungen, technische Leitplanken und Architekturentscheidungen werden zuerst im Repository festgehalten.

Beispiele:

- MVP-Umfang
- User Stories
- Setup und Deployment
- technische Entscheidungen zu Auth, Scoring oder Importformaten

### 2. Umsetzung in kleinen Arbeitspaketen

Danach wird jeweils nur ein kleines, klar abgegrenztes Thema umgesetzt.

Beispiele:

- `US-01 Registrierung mit Einladungscode`
- `US-02 Anmeldung mit E-Mail und Passwort`
- `US-03 Abmeldung`
- `US-09 Gruppenspiel tippen`

### 3. Neuer Chat pro User Story

Ein neuer Chat wird gestartet, wenn:

- eine neue User Story begonnen wird
- ein neues fachliches Thema startet
- der bisherige Chat zu lang oder zu unuebersichtlich wird
- eine andere technische Richtung diskutiert werden soll

Wenn eine Story sinnvoll abgegrenzt oder abgeschlossen ist, wird fuer die naechste Story bewusst ein neuer Chat gestartet.

## Arbeitsweise innerhalb eines Umsetzungs-Chats

### 1. Start immer mit Abgleich von Story und Codebasis

Zu Beginn eines Chats werden immer diese drei Quellen gemeinsam geprueft:

- [Tippspiel-UserStories.md](/home/dirk/so/2026/tipspiel/Tippspiel-UserStories.md)
- [Tippspiel-OpenPoints.md](/home/dirk/so/2026/tipspiel/Tippspiel-OpenPoints.md)
- die relevante bestehende Codebasis inklusive Routen, Services, Persistenz, Frontend-Struktur und vorhandener Tests

Danach wird die Story in wenige kleine Umsetzungsschritte geschnitten.

### 2. Der Entwickler implementiert selbst

Der Chat liefert in der Regel:

- nur den jeweils naechsten kleinen konkreten Schritt
- den dazu passenden Testvorschlag
- die minimale dazugehoerige Codeaenderung
- nach jeder zweiten vorgeschlagenen oder umgesetzten Aenderung kurze Verstaendnisfragen

Codeaenderungen werden nicht ungefragt direkt vorgenommen, sondern zuerst als konkreter Vorschlag formuliert.

Wenn sich in den Antworten des Entwicklers zu viele fachliche oder technische Fehler zeigen, wird voruebergehend wieder nach jeder Aenderung mit kurzen Verstaendnisfragen geprueft.

### 3. Testnah und in kleinen Inkrementen arbeiten

Jeder Schritt sollte moeglichst klein sein und sich auf genau einen Fortschritt konzentrieren.

Bevorzugt werden:

- rote Tests fuer den naechsten kleinen fachlichen oder architektonischen Schnitt
- danach die minimale Codeaenderung fuer gruen
- zunaechst nur die jeweils relevanten Tests

Fuer Frontend-Arbeit gilt zusaetzlich:

- keine Tests, die nur Sourcecode-Struktur, Imports, Textfragmente oder Implementierungsdetails pruefen
- Frontend-Tests erst dann schreiben oder empfehlen, wenn echtes Verhalten oder fachliche Funktionalitaet geprueft werden kann
- rein visuelle oder strukturelle Zwischenschritte koennen zunaechst per Browser-Ansicht, Komponenten-Review oder kurzem manuellen Check abgesichert werden

### 4. Klare Trennung der Verantwortlichkeiten

Die bestehende Architektur wird beibehalten und weitergeschaerft:

- Backend: klare Trennung zwischen Route, Service und Persistenz
- Frontend: klare Trennung zwischen View, Routing, Store und Hilfslogik
- keine unnötige Vermischung von fachlicher Logik und Framework-Integration

### 5. Restpunkte sauber markieren

Wenn ein Akzeptanzkriterium noch nicht voll nachweisbar ist, wird das explizit benannt.

Wenn nach Abschluss oder sinnvoller Abgrenzung einer Story noch offene Punkte bestehen, werden sie in [Tippspiel-OpenPoints.md](/home/dirk/so/2026/tipspiel/Tippspiel-OpenPoints.md) dokumentiert.

## Wie ein neuer Chat gestartet werden sollte

Ein neuer Umsetzungs-Chat sollte moeglichst konkret gestartet werden.

Gute Beispiele:

- Bitte bearbeite als Naechstes `US-30` aus `Tippspiel-UserStories.md`.
- Bitte gleiche zuerst `Tippspiel-UserStories.md`, `Tippspiel-OpenPoints.md` und die bestehende Codebasis mit `US-31` ab.
- Ich moechte die Implementierung selbst vornehmen. Gib mir immer nur den naechsten kleinen konkreten Schritt.

Wenn es zusaetzliche Randbedingungen gibt, sollten sie direkt im ersten Prompt genannt werden.

Beispiele:

- ich moechte die Implementierung selbst vornehmen
- bitte keine Codeaenderungen direkt ausfuehren, ausser ich bitte ausdruecklich darum
- testgetrieben bzw. testnah in kleinen Schritten
- klare Trennung zwischen Route, Service, Persistenz und Frontend-Zustaendigkeiten
- immer nur die jeweils relevanten Tests laufen lassen
- nach jeder zweiten Aenderung kurze Verstaendnisfragen stellen; wenn sich zu viele Fehler zeigen, voruebergehend wieder nach jeder Aenderung fragen

## Empfohlener Startprompt fuer einen neuen Story-Chat

Der folgende Prompt hat sich fuer die Arbeit im Projekt bewaehrt:

```text
Ich arbeite in diesem Projekt immer nur an genau einer User Story pro Chat. Wenn eine Story abgeschlossen oder sinnvoll abgegrenzt ist, starte ich fuer die naechste Story einen neuen Chat.

Arbeitsweise:
- Projekt: Tippspiel
- Ich moechte die Implementierung selbst vornehmen.
- Du sollst keine Codeaenderungen selbst machen, ausser ich bitte dich ausdruecklich darum.
- Gleiche zu Beginn immer die bestehende Codebasis mit der gewaehlten User Story ab.
- Lies dafuer die relevanten bestehenden Routen, Services, Prisma-Modelle, Frontend-Struktur und vorhandenen Tests.
- Orientiere dich strikt an der bestehenden Architektur und am aktuellen Code.
- Halte eine klare Trennung zwischen Route, Service, Persistenz und Frontend-Zustaendigkeiten ein.
- Arbeite testgetrieben bzw. testnah in kleinen Inkrementen.
- Schreibe oder empfehle im Frontend keine Tests, die nur Sourcecode-Struktur, Imports, Textfragmente oder Implementierungsdetails pruefen; Frontend-Tests sollen echtes Verhalten oder fachliche Funktionalitaet absichern.
- Gib mir immer nur den naechsten kleinen, konkreten Schritt.
- Fasse pro Schritt Test und dazu passende minimale Codeaenderung in einer gemeinsamen Antwort zusammen.
- Gib mir zu jedem Schritt einen konkreten Codevorschlag, den ich pruefen und ggf. uebernehmen kann.
- Lasse zunaechst nur die jeweils relevanten Tests laufen.
- Pruefe zwischendurch knapp, was von der Story bereits erledigt ist und was noch fehlt.
- Wenn ein Akzeptanzkriterium noch nicht voll nachweisbar ist, markiere das sauber.
- Wenn meine Antwort unpraezise oder fachlich falsch ist, weise mich direkt darauf hin und korrigiere knapp.
- Stelle mir nach jeder zweiten Aenderung kurze Verstaendnisfragen, mit denen du pruefst, ob ich die Aenderung verstanden habe.
- Wenn sich in meinen Antworten zu viele fachliche oder technische Fehler zeigen, stelle voruebergehend wieder nach jeder Aenderung kurze Verstaendnisfragen.
- Wenn zur Story offene fachliche oder technische Restpunkte bleiben, weise mich darauf hin, damit ich sie bei Bedarf in `Tippspiel-OpenPoints.md` dokumentieren kann.

Startverhalten:
- Wenn ich eine konkrete User Story nenne, gleiche zuerst `Tippspiel-UserStories.md`, `Tippspiel-OpenPoints.md` und die relevante bestehende Codebasis damit ab.
- Gib mir danach eine kurze Zusammenfassung der benoetigten Umsetzungsschritte fuer diese Story.
- Liefere anschliessend nur den ersten kleinen konkreten Schritt.
```

## Was nach jeder Umsetzung aktualisiert werden sollte

Nach Abschluss einer Story oder eines Arbeitspakets sollten die relevanten Projektdateien aktualisiert werden.

Typische Updates:

- `Tippspiel-UserStories.md`
  falls Status, Zuschnitt oder Akzeptanzkriterien nachgeschaerft werden muessen
- `Tippspiel-OpenPoints.md`
  falls offene fachliche, technische oder testseitige Restpunkte sichtbar geworden sind
- `README.md`
  falls sich Setup oder Startkommandos aendern
- `docs/DEPLOYMENT.md`
  falls sich der Betriebsweg aendert
- neue Dateien unter `docs/`
  falls eine Entscheidung dokumentiert werden sollte

## Umgang mit Architekturentscheidungen

Wenn waehrend der Umsetzung eine wichtige technische Entscheidung getroffen wird, soll sie nicht nur im Chat stehen, sondern im Repository dokumentiert werden.

Sinnvolle Orte dafuer sind zum Beispiel:

- `docs/decisions/auth.md`
- `docs/decisions/backend.md`
- `docs/decisions/scoring.md`

Diese Dateien muessen nur dann angelegt werden, wenn der Umfang der Entscheidung das rechtfertigt.

## Definition of Ready fuer eine Story

Eine Story sollte erst umgesetzt werden, wenn:

- sie in `Tippspiel-UserStories.md` beschrieben ist
- das Ziel fachlich klar ist
- offene Grundsatzfragen geklaert sind
- die Story klein genug fuer einen fokussierten Umsetzungs-Chat ist

## Definition of Done fuer eine Story

Eine Story ist erst abgeschlossen, wenn:

- die fachliche Funktion implementiert ist
- die relevanten Tests fuer den bearbeiteten Zuschnitt gruen sind
- der relevante lokale Startpfad weiterhin funktioniert
- notwendige Anpassungen an Doku oder Konfiguration erfolgt sind
- bekannte Restpunkte klar benannt wurden

## Priorisierung der naechsten Stories

Die konkrete Reihenfolge der naechsten Stories wird nicht dauerhaft in dieser Datei gepflegt, weil sie sich waehrend der Umsetzung aendert.

Massgeblich sind stattdessen:

- der aktuelle Stand in [Tippspiel-UserStories.md](/home/dirk/so/2026/tipspiel/Tippspiel-UserStories.md)
- bekannte Restpunkte in [Tippspiel-OpenPoints.md](/home/dirk/so/2026/tipspiel/Tippspiel-OpenPoints.md)
- die aktuell vereinbarte Priorisierung im jeweiligen Umsetzungs-Chat oder im extern gepflegten Board
