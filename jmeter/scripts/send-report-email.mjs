#!/usr/bin/env node
/**
 * Sends the JMeter performance PDF report by email via SMTP (nodemailer).
 * Works locally and inside GitHub Actions CI.
 *
 * Usage:
 *   node jmeter/scripts/send-report-email.mjs [plan-name]
 *
 * Required env vars:
 *   MAIL_HOST     — SMTP host          e.g. smtp.gmail.com
 *   MAIL_PORT     — SMTP port          e.g. 465 (SSL) or 587 (TLS)
 *   MAIL_USER     — SMTP username      e.g. you@gmail.com
 *   MAIL_PASS     — SMTP password / app-password
 *   MAIL_TO       — Recipient(s)       e.g. qa@company.com,dev@company.com
 *
 * Optional env vars:
 *   MAIL_FROM     — Sender display     default: "JMeter Performance CI <MAIL_USER>"
 *   MAIL_SECURE   — "true" for SSL 465 default: auto-detected from port
 *   CI_RUN_URL    — GitHub Actions URL appended to email body
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const plan = process.argv[2] || 'login';

/* ── Paths ──────────────────────────────────────────────────────────────── */
const reportDir = path.resolve(__dirname, '..', 'reports', plan);
const statsFile = path.join(reportDir, 'statistics.json');
const pdfFile   = path.join(reportDir, `${plan}-performance-report.pdf`);
const jtlFile   = path.resolve(__dirname, '..', 'results', `${plan}-summary.jtl`);

