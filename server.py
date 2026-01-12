#!/usr/bin/env python3
"""
Development Server mit No-Cache Headers
Startet einen HTTP-Server auf Port 8080 ohne Browser-Caching
"""
import http.server
import socketserver
from datetime import datetime

PORT = 8080

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP Handler der No-Cache Headers für alle Requests sendet"""
    
    def end_headers(self):
        # Verhindere Browser-Caching komplett
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Zeige Timestamp für jede Anfrage"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def run_server():
    """Starte den Development Server"""
    with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print("╔════════════════════════════════════════════════╗")
        print("║   🐴 esel2go Development Server (No-Cache)    ║")
        print("╚════════════════════════════════════════════════╝")
        print(f"\n✓ Server läuft auf: http://localhost:{PORT}")
        print("✓ Cache-Control: DEAKTIVIERT (sofortige Updates)")
        print("\n📋 Drücke Ctrl+C zum Beenden\n")
        print("─" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✓ Server beendet")
            print("─" * 50)

if __name__ == "__main__":
    run_server()
