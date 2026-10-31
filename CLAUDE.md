# La Bodeguita de la Esquina · web

Web de la cafetería-bar La Bodeguita de la Esquina (C/ Benicarló, 25, Benimaclet, València), para
https://labodeguitadelaesquina.com. HTML, CSS y JS a mano, sin frameworks ni paso de build.

## Reglas

- La web está en `web/` y se sube tal cual a `public_html` de Hostinger. `material/`, `pruebas/`,
  `kit-grupo-hostelero-friser/` y los `.md` no se suben.
- Nada inventado: ni platos, ni precios, ni alérgenos, ni reseñas, ni servicios.
- En `web/` no puede verse ningún marcador `[[`.
- Ningún crédito de quien ha hecho la web, en ningún sitio: textos, metadatos, comentarios ni nombres de
  archivo.
- `/mesa` y `/barra` son las redirecciones de las pegatinas NFC en `.htaccess`. No se cambian sin
  pedirlo y nunca se crean como carpetas. Lo mismo vale para `/ir/…` (locales del grupo).
- Con la CSP del `.htaccess` no puede haber `style` ni `script` en línea (el JSON-LD sí). Si algo choca,
  se ajusta la directiva concreta, no se quita.
- Sin peticiones a terceros antes del consentimiento: nada de Google Fonts, CDN, analítica ni píxeles.
  Google Maps solo se carga si se acepta.
- Solo castellano de España, tratando de tú. Las respuestas, los botones y los avisos hablan de tú; solo las preguntas del cliente al local de la FAQ conservan «¿Tenéis…?» y «¿Ponéis…?». El JSON-LD de la FAQ sale del mismo texto y debe coincidir palabra por palabra. Bizum solo aparece como «Bizum no» (FAQ).

## Estructura

- Páginas: `index.html`, `carta/`, `como-llegar/`, `preguntas-frecuentes/`, `aviso-legal/`,
  `privacidad/`, `cookies/` y `404.html`. La cabecera, el pie, la barra móvil y el banner de cookies están
  repetidos en cada HTML: si se cambian, se cambian en todas las páginas.
- CSS: `assets/css/base.css` (tokens, componentes, impresión) y `carta.css` (solo /carta/).
- JS (todo con `defer`): `main.js` (menú y aparición de secciones), `cookies.js` (consentimiento y mapa),
  `horario.js` (estado «abierto ahora», función pura con tests) y `carta.js` (chips de la carta).
- Iconos: sprite `assets/iconos/iconos.svg`, que se usa con `<use href="/assets/iconos/iconos.svg#id">`.
- Fotos del local en `assets/img/` y marca en `assets/marca/`. Las fotos del local se sustituyen siempre
  con el mismo nombre y la misma proporción. El encuadre de cada una está en las variables `--foco-*` de
  `base.css`.
