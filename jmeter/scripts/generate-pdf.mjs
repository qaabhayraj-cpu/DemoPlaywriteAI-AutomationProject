#!/usr/bin/env node
/**
 * Professional JMeter Performance Report Generator — Enhanced v2
 * Usage: node jmeter/scripts/generate-pdf.mjs [plan-name]
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const plan      = process.argv[2] || 'login';

/* ── Paths ──────────────────────────────────────────────────────────────── */
const reportDir = path.resolve(__dirname, '..', 'reports', plan);
const jtlFile   = path.resolve(__dirname, '..', 'results', `${plan}-summary.jtl`);
const statsFile = path.join(reportDir, 'statistics.json');
const pdfFile   = path.join(reportDir, `${plan}-performance-report.pdf`);

if (!fs.existsSync(jtlFile))   { console.error(`JTL not found: ${jtlFile}`);   process.exit(1); }
if (!fs.existsSync(statsFile)) { console.error(`Stats not found: ${statsFile}`); process.exit(1); }

/* ══════════════════════════════════════════════════════════════════════════
   CONFIG — edit per project
   ══════════════════════════════════════════════════════════════════════════ */
const PROJECT   = 'OrangeHRM Automation Suite';
const APP_NAME  = 'OrangeHRM Demo';
const ENV_NAME  = 'Demo Environment';
const ENV_URL   = 'https://opensource-demo.orangehrmlive.com';
const TOOL      = 'Apache JMeter 5.6.3';
const PREPARED  = 'QA — Performance Testing Team';
const TEST_TYPE = 'Smoke / Baseline Performance Test';
const THREADS   = 1;

/* Thresholds */
const TH_OK       = 5_000;   // ms — below = OK
const TH_CRITICAL = 60_000;  // ms — above = Critical; between = Slow

/* Labels intentionally expected to fail — excluded from functional error rate */
const EXPECTED_FAILURES = new Set([]);

/* ── Per-plan TC metadata: steps to reproduce, expected result ──────────── */
const TC_META_BY_PLAN = {

  /* ─── login plan ─────────────────────────────────────────────────────── */
  login: {
    'GET Login Page': {
      id: 'TC-001', module: 'Authentication Module',
      description: 'Verifies the OrangeHRM login page loads over HTTPS and returns HTTP 200 with the expected page title.',
      steps: [
        { action: 'Open browser and navigate to the OrangeHRM base URL over HTTPS.',
          expected: 'Browser establishes a TLS connection and sends GET /web/index.php/auth/login.' },
        { action: 'Wait for the server to return the full login page HTML response.',
          expected: 'Server returns HTTP 200 with page HTML containing "OrangeHRM" in the title — response time ≤ 3 000 ms.' },
        { action: 'Assert the HTTP response code and verify "OrangeHRM" text exists in the response body.',
          expected: 'Response code is 200 OK and the assertion on the title text passes.' },
      ],
    },
    'POST Login Credentials': {
      id: 'TC-002', module: 'Authentication Module',
      description: 'Validates that submitting valid credentials authenticates the user and redirects the browser to the dashboard.',
      steps: [
        { action: 'Extract the CSRF token from the login page HTML response using a regex extractor.',
          expected: 'A valid, non-empty CSRF token string is captured and stored in the ${csrf_token} variable.' },
        { action: 'POST username "Admin", password "admin123", and the extracted CSRF token to /web/index.php/auth/validate.',
          expected: 'Server validates credentials and returns HTTP 302 redirect to /dashboard/index — full round-trip ≤ 5 000 ms.' },
        { action: 'Follow the 302 redirect automatically and assert the final URL contains "dashboard".',
          expected: 'Final response URL contains "dashboard", HTTP status is 200 OK, and session is authenticated.' },
      ],
    },
    'POST Login Credentials-0': {
      id: 'TC-002a', module: 'Authentication Module',
      description: 'Sub-request: POST to /auth/validate endpoint returns HTTP 302 redirect to the dashboard.',
      steps: [
        { action: 'Send POST request to /web/index.php/auth/validate with credentials and CSRF token.',
          expected: 'Request reaches the authentication endpoint with correct Content-Type header.' },
        { action: 'Receive the HTTP response from the authentication endpoint.',
          expected: 'Server returns HTTP 302 with a Location header pointing to /dashboard/index — response ≤ 5 000 ms.' },
        { action: 'Verify the Location header in the 302 response points to the dashboard.',
          expected: 'Location header URL contains "/dashboard" path.' },
      ],
    },
    'POST Login Credentials-1': {
      id: 'TC-002b', module: 'Authentication Module',
      description: 'Sub-request: GET to /dashboard/index after following the 302 redirect returns HTTP 200.',
      steps: [
        { action: 'Follow the redirect from /auth/validate to /dashboard/index automatically.',
          expected: 'Browser sends a GET request to /web/index.php/dashboard/index.' },
        { action: 'Receive the dashboard page HTML response from the server.',
          expected: 'Server returns HTTP 200 with dashboard content — response ≤ 3 000 ms.' },
        { action: 'Verify HTTP 200 status and presence of dashboard page content.',
          expected: 'Response code is 200 OK and the dashboard HTML content is returned.' },
      ],
    },
  },

  /* ─── employee-list plan ─────────────────────────────────────────────── */
  'employee-list': {
    'GET Login Page': {
      id: 'TC-001', module: 'Authentication Module',
      description: 'Pre-requisite: load the login page to obtain the CSRF token required for authentication before accessing the employee list.',
      steps: [
        { action: 'Open browser and navigate to the OrangeHRM base URL over HTTPS.',
          expected: 'Browser establishes a TLS connection and sends GET /web/index.php/auth/login.' },
        { action: 'Wait for the server to return the full login page HTML.',
          expected: 'Server returns HTTP 200 containing "OrangeHRM" in the response body — response time ≤ 8 000 ms.' },
        { action: 'Extract the CSRF token using a regex extractor on the response body.',
          expected: 'A valid CSRF token is captured in the ${csrf_token} JMeter variable for use in the login POST.' },
      ],
    },
    'POST Login Credentials': {
      id: 'TC-002', module: 'Authentication Module',
      description: 'Authenticate the user with valid credentials so a session cookie is available for the subsequent employee list requests.',
      steps: [
        { action: 'POST username, password, and CSRF token to /web/index.php/auth/validate.',
          expected: 'Server validates credentials and returns HTTP 302 redirect to /dashboard/index — round-trip ≤ 8 000 ms.' },
        { action: 'Follow the redirect to the dashboard page.',
          expected: 'Final response URL contains "dashboard" and HTTP 200 is returned — session cookie is set in the cookie manager.' },
        { action: 'Assert the final URL contains "dashboard".',
          expected: 'Response URL assertion passes — user is successfully authenticated.' },
      ],
    },
    'POST Login Credentials-0': {
      id: 'TC-002a', module: 'Authentication Module',
      description: 'Sub-request: POST to /auth/validate returns HTTP 302.',
      steps: [
        { action: 'Send POST to /web/index.php/auth/validate.',
          expected: 'Server returns HTTP 302 with Location header pointing to /dashboard/index.' },
        { action: 'Verify the 302 redirect response.',
          expected: 'Response time ≤ 8 000 ms and Location header contains "/dashboard".' },
        { action: 'Cookie manager stores the session cookie.',
          expected: 'Session cookie persists for subsequent requests in the same thread iteration.' },
      ],
    },
    'POST Login Credentials-1': {
      id: 'TC-002b', module: 'Authentication Module',
      description: 'Sub-request: GET /dashboard/index after 302 redirect returns HTTP 200.',
      steps: [
        { action: 'Follow the 302 redirect to /web/index.php/dashboard/index.',
          expected: 'GET request is sent to the dashboard endpoint.' },
        { action: 'Receive the dashboard page response.',
          expected: 'Server returns HTTP 200 with dashboard HTML — response ≤ 3 000 ms.' },
        { action: 'Verify HTTP 200 and dashboard content.',
          expected: 'Response code is 200 OK and the SPA shell is returned.' },
      ],
    },
    'GET Employee List Page': {
      id: 'TC-003', module: 'PIM Module',
      description: 'Measures the response time for loading the Employee List SPA page after authentication — mirrors the smoke test "should display employee list with records".',
      steps: [
        { action: 'Navigate to /web/index.php/pim/viewEmployeeList using the authenticated session.',
          expected: 'Browser sends a GET request to the employee list URL with the session cookie attached.' },
        { action: 'Wait for the server to return the SPA shell HTML for the employee list page.',
          expected: 'Server returns HTTP 200 with page HTML containing "OrangeHRM" — response time ≤ 8 000 ms.' },
        { action: 'Assert the response contains "OrangeHRM" and HTTP 200 status.',
          expected: 'Content assertion passes and HTTP response code is 200 OK, confirming the page is accessible.' },
      ],
    },
    'GET Employee API': {
      id: 'TC-004', module: 'PIM Module — REST API',
      description: 'Measures the REST API response time for fetching the employee list — this is the XHR call the SPA makes after the page shell loads.',
      steps: [
        { action: 'Send GET request to /web/index.php/api/v2/pim/employees?limit=50&offset=0 with Accept: application/json header.',
          expected: 'Request is sent to the employee API endpoint with the authenticated session cookie.' },
        { action: 'Receive the JSON response containing the employee data array.',
          expected: 'Server returns HTTP 200 with JSON body containing a "data" key — response time ≤ 5 000 ms.' },
        { action: 'Assert the JSON response body contains a "data" field.',
          expected: 'Content assertion passes — employee records are present in the response.' },
      ],
    },
  },
};

