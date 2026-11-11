# La Bodeguita de la Esquina Â· web

Web de la cafeterÃ­a-bar La Bodeguita de la Esquina (C/ BenicarlÃ³, 25, Benimaclet, ValÃ¨ncia), para
https://labodeguitadelaesquina.com. HTML, CSS y JS a mano, sin frameworks ni paso de build.

## Reglas

- La web estÃ¡ en `web/` y se sube tal cual a `public_html` de Hostinger. `material/`, `pruebas/`,
  `kit-grupo-hostelero-friser/` y los `.md` no se suben.
- Nada inventado: ni platos, ni precios, ni alÃ©rgenos, ni reseÃ±as, ni servicios.
- En `web/` no puede verse ningÃºn marcador `[[`.
- NingÃºn crÃ©dito de quien ha hecho la web, en ningÃºn sitio: textos, metadatos, comentarios ni nombres de
  archivo.
- `/mesa` y `/barra` son las redirecciones de las pegatinas NFC en `.htaccess`. No se cambian sin
  pedirlo y nunca se crean como carpetas. Lo mismo vale para `/ir/â€¦` (locales del grupo).
- Con la CSP del `.htaccess` no puede haber `style` ni `script` en lÃ­nea (el JSON-LD sÃ­). Si algo choca,
  se ajusta la directiva concreta, no se quita.
- Sin peticiones a terceros antes del consentimiento: nada de Google Fonts, CDN, analÃ­tica ni pÃ­xeles.
  Google Maps solo se carga si se acepta.
- Solo castellano de EspaÃ±a, tratando de tÃº. Las respuestas, los botones y los avisos hablan de tÃº; solo las preguntas del cliente al local de la FAQ conservan Â«Â¿TenÃ©isâ€¦?Â» y Â«Â¿PonÃ©isâ€¦?Â». El JSON-LD de la FAQ sale del mismo texto y debe coincidir palabra por palabra. Bizum solo aparece como Â«Bizum noÂ» (FAQ).

## Estructura

- PÃ¡ginas: `index.html`, `carta/`, `como-llegar/`, `preguntas-frecuentes/`, `aviso-legal/`,
  `privacidad/`, `cookies/` y `404.html`. La cabecera, el pie, la barra mÃ³vil y el banner de cookies estÃ¡n
  repetidos en cada HTML: si se cambian, se cambian en todas las pÃ¡ginas.
- CSS: `assets/css/base.css` (tokens, componentes, impresiÃ³n) y `carta.css` (solo /carta/).
- JS (todo con `defer`): `main.js` (menÃº y apariciÃ³n de secciones), `cookies.js` (consentimiento y mapa),
  `horario.js` (estado Â«abierto ahoraÂ», funciÃ³n pura con tests) y `carta.js` (chips de la carta).
- Iconos: sprite `assets/iconos/iconos.svg`, que se usa con `<use href="/assets/iconos/iconos.svg#id">`.
- Fotos del local en `assets/img/` y marca en `assets/marca/`. Las fotos del local se sustituyen siempre
  con el mismo nombre y la misma proporciÃ³n. El encuadre de cada una estÃ¡ en las variables `--foco-*` de
  `base.css`.
