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
- CSP: va en un `<meta http-equiv="Content-Security-Policy">` al principio del `<head>` de cada página, seguida de
  `<meta name="referrer" content="strict-origin-when-cross-origin">`, porque GitHub Pages no envía cabeceras. Es la
  misma en las 15 páginas y en el `.htaccess` (que además añade `frame-ancestors`). Solo permite lo propio y el
  iframe de Google Maps (`frame-src https://www.google.com https://maps.google.com`). No puede haber `style` ni
  `script` en línea (el JSON-LD sí). Si algo choca, se ajusta la directiva concreta, no se quita. Si cambias la CSP,
  cámbiala en las páginas en español y en el `.htaccess`; la versión inglesa se regenera.
- nosniff, X-Frame-Options y Permissions-Policy están en el `.htaccess`, pero en GitHub Pages no se pueden enviar
  (no hay `<meta>` equivalente). Haría falta un servicio delante, como Cloudflare, o volver a Hostinger.
- Sin peticiones a terceros antes del consentimiento: nada de Google Fonts, CDN, analítica ni píxeles.
  Google Maps solo se carga si se acepta.
- Cookies: no hay banner al entrar ni botón flotante. El permiso del mapa se pide solo en su recuadro («Cargar mapa»,
  en Inicio y en «Cómo llegar») y se da o se retira en el panel «Configurar cookies» (menú del móvil, pie de todas
  las páginas y botón de la política de cookies). La política de cookies describe exactamente esto: si cambia el
  funcionamiento, cambia el texto en español y su traducción.
- Solo castellano de España, tratando de tú. Las respuestas, los botones y los avisos hablan de tú; solo las preguntas del cliente al local de la FAQ conservan «¿Tenéis…?» y «¿Ponéis…?». El JSON-LD de la FAQ sale del mismo texto y debe coincidir palabra por palabra. Bizum solo aparece como «Bizum no» (FAQ).

## Teléfono

- Desde el 14-11-2026 el único teléfono de La Bodeguita es el de Samu, el encargado: **603 18 95 49**. Formatos:
  visible `603 18 95 49`, enlace `tel:+34603189549`, WhatsApp `https://wa.me/34603189549?text=…` (con su mensaje
  predefinido) y en el JSON-LD `"telephone": "+34 603 18 95 49"`. Ningún texto visible dice a quién se llama: «Llámanos»,
  «Escríbenos». El anterior no debe volver a aparecer en ningún formato (está en `ANTIGUOS` de `pruebas/telefono.js`).
- `node pruebas/telefono.js` lo comprueba: ningún archivo del repositorio tiene el número antiguo y el nuevo está en el
  botón Llamar de la cabecera, la barra móvil, el pie, el JSON-LD y WhatsApp de las 15 páginas. Si el teléfono vuelve a
  cambiar, añade el saliente a `ANTIGUOS` en ese script.

## Estructura

- Páginas: `index.html`, `carta/`, `como-llegar/`, `preguntas-frecuentes/`, `aviso-legal/`,
  `privacidad/`, `cookies/` y `404.html`. La cabecera, el pie, la barra móvil y el panel de cookies están
  repetidos en cada HTML: si se cambian, se cambian en todas las páginas.
- CSS: `assets/css/base.css` (tokens, componentes, impresión) y `carta.css` (solo /carta/).
- JS (todo con `defer`): `main.js` (menú y aparición de secciones), `cookies.js` (consentimiento y mapa),
  `horario.js` (estado «abierto ahora», función pura con tests) y `carta.js` (chips de la carta).
- Iconos: sprite `assets/iconos/iconos.svg`, que se usa con `<use href="/assets/iconos/iconos.svg#id">`.
- Fotos del local en `assets/img/` y marca en `assets/marca/`. Las fotos del local se sustituyen siempre
  con el mismo nombre y la misma proporción. El encuadre de cada una está en las variables `--foco-*` de
  `base.css`.
