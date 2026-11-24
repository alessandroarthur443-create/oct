# Urso Motos — site

Site da **Urso Motos** (oficina de motos, peças e serviços — Guarulhos/SP, desde 1997).
Visual premium em preto, vermelho e branco, com painel do administrador para controle de peças.

## Páginas
- `index.html` — site público: serviços, peças disponíveis (vindas do painel), sobre, contato e mapa.
- `admin.html` — painel do dono (botão **Admin** no menu).

## Painel do administrador
- **Senha inicial:** `urso1997` — troque em *Configurações* no primeiro acesso.
- **Entrada / Venda:** registra peças que chegaram (somam ao estoque) e peças vendidas (saem do estoque).
- **Peças:** cadastrar, editar, excluir e escolher se aparece no site.
- **Histórico:** filtro por tipo e período, totais, desfazer lançamento e exportar CSV (abre no Excel).
- **Configurações:** número de WhatsApp (ativa os botões "Consultar" pelo WhatsApp), senha e backup.

> Importante: os dados ficam salvos **no navegador** onde o painel é usado (localStorage).
> O site público só mostra as peças cadastradas nesse mesmo navegador. Para publicar o estoque
> para todos os clientes na internet é preciso ligar o painel a um banco de dados online
> (ex.: Firebase/Supabase). Use *Exportar backup* com frequência.

## Rodar localmente
Abra `index.html` no navegador, ou:

```bash
python3 -m http.server 8000
```