- Inicio precarga también Libre Baskerville (la usa el óvalo de la portada): sin ello el óvalo cambiaba de alto al cargar la fuente y la home perdía CLS 0. La portada lleva `background-color` marrón y degradado detrás de la foto.
- Texto: nada visible baja de 13 px (salvo lo marcado solo para lectores). /carta/ mide como máximo 960 px de ancho y sus pestañas (Tostadas, Bocadillos, Dulces y cafés) quedan fijas bajo la cabecera, con `--alto-chips` para el desplazamiento de anclas.
- Botón flotante de cookies: solo existe desde 1280 px (por debajo es `display: none`): hace falta que el hueco lateral del contenido (1152 px) sea mayor que el botón con su zona pulsable (54 px a cada lado), contando una barra de scroll de unos 15 px; a 1184 y a 1260 px solapaba texto. Además se esconde (`.cookies-fab--oculto`) mientras pasa sobre la foto a todo el ancho de la portada o del cierre de Inicio; abajo a la izquierda, 40 px, con zona pulsable de 44 px (`::after`). En móvil el acceso es «Configurar cookies» (`<li class="nav__cookies">`, después de Inicio, Carta, Cómo llegar y Preguntas frecuentes y antes de los botones Llamar y WhatsApp), y el del pie. Entre 832 y 1279 px el único acceso a las cookies es el enlace del pie. En escritorio la cabecera lleva solo Carta, Cómo llegar, Preguntas frecuentes y Llamar, siempre en una sola línea (entre 832 y 1023 px se ajustan logo y tipografía); `Inicio` y `Configurar cookies` solo existen en el menú móvil. Desde el menú, al abrirse el panel el foco entra en él y al cerrarlo vuelve al botón de la hamburguesa.
- Menú móvil: al abrirse atenúa la página (`.menu-fondo`, negro al 55 %, entre la cabecera y la barra inferior), bloquea el scroll del fondo (`html.menu-abierto`, solo por debajo de 52rem), atrapa el foco y se cierra con Esc, tocando fuera o eligiendo una opción; `aria-expanded` y la etiqueta del botón van siempre sincronizados.
- /carta/: al pulsar una pestaña el foco pasa al `h2` de la sección (`tabindex="-1"`); sin JS funciona como ancla normal.
- Home en móvil (< 700 px): «Lo que encontrarás» es un carrusel horizontal con `scroll-snap`, tarjetas del 82 % y `tabindex="0"` en el contenedor, que `main.js` quita por encima de 700 px.
- Imagen para redes: `assets/marca/og-image.jpg` mide 1200 x 630, pesa unos 84 KB y está hecha con la cartela, Cinzel y Source Sans 3 (JPEG 4:4:4); `og:image:width/height` deben seguir siendo 1200 y 630.
- Títulos legales: los números de los `h2` (`1.`, `2.`…) van en `<span class="num">` con Source Sans 3 en negrita, porque en Cinzel el 1 se lee como una I.
- Zona pulsable: todo enlace o botón mide al menos 44 x 44 px en móvil (los enlaces en línea la amplían con un `::after` de `base.css`, sin cambiar el aspecto). El pie y el panel de cookies no llevan `h1`–`h6`: sus títulos son `<p class="pie__titulo">` y `<p class="cookies-panel__titulo">`.
- Móvil: el banner de cookies ocupa como máximo el 22 % de la altura y queda sobre la barra inferior (`--alto-barra`); la portada limita la foto a `min(42svh, 340px)` (`--foto-movil`) para que estado, `h1` y botones se vean sin scroll a 375 × 667 con el banner ya cerrado.
- `robots.txt` solo lleva `Allow: /` y el sitemap. El `.htaccess` de `web/` no añade `X-Robots-Tag`. En `hostingersite.com` Hostinger sirve su propio `robots.txt` con `Disallow: /` para Googlebot, aunque el archivo sea correcto: en el dominio propio no pasa.
- Tipografías de /carta/: solo Cinzel y Source Sans 3 (Libre Baskerville no se usa en esa página).

## Fotos de platos

- Llegan a `material/platos/` con el slug del plato como nombre (por ejemplo, `chivito-bodeguita.jpg`;
  la lista está en `material/platos/LEEME.txt`), en original y de calidad desigual.
- **Procedimiento (el script no publica nada):**
  1. Primera vez, en una terminal: `cd herramientas && npm install`.
  2. Desde la raíz del proyecto: `node herramientas/procesar-fotos-platos.js`
     (opciones: `--entrada material/platos`, `--salida herramientas/salida`, `--centro` para recorte centrado
     en vez de hacia el detalle).
  3. El script comprueba el lado largo (≥ 1600 px) y la nitidez (varianza del laplaciano ≥ 100; entre 40 y
     100 revisar; por debajo, no apta), recorta a 4:3, genera `<slug>-600/1000.webp` y `.jpg` sin metadatos en
     `herramientas/salida/` y escribe `tabla-resultado.md` y `revision.html`. No escribe nunca en `web/`.
  4. «Plato entero», «sin personas» y «sin pantallas» NO los mide el script: se revisan a mano en
     `revision.html`. Enseña la tabla y espera la aprobación antes de copiar nada a `web/assets/img/platos/`.
  5. Los HEIC no se leen: hay que convertirlos a JPG. Los nombres que no coinciden con un slug o las fotos
     repetidas salen como «PREGUNTAR».