- Inicio precarga también Libre Baskerville (la usa el óvalo de la portada): sin ello el óvalo cambiaba de alto al cargar la fuente y la home perdía CLS 0. La portada lleva `background-color` marrón y degradado detrás de la foto.
- Foto de portada: la de la barra (`bodeguita-barra-*` en escritorio y `bodeguita-barra-movil-*` por debajo de 700 px),
  con el encuadre de `--foco-barra` (`50% 40%`) y `--foco-barra-movil` (`50% 50%`). **Es la portada definitiva hasta que
  lleguen las fotos de Navidad: no se cambia por otra mientras tanto** (del 11 al 12-11-2026 se probó la de la terraza y
  se deshizo). Aparece en cuatro sitios que van juntos: las dos precargas (`<link rel="preload" as="image">`, móvil y
  escritorio), el `<picture class="portada__foto">`, el primer elemento de `image` en el JSON-LD de las 15 páginas y las
  dos variables de encuadre. Al cambiarla, luego `node herramientas/generar-ingles.js`. La foto de la terraza va en la
  tarjeta «Terraza» de Inicio y en el schema, en segundo lugar.
- Texto: nada visible baja de 13 px (salvo lo marcado solo para lectores). /carta/ mide como máximo 960 px de ancho y sus pestañas (Tostadas, Bocadillos, Dulces y cafés) quedan fijas bajo la cabecera, con `--alto-chips` para el desplazamiento de anclas.
- Acceso a las cookies: en móvil, «Configurar cookies» (`<li class="nav__cookies">`, después de Inicio, Carta, Cómo llegar y Preguntas frecuentes y antes de los botones Llamar y WhatsApp) y el del pie; desde 832 px, solo el del pie (y el botón de la política de cookies). No hay botón flotante ni banner: se quitaron el 11-11-2026 porque tapaban la carta al llegar por el NFC. En escritorio la cabecera lleva solo Carta, Cómo llegar, Preguntas frecuentes y Llamar, siempre en una sola línea (entre 832 y 1023 px se ajustan logo y tipografía); `Inicio` y `Configurar cookies` solo existen en el menú móvil. Desde el menú, al abrirse el panel el foco entra en él y al cerrarlo vuelve al botón de la hamburguesa.
- Menú móvil: al abrirse atenúa la página (`.menu-fondo`, negro al 55 %, entre la cabecera y la barra inferior), bloquea el scroll del fondo (`html.menu-abierto`, solo por debajo de 52rem), atrapa el foco y se cierra con Esc, tocando fuera o eligiendo una opción; `aria-expanded` y la etiqueta del botón van siempre sincronizados.
- /carta/: al pulsar una pestaña el foco pasa al `h2` de la sección (`tabindex="-1"`); sin JS funciona como ancla normal.
- Barra inferior del móvil (`.barra-movil`): en Inicio (español e inglés) lleva `barra-movil--auto` y solo aparece cuando los
  botones de la portada (`.portada .btn-grupo`) ya no se ven (`main.js`, con IntersectionObserver), entrando y saliendo
  desde abajo en 0,25 s; oculta tiene `visibility: hidden`, así que no recibe el foco. Con `prefers-reduced-motion`
  aparece al instante, sin desplazarse. Sin JS se queda oculta en Inicio (la portada tiene los mismos tres botones). En el
  resto de páginas se ve siempre.
- `color-scheme: light dark` en el `:root` de `base.css` es obligatorio: sin él, el «tema oscuro para webs» de Chrome en Android
  oscurecía la web encima de su propio tema oscuro y el logo del grupo salía con «GHF» gris y «Grupo Hostelero» ilegible.
  El logo es `assets/marca/ghf-logo-color-fondo-oscuro.svg`, idéntico al del Excalibur y al del kit.
