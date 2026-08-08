#!/usr/bin/env python3
"""Inject a file:// warning banner into a generated Allure report's index.html.

Allure reports load their data via fetch(), which every browser blocks on the
file:// protocol, so opening index.html directly always shows a blank/broken
page. This injects a banner that only renders in that scenario, pointing
people at the bundled OPEN-REPORT.command / OPEN-REPORT.bat launcher instead.
"""
import pathlib
import sys


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: inject-report-warning.py <path-to-index.html>", file=sys.stderr)
        return 1

    index_path = pathlib.Path(sys.argv[1])
    snippet_path = pathlib.Path(__file__).parent / "report-launcher" / "file-protocol-warning.html"

    if not index_path.exists():
        print(f"skip: {index_path} not found", file=sys.stderr)
        return 0

    content = index_path.read_text()
    if "This report can" in content:
        print("skip: warning already injected")
        return 0
    if "</head>" not in content:
        print(f"skip: no </head> found in {index_path}", file=sys.stderr)
        return 0

    snippet = snippet_path.read_text()
    index_path.write_text(content.replace("</head>", snippet + "</head>"))
    print(f"injected file:// warning into {index_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
