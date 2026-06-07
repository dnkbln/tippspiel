# Deployment

## Zielbild

Diese Datei beschreibt den produktionsnahen Betrieb. Das lokale Entwicklungssystem ist separat in [docs/DEVELOPMENT.md](/home/dirk/so/2026/tipspiel/docs/DEVELOPMENT.md) beschrieben.

## Zielplattform fuer den ersten produktionsnahen Test

Die Anleitung wird zunaechst auf einem Ubuntu-22.04-System getestet und spaeter auf ein moeglichst gleiches Ubuntu-WSL-System uebertragen.

Festlegung fuer den ersten produktionsnahen Stand:

- Ubuntu 22.04 als Betriebssystem
- `devbox` fuer die reproduzierbare App-Toolchain mit Node.js 22 und pnpm 9 gemaess `devbox.json`
- PostgreSQL als lokaler Ubuntu-Dienst
- keine projektlokale Entwicklungsdatenbank unter `.local/`
- Backend als gebauter Node.js-Prozess
- Frontend als statische Dateien aus `frontend/dist`
- Betrieb im Intranet, nicht im oeffentlichen Internet
- Zugriff ueber Rechnername und Port, z. B. `http://sfe200:<port>`
- lokaler Webserver oder Reverse Proxy nimmt die Intranet-Anfragen entgegen
- kein Domain-Name und kein oeffentliches TLS-Zertifikat fuer den ersten Stand

## Intranet-Zielbild

Das System wird nur im Intranet bereitgestellt. Der Zielrechner ist fuer Nutzer ueber einen Rechnernamen und einen expliziten Port erreichbar, z. B.:

```text
http://sfe200:<port>
```

Der lokale Webserver oder Reverse Proxy auf dem Zielrechner uebernimmt dabei zwei Aufgaben:

- statische Auslieferung des gebauten Frontends aus `frontend/dist`
- interne Weiterleitung der Backend-Pfade an den Backend-Prozess, z. B. `http://127.0.0.1:3000`

Das Backend soll im produktionsnahen Intranet-Betrieb nicht direkt im Netzwerk erreichbar sein. Es soll nur intern lauschen, z. B. auf `127.0.0.1:3000`. Oeffentlich im Intranet erreichbar ist nur der lokale Webserver auf dem gewaehlten Port.

Sicherheitsfolgen des Intranet-Betriebs ohne HTTPS:

- Ohne HTTPS werden HTTP-Anfragen und Session-Cookies nicht transportverschluesselt.
- Das ist nur vertretbar, wenn das Intranet als ausreichend vertrauenswuerdig gilt und der Rechner nicht aus dem Internet erreichbar ist.
- `HttpOnly` und `SameSite=Lax` schuetzen weiterhin gegen bestimmte Browser-seitige Risiken, ersetzen aber keine Transportverschluesselung.
- Das Cookie-Attribut `Secure` kann bei reinem HTTP nicht sinnvoll aktiviert werden, weil Browser solche Cookies dann nicht ueber HTTP senden.
- Der freigegebene Port sollte nur im Intranet erreichbar sein und nicht per Portweiterleitung, Firewall-Regel oder Router-Freigabe ins Internet gelangen.
- Fuer staerkere Sicherheit waere spaeter ein internes HTTPS-Setup mit eigener CA oder internem Zertifikat zu pruefen.

Hinweis fuer WSL:

- Wenn `systemd` in WSL aktiviert ist, koennen Backend und PostgreSQL wie normale Dienste betrieben werden.
- Wenn `systemd` nicht aktiviert ist, muessen Start und Neustart der Prozesse separat beschrieben werden.

## WSL-System einrichten

Dieser Abschnitt beschreibt die Vorbereitung des Ubuntu-WSL-Systems auf dem Zielrechner. Die weiteren App-spezifischen Schritte bauen darauf auf.

### 1. Ubuntu 22.04 unter WSL bereitstellen

Auf dem Windows-Host pruefen, ob die gewuenschte WSL-Distribution vorhanden ist:

```powershell
wsl --list --verbose
```

Falls Ubuntu 22.04 noch nicht vorhanden ist, wird es installiert:

```powershell
wsl --install -d Ubuntu-22.04
```

Die Distribution soll als WSL 2 laufen:

```powershell
wsl --set-version Ubuntu-22.04 2
```

### 2. systemd in WSL aktivieren

Im Ubuntu-WSL-System wird `systemd` aktiviert:

```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```

Danach WSL aus Windows heraus neu starten:

```powershell
wsl --shutdown
```

Anschliessend Ubuntu erneut oeffnen und pruefen:

```bash
systemctl is-system-running
```

Wenn `systemd` nicht nutzbar ist, muessen PostgreSQL, Backend und Webserver spaeter manuell oder ueber einen alternativen Prozessmanager gestartet werden.

### 3. Basispakete installieren

