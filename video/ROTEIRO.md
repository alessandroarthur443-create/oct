# Vídeo "Esse é o Zé" — roteiro de narração (~37 s, 9:16)

Arquivos:
- `video_com_voz.mp4` — narração com voz sintética + música + efeitos
- `video_sem_voz.mp4` — só música + efeitos + legendas (para gravar sua própria voz no CapCut/Instagram)

Texto para gravar (siga o ritmo das legendas):

1. Esse é o Zé.
2. O trabalho do Zé é levar dinheiro pra quem faz o comércio girar.
3. Todo dia ele sobe na moto e sai rodando pela cidade.
4. Primeira parada: a padaria do seu Antônio.
5. Com o dinheiro, ele comprou um forno novo. Agora o pão sai quentinho o dia todo!
6. Depois, o mercadinho da dona Maria.
7. Prateleira cheia, cliente voltando e o caixa girando!
8. E ainda dá tempo de passar na lojinha da Carla.
9. Coleção nova na vitrine e as vendas lá em cima!
10. Sem fila de banco, sem perder o dia de trabalho.
11. O Zé vai até você.
12. Quer o Zé no seu comércio também?
13. Agende sua visita!

## Como regerar
Edite `roteiro.py` (falas, texto do botão) e rode:

    python3 build_audio.py && node render.js
    ffmpeg -i build/video_mudo.mp4 -i build/mix_com_voz.wav -c:v copy -c:a aac -shortest video_com_voz.mp4

Requer: espeak-ng + mbrola-br1, ffmpeg, Node + Playwright (Chromium), Python com numpy.
