# Secure Software Development — Practical Test Project

## Prerequisites (Windows)
1. **Docker Desktop** (with WSL2 backend) — https://www.docker.com/products/docker-desktop/
2. **Git Bash** (comes with Git for Windows) — used to run the `.sh` script and `docker-compose` commands.
   Git Bash includes an `openssl` binary, so Step 1 below works out of the box.

Open **Git Bash**, `cd` into this project folder, then follow the steps below.

---

## Q1 + Q2: Web server + self-signed HTTPS

**Step 1 — generate the certificate (do this once, before first `docker-compose up`):**
```bash
bash nginx/certs/generate-cert.sh
```
This creates `nginx/certs/server.crt` and `nginx/certs/server.key`.

> Why not Certbot/ACME? Let's Encrypt (which Certbot talks to) only issues certificates
> for real, internet-resolvable domains it can challenge over HTTP/DNS. `127.0.0.1` is a
> loopback address — there is no domain to validate — so ACME issuance is not possible here.
> A self-signed certificate via OpenSSL is the correct and expected approach for local HTTPS.

**Step 2 — bring the stack up:**
```bash
docker-compose up -d --build
```
(Note: the task says `sudo docker-compose up` — Windows/Docker Desktop doesn't use `sudo`;
just run `docker-compose up` from Git Bash / PowerShell with Docker Desktop running.)

**Step 3 — verify:**
- Open **https://127.0.0.1/** in your browser.
- Your browser will warn "Not secure" / "Your connection is not private" — this is expected
  and correct behaviour for a self-signed cert. Click "Advanced" → "Proceed to 127.0.0.1".
- You should see the placeholder page (will become the real React app after Q4).

---

## Q3: Local Git server (Gitea)

**Step 1 — access the web UI:** http://127.0.0.1:3001/

**Step 2 — first-run installer:** Gitea shows a setup page on first visit. Use the defaults
for the database (it uses an embedded SQLite by default when you don't configure an
external DB — fine for this local dev/test purpose), and under **Administrator Account**
create:
- Username: `admin`
- Password: `2402195@sit.singaporetech.edu.sg`
- Email: `2402195@sit.singaporetech.edu.sg`

Click **Install Gitea**.

**Step 3 — create a repository** (via UI): `+` → New Repository → name it e.g. `secure-webapp`.

**Step 4 — configure your local git identity** (this is the "git account identity" the
question asks for — your commit author info, separate from the Gitea admin login above):
```bash
git config --global user.name "Joseph Goh Wei Jie"
git config --global user.email "2402195@sit.singaporetech.edu.sg"
```

**Step 5 — point this project at your Gitea repo and push:**
```bash
cd secure-webapp-project
git init
git add .
git commit -m "Initial commit: Q1-Q3 infrastructure (docker-compose, nginx TLS, gitea)"
git remote add origin http://127.0.0.1:3001/admin/secure-webapp.git
git push -u origin main
```
(Git will prompt for the Gitea admin username/password you set above.)

---

## What's included so far
- `docker-compose.yml` — nginx (webserver+TLS), backend (Express placeholder — real logic
  comes in Q4), db (Postgres — schema comes in Q4), gitea (local git server).
- `nginx/` — HTTPS reverse-proxy config + self-signed cert script.
- `backend/`, `frontend/` — placeholders, to be replaced with the real app in Q4.

## Not yet included (upcoming steps)
- Q4: the actual React frontend + Express backend with input validation, and Postgres schema.
- Q5/Q6: GitHub Actions workflow (integration test, OWASP dependency-check, ESLint + eslint-plugin-security).
- Q7/Q8/Q9: SonarQube service + scan + remediation.