- Pie en móvil (por debajo de 832 px): las cuatro tarjetas del grupo miden lo mismo de ancho (el de la lista) y de alto
  (`grid-auto-rows: 1fr`), con el icono del local en una columna de 24 px, nombre en negrita y dirección en `#CDBFA5`, y a la
  derecha el icono de enlace o la píldora «Estás aquí». `.pie .grupo__enlace` debe ganar a `.pie li a` (que es `inline-flex`).
  Desde 360 px nombre y dirección caben en una línea (el texto baja por tramos hasta 14 px; la píldora no baja de 13 px); a
  320 px «La Bodeguita de la Esquina» ocupa dos líneas y las cuatro tarjetas crecen a la vez.
- Pie en escritorio (desde 832 px): rejilla de 2 × 2 con las cuatro tarjetas iguales en ancho y alto (`grid-auto-rows: 1fr`),
  icono en columna de 28 px, nombre en negrita, dirección debajo en `#CDBFA5` y a la derecha el enlace o «Estás aquí», como
  en el Excalibur. Entre 832 y 1119 px el texto baja a 16 px y, hasta unos 960 px, los nombres largos ocupan dos líneas
  (las cuatro tarjetas crecen a la vez). Cabecera, columnas del pie y logo y frase del grupo no cambiaron (12-11-2026).
