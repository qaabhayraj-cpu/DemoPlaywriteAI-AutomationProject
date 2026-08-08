HOW TO VIEW THIS REPORT
========================

Do NOT double-click index.html directly -- it will show a "500 / data
could not be loaded" error. This is not broken; it's how every Allure
report behaves when opened as a plain file, because it loads test data
via fetch(), which browsers block on the file:// protocol.

Instead, double-click:

  Mac / Linux  ->  OPEN-REPORT.command
  Windows      ->  OPEN-REPORT.bat

Either one starts a small local server and opens the report correctly
in your browser. Leave the terminal/command window open while viewing;
closing it stops the server.

If double-clicking OPEN-REPORT.command does nothing on Mac: right-click
it, choose Open (bypasses the "unidentified developer" prompt once), or
run these two lines in Terminal from this folder:
  chmod +x OPEN-REPORT.command
  ./OPEN-REPORT.command