/* ── Validate files ─────────────────────────────────────────────────────── */
for (const [label, file] of [['PDF', pdfFile], ['Statistics', statsFile]]) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: ${label} not found: ${file}`);
    console.error('Run the test first: bash jmeter/scripts/run.sh ' + plan);
    process.exit(1);
  }
}

/* ── Validate SMTP config ───────────────────────────────────────────────── */
const DEFAULT_MAIL_TO = 'qaabhayraj@gmail.com';

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
const MAIL_TO = process.env.MAIL_TO || DEFAULT_MAIL_TO;

if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
  console.error('ERROR: Missing required env vars. Set:');
  console.error('  MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS');
  console.error(`  MAIL_TO is optional — defaults to ${DEFAULT_MAIL_TO}`);
  process.exit(1);
}

/* ── Parse statistics ───────────────────────────────────────────────────── */
const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
const total = stats['Total'] || {};

const TH_OK       = 5_000;
const TH_CRITICAL = 60_000;

function severity(ms) {
  if (ms >= TH_CRITICAL) return { label: 'CRITICAL', color: '#C0392B', bg: '#FDECEA' };
  if (ms >= TH_OK)       return { label: 'SLOW',     color: '#C87000', bg: '#FFF3CD' };
  return                        { label: 'OK',       color: '#1E8C1E', bg: '#DFF0D8' };
}

const allLabels   = Object.keys(stats).filter(k => k !== 'Total');
const sevCounts   = { CRITICAL: 0, SLOW: 0, OK: 0 };
allLabels.forEach(label => {
  const sv = severity(stats[label].meanResTime || 0);
  sevCounts[sv.label]++;
});

const overallSev  = sevCounts.CRITICAL > 0 ? 'CRITICAL' : sevCounts.SLOW > 0 ? 'SLOW' : 'OK';
const statusColor = { CRITICAL: '#C0392B', SLOW: '#C87000', OK: '#1E8C1E' }[overallSev];
const statusIcon  = { CRITICAL: '🔴', SLOW: '🟡', OK: '✅' }[overallSev];
const statusText  = { CRITICAL: 'CRITICAL — Action Required', SLOW: 'SLOW — Action Required', OK: 'All Transactions Within Target' }[overallSev];

const runDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
const pdfSizeKB = Math.round(fs.statSync(pdfFile).size / 1024);
const ciRunUrl = process.env.CI_RUN_URL || '';

/* ── Build transaction rows for email table ─────────────────────────────── */
const txRows = allLabels.map(label => {
  const s  = stats[label];
  const sv = severity(s.meanResTime || 0);
  return `
  <tr style="background:${sv.bg}">
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600">${label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${s.sampleCount}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;color:${sv.color}">${Math.round(s.meanResTime).toLocaleString()} ms</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${Math.round(s.minResTime).toLocaleString()} ms</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${Math.round(s.maxResTime).toLocaleString()} ms</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center">
      <span style="background:${sv.bg};color:${sv.color};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${sv.label}</span>
    </td>
    <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:${s.errorPct > 0 ? '#C0392B' : '#1E8C1E'};font-weight:700">${(s.errorPct * 100).toFixed(3)}%</td>
  </tr>`;
}).join('');

/* ── HTML email body ────────────────────────────────────────────────────── */
const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f1f5f9">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1B3A6B 0%,#2D5FA6 100%);padding:32px 40px">
    <div style="color:rgba(255,255,255,.6);font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">
      OrangeHRM Automation Suite · Performance Testing
    </div>
    <div style="color:#fff;font-size:26px;font-weight:800;margin-bottom:4px">
      Performance Test Report
    </div>
    <div style="color:rgba(255,255,255,.7);font-size:13px">
      ${plan.toUpperCase()} Plan · ${runDate}
    </div>
  </div>

  <!-- Status banner -->
  <div style="background:${statusColor};padding:14px 40px;display:flex;align-items:center;gap:10px">
    <span style="font-size:20px">${statusIcon}</span>
    <span style="color:#fff;font-size:14px;font-weight:700">${statusText}</span>
  </div>

  <div style="max-width:700px;margin:0 auto;padding:28px 20px">

    <!-- KPI row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
      ${[
        ['Total Requests', total.sampleCount ?? '—', '#1B3A6B'],
        ['Avg Response',   `${Math.round(total.meanResTime || 0).toLocaleString()} ms`, severity(total.meanResTime || 0).color],
        ['Max Response',   `${Math.round(total.maxResTime  || 0).toLocaleString()} ms`, severity(total.maxResTime  || 0).color],
        ['Error Rate',     `${((total.errorPct || 0) * 100).toFixed(3)}%`, total.errorPct > 0 ? '#C0392B' : '#1E8C1E'],
      ].map(([label, val, col]) => `
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:3px solid ${col};border-radius:8px;padding:14px;text-align:center">
        <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">${label}</div>
        <div style="font-size:20px;font-weight:800;color:${col}">${val}</div>
      </div>`).join('')}
    </div>

    <!-- Severity boxes -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
      ${[
        ['CRITICAL', sevCounts.CRITICAL, '#C0392B', '#FDECEA'],
        ['SLOW',     sevCounts.SLOW,     '#C87000', '#FFF3CD'],
        ['OK',       sevCounts.OK,       '#1E8C1E', '#DFF0D8'],
      ].map(([label, count, col, bg]) => `
      <div style="background:${bg};border:1.5px solid ${col};border-radius:8px;padding:14px;text-align:center">
        <div style="font-size:9px;font-weight:700;color:${col};text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">${label}</div>
        <div style="font-size:30px;font-weight:900;color:${col};line-height:1">${count}</div>
        <div style="font-size:10px;color:${col};margin-top:4px;opacity:.8">transaction${count !== 1 ? 's' : ''}</div>
      </div>`).join('')}
    </div>

    <!-- Transaction table -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:24px">
      <div style="background:#0f172a;padding:12px 16px">
        <span style="color:#fff;font-size:12px;font-weight:700">Transaction Summary</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#1B3A6B">
            <th style="padding:8px 12px;color:#fff;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px">Label</th>
            <th style="padding:8px 12px;color:#fff;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px">Samples</th>
            <th style="padding:8px 12px;color:#fff;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px">Avg (ms)</th>
            <th style="padding:8px 12px;color:#fff;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px">Min (ms)</th>
            <th style="padding:8px 12px;color:#fff;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px">Max (ms)</th>
            <th style="padding:8px 12px;color:#fff;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px">Severity</th>
            <th style="padding:8px 12px;color:#fff;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px">Error %</th>
          </tr>
        </thead>
        <tbody>${txRows}</tbody>
        <tfoot>
          <tr style="background:#DDE4F0">
            <td style="padding:8px 12px;font-weight:700">TOTAL</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700">${total.sampleCount}</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700">${Math.round(total.meanResTime || 0).toLocaleString()}</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700">${Math.round(total.minResTime  || 0).toLocaleString()}</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700">${Math.round(total.maxResTime  || 0).toLocaleString()}</td>
            <td style="padding:8px 12px;text-align:center">—</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700;color:${(total.errorPct||0) > 0 ? '#C0392B' : '#1E8C1E'}">${((total.errorPct || 0) * 100).toFixed(3)}%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- PDF note -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 18px;margin-bottom:24px">
      <div style="color:#1e40af;font-size:12px;font-weight:700;margin-bottom:4px">📎 Full PDF Report Attached</div>
      <div style="color:#3b82f6;font-size:11px">
        The complete 6-page professional performance report (${pdfSizeKB} KB) is attached to this email.
        It includes test cases with steps, aggregate metrics, charts, and recommendations.
      </div>
    </div>

    ${ciRunUrl ? `
    <!-- CI link -->
    <div style="text-align:center;margin-bottom:24px">
      <a href="${ciRunUrl}" style="display:inline-block;background:#1B3A6B;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:12px;font-weight:600">
        View GitHub Actions Run →
      </a>
    </div>` : ''}

    <!-- Footer -->
    <div style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;color:#94a3b8;font-size:10px">
      OrangeHRM Automation Suite · Performance Testing Team<br/>
      Apache JMeter 5.6.3 · Generated ${runDate} · CONFIDENTIAL
    </div>

  </div>
</body>
</html>`;

/* ── Send email ─────────────────────────────────────────────────────────── */
const port   = parseInt(MAIL_PORT);
const secure = process.env.MAIL_SECURE === 'true' || port === 465;

const transporter = nodemailer.createTransport({
  host   : MAIL_HOST,
  port,
  secure,
  auth   : { user: MAIL_USER, pass: MAIL_PASS },
});

const subject = `${statusIcon} [${overallSev}] Performance Report — ${plan.toUpperCase()} | ${runDate}`;

const info = await transporter.sendMail({
  from        : process.env.MAIL_FROM || `"JMeter Performance CI" <${MAIL_USER}>`,
  to          : MAIL_TO,
  subject,
  html,
  attachments : [
    {
      filename : `${plan}-performance-report.pdf`,
      path     : pdfFile,
      contentType: 'application/pdf',
    },
  ],
});

console.log(`Email sent → ${MAIL_TO}`);
console.log(`Subject    : ${subject}`);
console.log(`Message ID : ${info.messageId}`);