- Home en móvil (< 700 px): «Lo que encontrarás» es un carrusel horizontal con `scroll-snap`, tarjetas del 82 % y `tabindex="0"` en el contenedor, que `main.js` quita por encima de 700 px.
- Imagen para redes: `assets/marca/og-image.jpg` mide 1200 x 630, pesa unos 84 KB y está hecha con la cartela, Cinzel y Source Sans 3 (JPEG 4:4:4); `og:image:width/height` deben seguir siendo 1200 y 630.
  La inglesa, `og-image-en.jpg` (55 KB), es la misma con la línea «BREAKFAST · BRUNCH · TERRACE» (Cinzel 600, 35 px,
  espaciado 3 px, línea base en y = 400, color #F4EEDB, sobre el degradado vertical original). El generador la pone en
  `og:image` y `twitter:image` de /en/.
- Títulos legales: los números de los `h2` (`1.`, `2.`…) van en `<span class="num">` con Source Sans 3 en negrita, porque en Cinzel el 1 se lee como una I.
- Zona pulsable: todo enlace o botón mide al menos 44 x 44 px en móvil (los enlaces en línea la amplían con un `::after` de `base.css`, sin cambiar el aspecto). El pie y el panel de cookies no llevan `h1`–`h6`: sus títulos son `<p class="pie__titulo">` y `<p class="cookies-panel__titulo">`.
- Móvil: la portada limita la foto a `min(42svh, 340px)` (`--foto-movil`) para que estado, `h1` y botones se vean sin scroll a 375 × 667. La barra inferior (`--alto-barra`) no tapa el final de ninguna página.
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

## Versión en inglés (`web/en/`)

- No se edita a mano: la genera `node herramientas/generar-ingles.js` a partir de las páginas en español, con los
  textos de `herramientas/traduccion-en.json` («=» deja el texto igual). Si cambias o añades un texto en español,
  pon su traducción en ese JSON y vuelve a ejecutar el script; si falta alguna, se detiene y dice cuál.
- El script también pone en todas las páginas (también en las españolas y en la 404) el cambio de idioma, siempre
  hacia la página equivalente:
  - Móvil y hasta 1119 px: botón de 44 px «EN»/«ES» junto al menú (entre 832 y 1119 px, entre el menú y «Llamar»).
  - Desde 1120 px: conmutador de texto «ES · EN» entre el menú y «Llamar», con filete dorado. El idioma actual
    no es enlace y lleva `aria-current="true"`. Más estrecho no cabe sin apretar el menú en español.
  - Al final del menú desplegado, fila «Español · English». En el pie, enlace «English»/«Español».
  - Si cambias la cabecera, comprueba que el script sigue encontrando dónde ponerlos (si no, se detiene).
- Aviso «View this page in English →» (en /carta/, «View this menu in English →»): solo en las páginas en español,
  bajo las migas (en Inicio, bajo la cabecera). Lo enseña `assets/js/idioma.js`, que va en el `<head>` sin `defer`
  para marcar `<html>` antes de pintar (sin saltos), si `navigator.language` no empieza por es, ca, gl ni eu.
  Nunca redirige; al cerrarlo no vuelve en esa sesión (`sessionStorage`). Pensado para quien llega por el NFC.
- Rutas: `/en/`, `/en/menu/`, `/en/getting-here/`, `/en/faq/`, `/en/legal-notice/`, `/en/privacy/`, `/en/cookies/`.
  Precios en formato inglés (`€3.50`); direcciones y nombres propios en español. Los legales en inglés llevan una
  nota de que prevalece la versión en español.
- Horas en formato inglés solo en el texto de /en/ (el script convierte todas las «h:mm»): 24:00 → «midnight»,
  12:00 → «12 noon», el resto en 12 horas («8 am», «2 am»). El JSON-LD y la versión española siguen en 24 horas.
- Decisiones de traducción: «Café con leche» y «Bocadillos» se quedan en español (bajo «Bocadillos», «Baguette
  sandwiches»; la sobrasada lleva «Sobrasada is a soft cured pork sausage»: son añadidos solo en inglés, en
  `SOLO_EN` del script). En el menú de la cabecera, «FAQ» se escribe «Questions» porque la cola de la «Q» de
  Cinzel parecía un guion bajo (la variante ss01 es peor); el título y las migas siguen siendo «FAQ».
- Los textos que escribe el JavaScript (estado de abierto/cerrado con horas en inglés, «Hoy», etiqueta del menú)
  eligen idioma por `<html lang>`.
- `node pruebas/verificar.js` comprueba (EN1 a EN10) que `web/en/` está al día, sin restos de español ni horas de
  24 horas, con enlaces, `hreflang` y cambio de idioma correctos en las 14 páginas, el aviso en las 7 españolas y
  los mismos precios en cada pareja. El `sitemap.xml` lista las 14 páginas con sus alternativas.
- Además, C1 a C3 (sin banner ni botón flotante, «Configurar cookies» en todas las páginas, mapa solo con permiso) y S1
  y S2 (CSP igual en las 15 páginas y en el `.htaccess`; imagen para redes inglesa en /en/), 13b (reglas `/ir/` iguales
  que las del kit) y R1 (genera las páginas de redirección y comprueba cada una).

## Locales del grupo (`/ir/<slug>`)

- Destinos actuales (12-11-2026):
  - Pub Colonial: `/ir/pub-colonial` → https://pubcolonial.com/ y `/ir/en/pub-colonial` → https://pubcolonial.com/en/
  - Excalibur Irish Pub: `/ir/excalibur` → https://excaliburirishpub.com/ y `/ir/en/excalibur` → https://excaliburirishpub.com/en/
  - Restaurante Taberna Asturiana: `/ir/taberna-asturiana` → https://tabernaasturiana.com/ y `/ir/en/taberna-asturiana` → https://tabernaasturiana.com/en/
- Las páginas en español enlazan a `/ir/<slug>`. Las inglesas, a `/ir/en/<slug>` si esa regla existe en el `.htaccess`
  (lo decide solo `herramientas/generar-ingles.js`); si no, a `/ir/<slug>`. Los tres locales llevan en el pie el mismo
  aviso para lectores («se abre en otra web» / «opens another website») y el mismo icono.
- Cuando otro local estrene web: cambia su línea `/ir/<slug>` del `.htaccess` por su dominio (302, sin `NE`) y, si tiene
  versión inglesa, añade `/ir/en/<slug>`. Actualiza `kit-grupo-hostelero-friser/locales.json` (`destino_ir`,
  `destino_ir_en`, `web_activa`) y `htaccess-grupo.txt` (el kit incluye también `/ir/en/la-bodeguita` para las otras webs).
  Regenera la versión inglesa. Lo mismo hay que hacerlo en las demás webs del grupo.
- En GitHub Pages, cada redirección de `.htaccess` (`/mesa`, `/barra`, `/ir/…`) se publica como página con meta refresh
  generada por `.github/scripts/preparar-pages.js`: `noindex`, la misma CSP, los estilos de la web, el logo y un enlace
  visible «Si no se abre, pulsa aquí» / «If it doesn’t open, tap here» (en `/ir/en/…`, el inglés primero). GitHub añade
  antes la barra final (`/mesa` → 301 → `/mesa/`).

## Pendiente

- Hay dos ejecuciones de GitHub atascadas en cola (43097189241 y 43096566470) que no se pueden cancelar. Antes de cada publicación, comprobar si siguen ahí; si /ir/taberna-asturiana vuelve a llevar a Google Maps, relanzar el flujo de Pages. Si siguen el 14/11, escribir al soporte de GitHub con esos dos números.

## Después de cualquier cambio

- Sube el `?v=` del CSS y el JS (está en todos los HTML; hay que cambiarlo en todos a la vez). Si el cambio es el mismo día, añade una letra o un punto al final (`20261114a`): el `.htaccess` da caché de un año e `immutable` a todo recurso con `?v=`, así que sin cambiar el valor el navegador no verá el cambio.
- Actualiza `lastmod` en `sitemap.xml` y la fecha de «Última actualización» si se tocan los legales.
- Repite la verificación.

## Verificación final (obligatoria)

Comprueba cada punto con tus herramientas de búsqueda o con un script, y corrige antes de entregar.
Los scripts de `pruebas/` hacen casi todo: `node pruebas/verificar.js` (puntos 1 a 8, 10, 12 y 13),
`node pruebas/horario.test.js` (punto 9; incluye los cambios de hora y cualquier zona del equipo) y `node pruebas/contraste.js` (punto 11).
`node pruebas/navegador.js` abre la web en Chrome sin ventana (sin dependencias; necesita Chrome instalado o la variable
`CHROME`) y comprueba lo que solo se ve ejecutando la página: la barra inferior (B1 a B4), las tarjetas del grupo en el pie del móvil (G1 a G3 en móvil: mismo ancho y alto, iconos alineados, una línea desde 360 px y `color-scheme` declarado; G4 en escritorio, de 832 a 1440 px: rejilla de 2 × 2 con tarjetas iguales y alineadas), la consola sin avisos de CSP,
ninguna petición a terceros sin permiso y el mapa (N1 a N4) y, solo contra el dominio, que `/ir/taberna-asturiana` y `/ir/en/taberna-asturiana` llegan a https://tabernaasturiana.com/ y a /en/ (I1). Con una URL (`node pruebas/navegador.js https://labodeguitadelaesquina.com`)
se ejecuta contra el dominio.

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
  de redirección (meta refresh) y no envía ninguna cabecera de seguridad ni de caché (la CSP y la política de
  referer van en `<meta>` en cada página). `web/` no cambia: el `.htaccess`
  sigue siendo la referencia si algún día se vuelve a Hostinger.
- URL temporal: https://innpactcompany-source.github.io/labodeguitadelaesquina/ (rutas reescritas con el prefijo del
  repositorio, `noindex` y `robots.txt` que lo bloquea todo).
- Estado (2026-10-31): dominio ya conectado, `DOMINIO` definido, certificado aprobado y «Enforce HTTPS» activo. La web
  sirve desde https://labodeguitadelaesquina.com/. La URL temporal de arriba queda redirigida por GitHub al dominio.
  Para volver a conectar un dominio nuevo, estos son los pasos:
- Dominio propio: con el DNS ya apuntando a GitHub, definir la variable de Actions `DOMINIO=labodeguitadelaesquina.com`,
  poner el dominio en Settings > Pages (o con `gh api -X PUT repos/innpactcompany-source/labodeguitadelaesquina/pages -f cname=labodeguitadelaesquina.com`),
  relanzar el flujo y activar «Enforce HTTPS». Con la variable definida las rutas quedan en la raíz y el `robots.txt`
  vuelve a permitir todo.
