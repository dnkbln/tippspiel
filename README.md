# Tippspiel

Technischer Nullstand fuer das WM-Tippspiel-MVP mit `Vue 3`, `Pinia`, `Fastify`, `Prisma` und `PostgreSQL`.

## Projektstruktur

```text
.
|-- backend
|-- frontend
|-- scripts
|-- devbox.json
|-- package.json
|-- pnpm-workspace.yaml
|-- .env.example
```

## Voraussetzungen

Entwicklung aktuell unter `Ubuntu 22.04`.

Empfohlene lokale Werkzeuge:

- `devbox`
- `git`
- `node`
- `pnpm`
- `postgresql`

Mit `devbox` sollen diese Werkzeuge spaeter auch unter WSL reproduzierbar bereitgestellt werden.

## Lokales Setup

1. Optional in die Devbox-Shell wechseln:

   ```bash
   devbox shell
   ```

2. Umgebungsvariablen anlegen:

   ```bash
   cp .env.example .env
   ```

3. Abhaengigkeiten pruefen:

   ```bash
   bash ./scripts/check-prereqs.sh
   ```

4. `pnpm` bereitstellen:

   - bevorzugt ueber `devbox shell`
   - alternativ ausserhalb der Sandbox z. B. ueber `corepack enable pnpm`

5. Lokale Entwicklungsdatenbank starten:

   ```bash
   bash ./scripts/start-postgres.sh
   ```

   Das Skript initialisiert bei Bedarf einen projektlokalen PostgreSQL-Cluster unter `.local/`, startet ihn ueber Unix-Sockets und gibt die passende `DATABASE_URL` fuer `.env` aus.

6. Pakete installieren:

   ```bash
   pnpm install
   ```

7. Prisma Client erzeugen:

   ```bash
   pnpm db:generate
   ```

8. Datenbankmigration ausfuehren:

   ```bash
   pnpm db:migrate
   ```

9. Frontend und Backend im Entwicklungsmodus starten:

   ```bash
   pnpm dev
   ```

Zum Beenden der lokalen Entwicklungsdatenbank:

```bash
bash ./scripts/stop-postgres.sh
```

## Schnellstart Testumgebung

Fuer den typischen lokalen Entwicklungsstart gibt es jetzt ein gebuendeltes Skript:

```bash
devbox shell
pnpm dev:start
```

Das Skript erledigt in dieser Reihenfolge:

1. Voraussetzungen pruefen
2. `.env` bei Bedarf aus `.env.example` anlegen
3. projektlokale PostgreSQL-Instanz starten
4. Abhaengigkeiten installieren, falls noch nicht vorhanden
5. Prisma Client erzeugen
6. Migrationen ausfuehren
7. Frontend und Backend starten

Standardmaessig nutzt es die projektlokale Datenbank unter `.local/`.
Wenn du spaeter eine externe oder bereits laufende PostgreSQL-Instanz verwenden willst, kannst du den lokalen Start ueberspringen:

```bash
TIPPSPIEL_USE_LOCAL_DB=0 pnpm dev:start
```

## Lokaler Status in dieser Umgebung

Beim aktuellen Check in dieser Sandbox gilt:

- `git`, `devbox`, `node` und `psql` sind vorhanden
- `pnpm` ist noch nicht direkt verfuegbar
- `corepack` koennte `pnpm` nachladen, benoetigt dafuer aber Netzwerkzugriff
- ein PostgreSQL-System ist installiert, aber aktuell laeuft kein lokaler Server auf dem Standardsocket
- das Starten eines Test-PostgreSQL-Servers ist in dieser Sandbox durch Socket-Beschraenkungen blockiert

## Wichtige Endpunkte

- Frontend: `http://localhost:5173`
- Backend Healthcheck: `http://localhost:3000/health`

## Deployment eines Zwischenstands

Eine aktuelle Beschreibung fuer Intranet- oder spaeteren WSL-Betrieb steht in [docs/DEPLOYMENT.md](/home/dirk/so/2026/tipspiel/docs/DEPLOYMENT.md).
