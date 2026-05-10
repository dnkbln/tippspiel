# AGENTS.md

## Zweck

Diese Datei beschreibt die verbindliche Arbeitsweise fuer Coding-Agents in diesem Repository.

## Projektkontext

- Projekt: `Tippspiel`
- Das Projekt wird entlang der User Stories in [Tippspiel-UserStories.md](/home/dirk/so/2026/tipspiel/Tippspiel-UserStories.md) umgesetzt.
- Offene fachliche, technische und testseitige Restpunkte werden in [Tippspiel-OpenPoints.md](/home/dirk/so/2026/tipspiel/Tippspiel-OpenPoints.md) dokumentiert.
- Die ausfuehrlichere Prozessbeschreibung steht in [docs/WORKFLOW.md](/home/dirk/so/2026/tipspiel/docs/WORKFLOW.md).

## Verbindliche Arbeitsweise

- Pro Chat wird genau eine User Story bearbeitet.
- Zu Beginn eines Chats muessen immer `Tippspiel-UserStories.md`, `Tippspiel-OpenPoints.md` und die relevante bestehende Codebasis abgeglichen werden.
- Die bestehende Architektur und der vorhandene Code haben Vorrang vor abstrakten Idealstrukturen.
- Die Implementierung erfolgt in kleinen, testnahen Inkrementen.
- Es soll immer nur der naechste kleine, konkrete Schritt vorgeschlagen werden.
- Testvorschlag und dazu passende minimale Codeaenderung sollen gemeinsam vorgeschlagen werden.
- Zunaechst sollen nur die jeweils relevanten Tests ausgefuehrt oder empfohlen werden.
- Im Frontend werden keine Tests geschrieben oder empfohlen, die nur Sourcecode-Struktur, Imports, Textfragmente oder andere Implementierungsdetails pruefen.
- Frontend-Tests sollen erst vorgeschlagen werden, wenn damit echtes Verhalten oder fachliche Funktionalitaet geprueft werden kann.
- Wenn ein Akzeptanzkriterium noch nicht voll nachweisbar ist, muss das explizit benannt werden.
- Wenn nach einer Story noch Restpunkte offen bleiben, sollen sie fuer [Tippspiel-OpenPoints.md](/home/dirk/so/2026/tipspiel/Tippspiel-OpenPoints.md) benannt werden.

## Zusammenarbeit mit dem Entwickler

- Der Entwickler moechte die Implementierung in der Regel selbst vornehmen.
- Codeaenderungen sollen nicht ungefragt direkt ausgefuehrt werden.
- Stattdessen sollen konkrete, kleine Codevorschlaege geliefert werden, die der Entwickler pruefen und uebernehmen kann.
- Nach jeder zweiten vorgeschlagenen oder umgesetzten Aenderung sollen kurze Verstaendnisfragen gestellt werden.
- Wenn sich in den Antworten zu viele fachliche oder technische Fehler zeigen, sollen voruebergehend wieder nach jeder Aenderung kurze Verstaendnisfragen gestellt werden.
- Wenn eine Antwort fachlich unpraezise oder falsch ist, soll sie direkt und knapp korrigiert werden.

## Architekturelle Leitplanken

- Backend: klare Trennung zwischen Route, Service und Persistenz
- Frontend: klare Trennung zwischen View, Routing, Store und Hilfslogik
- Fachliche Logik und Framework-Integration sollen nicht unnoetig vermischt werden
- Vorhandene Tests und bestehende Projektmuster haben hohe Prioritaet

## Neue Chats

Ein neuer Chat soll begonnen werden, wenn:

- eine neue User Story startet
- die aktuelle Story sinnvoll abgeschlossen oder abgegrenzt ist
- ein Chat zu lang oder unuebersichtlich wird

## Startverhalten fuer Agents

Wenn der Nutzer eine User Story nennt, soll der Agent:

1. `Tippspiel-UserStories.md`, `Tippspiel-OpenPoints.md` und die relevante Codebasis abgleichen.
2. Die benoetigten Umsetzungsschritte fuer die Story kurz zusammenfassen.
3. Danach nur den ersten kleinen konkreten Schritt liefern.
