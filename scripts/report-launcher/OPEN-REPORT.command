#!/bin/bash
# Double-click this file to view the Allure report correctly.
#
# Why you can't just open index.html: Allure loads its test data via
# fetch(), and every browser blocks fetch() against the file:// protocol.
# Opening index.html directly always shows a "data could not be loaded"
# error — this script serves the report over a real local HTTP server
# instead, which is the only way Allure reports work when downloaded.

cd "$(dirname "$0")" || exit 1

PORT=8080
while lsof -i ":$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://localhost:$PORT"
echo "Starting local report server at $URL"
echo "Leave this window open while viewing the report."
echo "Press Ctrl+C here to stop the server when you're done."
echo

( sleep 1 && open "$URL" >/dev/null 2>&1 ) &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  npx --yes http-server . -p "$PORT"
else
  echo "Neither python3 nor npx/node was found — install either, then re-run this file."
  read -r -p "Press Enter to close..."
  exit 1
fi