const TC_META = TC_META_BY_PLAN[plan] || TC_META_BY_PLAN['login'];

/* ── Parse JTL ──────────────────────────────────────────────────────────── */
const jtlRaw = fs.readFileSync(jtlFile, 'utf8').trim().split('\n');
const hdrs   = jtlRaw[0].split(',');
const col    = k => hdrs.indexOf(k);

const rows = jtlRaw.slice(1).map(line => {
  const v = line.split(',');
  return {
    timestamp : parseInt(v[col('timeStamp')]),
    elapsed   : parseInt(v[col('elapsed')]),
    label     : v[col('label')],
    code      : v[col('responseCode')],
    success   : v[col('success')] === 'true',
    bytes     : parseInt(v[col('bytes')]),
    sentBytes : parseInt(v[col('sentBytes')]),
    latency   : parseInt(v[col('Latency')]),
    connect   : parseInt(v[col('Connect')]),
    url       : v[col('URL')],
  };
});

const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
const total = stats['Total'];

const startTs       = Math.min(...rows.map(r => r.timestamp));
const endTs         = Math.max(...rows.map(r => r.timestamp + r.elapsed));
const totalDuration = ((endTs - startTs) / 1000).toFixed(2);
const runDate       = new Date(startTs).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
const runDateShort  = new Date(startTs).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

/* ── Helpers ────────────────────────────────────────────────────────────── */
function severity(ms) {
  if (ms >= TH_CRITICAL) return { label: 'CRITICAL', color: '#C0392B', bg: '#FDECEA', text: '[Critical]' };
  if (ms >= TH_OK)       return { label: 'SLOW',     color: '#C87000', bg: '#FFF3CD', text: '[Slow]' };
  return                        { label: 'OK',       color: '#1E8C1E', bg: '#DFF0D8', text: '' };
}

const getRow   = label => rows.find(r => r.label === label) || {};
const fmtMs    = v => Number(v).toLocaleString() + ' ms';
const fmtKB    = v => (v / 1024).toFixed(1) + ' KB';
const fmtPct   = v => (v * 100).toFixed(3) + '%';

/* ── Functional rows (exclude expected failures) ────────────────────────── */
const funcRows    = rows.filter(r => !EXPECTED_FAILURES.has(r.label));
const funcErrors  = funcRows.filter(r => !r.success).length;
const funcErrRate = funcRows.length ? ((funcErrors / funcRows.length) * 100).toFixed(2) : '0.00';
const allErrors   = rows.filter(r => !r.success).length;

/* ── Severity buckets ───────────────────────────────────────────────────── */
const sevCounts = { CRITICAL: 0, SLOW: 0, OK: 0 };
rows.forEach(r => { sevCounts[severity(r.elapsed).label]++; });

/* ── Verdict ────────────────────────────────────────────────────────────── */
const verdict = sevCounts.CRITICAL > 0
  ? { cls: 'fail',  icon: '🔴', title: 'CRITICAL ISSUES FOUND — ACTION REQUIRED',    color: '#C0392B', bg: '#FDECEA', border: '#f5c6c6' }
  : sevCounts.SLOW > 0
  ? { cls: 'warn',  icon: '🟡', title: 'PERFORMANCE ISSUES FOUND — ACTION REQUIRED', color: '#C87000', bg: '#FFF3CD', border: '#fde68a' }
  : { cls: 'pass',  icon: '🟢', title: 'ALL TRANSACTIONS WITHIN TARGET',              color: '#1E8C1E', bg: '#DFF0D8', border: '#86efac' };

/* ── Slow/Critical TC list for findings section ─────────────────────────── */
const slowRows = rows
  .filter(r => severity(r.elapsed).label !== 'OK')
  .sort((a, b) => {
    const aS = severity(a.elapsed).label, bS = severity(b.elapsed).label;
    if (aS !== bS) return aS === 'CRITICAL' ? -1 : 1;
    return b.elapsed - a.elapsed;
  });

/* ── Main TC list for step cards ────────────────────────────────────────── */
const mainLabels = Object.keys(TC_META);
const tcList = mainLabels.map(label => {
  const r  = getRow(label);
  const s  = stats[label] || {};
  const sv = severity(r.elapsed || 0);
  return { ...TC_META[label], label, row: r, stat: s, sv };
});

/* ── Chart data ─────────────────────────────────────────────────────────── */
const chartLabels    = JSON.stringify(tcList.map(t => t.name || t.id));
const chartElapsed   = JSON.stringify(tcList.map(t => t.row.elapsed || 0));
const chartLatency   = JSON.stringify(tcList.map(t => t.row.latency || 0));
const chartConnect   = JSON.stringify(tcList.map(t => t.row.connect || 0));
const chartBytes     = JSON.stringify(tcList.map(t => +((t.row.bytes || 0) / 1024).toFixed(2)));
const chartSevColors = JSON.stringify(tcList.map(t => t.sv.color + '99'));
const chartSevBorder = JSON.stringify(tcList.map(t => t.sv.color));
const chartThreshold = JSON.stringify(tcList.map(() => TH_OK));

/* ══════════════════════════════════════════════════════════════════════════
   HTML TEMPLATE
   ══════════════════════════════════════════════════════════════════════════ */
const html = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${PROJECT} — Performance Report</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