- Cada categoría de /carta/ tiene dos listas: primero `<ul class="platos platos--fotos">` con los platos que
  tienen foto, y debajo `<ul class="platos platos--lista">` con los que no. Si ninguno de la categoría tiene
  foto, solo la lista. Un plato que gana foto sale de la lista y entra en la cuadrícula; el orden de la carta
  impresa solo se conserva dentro de cada lista.
- Un plato con foto es exactamente este `<li>` (el `id` es el slug; la primera foto de la página no lleva
  `loading="lazy"` y el resto sí; el `alt` describe lo que se ve en la foto):

```html
<li class="plato plato--con-foto" id="SLUG"><picture class="plato__foto"><source type="image/webp" srcset="/assets/img/platos/SLUG-600.webp 600w, /assets/img/platos/SLUG-1000.webp 1000w" sizes="(min-width: 900px) 440px, 100vw"><img src="/assets/img/platos/SLUG-1000.jpg" srcset="/assets/img/platos/SLUG-600.jpg 600w, /assets/img/platos/SLUG-1000.jpg 1000w" sizes="(min-width: 900px) 440px, 100vw" width="1000" height="750" alt="…" loading="lazy" decoding="async"></picture><div class="plato__texto"><div class="plato__fila"><h3 class="plato__nombre">NOMBRE</h3><span class="plato__precio">0,00&nbsp;€</span></div><p class="plato__desc">Descripción, si la tiene</p></div></li>
```

- El CSS ya está en `base.css`: en móvil la foto va arriba a todo el ancho de la tarjeta; desde 900 px la
  cuadrícula es de 2 columnas con la foto a la izquierda, y si el número de platos con foto es impar el
  último ocupa las dos columnas. El plato sin foto no lleva hueco ni marcador.
- Hay una maqueta con tres platos de prueba en `pruebas/carta-con-fotos.html` (fotos del local, no de los
  platos; no se publica). Sus fotos están en `pruebas/carta-fotos/`.
- Además de la foto, el plato gana `image` en su `MenuItem` del JSON-LD.
- Si un nombre no coincide con ningún slug, pregunta antes de asignarla.

## Cambios de carta o de precios

- Se hacen a la vez en /carta/ y en su JSON-LD.
- Revisa también los textos que citan precios: la description y «De la carta» de Inicio, la tarjeta de
  tartas de Inicio y la pregunta 2 de la FAQ.
- Son 18 platos con precio. «Cafés más elaborados» no lleva precio ni entra en el JSON-LD.

## Cuando otro local del grupo estrene web

- Cambia su línea `/ir/<slug>` del `.htaccess` por su dominio.
- Actualiza `kit-grupo-hostelero-friser/locales.json` y `htaccess-grupo.txt`.
- Recuerda que lo mismo hay que hacerlo en las demás webs del grupo.

## Después de cualquier cambio

- Sube el `?v=` del CSS y el JS (está en todos los HTML; hay que cambiarlo en todos a la vez). Si el cambio es el mismo día, añade una letra o un punto al final (`20261026h`): el `.htaccess` da caché de un año e `immutable` a todo recurso con `?v=`, así que sin cambiar el valor el navegador no verá el cambio.
- Actualiza `lastmod` en `sitemap.xml` y la fecha de «Última actualización» si se tocan los legales.
- Repite la verificación.

## Verificación final (obligatoria)

Comprueba cada punto con tus herramientas de búsqueda o con un script, y corrige antes de entregar.
Los scripts de `pruebas/` hacen casi todo: `node pruebas/verificar.js` (puntos 1 a 8, 10, 12 y 13),
`node pruebas/horario.test.js` (punto 9; incluye los cambios de hora y cualquier zona del equipo) y `node pruebas/contraste.js` (punto 11).

