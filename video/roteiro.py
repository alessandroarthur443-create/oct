# Roteiro do vídeo. Palavras entre *asteriscos* ficam amarelas na legenda.
# "tts" (opcional) é o texto falado quando precisa ser diferente da legenda.

CENAS = [
    {"tipo": "intro", "lead": 0.35, "tail": 0.6, "falas": [
        {"txt": "Esse é o *Zé*."},
    ]},
    {"tipo": "dinheiro", "lead": 0.15, "tail": 0.3, "falas": [
        {"txt": "O trabalho do Zé é levar *dinheiro* pra quem faz o *comércio girar*."},
    ]},
    {"tipo": "rodando", "lead": 0.2, "tail": 0.3, "falas": [
        {"txt": "Todo dia ele sobe na *moto* e sai rodando pela cidade."},
    ]},
    {"tipo": "loja", "loja": "padaria", "lead": 1.4, "tail": 0.6, "falas": [
        {"txt": "Primeira parada: a *padaria* do seu Antônio."},
        {"txt": "Com o dinheiro, ele comprou um *forno novo*. Agora o pão sai *quentinho* o dia todo!"},
    ]},
    {"tipo": "loja", "loja": "mercado", "lead": 1.4, "tail": 0.6, "falas": [
        {"txt": "Depois, o *mercadinho* da dona Maria."},
        {"txt": "Prateleira *cheia*, cliente voltando e o caixa *girando*!"},
    ]},
    {"tipo": "loja", "loja": "roupas", "lead": 1.4, "tail": 0.6, "falas": [
        {"txt": "E ainda dá tempo de passar na *lojinha* da Carla."},
        {"txt": "Coleção *nova* na vitrine e as vendas *lá em cima*!"},
    ]},
    {"tipo": "resumo", "lead": 0.2, "tail": 0.4, "falas": [
        {"txt": "Sem *fila de banco*, sem perder o dia de trabalho."},
        {"txt": "O Zé *vai até você*."},
    ]},
    {"tipo": "cta", "lead": 0.2, "tail": 3.0, "falas": [
        {"txt": "Quer o Zé no *seu comércio* também?"},
        {"txt": "*Agende sua visita*!", "semLegenda": True},
    ]},
]

# Texto do final (botão) — troque à vontade
CTA_BOTAO = "AGENDE SUA VISITA"
CTA_SUB = "Chame no WhatsApp • link na bio"