Im Ubuntu-WSL-System:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates postgresql postgresql-contrib
```

PostgreSQL soll als lokaler Ubuntu-Dienst laufen:

```bash
sudo systemctl enable --now postgresql
sudo systemctl status postgresql
```

Sicherheitsregel:

- PostgreSQL bleibt lokal auf dem Zielsystem und wird nicht im Intranet freigegeben.
- Die Datenbank ist nur fuer lokale Prozesse wie Backend und Wartungskommandos erreichbar.

### 4. PostgreSQL-User und Datenbank anlegen

Fuer die Anwendung wird ein eigener PostgreSQL-User verwendet. Der PostgreSQL-User `postgres` wird nur fuer administrative Einrichtungsschritte genutzt und nicht in der Anwendungskonfiguration gespeichert.

Festlegung fuer den ersten Stand:

- Datenbankname: `tippspiel`
- Datenbank-User: `tippspiel`
- Passwort: starkes individuelles Passwort, nicht in Git speichern
- keine Superuser-Rechte
- kein Recht zum Anlegen weiterer Datenbanken
- kein Recht zum Anlegen weiterer Rollen

PostgreSQL-Dienst pruefen:

```bash
sudo systemctl status postgresql
pg_isready
```

PostgreSQL-User anlegen:

```bash
sudo -u postgres createuser --login --no-superuser --no-createdb --no-createrole tippspiel
```

Passwort interaktiv setzen:

```bash
sudo -u postgres psql
```

In der `psql`-Konsole:

```sql
\password tippspiel
\q
```

Das Passwort wird bewusst interaktiv gesetzt, damit es nicht direkt in der Shell-History landet.

Datenbank mit dem App-User als Besitzer anlegen:

```bash
sudo -u postgres createdb --owner=tippspiel tippspiel
```

Basisrechte auf Datenbank und Schema setzen:

```bash
sudo -u postgres psql -d tippspiel
```

In der `psql`-Konsole:

```sql
REVOKE ALL ON DATABASE tippspiel FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE tippspiel TO tippspiel;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO tippspiel;
GRANT USAGE, CREATE ON SCHEMA public TO tippspiel;
\q
```

Diese Rechte erlauben dem User `tippspiel`, Prisma-Migrationen auszufuehren und die Anwendung zu betreiben. Der User ist trotzdem kein PostgreSQL-Superuser.

Verbindung testen:

```bash
psql "postgresql://tippspiel:<password>@localhost:5432/tippspiel?schema=public" -c "select current_user, current_database();"
```

Die daraus abgeleitete `DATABASE_URL` fuer die produktionsnahe Anwendung lautet:

```env
DATABASE_URL=postgresql://tippspiel:<password>@localhost:5432/tippspiel?schema=public
```

Sicherheitsregeln fuer die Datenbank:

- Das Passwort nicht in Git, Chatprotokollen, Screenshots oder dauerhaften Logs speichern.
- Die produktive `.env` spaeter ausserhalb des Quellcodes ablegen oder mindestens restriktiv berechtigen.
- PostgreSQL nicht auf `0.0.0.0` freigeben.
- Port `5432` nicht in Windows-Firewall oder Router freigeben.
- Fuer einen spaeteren haerteren Betrieb kann ein separater Migrations-User vom App-User getrennt werden.

### 5. Intranet-Erreichbarkeit pruefen

Der spaetere Zugriff soll ueber den Windows-Rechnernamen und einen expliziten Port erfolgen, z. B.:

```text
http://sfe200:<port>
```

WSL-Netzwerkverhalten haengt von Windows- und WSL-Version ab. Deshalb muss nach Einrichtung des lokalen Webservers explizit geprueft werden:

1. Zugriff aus WSL auf den lokalen Webserver
2. Zugriff vom Windows-Host auf `http://localhost:<port>`
3. Zugriff von einem anderen Intranet-Rechner auf `http://sfe200:<port>`

Wenn der Zugriff aus dem Intranet nicht funktioniert, ist wahrscheinlich eine Windows-Firewall-Regel oder eine WSL-Portweiterleitung noetig.

Sicherheitsregeln fuer den Intranet-Port:

- Nur der Port des lokalen Webservers wird freigegeben.
- Der Backend-Port, z. B. `3000`, bleibt intern und wird nicht im Intranet freigegeben.
- Die Freigabe erfolgt nur fuer private oder domaeneninterne Netzwerke, nicht fuer oeffentliche Netzprofile.
- Es darf keine Router- oder Firewall-Regel geben, die den Port aus dem Internet erreichbar macht.
- Nach WSL-Neustarts muss geprueft werden, ob eine manuelle Portweiterleitung noch auf die korrekte WSL-IP zeigt.

## Scriptgestuetztes Deployment eines konkreten Stands

Fuer den ersten produktionsnahen Stand gibt es zwei getrennte Scripts:

- `scripts/prod-setup.sh` fuer die einmalige Einrichtung von PostgreSQL-Rechten, Backend-Environment, `systemd`-Service und Caddy-Konfiguration
- `scripts/prod-deploy.sh` fuer wiederholbare App-Updates mit Installation, Migration, Build, Neustart und Healthcheck