1. No hay `name="author"` ni `name="generator"`, ni textos tipo «diseñado por», «desarrollado por»,
   «hecho por» o «powered by» en `web/`.
2. «Bizum» solo aparece como «Bizum no».
3. No aparecen «Halloween», «Navidad», «estufa», «tapas», «montadito» ni «raciones» en `web/`.
4. No queda ningún `[[` en `web/`.
5. Los platos y precios de /carta/ (HTML y JSON-LD) coinciden con las tablas de la carta: 18 platos con
   precio, ni uno más ni uno menos.
6. Cada página tiene un `title` y una `description` únicos; un solo `h1`; todas las `<img>` con `alt`;
   y ningún enlace interno roto (`/mesa`, `/barra` e `/ir/…` son redirecciones del `.htaccess`, no
   archivos).
7. Existen `robots.txt`, `sitemap.xml`, `site.webmanifest` y `404.html`, y las reglas de `/mesa`,
   `/barra` e `/ir/…` están en el `.htaccess`, sin códigos tipo `%20` en los destinos.
8. Antes del consentimiento, ningún `src`, hoja de estilos, `preload`, `@import`, `url()`, `fetch` ni
   `iframe` apunta fuera del dominio. Los enlaces `<a>` a Google o WhatsApp no cuentan.
9. Pasan las pruebas de `horario.js`: sábado a la 1:30 abierto; domingo a la 1:30 abierto; viernes a la
   1:30 cerrado; lunes a las 0:30 cerrado; y los bordes 7:59, 8:00, 23:59, 2:00 y, en domingo, 11:59 y
   12:00. El cálculo usa siempre `Intl.DateTimeFormat` con `Europe/Madrid`, sin depender de la hora del dispositivo.
10. Todo el JSON-LD se parsea sin errores y usa los tipos indicados (`CafeOrCoffeeShop` y `BarOrPub`,
    `Menu`, `FAQPage`, `BreadcrumbList`; sin `aggregateRating` ni `review`).
11. Contraste AA de todas las combinaciones de texto, en claro y en oscuro, calculado con la fórmula
    WCAG.
12. /carta/ pesa menos de 200 KB en la primera carga y no tiene desplazamiento lateral a 360 px.
13. El kit `kit-grupo-hostelero-friser/` está completo: `bloque-grupo.html` y `.css`, `iconos/`, `logos/`,
    `locales.json`, `htaccess-grupo.txt` y `LEEME.md`.

## Publicación en GitHub Pages

- Repositorio: https://github.com/innpactcompany-source/labodeguitadelaesquina (público, rama `main`). Git de este
  proyecto usa solo en local el correo `innpactcompany@gmail.com`.
- Cada subida a `main` que toque `web/` o el flujo lanza `.github/workflows/pages.yml`, que prepara una copia de
  `web/` con `.github/scripts/preparar-pages.js` y la publica. No hay compilación. Para publicar un cambio:
  `git add -A && git commit -m "…" && git push` (con `gh` ya autorizado en este equipo).
- GitHub Pages no lee `.htaccess`: la copia publicada convierte `/mesa`, `/barra` e `/ir/<local>` en páginas HTML
  de redirección (meta refresh) y no aplica la CSP ni las cabeceras de caché. `web/` no cambia: el `.htaccess`
  sigue siendo la referencia si algún día se vuelve a Hostinger.
- URL temporal: https://innpactcompany-source.github.io/labodeguitadelaesquina/ (rutas reescritas con el prefijo del
  repositorio, `noindex` y `robots.txt` que lo bloquea todo).
- Dominio propio: con el DNS ya apuntando a GitHub, definir la variable de Actions `DOMINIO=labodeguitadelaesquina.com`,
  poner el dominio en Settings > Pages (o con `gh api -X PUT repos/innpactcompany-source/labodeguitadelaesquina/pages -f cname=labodeguitadelaesquina.com`),
  relanzar el flujo y activar «Enforce HTTPS». Con la variable definida las rutas quedan en la raíz y el `robots.txt`
  vuelve a permitir todo.
