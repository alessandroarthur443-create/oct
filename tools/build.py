"""Gera baixar/urso-motos-SITE.html e baixar/urso-motos-ADMIN.html (arquivos únicos, abrem com 2 cliques)."""
import base64, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
logo = 'data:image/svg+xml;base64,' + base64.b64encode(open('assets/logo.svg', 'rb').read()).decode()
css, store = open('css/style.css').read(), open('js/store.js').read()
def build(src, js, out):
    h = open(src).read()
    h = h.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
    h = h.replace('<script src="js/store.js"></script>', '<script>\n' + store + '\n</script>')
    h = h.replace(f'<script src="js/{js}"></script>', '<script>\n' + open('js/' + js).read() + '\n</script>')
    h = h.replace('assets/logo.svg', logo)
    h = h.replace('href="admin.html"', 'href="urso-motos-ADMIN.html"').replace('href="index.html"', 'href="urso-motos-SITE.html"')
    os.makedirs('baixar', exist_ok=True); open(out, 'w').write(h)
build('index.html', 'site.js', 'baixar/urso-motos-SITE.html')
build('admin.html', 'admin.js', 'baixar/urso-motos-ADMIN.html')
print('ok')
