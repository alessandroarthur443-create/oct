# Vídeo "Esse é o Zé" — 9:16 para Reels

## Versões
- `video_3d_com_voz.mp4` — **versão nova**: animação 3D (luz do sol, sombras, rua, lojas) + voz neural humana (Piper "cadu", pt-BR)
- `video_3d_sem_voz.mp4` — mesma animação 3D, só música e efeitos (para gravar sua própria voz)
- `video_com_voz.mp4` / `video_sem_voz.mp4` — versão antiga, desenho 2D

## Narração
1. Esse aqui é o Zé.
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
12. E aí, quer o Zé no seu comércio também?
13. Então, agende sua visita!

## Como regerar
Edite `roteiro.py` (falas, texto do botão) e rode:

    python3 build_audio.py          # voz + música + timeline
    node render3d.js                # vídeo 3D -> build/video3d_mudo.mp4
    ffmpeg -i build/video3d_mudo.mp4 -i build/mix_com_voz.wav -c:v copy -c:a aac -shortest video_3d_com_voz.mp4

Requer: `pip install piper-tts`, vozes Piper em `vozes/` (ex.: vits-piper-pt_BR-cadu-medium dos releases do sherpa-onnx),
ffmpeg, Node + Playwright (Chromium) e `npm install` (three.js).
