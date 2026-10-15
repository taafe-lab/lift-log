"""Helpers to drive the built app in an iPhone-sized Chromium for testing."""
import http.server
import socketserver
import threading
from functools import partial
from pathlib import Path

from playwright.sync_api import sync_playwright

import os
import tempfile

# The built app lives at the repository root (two levels up from source/tools)
DIST = Path(__file__).resolve().parent.parent.parent
# Screenshots go to a temp folder, never into the repository
OUT = Path(os.environ.get("LIFTLOG_SHOTS", Path(tempfile.gettempdir()) / "lift-log-shots"))
OUT.mkdir(parents=True, exist_ok=True)
# Optional: a rounded font so screenshots look closer to the iPhone (SF Pro Rounded isn't on Linux).
# Get it with: npm pack @fontsource/nunito@5 && tar xzf fontsource-nunito-*.tgz  (then point LIFTLOG_FONTS at package/files)
FONTS = Path(os.environ.get("LIFTLOG_FONTS", Path(tempfile.gettempdir()) / "lift-log-fonts" / "package" / "files"))
IPHONE_UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 "
             "(KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(port=8765):
    handler = partial(Quiet, directory=str(DIST))
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


FONT_CSS = "".join(
    f"@font-face{{font-family:'TestRounded';font-weight:{w};src:url('data:font/woff2;base64,{{b64_{w}}}') format('woff2')}}"
    for w in (400, 600, 700, 800)
)


def font_css():
    import base64
    if not (FONTS / "nunito-latin-400-normal.woff2").exists():
        return ""  # fall back to the system font
    css = FONT_CSS
    for w in (400, 600, 700, 800):
        b = base64.b64encode((FONTS / f"nunito-latin-{w}-normal.woff2").read_bytes()).decode()
        css = css.replace(f"{{b64_{w}}}", b)
    return css + ":root{--font:'TestRounded',sans-serif}"


class Phone:
    def __init__(self, p, dark=False, port=8765, scale=2, sw=False):
        self.browser = p.chromium.launch()
        self.ctx = self.browser.new_context(
            viewport={"width": 440, "height": 956}, device_scale_factor=scale, is_mobile=True,
            has_touch=True, user_agent=IPHONE_UA, color_scheme="dark" if dark else "light",
            service_workers="allow" if sw else "block",
        )
        self.page = self.ctx.new_page()
        self.errors = []
        self.page.on("pageerror", lambda e: self.errors.append(f"pageerror: {e}"))
        self.page.on("console", lambda m: self.errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
        self.url = f"http://localhost:{port}/"
        self._font = font_css()

    def set_storage(self, state=None, clear=False):
        """Change saved data from a page that doesn't run the app, so the app can't write over it."""
        self.page.goto(self.url + "manifest.webmanifest")
        if clear:
            self.page.evaluate("localStorage.clear()")
        if state is not None:
            self.page.evaluate("s => localStorage.setItem('liftlog.v1', s)", state)

    def open(self, hash_="#/", state=None):
        if state is not None:
            self.set_storage(state)
        self.page.goto(self.url + hash_)
        if self._font:
            self.page.add_style_tag(content=self._font)
        self.page.wait_for_timeout(250)
        return self

    def shot(self, name, full=False):
        path = OUT / f"{name}.png"
        self.page.screenshot(path=str(path), full_page=full)
        return path

    def state(self):
        import json
        return json.loads(self.page.evaluate("localStorage.getItem('liftlog.v1')"))

    def close(self):
        self.browser.close()