/* ── Variables ── */
:root {
  --dark-blue : #1B3A6B;
  --mid-blue  : #2D5FA6;
  --accent    : #4A90D9;
  --light-blue: #D6E4F7;
  --soft-blue : #EBF3FC;
  --gray-line : #CCCCCC;
  --gray-text : #555555;
  --red       : #C0392B;
  --amber     : #C87000;
  --green     : #1E8C1E;
  --red-bg    : #FDECEA;
  --amber-bg  : #FFF3CD;
  --green-bg  : #DFF0D8;
  --total-bg  : #DDE4F0;
  --border    : #e2e8f0;
  --light     : #f8fafc;
  --body      : #1e293b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; font-size: 12.5px; color: var(--body); background: #fff; }

/* ══════════════════════════════════════ COVER ═══════════════════════════ */
.cover {
  width: 100vw; min-height: 100vh;
  background: linear-gradient(160deg, #1B3A6B 0%, #152d54 55%, #0d1f3c 100%);
  display: flex; flex-direction: column;
  page-break-after: always; position: relative; overflow: hidden;
}

/* diagonal accent stripe */
.cover::before {
  content: ''; position: absolute; top: 0; right: 0;
  width: 38%; height: 100%;
  background: linear-gradient(180deg, rgba(74,144,217,.18) 0%, rgba(74,144,217,.04) 100%);
  clip-path: polygon(18% 0, 100% 0, 100% 100%, 0% 100%);
}
.cover::after {
  content: ''; position: absolute; bottom: 0; left: 0;
  width: 100%; height: 5px;
  background: linear-gradient(90deg, #4A90D9, #2D5FA6, #4A90D9);
}

.cover-inner { position: relative; z-index: 1; padding: 52px 60px 40px; flex: 1; display: flex; flex-direction: column; }

/* top bar */
.cover-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 64px; }
.cover-brand  { display: flex; align-items: center; gap: 12px; }
.cover-icon   {
  width: 42px; height: 42px; background: rgba(74,144,217,.25);
  border: 1px solid rgba(74,144,217,.5); border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.cover-brand-name  { color: rgba(255,255,255,.85); font-size: 13px; font-weight: 600; letter-spacing: .5px; }
.cover-brand-sub   { color: rgba(255,255,255,.45); font-size: 10px; margin-top: 1px; }
.cover-tag {
  background: rgba(74,144,217,.2); border: 1px solid rgba(74,144,217,.45);
  color: #93c5fd; font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
  padding: 5px 16px; border-radius: 20px;
}

/* center hero */
.cover-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 0 32px; }
.cover-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.6); font-size: 10px; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 5px 14px; border-radius: 20px; margin-bottom: 24px; width: fit-content;
}
.cover-title {
  color: #fff; font-size: 46px; font-weight: 900; line-height: 1.1;
  letter-spacing: -.5px; margin-bottom: 12px;
}
.cover-title span { color: #60a5fa; }
.cover-subtitle { color: rgba(255,255,255,.55); font-size: 16px; font-weight: 300; margin-bottom: 40px; }

/* accent dividers */
.cover-rule { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; }
.cover-rule-line { flex: 1; height: 1px; background: rgba(74,144,217,.4); }
.cover-rule-dot  { width: 6px; height: 6px; border-radius: 50%; background: #4A90D9; }

/* metadata table */
.cover-table { width: 520px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,.1); }
.cover-table-row {
  display: flex; height: 38px; align-items: center;
  border-bottom: 1px solid rgba(27,58,107,.8);
}
.cover-table-row:last-child { border-bottom: none; }
.cover-table-row:nth-child(odd)  { background: rgba(45,95,166,.35); }
.cover-table-row:nth-child(even) { background: rgba(27,58,107,.5); }
.cover-table-key {
  width: 44%; padding-left: 16px;
  color: #A8C4E0; font-size: 11px; font-weight: 600; letter-spacing: .3px;
}
.cover-table-val {
  flex: 1; color: #fff; font-size: 11px; font-weight: 500;
}
.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700;
}
.status-badge.action { background: rgba(200,112,0,.3); color: #fbbf24; border: 1px solid rgba(200,112,0,.5); }
.status-badge.pass   { background: rgba(30,140,30,.3);  color: #86efac;  border: 1px solid rgba(30,140,30,.5); }

/* cover footer */
.cover-footer {
  position: relative; z-index: 1; padding: 20px 60px;
  border-top: 1px solid rgba(255,255,255,.08);
  display: flex; justify-content: space-between; align-items: center;
}
.cover-footer-left { color: rgba(255,255,255,.35); font-size: 10px; line-height: 1.6; }
.cover-kpi-row     { display: flex; gap: 32px; }
.cover-kpi-item    { text-align: center; }
.cover-kpi-val     { color: #fff; font-size: 20px; font-weight: 800; }
.cover-kpi-lbl     { color: rgba(255,255,255,.4); font-size: 9px; text-transform: uppercase; letter-spacing: .8px; margin-top: 2px; }

/* ══════════════════════════════════════ PAGE SHELL ══════════════════════ */
.page { padding: 36px 44px 36px; }
.page-break { page-break-before: always; }

/* slim header bar — pages 2+ */
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--dark-blue); padding: 7px 14px; border-radius: 6px;
  margin-bottom: 24px;
}
.page-header-title { color: #fff; font-size: 8px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; }
.page-header-right { color: rgba(255,255,255,.7); font-size: 8px; }
.page-header-sep   { color: rgba(255,255,255,.3); margin: 0 6px; }

/* footer strip */
.page-footer {
  margin-top: 32px; padding-top: 10px;
  border-top: 1px solid var(--gray-line);
  text-align: center; color: var(--gray-text); font-size: 9px;
}

/* ══════════════════════════════════════ SECTION HEADER ══════════════════ */
.section-hdr {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 8px; border-bottom: 2px solid var(--mid-blue); margin-bottom: 20px;
}
.section-num {
  background: var(--dark-blue); color: #fff;
  font-size: 10px; font-weight: 700; padding: 3px 9px;
  border-radius: 5px; letter-spacing: .5px;
}
.section-title { font-size: 17px; font-weight: 800; color: #0f172a; }
.sub-hdr { font-size: 12px; font-weight: 700; color: var(--dark-blue); margin: 20px 0 10px; }

/* ══════════════════════════════════════ VERDICT ═════════════════════════ */
.verdict {
  display: flex; align-items: flex-start; gap: 16px;
  border-radius: 10px; padding: 18px 22px; margin-bottom: 22px;
}
.verdict-icon { font-size: 28px; line-height: 1; margin-top: 2px; }
.verdict-title { font-size: 13px; font-weight: 800; margin-bottom: 4px; }
.verdict-body  { font-size: 11.5px; line-height: 1.6; }

/* ══════════════════════════════════════ KPI CARDS ═══════════════════════ */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.kpi-card {
  background: var(--light); border: 1px solid var(--border);
  border-top: 4px solid var(--dark-blue); border-radius: 10px; padding: 16px 14px;
}
.kpi-card.ok   { border-top-color: var(--green); }
.kpi-card.warn { border-top-color: var(--amber); }
.kpi-card.fail { border-top-color: var(--red); }
.kpi-label { color: var(--gray-text); font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 6px; }
.kpi-value { font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1; }
.kpi-sub   { color: var(--gray-text); font-size: 10px; margin-top: 4px; }

/* ══════════════════════════════════════ SEVERITY BOXES ══════════════════ */
.sev-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }
.sev-box {
  border-radius: 10px; padding: 18px; text-align: center;
  border-width: 1.5px; border-style: solid;
}
.sev-box-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px; }
.sev-box-count { font-size: 36px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
.sev-box-sub   { font-size: 10px; font-weight: 500; opacity: .75; }

/* ══════════════════════════════════════ INFO GRID ═══════════════════════ */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
.info-card { background: var(--light); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.info-card-title { font-size: 9px; font-weight: 700; color: var(--mid-blue); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 10px; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--border); }
.info-row:last-child { border-bottom: none; }
.info-key { color: var(--gray-text); font-size: 11px; }
.info-val { font-size: 11px; font-weight: 600; color: #1e293b; text-align: right; }

/* ══════════════════════════════════════ MODULE BADGE ════════════════════ */
.module-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #eff6ff; border: 1px solid #bfdbfe;
  color: var(--dark-blue); font-size: 10px; font-weight: 700;
  padding: 4px 12px; border-radius: 20px; margin-bottom: 14px;
  text-transform: uppercase; letter-spacing: .5px;
}

/* ══════════════════════════════════════ TC CARD ═════════════════════════ */
.tc-card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 1px 6px rgba(0,0,0,.06); }
.tc-hdr {
  background: linear-gradient(90deg, var(--dark-blue) 0%, var(--mid-blue) 100%);
  padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;
}
.tc-hdr-left { display: flex; align-items: center; gap: 10px; }
.tc-id   { background: rgba(255,255,255,.2); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 5px; }
.tc-name { color: #fff; font-size: 14px; font-weight: 700; }
.tc-module-tag { color: rgba(255,255,255,.6); font-size: 10px; }
.sev-pill { font-size: 10px; font-weight: 700; padding: 3px 12px; border-radius: 20px; }

.tc-body { padding: 16px 18px; }
.tc-desc { font-size: 11px; color: var(--gray-text); line-height: 1.5; margin-bottom: 14px; font-style: italic; }
.tc-method-line { margin-bottom: 14px; }
.tc-method   { display: inline-block; background: #0f172a; color: #60a5fa; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 4px; margin-right: 6px; font-family: monospace; }
.tc-endpoint { font-size: 11px; color: var(--gray-text); font-family: monospace; }

/* step table */
.step-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
.step-table thead th {
  background: var(--dark-blue); color: #fff;
  padding: 7px 10px; text-align: left;
  font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: .7px;
}
.step-table thead th:first-child { border-radius: 6px 0 0 0; text-align: center; width: 40px; }
.step-table thead th:last-child  { border-radius: 0 6px 0 0; width: 130px; }
.step-table tbody tr:nth-child(odd)  { background: #fff; }
.step-table tbody tr:nth-child(even) { background: var(--soft-blue, #EBF3FC); }
.step-table tbody td { padding: 8px 10px; border: 0.3px solid var(--gray-line); color: #334155; vertical-align: middle; line-height: 1.4; }
.step-table tbody td:first-child {
  text-align: center; font-weight: 700; font-size: 12px;
  color: #fff; background: var(--mid-blue); width: 40px;
}
.step-num-circle {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--mid-blue); color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
}
.time-cell { font-weight: 700; font-size: 12px; }
.tag-slow     { color: var(--amber); font-size: 9px; font-weight: 700; margin-left: 4px; }
.tag-critical { color: var(--red);   font-size: 9px; font-weight: 700; margin-left: 4px; }

/* timing mini-cards */
.timing-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
.timing-card {
  background: #fff; border: 1px solid var(--border);
  border-top-width: 3px; border-radius: 7px; padding: 8px; text-align: center;
}
.timing-label { font-size: 8px; color: var(--gray-text); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
.timing-value { font-size: 13px; font-weight: 800; }

/* ══════════════════════════════════════ AGGREGATE TABLE ═════════════════ */
.agg-note { font-size: 10px; color: var(--gray-text); margin-bottom: 12px; font-style: italic; }
.agg-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 20px; }
.agg-table thead th {
  background: #0f172a; color: #fff; padding: 8px 8px;
  text-align: center; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px;
}
.agg-table thead th:first-child { text-align: left; border-radius: 7px 0 0 0; }
.agg-table thead th:last-child  { border-radius: 0 7px 0 0; }
.agg-table tbody tr:nth-child(even) { background: #f8fafc; }
.agg-table tbody td { padding: 7px 8px; border-bottom: 1px solid var(--border); text-align: center; color: #334155; }
.agg-table tbody td:first-child { text-align: left; font-weight: 600; }
.agg-table tfoot td { padding: 8px 8px; font-weight: 700; text-align: center; background: var(--total-bg); font-size: 11px; }
.agg-table tfoot td:first-child { text-align: left; border-radius: 0 0 0 7px; }
.agg-table tfoot td:last-child  { border-radius: 0 0 7px 0; }
.code-ok   { color: var(--green); font-weight: 700; }
.code-3xx  { color: #6366f1;      font-weight: 700; }
.code-err  { color: var(--red);   font-weight: 700; }
.err-pct-ok   { color: var(--green); font-weight: 700; }
.err-pct-warn { color: var(--amber); font-weight: 700; }
.err-pct-fail { color: var(--red);   font-weight: 700; }

/* ══════════════════════════════════════ CHARTS ══════════════════════════ */
.charts-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.chart-card { background: var(--light); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.chart-title    { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.chart-subtitle { font-size: 10px; color: var(--gray-text); margin-bottom: 12px; }
.chart-wrap     { position: relative; height: 210px; }
.chart-full     { background: var(--light); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 20px; }
.chart-full .chart-wrap { height: 230px; }

/* ══════════════════════════════════════ FINDINGS ════════════════════════ */
.positive-list { list-style: none; margin-bottom: 18px; }
.positive-list li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 11.5px; color: #1e293b; line-height: 1.6; padding: 5px 0;
  border-bottom: 1px dashed var(--border);
}
.positive-list li:last-child { border-bottom: none; }
.positive-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); margin-top: 6px; flex-shrink: 0; }

.issue-block { margin-bottom: 14px; padding: 14px 16px; background: var(--light); border-radius: 8px; border-left: 4px solid; }
.issue-block.slow     { border-left-color: var(--amber); }
.issue-block.critical { border-left-color: var(--red); background: #fffbfa; }
.issue-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.issue-severity { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
.issue-sev-slow     { background: var(--amber-bg); color: var(--amber); }
.issue-sev-critical { background: var(--red-bg);   color: var(--red); }
.issue-tc-name  { font-size: 12px; font-weight: 700; color: #0f172a; }
.issue-time     { font-size: 11px; color: var(--gray-text); }
.issue-line     { font-size: 11.5px; color: #334155; line-height: 1.5; margin-bottom: 4px; }
.issue-label    { font-weight: 700; color: #0f172a; }

.next-steps-list { list-style: none; counter-reset: steps; }
.next-steps-list li {
  counter-increment: steps;
  display: flex; align-items: flex-start; gap: 12px;
  font-size: 11.5px; color: #1e293b; line-height: 1.6; padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.next-steps-list li:last-child { border-bottom: none; }
.next-steps-list li::before {
  content: counter(steps);
  min-width: 24px; height: 24px; background: var(--dark-blue); color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
}

/* ══════════════════════════════════════ REPORT FOOTER ═══════════════════ */
.report-foot {
  margin-top: 28px; padding: 14px 18px;
  background: #0f172a; border-radius: 8px;
  display: flex; justify-content: space-between; align-items: center;
}
.report-foot-l { color: rgba(255,255,255,.45); font-size: 10px; line-height: 1.6; }
.report-foot-r { color: rgba(255,255,255,.45); font-size: 10px; text-align: right; line-height: 1.6; }

.divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
</style>
</head>
<body>

<!-- ══════════════════════════ PAGE 1 — COVER ══════════════════════════════ -->
<div class="cover">
  <div class="cover-inner">

    <!-- top bar -->
    <div class="cover-topbar">
      <div class="cover-brand">
        <div class="cover-icon">⚡</div>
        <div>
          <div class="cover-brand-name">${PROJECT}</div>
          <div class="cover-brand-sub">Performance Engineering · QA Division</div>
        </div>
      </div>
      <div class="cover-tag">CONFIDENTIAL</div>
    </div>

    <!-- hero -->
    <div class="cover-hero">
      <div class="cover-eyebrow">⚡ &nbsp;Apache JMeter 5.6.3 · Playwright PDF Engine</div>
      <div class="cover-title">Performance Test<br/><span>Report</span></div>
      <div class="cover-subtitle">${APP_NAME} · Login Module · ${TEST_TYPE}</div>

      <div class="cover-rule">
        <div class="cover-rule-line"></div>
        <div class="cover-rule-dot"></div>
        <div class="cover-rule-line"></div>
      </div>

      <!-- metadata table -->
      <div class="cover-table">
        <div class="cover-table-row">
          <div class="cover-table-key">Test Type</div>
          <div class="cover-table-val">${TEST_TYPE}</div>
        </div>
        <div class="cover-table-row">
          <div class="cover-table-key">Virtual Users</div>
          <div class="cover-table-val">${THREADS}</div>
        </div>
        <div class="cover-table-row">
          <div class="cover-table-key">Test Date</div>
          <div class="cover-table-val">${runDate}</div>
        </div>
        <div class="cover-table-row">
          <div class="cover-table-key">Tool</div>
          <div class="cover-table-val">${TOOL}</div>
        </div>
        <div class="cover-table-row">
          <div class="cover-table-key">Prepared By</div>
          <div class="cover-table-val">${PREPARED}</div>
        </div>
        <div class="cover-table-row">
          <div class="cover-table-key">Status</div>
          <div class="cover-table-val">
            <span class="status-badge ${verdict.cls === 'pass' ? 'pass' : 'action'}">
              ${verdict.icon} &nbsp;${verdict.cls === 'pass' ? 'All Passed' : 'Action Required'}
            </span>
          </div>
        </div>
      </div>
    </div>

  </div><!-- /cover-inner -->

  <!-- cover footer kpi row -->
  <div class="cover-footer">
    <div class="cover-kpi-row">
      <div class="cover-kpi-item">
        <div class="cover-kpi-val">${rows.length}</div>
        <div class="cover-kpi-lbl">Total Requests</div>
      </div>
      <div class="cover-kpi-item">
        <div class="cover-kpi-val">${totalDuration} s</div>
        <div class="cover-kpi-lbl">Test Duration</div>
      </div>
      <div class="cover-kpi-item">
        <div class="cover-kpi-val" style="color:${allErrors===0?'#86efac':'#fca5a5'}">${funcErrRate}%</div>
        <div class="cover-kpi-lbl">Error Rate</div>
      </div>
      <div class="cover-kpi-item">
        <div class="cover-kpi-val" style="color:${sevCounts.CRITICAL>0?'#fca5a5':sevCounts.SLOW>0?'#fde68a':'#86efac'}">${sevCounts.CRITICAL > 0 ? 'CRITICAL' : sevCounts.SLOW > 0 ? 'SLOW' : 'OK'}</div>
        <div class="cover-kpi-lbl">Worst Severity</div>
      </div>
    </div>
    <div class="cover-footer-left">
      CONFIDENTIAL · Internal Use Only<br/>
      ${ENV_NAME} · ${ENV_URL}
    </div>
  </div>
</div>

<!-- ══════════════════════════ PAGE 2 — EXECUTIVE SUMMARY ══════════════════ -->
<div class="page page-break">

  <div class="page-header">
    <span class="page-header-title">${PROJECT} — Performance Test Report</span>
    <span class="page-header-right">${APP_NAME}<span class="page-header-sep">|</span>Page 2</span>
  </div>

  <div class="section-hdr">
    <span class="section-num">01</span>
    <span class="section-title">Executive Summary</span>
  </div>

  <!-- Verdict -->
  <div class="verdict" style="background:${verdict.bg};border:1px solid ${verdict.border}">
    <div class="verdict-icon">${verdict.icon}</div>
    <div>
      <div class="verdict-title" style="color:${verdict.color}">${verdict.title}</div>
      <div class="verdict-body" style="color:${verdict.color}cc">
        ${rows.length} total requests executed · ${allErrors} error(s) · test duration ${totalDuration} s.
        ${sevCounts.SLOW > 0 ? `<strong>${sevCounts.SLOW} transaction(s) exceeded the ${(TH_OK/1000).toFixed(0)} s OK threshold</strong> and are classified as <strong>SLOW</strong>.` : ''}
        ${sevCounts.CRITICAL > 0 ? `<strong>${sevCounts.CRITICAL} transaction(s) exceeded the ${(TH_CRITICAL/1000).toFixed(0)} s Critical threshold.</strong>` : ''}
        ${sevCounts.CRITICAL === 0 && sevCounts.SLOW === 0 ? 'All transactions responded within the OK threshold.' : 'Performance improvements are recommended before load-scaling.'}
      </div>
    </div>
  </div>

  <!-- KPI cards -->
  <div class="kpi-row">
    <div class="kpi-card ${allErrors===0?'ok':'fail'}">
      <div class="kpi-label">Total Requests</div>
      <div class="kpi-value">${rows.length}</div>
      <div class="kpi-sub">${mainLabels.length} main · ${rows.length - mainLabels.length} sub-req</div>
    </div>
    <div class="kpi-card ${allErrors===0?'ok':'fail'}">
      <div class="kpi-label">Error Rate (Functional)</div>
      <div class="kpi-value">${funcErrRate}%</div>
      <div class="kpi-sub">${funcErrors} failed of ${funcRows.length}</div>
    </div>
    <div class="kpi-card ${total.meanResTime >= TH_CRITICAL ? 'fail' : total.meanResTime >= TH_OK ? 'warn' : 'ok'}">
      <div class="kpi-label">Avg Response Time</div>
      <div class="kpi-value">${total.meanResTime.toLocaleString()} ms</div>
      <div class="kpi-sub">OK target: &lt; ${(TH_OK/1000).toFixed(0)} 000 ms</div>
    </div>
    <div class="kpi-card ${total.maxResTime >= TH_CRITICAL ? 'fail' : total.maxResTime >= TH_OK ? 'warn' : 'ok'}">
      <div class="kpi-label">Max Response Time</div>
      <div class="kpi-value">${total.maxResTime.toLocaleString()} ms</div>
      <div class="kpi-sub">Critical: &gt; ${(TH_CRITICAL/1000).toFixed(0)} 000 ms</div>
    </div>
  </div>

  <!-- Severity summary boxes -->
  <div class="sev-row">
    <div class="sev-box" style="background:var(--red-bg);border-color:var(--red);color:var(--red)">
      <div class="sev-box-label">CRITICAL &nbsp;(over ${(TH_CRITICAL/1000).toFixed(0)}s)</div>
      <div class="sev-box-count">${sevCounts.CRITICAL}</div>
      <div class="sev-box-sub">transaction${sevCounts.CRITICAL !== 1 ? 's' : ''}</div>
    </div>
    <div class="sev-box" style="background:var(--amber-bg);border-color:var(--amber);color:var(--amber)">
      <div class="sev-box-label">SLOW &nbsp;(${(TH_OK/1000).toFixed(0)}s – ${(TH_CRITICAL/1000).toFixed(0)}s)</div>
      <div class="sev-box-count">${sevCounts.SLOW}</div>
      <div class="sev-box-sub">transaction${sevCounts.SLOW !== 1 ? 's' : ''}</div>
    </div>
    <div class="sev-box" style="background:var(--green-bg);border-color:var(--green);color:var(--green)">
      <div class="sev-box-label">OK &nbsp;(under ${(TH_OK/1000).toFixed(0)}s)</div>
      <div class="sev-box-count">${sevCounts.OK}</div>
      <div class="sev-box-sub">transaction${sevCounts.OK !== 1 ? 's' : ''}</div>
    </div>
  </div>

  <!-- Info grid -->
  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">Test Configuration</div>
      <div class="info-row"><span class="info-key">Test Plan</span><span class="info-val">${plan}.jmx</span></div>
      <div class="info-row"><span class="info-key">Thread Group</span><span class="info-val">${plan === 'employee-list' ? 'Employee List Smoke Test' : 'Login Smoke Test'}</span></div>
      <div class="info-row"><span class="info-key">Virtual Users</span><span class="info-val">${THREADS}</span></div>
      <div class="info-row"><span class="info-key">Iterations</span><span class="info-val">1 loop</span></div>
      <div class="info-row"><span class="info-key">Ramp-up</span><span class="info-val">1 second</span></div>
      <div class="info-row"><span class="info-key">Duration</span><span class="info-val">${totalDuration} seconds</span></div>
      <div class="info-row"><span class="info-key">OK Threshold</span><span class="info-val">&lt; ${TH_OK.toLocaleString()} ms</span></div>
      <div class="info-row"><span class="info-key">Critical Threshold</span><span class="info-val">&gt; ${TH_CRITICAL.toLocaleString()} ms</span></div>
    </div>
    <div class="info-card">
      <div class="info-card-title">Target Environment</div>
      <div class="info-row"><span class="info-key">Application</span><span class="info-val">${APP_NAME}</span></div>
      <div class="info-row"><span class="info-key">Environment</span><span class="info-val">${ENV_NAME}</span></div>
      <div class="info-row"><span class="info-key">Host</span><span class="info-val" style="font-size:10px">opensource-demo.orangehrmlive.com</span></div>
      <div class="info-row"><span class="info-key">Protocol</span><span class="info-val">HTTPS</span></div>
      <div class="info-row"><span class="info-key">Port</span><span class="info-val">443</span></div>
      <div class="info-row"><span class="info-key">JMeter Version</span><span class="info-val">${TOOL}</span></div>
      <div class="info-row"><span class="info-key">Prepared By</span><span class="info-val">${PREPARED}</span></div>
      <div class="info-row"><span class="info-key">Test Date</span><span class="info-val">${runDateShort}</span></div>
    </div>
  </div>

  <div class="page-footer">${PROJECT} &nbsp;|&nbsp; ${runDateShort} &nbsp;|&nbsp; ${TOOL} &nbsp;|&nbsp; CONFIDENTIAL</div>
</div>

<!-- ══════════════════════════ PAGE 3 — TEST CASES ═════════════════════════ -->
<div class="page page-break">

  <div class="page-header">
    <span class="page-header-title">${PROJECT} — Performance Test Report</span>
    <span class="page-header-right">${APP_NAME}<span class="page-header-sep">|</span>Page 3</span>
  </div>

  <div class="section-hdr">
    <span class="section-num">02</span>
    <span class="section-title">Steps to Reproduce — Test Cases</span>
  </div>

  <div class="module-badge">🔐 &nbsp;Authentication Module</div>

  ${tcList.map(t => {
    const sv = t.sv;
    return `
  <div class="tc-card">
    <div class="tc-hdr">
      <div class="tc-hdr-left">
        <span class="tc-id">${t.id}</span>
        <span class="tc-name">${t.label}</span>
        <span class="tc-module-tag">· ${t.module}</span>
      </div>
      <span class="sev-pill" style="background:${sv.bg};color:${sv.color}">${sv.label}</span>
    </div>
    <div class="tc-body">
      <div class="tc-desc">${t.description}</div>
      <div class="tc-method-line">
        <span class="tc-method">${t.label.startsWith('GET') ? 'GET' : 'POST'}</span>
        <span class="tc-endpoint">${t.row.url || 'N/A'}</span>
      </div>

      <table class="step-table">
        <thead>
          <tr>
            <th>Step</th>
            <th>Action</th>
            <th>Expected Result</th>
            <th>Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          ${t.steps.map((s, i) => {
            const isActionStep = i === 1;
            const timeVal = isActionStep && t.row.elapsed
              ? `<span class="time-cell">${t.row.elapsed.toLocaleString()} ms</span>${sv.label === 'SLOW' ? '<span class="tag-slow">[Slow]</span>' : sv.label === 'CRITICAL' ? '<span class="tag-critical">[Critical]</span>' : ''}`
              : '';
            return `<tr>
              <td><div class="step-num-circle">${i + 1}</div></td>
              <td>${s.action}</td>
              <td>${s.expected}</td>
              <td style="text-align:center">${timeVal}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>

      <div class="timing-row">
        ${[
          ['Total Time',    t.row.elapsed ? fmtMs(t.row.elapsed) : 'N/A',  sv.color],
          ['Latency/TTFB', t.row.latency ? fmtMs(t.row.latency) : 'N/A',  '#6366f1'],
          ['Connect',       t.row.connect > 0 ? fmtMs(t.row.connect) : 'Reused', '#0891b2'],
          ['Received',      t.row.bytes ? fmtKB(t.row.bytes) : 'N/A',     '#059669'],
        ].map(([lbl, val, col]) => `
        <div class="timing-card" style="border-top-color:${col}">
          <div class="timing-label">${lbl}</div>
          <div class="timing-value" style="color:${col}">${val}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
  }).join('')}

  <div class="page-footer">${PROJECT} &nbsp;|&nbsp; ${runDateShort} &nbsp;|&nbsp; ${TOOL} &nbsp;|&nbsp; CONFIDENTIAL</div>
</div>

<!-- ══════════════════════════ PAGE 4 — AGGREGATE TABLE ════════════════════ -->
<div class="page page-break">

  <div class="page-header">
    <span class="page-header-title">${PROJECT} — Performance Test Report</span>
    <span class="page-header-right">${APP_NAME}<span class="page-header-sep">|</span>Page 4</span>
  </div>

  <div class="section-hdr">
    <span class="section-num">03</span>
    <span class="section-title">Aggregate Report Summary</span>
  </div>

  ${EXPECTED_FAILURES.size > 0 ? `<div class="agg-note">* Rows marked with an asterisk are intentional negative test cases (expected failures) and are excluded from the functional error rate calculation.</div>` : ''}

  <table class="agg-table">
    <thead>
      <tr>
        <th>Label</th>
        <th># Samples</th>
        <th>Avg (ms)</th>
        <th>Median</th>
        <th>90% Line</th>
        <th>95% Line</th>
        <th>99% Line</th>
        <th>Min (ms)</th>
        <th>Max (ms)</th>
        <th>HTTP Code</th>
        <th>Severity</th>
        <th>Error %</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => {
        const s  = stats[r.label] || {};
        const sv = severity(r.elapsed);
        const isExpected = EXPECTED_FAILURES.has(r.label);
        const errPct = s.errorPct != null ? (s.errorPct * 100).toFixed(3) + '%' : '0.000%';
        const errClass = isExpected ? 'err-pct-warn' : (s.errorPct > 0 ? 'err-pct-fail' : 'err-pct-ok');
        const rowBg = sv.label === 'CRITICAL' ? 'background:var(--red-bg)'
                    : sv.label === 'SLOW'     ? 'background:var(--amber-bg)'
                    : isExpected              ? 'background:var(--amber-bg)'
                    : '';
        const codeClass = r.code === '200' ? 'code-ok' : r.code === '302' ? 'code-3xx' : 'code-err';
        return `<tr style="${rowBg}">
          <td>${r.label}${isExpected ? ' *' : ''}</td>
          <td>${s.sampleCount ?? 1}</td>
          <td style="font-weight:600;color:${sv.color}">${(s.meanResTime ?? r.elapsed).toLocaleString()}</td>
          <td>${(s.medianResTime ?? r.elapsed).toLocaleString()}</td>
          <td>${(s.pct1ResTime  ?? r.elapsed).toLocaleString()}</td>
          <td>${(s.pct2ResTime  ?? r.elapsed).toLocaleString()}</td>
          <td>${(s.pct3ResTime  ?? r.elapsed).toLocaleString()}</td>
          <td>${(s.minResTime   ?? r.elapsed).toLocaleString()}</td>
          <td>${(s.maxResTime   ?? r.elapsed).toLocaleString()}</td>
          <td class="${codeClass}">${r.code}</td>
          <td><span class="sev-pill" style="background:${sv.bg};color:${sv.color};font-size:9px;padding:2px 8px">${sv.label}</span></td>
          <td class="${errClass}">${errPct}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td>TOTAL</td>
        <td>${total.sampleCount}</td>
        <td>${total.meanResTime.toLocaleString()}</td>
        <td>${total.medianResTime.toLocaleString()}</td>
        <td>${total.pct1ResTime.toLocaleString()}</td>
        <td>${total.pct2ResTime.toLocaleString()}</td>
        <td>${total.pct3ResTime.toLocaleString()}</td>
        <td>${total.minResTime.toLocaleString()}</td>
        <td>${total.maxResTime.toLocaleString()}</td>
        <td>—</td>
        <td>—</td>
        <td class="${funcErrors > 0 ? 'err-pct-fail' : 'err-pct-ok'}">${funcErrRate}%</td>
      </tr>
    </tfoot>
  </table>

  <div class="page-footer">${PROJECT} &nbsp;|&nbsp; ${runDateShort} &nbsp;|&nbsp; ${TOOL} &nbsp;|&nbsp; CONFIDENTIAL</div>
</div>

<!-- ══════════════════════════ PAGE 5 — CHARTS ═════════════════════════════ -->
<div class="page page-break">

  <div class="page-header">
    <span class="page-header-title">${PROJECT} — Performance Test Report</span>
    <span class="page-header-right">${APP_NAME}<span class="page-header-sep">|</span>Page 5</span>
  </div>

  <div class="section-hdr">
    <span class="section-num">04</span>
    <span class="section-title">Graphical Representation</span>
  </div>

  <div class="sub-hdr">4a. Response Time by Transaction — vs OK &amp; Critical Thresholds</div>
  <div class="chart-full">
    <div class="chart-wrap" style="height:260px"><canvas id="chartMain"></canvas></div>
  </div>

  <div class="charts-2col">
    <div class="chart-card">
      <div class="chart-title">Latency vs Total Response Time</div>
      <div class="chart-subtitle">TTFB compared to full round-trip per transaction</div>
      <div class="chart-wrap"><canvas id="chartLatency"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Severity Distribution</div>
      <div class="chart-subtitle">Transaction count per performance tier</div>
      <div class="chart-wrap"><canvas id="chartSeverity"></canvas></div>
    </div>
  </div>

  <div class="chart-full">
    <div class="chart-title">Timing Breakdown — Connect · TTFB · Server Processing</div>
    <div class="chart-subtitle">Stacked view of where response time is spent per transaction</div>
    <div class="chart-wrap"><canvas id="chartStacked"></canvas></div>
  </div>

  <div class="page-footer">${PROJECT} &nbsp;|&nbsp; ${runDateShort} &nbsp;|&nbsp; ${TOOL} &nbsp;|&nbsp; CONFIDENTIAL</div>
</div>

<!-- ══════════════════════════ PAGE 6 — FINDINGS ═══════════════════════════ -->
<div class="page page-break">

  <div class="page-header">
    <span class="page-header-title">${PROJECT} — Performance Test Report</span>
    <span class="page-header-right">${APP_NAME}<span class="page-header-sep">|</span>Page 6</span>
  </div>

  <div class="section-hdr">
    <span class="section-num">05</span>
    <span class="section-title">Key Findings and Recommendations</span>
  </div>

  <!-- 5a Positive Findings -->
  <div class="sub-hdr">5a. Positive Findings</div>
  <ul class="positive-list">
    ${rows.filter(r => r.success).length === rows.length
      ? '<li><div class="positive-dot"></div><div>All <strong>' + rows.length + ' requests</strong> completed successfully with a <strong>0.000% error rate</strong> — no functional failures were recorded during this test run.</div></li>'
      : ''}
    ${rows.filter(r => severity(r.elapsed).label === 'OK').map(r =>
      `<li><div class="positive-dot"></div><div><strong>${r.label}</strong> responded in <strong>${fmtMs(r.elapsed)}</strong> — well within the ${fmtMs(TH_OK)} OK threshold.</div></li>`
    ).join('')}
    ${allErrors === 0 ? '<li><div class="positive-dot"></div><div>All JMeter assertions passed: HTTP response code checks, content assertions, and URL redirect assertions all verified correctly.</div></li>' : ''}
    ${getRow('GET Login Page').elapsed > 0 && getRow('GET Login Page').elapsed < TH_OK
      ? `<li><div class="positive-dot"></div><div>Login page GET returned HTTP 200 with only <strong>${fmtKB(getRow('GET Login Page').bytes)}</strong> payload — page is lightweight and not causing unnecessary data transfer.</div></li>`
      : ''}
    ${getRow('POST Login Credentials').code === '200'
      ? '<li><div class="positive-dot"></div><div>Authentication redirect flow completed end-to-end: POST → 302 → 200 dashboard, confirming the login session is established correctly.</div></li>'
      : ''}
  </ul>

  <hr class="divider"/>

  <!-- 5b Issues & Recommendations -->
  <div class="sub-hdr">5b. Issues and Recommendations</div>

  ${slowRows.length === 0
    ? '<p style="font-size:12px;color:var(--green);font-weight:600;">✅ No Slow or Critical transactions found. All transactions are within the OK threshold.</p>'
    : slowRows.map(r => {
        const sv = severity(r.elapsed);
        const isCrit = sv.label === 'CRITICAL';
        return `
  <div class="issue-block ${isCrit ? 'critical' : 'slow'}">
    <div class="issue-hdr">
      <span class="issue-severity ${isCrit ? 'issue-sev-critical' : 'issue-sev-slow'}">[${sv.label}]</span>
      <span class="issue-tc-name">${r.label}</span>
      <span class="issue-time">— ${fmtMs(r.elapsed)}</span>
    </div>
    <div class="issue-line"><span class="issue-label">Issue:</span> This transaction took <strong>${fmtMs(r.elapsed)}</strong>, exceeding the ${sv.label === 'CRITICAL' ? fmtMs(TH_CRITICAL) + ' critical' : fmtMs(TH_OK) + ' OK'} threshold by <strong>${fmtMs(r.elapsed - (sv.label === 'CRITICAL' ? TH_CRITICAL : TH_OK))}</strong> — this will degrade significantly under concurrent user load.</div>
    <div class="issue-line"><span class="issue-label">Recommendation:</span> ${
      r.label.includes('Login Credentials')
        ? 'Investigate server-side session creation and database authentication query performance; consider caching the CSRF validation step and enabling HTTP keep-alive connection reuse.'
        : 'Profile the server response time for this endpoint, enable CDN caching for static assets, and review database query plans to reduce server processing time.'
    }</div>
  </div>`;
      }).join('')}

  <!-- Additional recommendations -->
  ${sevCounts.SLOW > 0 || sevCounts.CRITICAL > 0 ? `
  <div class="issue-block slow" style="border-left-color:#4A90D9;background:#EBF3FC">
    <div class="issue-hdr">
      <span class="issue-severity" style="background:#EBF3FC;color:#1B3A6B">[INFO]</span>
      <span class="issue-tc-name">Scale Load Test Recommended</span>
    </div>
    <div class="issue-line"><span class="issue-label">Issue:</span> This was a single-user smoke test. With SLOW transactions already present at 1 virtual user, response times will worsen under concurrent load.</div>
    <div class="issue-line"><span class="issue-label">Recommendation:</span> After resolving the SLOW transactions above, re-run with increasing virtual users (1 → 5 → 10 → 25 → 50) to establish the breaking point and confirm SLA compliance under realistic load.</div>
  </div>` : ''}

  <hr class="divider"/>

  <!-- 5c Next Steps -->
  <div class="sub-hdr">5c. Next Steps</div>
  <ol class="next-steps-list">
    <li>${sevCounts.CRITICAL > 0 ? 'Fix all <strong>Critical</strong> issues identified in Section 5b before any further testing.' : 'Address all <strong>Slow</strong> transactions identified in Section 5b to bring response times within the ' + fmtMs(TH_OK) + ' OK threshold.'}</li>
    <li>Re-run the performance test with <strong>1 virtual user</strong> to confirm all fixes are effective and no regressions were introduced.</li>
    <li>Once the 1-user test passes with all transactions in the OK tier, conduct a load test with <strong>5 simultaneous users</strong>.</li>
    <li>Increase load to <strong>10 simultaneous users</strong> and measure response times to identify the initial degradation point.</li>
    <li>Test with <strong>25 simultaneous users</strong> to assess mid-scale load capacity and ensure SLA compliance.</li>
    <li>Test with <strong>50 simultaneous users</strong> to validate the application under realistic peak load conditions.</li>
  </ol>

  <div class="report-foot">
    <div class="report-foot-l">
      ${PROJECT} · ${APP_NAME}<br/>
      Test executed: ${runDate} · ${TOOL}
    </div>
    <div class="report-foot-r">
      Prepared by: ${PREPARED}<br/>
      CONFIDENTIAL · Internal Use Only
    </div>
  </div>

</div>

<script>
/* ── Chart.js ─────────────────────────────────────────────────────────── */
const LABELS     = ${chartLabels};
const ELAPSED    = ${chartElapsed};
const LATENCY    = ${chartLatency};
const CONNECT    = ${chartConnect};
const BYTES      = ${chartBytes};
const SEV_COLORS = ${chartSevColors};
const SEV_BORDER = ${chartSevBorder};
const TH_OK_VAL  = ${TH_OK};
const TH_CR_VAL  = ${TH_CRITICAL};

Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size   = 10;
Chart.defaults.color       = '#64748b';

/* value-label plugin */
const valueLabels = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const {ctx} = chart;
    chart.data.datasets.forEach((ds, di) => {
      if (ds.type === 'line') return;
      const meta = chart.getDatasetMeta(di);
      meta.data.forEach((bar, i) => {
        const val = ds.data[i];
        if (!val) return;
        ctx.save();
        ctx.fillStyle   = '#1A1A1A';
        ctx.font        = 'bold 9px Inter';
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(Number(val).toLocaleString(), bar.x, bar.y - 4);
        ctx.restore();
      });
    });
  }
};

/* 1 — Main response time bar + threshold lines */
new Chart(document.getElementById('chartMain'), {
  type: 'bar',
  plugins: [valueLabels],
  data: {
    labels: LABELS,
    datasets: [
      {
        label: 'Response Time (ms)',
        data: ELAPSED,
        backgroundColor: SEV_COLORS,
        borderColor: SEV_BORDER,
        borderWidth: 2,
        borderRadius: 5,
      },
      {
        label: 'OK Threshold (' + (TH_OK_VAL/1000).toFixed(0) + ' s)',
        data: LABELS.map(() => TH_OK_VAL),
        type: 'line',
        borderColor: '#C87000',
        borderDash: [7, 4],
        borderWidth: 1.5,
        pointStyle: false,
        fill: false,
      },
      {
        label: 'Critical Threshold (' + (TH_CR_VAL/1000).toFixed(0) + ' s)',
        data: LABELS.map(() => TH_CR_VAL),
        type: 'line',
        borderColor: '#C0392B',
        borderDash: [7, 4],
        borderWidth: 1.5,
        pointStyle: false,
        fill: false,
      },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: { callback: v => v.toLocaleString() + ' ms' },
      },
      x: { grid: { display: false } },
    },
  },
});

/* 2 — Latency vs Elapsed */
new Chart(document.getElementById('chartLatency'), {
  type: 'bar',
  data: {
    labels: LABELS,
    datasets: [
      { label: 'Total Response (ms)', data: ELAPSED,  backgroundColor: '#6366f199', borderColor: '#6366f1', borderWidth: 2, borderRadius: 5 },
      { label: 'Latency/TTFB (ms)',  data: LATENCY, backgroundColor: '#06b6d499', borderColor: '#06b6d4', borderWidth: 2, borderRadius: 5 },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } } },
    scales: { y: { beginAtZero: true, grid: { color: '#e2e8f0' } }, x: { grid: { display: false } } },
  },
});

/* 3 — Severity bar chart */
new Chart(document.getElementById('chartSeverity'), {
  type: 'bar',
  data: {
    labels: ['CRITICAL (> ${(TH_CRITICAL/1000).toFixed(0)}s)', 'SLOW (${(TH_OK/1000).toFixed(0)}–${(TH_CRITICAL/1000).toFixed(0)}s)', 'OK (< ${(TH_OK/1000).toFixed(0)}s)'],
    datasets: [{
      label: 'Transactions',
      data: [${sevCounts.CRITICAL}, ${sevCounts.SLOW}, ${sevCounts.OK}],
      backgroundColor: ['#C0392B99', '#C8700099', '#1E8C1E99'],
      borderColor:     ['#C0392B',   '#C87000',   '#1E8C1E'],
      borderWidth: 2, borderRadius: 6,
    }],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#e2e8f0' } },
      x: { grid: { display: false } },
    },
  },
});

/* 4 — Stacked timing breakdown */
new Chart(document.getElementById('chartStacked'), {
  type: 'bar',
  data: {
    labels: LABELS,
    datasets: [
      { label: 'Connect (ms)',     data: CONNECT,                                   backgroundColor: '#06b6d4bb' },
      { label: 'TTFB/Latency (ms)',data: LATENCY.map((l,i) => Math.max(0, l - CONNECT[i])), backgroundColor: '#6366f1bb' },
      { label: 'Processing (ms)', data: ELAPSED.map((e,i) => Math.max(0, e - LATENCY[i])), backgroundColor: '#f59e0bbb' },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, grid: { color: '#e2e8f0' }, ticks: { callback: v => v.toLocaleString() + ' ms' } },
    },
  },
});
</script>
</body>
</html>`;

/* ── Write HTML → convert to PDF ────────────────────────────────────────── */
const htmlPath = path.join(reportDir, `${plan}-performance-report.html`);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`HTML written : ${htmlPath}`);

const browser = await chromium.launch();
const page    = await browser.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);

await page.pdf({
  path: pdfFile,
  format: 'A4',
  landscape: true,
  printBackground: true,
  margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
});

await browser.close();

const sizeKB = Math.round(fs.statSync(pdfFile).size / 1024);
console.log(`PDF saved   : ${pdfFile} (${sizeKB} KB)`);
console.log(`HTML copy   : ${htmlPath}`);
