#!/usr/bin/env bash
# Runs a JMeter test plan in non-GUI (headless) mode, generates the JMeter
# HTML dashboard, then auto-generates the professional PDF performance report.
#
# Usage:
#   bash jmeter/scripts/run.sh <plan>                      # e.g. login
#   bash jmeter/scripts/run.sh login -Jthreads=5 -Jloops=3
#
# Outputs:
#   jmeter/results/<plan>-summary.jtl              — raw JTL results
#   jmeter/reports/<plan>/                         — JMeter HTML dashboard
#   jmeter/reports/<plan>/<plan>-performance-report.pdf  — professional PDF

set -euo pipefail

JMETER_VERSION="5.6.3"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JMETER_DIR="${SCRIPT_DIR}/../bin/apache-jmeter-${JMETER_VERSION}"
JMETER_BIN="${JMETER_DIR}/bin/jmeter"

# Fall back to system JMeter if local install is absent
if [ ! -f "${JMETER_BIN}" ]; then
  if command -v jmeter &>/dev/null; then
    JMETER_BIN="jmeter"
  else
    echo "ERROR: JMeter not found. Run: bash jmeter/scripts/setup.sh"
    exit 1
  fi
fi

PLAN="${1:-}"
if [ -z "${PLAN}" ]; then
  echo "Usage: bash jmeter/scripts/run.sh <plan-name> [extra JMeter args]"
  echo "  Available plans: $(ls "${SCRIPT_DIR}/../test-plans/"*.jmx | xargs -n1 basename | sed 's/.jmx//' | tr '\n' ' ')"
  exit 1
fi

shift || true  # remaining args passed through to JMeter

JMX="${SCRIPT_DIR}/../test-plans/${PLAN}.jmx"
RESULTS_DIR="${SCRIPT_DIR}/../results"
REPORT_DIR="${SCRIPT_DIR}/../reports/${PLAN}"
JTL="${RESULTS_DIR}/${PLAN}-summary.jtl"

if [ ! -f "${JMX}" ]; then
  echo "ERROR: Test plan not found: ${JMX}"
  exit 1
fi

mkdir -p "${RESULTS_DIR}" "${REPORT_DIR}"

# Remove stale results so the HTML report command doesn't fail
rm -f "${JTL}"
rm -rf "${REPORT_DIR:?}"/*

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Running JMeter plan: ${PLAN}.jmx"
echo "  Results  : ${JTL}"
echo "  Report   : ${REPORT_DIR}"
echo "═══════════════════════════════════════════════════════"
echo ""

"${JMETER_BIN}" \
  -n \
  -t "${JMX}" \
  -l "${JTL}" \
  -e \
  -o "${REPORT_DIR}" \
  "$@"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  JMeter run complete. Generating PDF report..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Resolve node — prefer project-local, fall back to system
NODE_BIN="$(command -v node 2>/dev/null || true)"
GENERATE_SCRIPT="${SCRIPT_DIR}/generate-pdf.mjs"

if [ -z "${NODE_BIN}" ]; then
  echo "WARNING: node not found — skipping PDF generation."
  echo "  Install Node.js 18+ and re-run: node ${GENERATE_SCRIPT} ${PLAN}"
elif [ ! -f "${GENERATE_SCRIPT}" ]; then
  echo "WARNING: PDF generator not found at ${GENERATE_SCRIPT} — skipping."
else
  "${NODE_BIN}" "${GENERATE_SCRIPT}" "${PLAN}"
  echo ""
  echo "─────────────────────────────────────────────────────"
  echo "  PDF report : ${REPORT_DIR}/${PLAN}-performance-report.pdf"
  echo "  HTML report: ${REPORT_DIR}/index.html"
  echo "─────────────────────────────────────────────────────"
fi