- Inicio precarga tambiÃ©n Libre Baskerville (la usa el Ã³valo de la portada): sin ello el Ã³valo cambiaba de alto al cargar la fuente y la home perdÃ­a CLS 0. La portada lleva `background-color` marrÃ³n y degradado detrÃ¡s de la foto.
- Texto: nada visible baja de 13 px (salvo lo marcado solo para lectores). /carta/ mide como mÃ¡ximo 960 px de ancho y sus pestaÃ±as (Tostadas, Bocadillos, Dulces y cafÃ©s) quedan fijas bajo la cabecera, con `--alto-chips` para el desplazamiento de anclas.
- BotÃ³n flotante de cookies: solo existe desde 1280 px (por debajo es `display: none`): hace falta que el hueco lateral del contenido (1152 px) sea mayor que el botÃ³n con su zona pulsable (54 px a cada lado), contando una barra de scroll de unos 15 px; a 1184 y a 1260 px solapaba texto. AdemÃ¡s se esconde (`.cookies-fab--oculto`) mientras pasa sobre la foto a todo el ancho de la portada o del cierre de Inicio; abajo a la izquierda, 40 px, con zona pulsable de 44 px (`::after`). En mÃ³vil el acceso es Â«Configurar cookiesÂ» (`<li class="nav__cookies">`, despuÃ©s de Inicio, Carta, CÃ³mo llegar y Preguntas frecuentes y antes de los botones Llamar y WhatsApp), y el del pie. Entre 832 y 1279 px el Ãºnico acceso a las cookies es el enlace del pie. En escritorio la cabecera lleva solo Carta, CÃ³mo llegar, Preguntas frecuentes y Llamar, siempre en una sola lÃ­nea (entre 832 y 1023 px se ajustan logo y tipografÃ­a); `Inicio` y `Configurar cookies` solo existen en el menÃº mÃ³vil. Desde el menÃº, al abrirse el panel el foco entra en Ã©l y al cerrarlo vuelve al botÃ³n de la hamburguesa.
- MenÃº mÃ³vil: al abrirse atenÃºa la pÃ¡gina (`.menu-fondo`, negro al 55 %, entre la cabecera y la barra inferior), bloquea el scroll del fondo (`html.menu-abierto`, solo por debajo de 52rem), atrapa el foco y se cierra con Esc, tocando fuera o eligiendo una opciÃ³n; `aria-expanded` y la etiqueta del botÃ³n van siempre sincronizados.
- /carta/: al pulsar una pestaÃ±a el foco pasa al `h2` de la secciÃ³n (`tabindex="-1"`); sin JS funciona como ancla normal.
- Home en mÃ³vil (< 700 px): Â«Lo que encontrarÃ¡sÂ» es un carrusel horizontal con `scroll-snap`, tarjetas del 82 % y `tabindex="0"` en el contenedor, que `main.js` quita por encima de 700 px.
- Imagen para redes: `assets/marca/og-image.jpg` mide 1200 x 630, pesa unos 84 KB y estÃ¡ hecha con la cartela, Cinzel y Source Sans 3 (JPEG 4:4:4); `og:image:width/height` deben seguir siendo 1200 y 630.
- TÃ­tulos legales: los nÃºmeros de los `h2` (`1.`, `2.`â€¦) van en `<span class="num">` con Source Sans 3 en negrita, porque en Cinzel el 1 se lee como una I.
- Zona pulsable: todo enlace o botÃ³n mide al menos 44 x 44 px en mÃ³vil (los enlaces en lÃ­nea la amplÃ­an con un `::after` de `base.css`, sin cambiar el aspecto). El pie y el panel de cookies no llevan `h1`â€“`h6`: sus tÃ­tulos son `<p class="pie__titulo">` y `<p class="cookies-panel__titulo">`.
- MÃ³vil: el banner de cookies ocupa como mÃ¡ximo el 22 % de la altura y queda sobre la barra inferior (`--alto-barra`); la portada limita la foto a `min(42svh, 340px)` (`--foto-movil`) para que estado, `h1` y botones se vean sin scroll a 375 Ã— 667 con el banner ya cerrado.
- `robots.txt` solo lleva `Allow: /` y el sitemap. El `.htaccess` de `web/` no aÃ±ade `X-Robots-Tag`. En `hostingersite.com` Hostinger sirve su propio `robots.txt` con `Disallow: /` para Googlebot, aunque el archivo sea correcto: en el dominio propio no pasa.
- TipografÃ­as de /carta/: solo Cinzel y Source Sans 3 (Libre Baskerville no se usa en esa pÃ¡gina).

## Fotos de platos

- Llegan a `material/platos/` con el slug del plato como nombre (por ejemplo, `chivito-bodeguita.jpg`;
  la lista estÃ¡ en `material/platos/LEEME.txt`), en original y de calidad desigual.
- **Procedimiento (el script no publica nada):**
  1. Primera vez, en una terminal: `cd herramientas && npm install`.
  2. Desde la raÃ­z del proyecto: `node herramientas/procesar-fotos-platos.js`
     (opciones: `--entrada material/platos`, `--salida herramientas/salida`, `--centro` para recorte centrado
     en vez de hacia el detalle).
  3. El script comprueba el lado largo (â‰¥ 1600 px) y la nitidez (varianza del laplaciano â‰¥ 100; entre 40 y
     100 revisar; por debajo, no apta), recorta a 4:3, genera `<slug>-600/1000.webp` y `.jpg` sin metadatos en
     `herramientas/salida/` y escribe `tabla-resultado.md` y `revision.html`. No escribe nunca en `web/`.
  4. Â«Plato enteroÂ», Â«sin personasÂ» y Â«sin pantallasÂ» NO los mide el script: se revisan a mano en
     `revision.html`. EnseÃ±a la tabla y espera la aprobaciÃ³n antes de copiar nada a `web/assets/img/platos/`.
  5. Los HEIC no se leen: hay que convertirlos a JPG. Los nombres que no coinciden con un slug o las fotos
     repetidas salen como Â«PREGUNTARÂ».
