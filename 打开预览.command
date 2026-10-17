#!/bin/zsh
cd -- "$(dirname -- "$0")"
print 'K pro 网页 Demo'
print '请在浏览器打开 http://127.0.0.1:4173/'
print '按 Ctrl+C 停止本机预览。'
python3 -m http.server 4173 --bind 127.0.0.1
