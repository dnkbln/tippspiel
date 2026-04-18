# Workflow

## Ziel

Diese Datei beschreibt, wie die weitere Entwicklung des Tippspiels organisiert wird, damit einzelne Chats uebersichtlich bleiben und wichtige Projektentscheidungen nicht im Chatverlauf verloren gehen.

## Grundprinzip

- Dauerhaft relevantes Wissen wird im Repository gepflegt.
- Einzelne Implementierungen werden in kurzen, fokussierten Chats bearbeitet.
- Pro Story oder kleinem Story-Paket wird ein neuer Chat verwendet.
- Der Chatverlauf ist nicht die langfristige Wissensquelle, sondern nur das Arbeitsmedium fuer die aktuelle Aufgabe.

## Verbindliche Projektquellen

Diese Dateien gelten als zentrale fachliche und technische Grundlage:

- [Tippspiel-MVP.md](/home/dirk/so/2026/tipspiel/Tippspiel-MVP.md)
- [Tippspiel-UserStories.md](/home/dirk/so/2026/tipspiel/Tippspiel-UserStories.md)
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
- `US-09` und `US-10` gemeinsam als Tippabgabe

### 3. Neuer Chat pro Arbeitspaket

Ein neuer Chat wird gestartet, wenn:

- eine neue Story begonnen wird
- ein neues fachliches Thema startet
- der bisherige Chat zu lang oder zu unuebersichtlich wird
- eine andere technische Richtung diskutiert werden soll

## Wie ein neuer Chat gestartet werden sollte

Ein neuer Umsetzungs-Chat sollte moeglichst konkret gestartet werden.

Gute Beispiele:

- Bitte implementiere `US-01 Registrierung mit Einladungscode` auf Basis von `Tippspiel-MVP.md` und `Tippspiel-UserStories.md`.
- Bitte bearbeite als Naechstes `US-02 Anmeldung mit E-Mail und Passwort`.
- Bitte implementiere das Datenmodell und den Backend-Endpunkt fuer `US-01`.

Wenn es zusaetzliche Randbedingungen gibt, sollten sie direkt im ersten Prompt genannt werden.

Beispiele:

- zuerst nur Backend, noch kein Frontend
- mit Tests
- ohne Session-Handling im ersten Schritt
- inklusive API-Dokumentation

## Was nach jeder Umsetzung aktualisiert werden sollte

Nach Abschluss einer Story oder eines Arbeitspakets sollten die relevanten Projektdateien aktualisiert werden.

Typische Updates:

- `Tippspiel-UserStories.md`
  falls Status, Zuschnitt oder Akzeptanzkriterien nachgeschaerft werden muessen
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
- der relevante lokale Startpfad weiterhin funktioniert
- notwendige Anpassungen an Doku oder Konfiguration erfolgt sind
- bekannte Restpunkte klar benannt wurden

## Empfohlene Reihenfolge fuer die naechsten Stories

1. `US-01 Registrierung mit Einladungscode`
2. `US-22 Sichere Passwort- und Session-Verwaltung umsetzen`
3. `US-02 Anmeldung mit E-Mail und Passwort`
4. `US-03 Abmeldung`

Diese Reihenfolge ist sinnvoll, weil sie zuerst die Authentifizierungsbasis schafft, auf der die meisten weiteren Nutzerfunktionen aufbauen.