- Cada categorÃ­a de /carta/ tiene dos listas: primero `<ul class="platos platos--fotos">` con los platos que
  tienen foto, y debajo `<ul class="platos platos--lista">` con los que no. Si ninguno de la categorÃ­a tiene
  foto, solo la lista. Un plato que gana foto sale de la lista y entra en la cuadrÃ­cula; el orden de la carta
  impresa solo se conserva dentro de cada lista.
- Un plato con foto es exactamente este `<li>` (el `id` es el slug; la primera foto de la pÃ¡gina no lleva
  `loading="lazy"` y el resto sÃ­; el `alt` describe lo que se ve en la foto):

```html
<li class="plato plato--con-foto" id="SLUG"><picture class="plato__foto"><source type="image/webp" srcset="/assets/img/platos/SLUG-600.webp 600w, /assets/img/platos/SLUG-1000.webp 1000w" sizes="(min-width: 900px) 440px, 100vw"><img src="/assets/img/platos/SLUG-1000.jpg" srcset="/assets/img/platos/SLUG-600.jpg 600w, /assets/img/platos/SLUG-1000.jpg 1000w" sizes="(min-width: 900px) 440px, 100vw" width="1000" height="750" alt="â€¦" loading="lazy" decoding="async"></picture><div class="plato__texto"><div class="plato__fila"><h3 class="plato__nombre">NOMBRE</h3><span class="plato__precio">0,00&nbsp;â‚¬</span></div><p class="plato__desc">DescripciÃ³n, si la tiene</p></div></li>
```

- El CSS ya estÃ¡ en `base.css`: en mÃ³vil la foto va arriba a todo el ancho de la tarjeta; desde 900 px la
  cuadrÃ­cula es de 2 columnas con la foto a la izquierda, y si el nÃºmero de platos con foto es impar el
  Ãºltimo ocupa las dos columnas. El plato sin foto no lleva hueco ni marcador.
- Hay una maqueta con tres platos de prueba en `pruebas/carta-con-fotos.html` (fotos del local, no de los
  platos; no se publica). Sus fotos estÃ¡n en `pruebas/carta-fotos/`.
- AdemÃ¡s de la foto, el plato gana `image` en su `MenuItem` del JSON-LD.
- Si un nombre no coincide con ningÃºn slug, pregunta antes de asignarla.

## Cambios de carta o de precios

- Se hacen a la vez en /carta/ y en su JSON-LD.
- Revisa tambiÃ©n los textos que citan precios: la description y Â«De la cartaÂ» de Inicio, la tarjeta de
  tartas de Inicio y la pregunta 2 de la FAQ.
- Son 18 platos con precio. Â«CafÃ©s mÃ¡s elaboradosÂ» no lleva precio ni entra en el JSON-LD.

## VersiÃ³n en inglÃ©s (`web/en/`)

- No se edita a mano: la genera `node herramientas/generar-ingles.js` a partir de las pÃ¡ginas en espaÃ±ol, con los
  textos de `herramientas/traduccion-en.json` (Â«=Â» deja el texto igual). Si cambias o aÃ±ades un texto en espaÃ±ol,
  pon su traducciÃ³n en ese JSON y vuelve a ejecutar el script; si falta alguna, se detiene y dice cuÃ¡l.
- El script tambiÃ©n pone en todas las pÃ¡ginas (tambiÃ©n en las espaÃ±olas y en la 404) el cambio de idioma, siempre
  hacia la pÃ¡gina equivalente:
  - MÃ³vil y hasta 1119 px: botÃ³n de 44 px Â«ENÂ»/Â«ESÂ» junto al menÃº (entre 832 y 1119 px, entre el menÃº y Â«LlamarÂ»).
  - Desde 1120 px: conmutador de texto Â«ES Â· ENÂ» entre el menÃº y Â«LlamarÂ», con filete dorado. El idioma actual
    no es enlace y lleva `aria-current="true"`. MÃ¡s estrecho no cabe sin apretar el menÃº en espaÃ±ol.
  - Al final del menÃº desplegado, fila Â«EspaÃ±ol Â· EnglishÂ». En el pie, enlace Â«EnglishÂ»/Â«EspaÃ±olÂ».
  - Si cambias la cabecera, comprueba que el script sigue encontrando dÃ³nde ponerlos (si no, se detiene).
