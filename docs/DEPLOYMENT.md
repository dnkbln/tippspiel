# Deployment

## Zielbild

Das System soll spaeter ohne Docker auch unter WSL deploybar sein. Der aktuelle technische Nullstand ist dafuer vorbereitet und trennt Frontend und Backend sauber.

## Deployment eines konkreten Stands

### 1. Code bereitstellen

- Repository auf der Zielmaschine auschecken oder kopieren
- in das Projektverzeichnis wechseln

### 2. Werkzeuge bereitstellen

Empfohlen ueber `devbox`:

```bash
devbox shell
```

Alternativ muessen mindestens diese Werkzeuge lokal vorhanden sein:

- `git`
- `node`
- `pnpm`
- `postgresql`

Hinweis fuer Ubuntu 22.04 oder spaeteres WSL-Deployment:

- `pnpm` sollte ueber `devbox` oder `corepack` bereitgestellt werden
- fuer PostgreSQL reicht nicht nur der Client; ein lokaler oder externer Server muss erreichbar sein
- intern wurde der technische Nullstand auf Trennung von Browser-Frontend, Node-Backend und PostgreSQL ausgelegt

### 3. Konfiguration setzen

```bash
cp .env.example .env
```

Wichtige Variable:

- `DATABASE_URL` fuer die PostgreSQL-Verbindung

### 4. Datenbank vorbereiten

- PostgreSQL-Server starten
- Datenbank und Benutzer anlegen
- dann Migrationen ausfuehren:

```bash
pnpm db:migrate
```

Fuer lokale Entwicklung in `devbox` gibt es alternativ einen projektlokalen PostgreSQL-Start:

```bash
bash ./scripts/start-postgres.sh
```

Dieses Skript ist fuer Entwicklung gedacht, nicht fuer produktionsnahen Betrieb.

Fuer die lokale Testumgebung kann der gesamte Entwicklungsstart auch gebuendelt ausgefuehrt werden:

```bash
pnpm dev:start
```

Das Skript startet die lokale Entwicklungsdatenbank, fuehrt Prisma-Generierung und Migrationen aus und startet anschliessend Frontend und Backend.

### 5. Build erzeugen

```bash
pnpm install --frozen-lockfile
pnpm build
```

### 6. Prozesse starten

Backend:

```bash
pnpm --filter backend start
```

Frontend:

- zunaechst ueber `vite preview` moeglich
- spaeter sinnvollerweise als statische Dateien hinter einem Reverse Proxy ausliefern

### 7. Update eines laufenden Stands

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
```

Danach den Backend-Prozess neu starten und den Healthcheck pruefen:

```bash
curl http://localhost:3000/health
```

## Offene Punkte fuer produktionsnahen Betrieb

- Systemdienst fuer das Backend, z. B. `systemd`
- Reverse Proxy fuer Frontend und API, z. B. `Caddy` oder `nginx`
- TLS und Hostname
- Backup-Konzept fuer PostgreSQL

## Von Dev zu Prod

Um aus dem aktuellen Dev-System ein produktionsnahes System zu machen, muessen mindestens diese Punkte erledigt werden:

### 1. Laufzeitumgebung festziehen

- feste Zielmaschine oder WSL-Instanz definieren
- produktive Versionen fuer `node`, `pnpm` und `postgresql` festlegen
- Benutzer und Verzeichnisstruktur fuer den Betrieb anlegen

### 2. Konfiguration trennen

- eigene produktive `.env` pflegen
- produktive `DATABASE_URL` verwenden
- Entwicklungswerte wie lokale Socket-Pfade oder Test-URLs nicht uebernehmen

### 3. PostgreSQL produktiv betreiben

- keinen projektlokalen Dev-Cluster unter `.local/` verwenden
- stattdessen PostgreSQL als echten Dienst oder auf separatem DB-Host betreiben
- Backup- und Restore-Prozess festlegen

### 4. Anwendung bauen und als Dienste betreiben

- Frontend mit `pnpm build` bauen
- Backend als dauerhaften Prozess starten, z. B. ueber `systemd`
- Frontend statisch ausliefern, nicht ueber den Dev-Server

### 5. Reverse Proxy und Netzwerk konfigurieren

- `Caddy` oder `nginx` vor Frontend und Backend setzen
- Routing fuer `/` und `/api` festlegen
- nur benoetigte Ports oeffnen

### 6. Sicherheit aktivieren

- TLS fuer den produktiven Host aktivieren
- Cookie- und CORS-Einstellungen fuer echte Domain und HTTPS anpassen
- starke produktive Zugangsdaten und Admin-Zugang definieren

### 7. Betriebsprozess definieren

- Deploy-Schritte fuer Updates festlegen
- Migrationen vor Neustart ausfuehren
- Healthcheck nach jedem Deployment pruefen
- Logs und Fehlerfaelle beobachtbar machen
