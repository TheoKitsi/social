# PRAGMA — Pre-Deployment Checklist

> Alles was erledigt werden muss, BEVOR PRAGMA live geht.

---

## 1. Umgebungsvariablen (Vercel Dashboard)

In Vercel unter **Settings > Environment Variables** setzen:

| Variable | Wert | Pflicht |
|----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL | Ja |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Ja |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (nie public!) | Ja |
| `RESEND_API_KEY` | von [resend.com](https://resend.com) | Ja |
| `RESEND_FROM_EMAIL` | `PRAGMA <noreply@pragma.app>` | Ja |
| `CRON_SECRET` | Beliebiger sicherer Token (min. 32 Zeichen) | Ja |
| `NEXT_PUBLIC_APP_URL` | `https://pragma.app` | Ja |
| `FLAGS_SECRET` | `node -e "console.log(crypto.randomBytes(32).toString('base64url'))"` | Ja |
| `EDGE_CONFIG` | Vercel Edge Config Connection String | Optional |
| `NEXT_PUBLIC_SENTRY_DSN` | von [sentry.io](https://sentry.io) | Ja |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `pragma.app` | Ja |
| `NEXT_PUBLIC_DEMO_MODE` | `false` (in Production!) | Ja |

### Social Login (Google + Apple)
| Variable | Wert |
|----------|------|
| Google OAuth | Wird in Supabase Dashboard unter Auth > Providers konfiguriert |
| Apple OAuth | Wird in Supabase Dashboard unter Auth > Providers konfiguriert |

> Supabase Auth Providers brauchen jeweils Client ID + Secret aus den Developer Consoles.

---

## 2. Domain + DNS

- [ ] **Domain sichern**: `pragma.app` (oder Alternative falls vergeben)
  - Alternativen: `getpragma.app`, `pragma.dating`, `pragma.love`
  - Registrar-Empfehlung: Cloudflare Registrar (guenstig, schnell, DNSSEC)
- [ ] **DNS auf Vercel zeigen**: CNAME `cname.vercel-dns.com` oder A-Records
- [ ] **Custom Domain in Vercel** hinzufuegen (Settings > Domains)
- [ ] **SSL/TLS**: Wird automatisch von Vercel provisioniert (Let's Encrypt)
- [ ] **Email-Domain verifizieren** bei Resend (SPF, DKIM, DMARC Records setzen)
  - Resend Dashboard > Domains > `pragma.app` > DNS Records kopieren

---

## 3. Rechtsform + Unternehmensgruendung

### Empfehlung nach Teamgroesse

| Konstellation | Empfehlung | Gruendungskosten | Haftung |
|---------------|------------|-------------------|---------|
| **1 Person** | **UG (haftungsbeschraenkt)** | ca. 300-500 EUR (Notar + Handelsregister) | Beschraenkt auf Stammkapital |
| **2 Personen** | **UG (haftungsbeschraenkt)** | ca. 500-800 EUR | Beschraenkt, klare Anteile |
| **2+ Personen** | **GmbH** | ca. 25.000 EUR Stammkapital + Notar | Beschraenkt |

**Warum UG und NICHT GbR/Einzelunternehmen?**
- Dating-App verarbeitet **sensible personenbezogene Daten** (Art. 9 DSGVO: sexuelle Orientierung, Beziehungspraeferenzen)
- DSGVO-Bussgelder koennen bis zu **20 Mio. EUR** betragen — persoenliche Haftung bei GbR/Einzelunternehmen!
- UG schuetzt Privatvermoegen
- UG kann spaeter in GmbH umgewandelt werden (Ansparpflicht: 25% des Jahresueberschusses)

### Gruendungs-Schritte UG
1. [ ] **Gesellschaftsvertrag (Satzung)** erstellen — Musterprotokoll reicht fuer 1-Person-UG
2. [ ] **Notartermin** buchen (Beurkundung, ca. 150-250 EUR)
3. [ ] **Geschaeftskonto eroeffnen** (z.B. Qonto, Kontist, N26 Business)
4. [ ] **Stammkapital einzahlen** (mind. 1 EUR, empfohlen: 500-1000 EUR)
5. [ ] **Handelsregister-Anmeldung** durch den Notar (ca. 150 EUR Gebuehren)
6. [ ] **Gewerbeanmeldung** beim Gewerbeamt (ca. 20-60 EUR)
7. [ ] **Steuernummer** beantragen (Fragebogen zur steuerlichen Erfassung beim Finanzamt)
8. [ ] **USt-ID** beantragen (fuer EU-weite Geschaefte, Bundeszentralamt fuer Steuern)

---

## 4. Impressum aktualisieren

Sobald die UG gegruendet ist, muessen folgende Platzhalter in den i18n-Dateien ersetzt werden:

| Platzhalter | Ersetzen durch |
|-------------|---------------|
| `PRAGMA GmbH (in Gruendung)` | `PRAGMA UG (haftungsbeschraenkt)` |
| `Adresse wird vor Launch veroeffentlicht` | Geschaeftsadresse (z.B. c/o Coworking oder Privatadresse) |
| `Wird vor Launch veroeffentlicht` (Telefon) | Geschaeftstelefon |
| `Amtsgericht Muenchen (Eintragung ausstehend)` | `Amtsgericht Muenchen, HRB XXXXX` |
| `Eintragung ausstehend` (Registernummer) | `HRB XXXXX` |
| `Eintragung ausstehend` (USt-ID) | `DE XXXXXXXXX` |
| `Wird vor Launch veroeffentlicht` (GF) | Name des Geschaeftsfuehrers |
| `Wird vor Launch veroeffentlicht` (Inhaltlich Verantwortlicher) | Name + Adresse |

> Alle 15 Locale-Dateien in `src/i18n/messages/` muessen aktualisiert werden.

---

## 5. Datenschutz + DSGVO

- [ ] **Verarbeitungsverzeichnis** erstellen (Art. 30 DSGVO) — Pflicht fuer Unternehmen
- [ ] **Datenschutzerklaerung** finalisieren (Platzhalter ersetzen)
- [ ] **Auftragsverarbeitungsvertraege (AVV)** abschliessen mit:
  - Vercel (Hosting) — [Vercel DPA](https://vercel.com/legal/dpa)
  - Supabase (Datenbank, Auth) — [Supabase DPA](https://supabase.com/legal/dpa)
  - Resend (E-Mail) — [Resend DPA](https://resend.com/legal/dpa)
  - Sentry (Error Tracking) — [Sentry DPA](https://sentry.io/legal/dpa/)
  - Plausible (Analytics) — kein AVV noetig (EU-hosted, keine personenbezogenen Daten)
- [ ] **Cookie-Banner** ist implementiert (granular: essential/analytics/marketing)
- [ ] **Recht auf Loeschung** ist implementiert (Account Deletion mit Cascade)
- [ ] **Auskunftsrecht** (Art. 15 DSGVO): Datenexport-Funktion fuer User vorbereiten
- [ ] **Datenschutzbeauftragter**: Nicht Pflicht unter 20 MA, aber empfohlen bei sensiblen Daten
- [ ] **Datenschutz-Folgenabschaetzung (DSFA)**: Empfohlen bei Dating-Apps (Profiling, sensible Daten)

---

## 6. Jugendschutz + Altersverifikation

- [ ] **Mindestalter 18** enforced? (Onboarding muss Geburtsdatum abfragen, <18 blocken)
- [ ] **Jugendschutzbeauftragter**: Pflicht bei Telemedien mit jugendgefaehrdenden Inhalten
  - Dating = "Kontaktaufnahme zu Erwachsenen" → Jugendschutz-relevant
  - Kann extern bestellt werden (z.B. FSM, jugendschutzbeauftragter.de)

---

## 7. Markenrecht

- [ ] **PRAGMA Markenrecherche** beim DPMA (Deutsches Patent- und Markenamt)
  - Klassen 9 (Software), 42 (SaaS), 45 (Dating-Services)
  - Hohes Konfliktrisiko: "Pragma" wird in Tech haeufig verwendet
- [ ] **Markenanmeldung** (DPMA: 290 EUR fuer 3 Klassen, online)
- [ ] **EU-Marke** (EUIPO: 850 EUR fuer 1 Klasse, +150 pro weitere)
- [ ] **Markenanwalt** konsultieren (Empfehlung: spezialisierte IP-Kanzlei)

---

## 8. Supabase Production-Setup

- [ ] **Pro Plan** aktivieren (mind. fuer Production, 25 USD/Monat)
- [ ] **Point-in-Time Recovery** aktivieren (Datenverlust-Schutz)
- [ ] **Database Backups** verifizieren (automatisch bei Pro Plan)
- [ ] **RLS Policies** nochmals pruefen (alle 6 Migrations sind applied)
- [ ] **Auth Rate Limits** konfigurieren (Supabase Dashboard > Auth > Rate Limits)
- [ ] **Custom SMTP** in Supabase konfigurieren (Resend als SMTP-Provider)
  - Damit Supabase Auth-Emails (Verifizierung, Passwort-Reset) auch ueber eigene Domain gehen
- [ ] **Auth Email Templates** anpassen (Supabase Dashboard > Auth > Email Templates)

---

## 9. Vercel Production-Setup

- [ ] **Pro Plan** (20 USD/Monat fuer Production-Features)
- [ ] **Analytics** aktivieren (oder Plausible beibehalten)
- [ ] **Speed Insights** aktivieren
- [ ] **DDoS-Protection** ist automatisch bei Vercel inkludiert
- [ ] **Vercel Cron** verifizieren (vercel.json: `/api/cron/emails` um 10:00 UTC)
- [ ] **Edge Config** erstellen (fuer Feature Flags, Vercel Dashboard > Storage)

---

## 10. Monitoring + Alerting

- [ ] **Sentry** Projekt erstellen + DSN setzen
  - Alert-Rules konfigurieren (Email bei Errors)
  - Release Tracking aktivieren (Source Maps)
- [ ] **Plausible** Account erstellen + Domain hinzufuegen
  - Oder: Self-hosted Plausible CE (kostenlos, EU-compliant)
- [ ] **Uptime Monitoring** einrichten (z.B. BetterStack, Checkly, oder Vercel Checks)

---

## 11. Testing vor Launch

- [ ] **E2E Tests** ausfuehren: `npx playwright test`
- [ ] **Lighthouse Audit** > 90 auf allen Kategorien
- [ ] **Accessibility Audit** (axe-core oder Pa11y)
- [ ] **Cross-Browser Test**: Chrome, Firefox, Safari, Edge
- [ ] **Mobile Test**: iOS Safari, Android Chrome
- [ ] **PWA Install Test**: "Add to Home Screen" auf iOS + Android

---

## 12. Go-Live Reihenfolge

1. UG gruenden (2-4 Wochen mit Handelsregister)
2. Domain + Email-Domain sichern und verifizieren
3. Supabase Pro + Vercel Pro aktivieren
4. Env-Variablen setzen
5. AVVs unterschreiben (Vercel, Supabase, Resend, Sentry)
6. Impressum + Datenschutz finalisieren
7. Testphase mit geschlossenem Nutzerkreis (Beta)
8. Markenanmeldung einreichen
9. Public Launch

---

## Zeitschaetzung bis Launch

| Schritt | Dauer |
|---------|-------|
| UG-Gruendung | 2-4 Wochen |
| Domain + DNS | 1 Tag |
| AVVs + DSGVO | 1-2 Wochen |
| Markenrecherche | 1 Woche |
| Env-Setup + Deployment | 1 Tag |
| Beta-Test | 2-4 Wochen |
| **Gesamt (parallel)** | **4-8 Wochen** |