- Aviso Â«View this page in English â†’Â» (en /carta/, Â«View this menu in English â†’Â»): solo en las pÃ¡ginas en espaÃ±ol,
  bajo las migas (en Inicio, bajo la cabecera). Lo enseÃ±a `assets/js/idioma.js`, que va en el `<head>` sin `defer`
  para marcar `<html>` antes de pintar (sin saltos), si `navigator.language` no empieza por es, ca, gl ni eu.
  Nunca redirige; al cerrarlo no vuelve en esa sesiÃ³n (`sessionStorage`). Pensado para quien llega por el NFC.
- Rutas: `/en/`, `/en/menu/`, `/en/getting-here/`, `/en/faq/`, `/en/legal-notice/`, `/en/privacy/`, `/en/cookies/`.
  Precios en formato inglÃ©s (`â‚¬3.50`); direcciones y nombres propios en espaÃ±ol. Los legales en inglÃ©s llevan una
  nota de que prevalece la versiÃ³n en espaÃ±ol.
- Horas en formato inglÃ©s solo en el texto de /en/ (el script convierte todas las Â«h:mmÂ»): 24:00 â†’ Â«midnightÂ»,
  12:00 â†’ Â«12 noonÂ», el resto en 12 horas (Â«8 amÂ», Â«2 amÂ»). El JSON-LD y la versiÃ³n espaÃ±ola siguen en 24 horas.
- Decisiones de traducciÃ³n: Â«CafÃ© con lecheÂ» y Â«BocadillosÂ» se quedan en espaÃ±ol (bajo Â«BocadillosÂ», Â«Baguette
  sandwichesÂ»; la sobrasada lleva Â«Sobrasada is a soft cured pork sausageÂ»: son aÃ±adidos solo en inglÃ©s, en
  `SOLO_EN` del script). En el menÃº de la cabecera, Â«FAQÂ» se escribe Â«QuestionsÂ» porque la cola de la Â«QÂ» de
  Cinzel parecÃ­a un guion bajo (la variante ss01 es peor); el tÃ­tulo y las migas siguen siendo Â«FAQÂ».
- Los textos que escribe el JavaScript (estado de abierto/cerrado con horas en inglÃ©s, Â«HoyÂ», etiqueta del menÃº)
  eligen idioma por `<html lang>`.
- `node pruebas/verificar.js` comprueba (EN1 a EN10) que `web/en/` estÃ¡ al dÃ­a, sin restos de espaÃ±ol ni horas de
  24 horas, con enlaces, `hreflang` y cambio de idioma correctos en las 14 pÃ¡ginas, el aviso en las 7 espaÃ±olas y
  los mismos precios en cada pareja. El `sitemap.xml` lista las 14 pÃ¡ginas con sus alternativas.

## Cuando otro local del grupo estrene web

- Cambia su lÃ­nea `/ir/<slug>` del `.htaccess` por su dominio.
- Actualiza `kit-grupo-hostelero-friser/locales.json` y `htaccess-grupo.txt`.
- Recuerda que lo mismo hay que hacerlo en las demÃ¡s webs del grupo.

## DespuÃ©s de cualquier cambio

- Sube el `?v=` del CSS y el JS (estÃ¡ en todos los HTML; hay que cambiarlo en todos a la vez). Si el cambio es el mismo dÃ­a, aÃ±ade una letra o un punto al final (`20261111b`): el `.htaccess` da cachÃ© de un aÃ±o e `immutable` a todo recurso con `?v=`, asÃ­ que sin cambiar el valor el navegador no verÃ¡ el cambio.
- Actualiza `lastmod` en `sitemap.xml` y la fecha de Â«Ãšltima actualizaciÃ³nÂ» si se tocan los legales.
- Repite la verificaciÃ³n.

## VerificaciÃ³n final (obligatoria)

Comprueba cada punto con tus herramientas de bÃºsqueda o con un script, y corrige antes de entregar.
Los scripts de `pruebas/` hacen casi todo: `node pruebas/verificar.js` (puntos 1 a 8, 10, 12 y 13),
`node pruebas/horario.test.js` (punto 9; incluye los cambios de hora y cualquier zona del equipo) y `node pruebas/contraste.js` (punto 11).

1. No hay `name="author"` ni `name="generator"`, ni textos tipo Â«diseÃ±ado porÂ», Â«desarrollado porÂ»,
   Â«hecho porÂ» o Â«powered byÂ» en `web/`.
