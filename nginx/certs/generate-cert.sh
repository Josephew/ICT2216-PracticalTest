#!/bin/bash
# Generates a self-signed TLS certificate for https://127.0.0.1
# Run this ONCE before "docker-compose up" (from Git Bash / WSL on Windows).
#
# NOTE ON CERTBOT / ACME:
# Certbot (ACME) issues publicly-trusted certificates via Let's Encrypt, which
# requires proving ownership of a real, internet-resolvable domain (HTTP-01 or
# DNS-01 challenge). 127.0.0.1 is a loopback address, not a domain, so
# Let's Encrypt / Certbot cannot and will not issue a certificate for it.
# A self-signed certificate generated with OpenSSL is the correct approach
# for local/loopback HTTPS testing.

set -e
cd "$(dirname "$0")"

# MSYS_NO_PATHCONV=1 stops Git Bash (MSYS2) from "helpfully" rewriting the
# leading "/C=SG/..." in -subj as if it were a Windows filesystem path.
MSYS_NO_PATHCONV=1 openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout server.key \
  -out server.crt \
  -subj "/C=SG/ST=Singapore/L=Singapore/O=SIT/OU=SSD/CN=127.0.0.1" \
  -addext "subjectAltName=IP:127.0.0.1,DNS:localhost"

echo "Certificate generated: server.crt / server.key"
