# -*- coding: utf-8 -*-
"""本地刷题网站服务器。
用法：python server.py
然后浏览器打开 http://localhost:8080
"""
import http.server
import socketserver
import os
import webbrowser
import threading

PORT = 9876
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def end_headers(self):
        # 允许 CORS，方便本地调试
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        # 简化日志输出
        print(f"  [{args[1]}] {args[0]}")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    url = f"http://localhost:{PORT}"
    print(f"\n  刷题网站已启动 -> {url}")
    print("  按 Ctrl+C 停止服务\n")
    # 自动打开浏览器
    threading.Timer(1, lambda: webbrowser.open(url)).start()
    httpd.serve_forever()
