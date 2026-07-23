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

## Q4: Web application (React frontend + Express backend + Postgres)

**Architecture:**
- `frontend/` — React (Vite). Home page = search form; on submit, validates
  client-side, then calls the backend; on success, switches to a result view.
- `backend/` — Express API (`POST /api/search` via nginx proxy `/api/` → `backend:3000/`).
  Re-validates server-side (never trust the client), then logs to Postgres.
- `db-init/001_create_table.sql` — runs automatically on Postgres's first boot,
  creating table `"2402195"` (id, search_query, search_time).
- `frontend/src/validate.js` and `backend/validate.js` — the two required
  validation functions (b)/(c). Both use the same positive allow-list logic;
  see the comments in those files for the OWASP C3 rationale.

**Rebuild and run:**
```bash
docker-compose down
docker-compose up -d --build
```
(`--build` is required this time since `frontend` and `backend` now build from
Dockerfiles instead of using pre-built images.)

**Verify:**
1. Go to `https://127.0.0.1/` — you should see the real search form now (not
   the placeholder page).
2. Try a normal term (e.g. `hello world`) → submit → should land on the
   result page showing `You searched for: hello world`.
3. Try an attack payload (e.g. `<script>alert(1)</script>` or
   `' OR 1=1 --`) → should be rejected, input cleared, error shown, you stay
   on the home page.
4. Confirm it's actually logged: `docker exec -it search_db psql -U appuser -d searchapp -c "SELECT * FROM \"2402195\";"`
   — only the valid `hello world` row should appear, not the rejected attack attempt.

**Commit to Gitea (part l — multiple commits to show development process):**
Since the files already exist locally now, stage them in logical groups
rather than one giant commit, e.g.:
```bash
git add frontend/src/validate.js frontend/package.json frontend/vite.config.js frontend/index.html frontend/src/main.jsx frontend/src/App.jsx
git commit -m "Add React frontend with client-side search term validation"

git add backend/validate.js backend/server.js backend/package.json
git commit -m "Add Express backend with server-side validation and DB logging"

git add db-init/001_create_table.sql
git commit -m "Add Postgres init script for search log table"

git add frontend/Dockerfile docker-compose.yml .gitignore frontend/.dockerignore backend/.dockerignore
git commit -m "Wire frontend/backend into docker-compose, remove placeholders"

git push gitea main   # or 'origin main' if that's your gitea remote name
```

## Q5 + Q6: GitHub Actions (integration test, dependency check, ESLint + security plugin)

`.github/workflows/ci.yml` defines three jobs:
- **eslint** — lints `frontend/` and `backend/` (this is the "UI testing" stand-in
  per your plan — see caveat below). `eslint-plugin-security` is included in
  both ESLint configs, so this same job satisfies Q6.
- **dependency-check** — runs OWASP Dependency-Check against the whole repo,
  uploads the HTML report as a workflow artifact.
- **integration-test** — spins up just `db` + `backend` via `docker compose`,
  waits for `/health`, then POSTs three cases over **plain HTTP** directly to
  the backend (bypassing nginx/TLS, since Q1/Q2's cert isn't something a CI
  runner can trust): a valid term (expect 200), an XSS/SQLi payload (expect
  400), and an oversized input (expect 400).

> **Caveat for your report:** ESLint is a static linter, not a UI testing
> framework (e.g. Playwright/Cypress actually render and click through pages).
> It's used here as a lightweight code-quality gate standing in for "UI
> testing" per your stated plan — worth one sentence in your write-up so a
> grader doesn't assume the distinction was missed rather than a deliberate
> choice.

**Setup steps:**
1. Push this whole repository (including `.github/workflows/ci.yml`) to
   **GitHub** — Actions only runs from a GitHub-hosted repo, not from Gitea:
   ```bash
   git remote add origin https://github.com/<your-username>/ICT2216-PracticalTest.git
   git push -u origin main
   ```
2. Go to the **Actions** tab on GitHub — the workflow runs automatically on
   push. Confirm all three jobs pass (green).
3. (Optional but recommended) Add an NVD API key as a repo secret
   (`Settings -> Secrets and variables -> Actions -> New repository secret`,
   name `NVD_API_KEY`) — without one, OWASP Dependency-Check's first-time NVD
   database download is heavily rate-limited and can time out or take a very
   long time. Get a free key at https://nvd.nist.gov/developers/request-an-api-key
4. Per Q5's instruction to also commit these workflow files into your
   **local Gitea repo** (Q3): push the same commit there too, e.g.
   ```bash
   git push gitea main
   ```

## Not yet included (upcoming steps)
- Q7/Q8/Q9: SonarQube service + scan + remediation.