Die Scripts installieren keine Basispakete. Vorher muessen mindestens `devbox`, `pnpm`, PostgreSQL, `psql`, `curl`, `caddy` und `systemd` vorhanden sein.

### 1. Deployment-Konfiguration anlegen

Der erste Lauf erzeugt eine Vorlage und stoppt danach bewusst:

```bash
sudo bash ./scripts/prod-setup.sh
```

Danach die erzeugte Datei bearbeiten:

```bash
sudo editor /etc/tippspiel/deploy.env
```

Wichtige Werte:

- `TIPPSPIEL_APP_DIR`: absoluter Pfad zum Repository
- `TIPPSPIEL_APP_USER`: lokaler Linux-User, unter dem das Backend laufen soll
- `TIPPSPIEL_PUBLIC_PORT`: Intranet-Port fuer Caddy, z. B. `8080`
- `TIPPSPIEL_BACKEND_PORT`: interner Backend-Port, standardmaessig `3000`
- `TIPPSPIEL_DB_NAME`: PostgreSQL-Datenbankname, standardmaessig `tippspiel`
- `TIPPSPIEL_DB_USER`: PostgreSQL-App-User, standardmaessig `tippspiel`

### 2. Einmaliges Setup ausfuehren

Nach Anpassung von `/etc/tippspiel/deploy.env`:

```bash
sudo bash ./scripts/prod-setup.sh
```

Das Script fragt interaktiv und verdeckt nach dem PostgreSQL-Passwort fuer den App-User. Ausserdem fragt es nach:

- produktivem Einladungscode fuer Registrierungen
- optionalem Bootstrap-Token fuer den initialen Admin

Das Bootstrap-Token wird nicht im Klartext gespeichert. Das Script speichert nur den SHA-256-Hash in einer restriktiv berechtigten Provisionierungsdatei.

Das Setup erzeugt:

- `/etc/tippspiel/backend.env` mit `NODE_ENV=production`, `APP_HOST=127.0.0.1`, `APP_PORT` und `DATABASE_URL`
- `/etc/tippspiel/provision.env` fuer Einladungscode und optionalen Bootstrap-Token-Hash
- `tippspiel-backend.service` als `systemd`-Service
- einen markierten Tippspiel-Block in `/etc/caddy/Caddyfile`

### 3. App-Stand deployen oder aktualisieren

```bash
sudo bash ./scripts/prod-deploy.sh
```

Das Script fuehrt aus:

```bash
devbox run -- pnpm install --frozen-lockfile
devbox run -- pnpm db:generate
devbox run -- pnpm --filter backend exec prisma migrate deploy
devbox run -- pnpm build
```

Danach provisioniert es Einladungscode und optionalen Bootstrap-Token-Hash per SQL, startet das Backend neu, laedt Caddy neu und prueft:

```bash
curl http://127.0.0.1:3000/health
```

Wenn ein anderer Backend-Port in `/etc/tippspiel/deploy.env` gesetzt ist, verwendet das Script diesen Port fuer den Healthcheck.

### 4. Intranet-Erreichbarkeit pruefen

Nach dem Deployment muss der Zugriff wie oben beschrieben manuell geprueft werden:

1. Zugriff aus WSL auf `http://127.0.0.1:<public-port>`
2. Zugriff vom Windows-Host auf `http://localhost:<public-port>`
3. Zugriff von einem anderen Intranet-Rechner auf `http://sfe200:<public-port>`

Das Backend darf dabei nur intern erreichbar sein, z. B. auf `127.0.0.1:3000`.

## Manuelle Referenz fuer ein Deployment

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

- PostgreSQL als lokalen Ubuntu-Dienst starten
- Datenbank und Benutzer anlegen
- `DATABASE_URL` auf diese produktionsnahe Datenbank setzen
- Prisma Client erzeugen
- Migrationen mit dem produktionsgeeigneten Prisma-Kommando ausfuehren:

```bash
pnpm db:generate
pnpm --filter backend exec prisma migrate deploy
```

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

- statische Dateien aus `frontend/dist` ueber den lokalen Webserver oder Reverse Proxy ausliefern
- Intranet-Zugriff ueber `http://sfe200:<port>` pruefen

### 7. Update eines laufenden Stands

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter backend exec prisma migrate deploy
pnpm build
```

Danach den Backend-Prozess neu starten und den Healthcheck pruefen:

```bash
curl http://localhost:3000/health
```

## Offene Punkte fuer produktionsnahen Betrieb

- konkreter Intranet-Port fuer `http://sfe200:<port>` in `/etc/tippspiel/deploy.env`
- Firewall-/Netzwerkregel, die den Zugriff auf das Intranet begrenzt
- WSL-Portweiterleitung, falls der gewaehlte Port nicht automatisch vom Intranet aus erreichbar ist
- Backup-Konzept fuer PostgreSQL