2. Â«BizumÂ» solo aparece como Â«Bizum noÂ».
3. No aparecen Â«HalloweenÂ», Â«NavidadÂ», Â«estufaÂ», Â«tapasÂ», Â«montaditoÂ» ni Â«racionesÂ» en `web/`.
4. No queda ningÃºn `[[` en `web/`.
5. Los platos y precios de /carta/ (HTML y JSON-LD) coinciden con las tablas de la carta: 18 platos con
   precio, ni uno mÃ¡s ni uno menos.
6. Cada pÃ¡gina tiene un `title` y una `description` Ãºnicos; un solo `h1`; todas las `<img>` con `alt`;
   y ningÃºn enlace interno roto (`/mesa`, `/barra` e `/ir/â€¦` son redirecciones del `.htaccess`, no
   archivos).
7. Existen `robots.txt`, `sitemap.xml`, `site.webmanifest` y `404.html`, y las reglas de `/mesa`,
   `/barra` e `/ir/â€¦` estÃ¡n en el `.htaccess`, sin cÃ³digos tipo `%20` en los destinos.
8. Antes del consentimiento, ningÃºn `src`, hoja de estilos, `preload`, `@import`, `url()`, `fetch` ni
   `iframe` apunta fuera del dominio. Los enlaces `<a>` a Google o WhatsApp no cuentan.
9. Pasan las pruebas de `horario.js`: sÃ¡bado a la 1:30 abierto; domingo a la 1:30 abierto; viernes a la
   1:30 cerrado; lunes a las 0:30 cerrado; y los bordes 7:59, 8:00, 23:59, 2:00 y, en domingo, 11:59 y
   12:00. El cÃ¡lculo usa siempre `Intl.DateTimeFormat` con `Europe/Madrid`, sin depender de la hora del dispositivo.
10. Todo el JSON-LD se parsea sin errores y usa los tipos indicados (`CafeOrCoffeeShop` y `BarOrPub`,
    `Menu`, `FAQPage`, `BreadcrumbList`; sin `aggregateRating` ni `review`).
11. Contraste AA de todas las combinaciones de texto, en claro y en oscuro, calculado con la fÃ³rmula
    WCAG.
12. /carta/ pesa menos de 200 KB en la primera carga y no tiene desplazamiento lateral a 360 px.
13. El kit `kit-grupo-hostelero-friser/` estÃ¡ completo: `bloque-grupo.html` y `.css`, `iconos/`, `logos/`,
    `locales.json`, `htaccess-grupo.txt` y `LEEME.md`.

## PublicaciÃ³n en GitHub Pages

- Repositorio: https://github.com/innpactcompany-source/labodeguitadelaesquina (pÃºblico, rama `main`). Git de este
  proyecto usa solo en local el correo `innpactcompany@gmail.com`.
- Cada subida a `main` que toque `web/` o el flujo lanza `.github/workflows/pages.yml`, que prepara una copia de
  `web/` con `.github/scripts/preparar-pages.js` y la publica. No hay compilaciÃ³n. Para publicar un cambio:
  `git add -A && git commit -m "â€¦" && git push` (con `gh` ya autorizado en este equipo).
- GitHub Pages no lee `.htaccess`: la copia publicada convierte `/mesa`, `/barra` e `/ir/<local>` en pÃ¡ginas HTML
  de redirecciÃ³n (meta refresh) y no aplica la CSP ni las cabeceras de cachÃ©. `web/` no cambia: el `.htaccess`
  sigue siendo la referencia si algÃºn dÃ­a se vuelve a Hostinger.
- URL temporal: https://innpactcompany-source.github.io/labodeguitadelaesquina/ (rutas reescritas con el prefijo del
  repositorio, `noindex` y `robots.txt` que lo bloquea todo).
- Estado (2026-10-31): dominio ya conectado, `DOMINIO` definido, certificado aprobado y Â«Enforce HTTPSÂ» activo. La web
  sirve desde https://labodeguitadelaesquina.com/. La URL temporal de arriba queda redirigida por GitHub al dominio.
  Para volver a conectar un dominio nuevo, estos son los pasos:
- Dominio propio: con el DNS ya apuntando a GitHub, definir la variable de Actions `DOMINIO=labodeguitadelaesquina.com`,
  poner el dominio en Settings > Pages (o con `gh api -X PUT repos/innpactcompany-source/labodeguitadelaesquina/pages -f cname=labodeguitadelaesquina.com`),
  relanzar el flujo y activar Â«Enforce HTTPSÂ». Con la variable definida las rutas quedan en la raÃ­z y el `robots.txt`
  vuelve a permitir todo.
