#!/usr/bin/env bash
# Downloads Apache JMeter 5.6.3 into jmeter/bin/ if not already present.
# Run once: bash jmeter/scripts/setup.sh

set -euo pipefail

JMETER_VERSION="5.6.3"
INSTALL_DIR="$(cd "$(dirname "$0")/.." && pwd)/bin"
ARCHIVE="apache-jmeter-${JMETER_VERSION}.tgz"
DOWNLOAD_URL="https://dlcdn.apache.org/jmeter/binaries/${ARCHIVE}"

if [ -f "${INSTALL_DIR}/apache-jmeter-${JMETER_VERSION}/bin/jmeter" ]; then
  echo "JMeter ${JMETER_VERSION} already installed at ${INSTALL_DIR}"
  exit 0
fi

# Check Java
if ! java -version &>/dev/null; then
  echo "ERROR: Java is required but not found. Install Java 8+ and retry."
  exit 1
fi

echo "Downloading Apache JMeter ${JMETER_VERSION}..."
mkdir -p "${INSTALL_DIR}"
curl -fSL "${DOWNLOAD_URL}" -o "/tmp/${ARCHIVE}"

echo "Extracting..."
tar -xzf "/tmp/${ARCHIVE}" -C "${INSTALL_DIR}"
rm "/tmp/${ARCHIVE}"

chmod +x "${INSTALL_DIR}/apache-jmeter-${JMETER_VERSION}/bin/jmeter"
echo "JMeter ${JMETER_VERSION} installed at ${INSTALL_DIR}/apache-jmeter-${JMETER_VERSION}"
echo "Run tests with: npm run perf:login"
