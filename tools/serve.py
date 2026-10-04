#!/usr/bin/env python3
"""Static dev server for KO Circuit that never lets the browser cache files.

`python3 -m http.server` lets browsers keep stale ES modules after an edit,
so the game can run old code until a hard reload. This sends no-store headers.

    python3 tools/serve.py [port]      (run from the ko-circuit folder)
"""
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 8420))
    http.server.ThreadingHTTPServer(('', port), NoCacheHandler).serve_forever()
