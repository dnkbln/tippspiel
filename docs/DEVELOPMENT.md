# Entwicklungssystem

## Ziel

Diese Datei beschreibt, wie das lokale Entwicklungssystem fuer das Tippspiel aufgebaut ist und wie es auf einem Ubuntu-22.04-System angelegt wird.

Die Anleitung beschreibt bewusst das Entwicklungssystem. Fuer produktionsnahen Betrieb gilt [docs/DEPLOYMENT.md](/home/dirk/so/2026/tipspiel/docs/DEPLOYMENT.md).

## Architektur des Entwicklungssystems

Das Entwicklungssystem besteht aus drei getrennten Teilen:

- Frontend: Vue/Vite-Entwicklungsserver auf `http://localhost:5173`
- Backend: Fastify/Node.js-Entwicklungsserver auf `http://localhost:3000`
- Datenbank: projektlokale PostgreSQL-Instanz unter `.local/`

Der Vite-Entwicklungsserver leitet API-Pfade wie `/auth`, `/competitions` und `/admin` an das Backend weiter. Dadurch kann das Frontend im Browser relative API-Pfade verwenden.

Die lokale Entwicklungsdatenbank wird nicht als produktionsnaher Dienst betrieben. Sie wird durch `scripts/start-postgres.sh` im Projektverzeichnis initialisiert und ueber einen lokalen Unix-Socket erreichbar gemacht.

## Voraussetzungen

Empfohlen wird Ubuntu 22.04 mit diesen Werkzeugen:

- `git`
- `devbox`
- `node`
- `pnpm`
- PostgreSQL-Client-Werkzeuge wie `psql`, `pg_ctl`, `initdb`, `createdb` und `pg_isready`

Die Projekt-Toolchain ist in `devbox.json` beschrieben:

- Node.js 22
- pnpm 9
- PostgreSQL 16

Die Voraussetzungen koennen im Projektverzeichnis geprueft werden:

```bash
bash ./scripts/check-prereqs.sh
```

## Erstmaliges Anlegen

### 1. Repository bereitstellen

```bash
git clone <repository-url> tipspiel
cd tipspiel
```

Wenn das Repository bereits vorhanden ist, reicht der Wechsel in das Projektverzeichnis.

### 2. Devbox-Shell starten

```bash
devbox shell
```

Die Devbox stellt die im Projekt erwarteten Versionen von Node.js, pnpm und PostgreSQL-Werkzeugen bereit.

### 3. Umgebungsdatei anlegen

```bash
cp .env.example .env
```

Wichtig fuer die Entwicklung:

- `NODE_ENV=development`
- `APP_PORT=3000`
- `APP_HOST=0.0.0.0`
- `APP_ORIGIN=http://localhost:5173`
- `DATABASE_URL` fuer die lokale Entwicklungsdatenbank
- `TIPPSPIEL_INVITATION_CODE` fuer die Registrierung

Wenn die projektlokale Datenbank genutzt wird, gibt `scripts/start-postgres.sh` die passende `DATABASE_URL` aus. Diese URL sollte in `.env` uebernommen werden, wenn nicht `pnpm dev:start` verwendet wird.

### 4. Entwicklungsdatenbank starten

```bash
bash ./scripts/start-postgres.sh
```

Das Skript legt bei Bedarf diese lokalen Verzeichnisse an:

- `.local/postgres-data`
- `.local/postgres-socket`
- `.local/postgres.log`

Danach laeuft PostgreSQL projektlokal und nicht als globaler Ubuntu-Dienst.

### 5. Abhaengigkeiten installieren

```bash
pnpm install
```

### 6. Prisma Client erzeugen

```bash
pnpm db:generate
```

### 7. Migrationen ausfuehren

```bash
pnpm db:migrate
```

Im Entwicklungssystem verwendet dieses Kommando `prisma migrate dev`. Das ist fuer lokale Entwicklung passend, aber nicht fuer produktionsnahes Deployment.

### 8. Optionale Entwicklungsdaten seed'en

```bash
pnpm db:seed
```

Der Seed legt einen aktiven Einladungscode aus `TIPPSPIEL_INVITATION_CODE` an.

Optional kann fuer das lokale Setup des initialen Admins ein Bootstrap-Token gesetzt werden:

```bash
TIPPSPIEL_BOOTSTRAP_TOKEN=<token> pnpm db:seed
```

Der Seed ist fuer Entwicklung gedacht und verweigert die Ausfuehrung bei `NODE_ENV=production`.

### 9. Frontend und Backend starten

```bash
pnpm dev
```

Danach sind erreichbar:

- Frontend: `http://localhost:5173`
- Backend Healthcheck: `http://localhost:3000/health`

## Schnellstart

Fuer das normale lokale Entwicklungssystem kann der gebuendelte Start verwendet werden:

```bash
devbox shell
pnpm dev:start
```

Das Skript fuehrt diese Schritte aus:

1. Voraussetzungen pruefen
2. `.env` bei Bedarf aus `.env.example` anlegen
3. projektlokale PostgreSQL-Instanz starten
4. Abhaengigkeiten installieren, falls `node_modules` fehlt
5. Prisma Client erzeugen
6. Migrationen ausfuehren
7. Entwicklungsdaten seed'en
8. Frontend und Backend starten

Standardmaessig verwendet `pnpm dev:start` die projektlokale Datenbank unter `.local/`.

Wenn stattdessen eine bereits laufende Datenbank aus `DATABASE_URL` verwendet werden soll:

```bash
TIPPSPIEL_USE_LOCAL_DB=0 pnpm dev:start
```

## Entwicklung stoppen

Frontend und Backend werden mit `Ctrl+C` im laufenden Terminal beendet.

Die projektlokale PostgreSQL-Instanz wird separat gestoppt:

```bash
pnpm db:stop
```

oder direkt:

```bash
bash ./scripts/stop-postgres.sh
```

## Relevante Checks

Vor einem Commit oder vor groesseren Aenderungen sind diese Checks sinnvoll:

```bash
pnpm lint
pnpm test
pnpm build
```

Fuer kleine Story-Inkremente sollen zunaechst nur die jeweils relevanten Tests ausgefuehrt werden.

## Unterschiede zum produktionsnahen System

Das Entwicklungssystem unterscheidet sich bewusst vom produktionsnahen Betrieb:

- PostgreSQL laeuft projektlokal unter `.local/`, nicht als Ubuntu-Dienst.
- Frontend laeuft ueber den Vite-Entwicklungsserver, nicht als statischer Build.
- Backend laeuft ueber `tsx watch`, nicht als gebauter Node.js-Prozess.
- Migrationen laufen ueber `prisma migrate dev`, nicht ueber `prisma migrate deploy`.
- Seed-Daten sind fuer Entwicklung erlaubt, aber nicht fuer Produktion.

