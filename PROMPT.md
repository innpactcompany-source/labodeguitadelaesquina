# Web de La Bodeguita de la Esquina

Construye la web completa de **La Bodeguita de la Esquina**, cafetería-bar de Benimaclet (Valencia),
para **https://labodeguitadelaesquina.com**, lista para publicar hoy mismo. Todo lo que necesitas está
en esta carpeta.

## 0. Reglas del encargo

- **Este mensaje es la única fuente de verdad.** `PROMPT.md` es una copia de este mismo texto. Al final
  reescribes `CLAUDE.md` (sección 12).
- **Método skeleton-web, ya aplicado.** Este encargo incluye entero el método de la skill skeleton-web:
  las preguntas del Paso 1 respondidas (1), la arquitectura (2), las 20 piezas imprescindibles (9), los
  esenciales y los requisitos CX/UX/UI (10), la verificación obligatoria (13) y la entrega (14). No
  necesitas ninguna skill instalada.
- **Lo que cambia respecto a una web esqueleto:** el contenido, los datos y el diseño ya están
  decididos aquí. No hagas un wireframe neutro: construye la web final.
- **No me hagas preguntas.** Si algo choca, elige la opción más conservadora, sigue y apúntalo en el
  resumen final.
- **La web se publica tal cual:** no puede verse ningún marcador `[[…]]` ni texto de relleno. Lo único
  pendiente son las fotos de los platos, y la carta tiene que estar completa sin ellas (6.2).
- **Nada inventado:** ni platos, ni ingredientes, ni precios, ni alérgenos, ni reseñas, ni cifras, ni
  servicios. Lo que no está aquí, no existe.
- Si tienes disponible la skill `frontend-design`, úsala para la capa visual. Es opcional.

## 1. Paso 1 de skeleton-web, respondido

- **Formato:** HTML/CSS/JS por páginas (una carpeta con su `index.html` por página). Sin frameworks,
  sin paso de build y sin dependencias: no hace falta npm.
- **Alojamiento:** Hostinger (Apache/LiteSpeed, `.htaccess`). Todo el sitio va en `web/`, que se sube
  tal cual a `public_html`.
- **Tipo de web:** negocio local de hostelería, cafetería-bar de barrio. Su objetivo es traer clientes.
- **Conversión principal:** que vengan al local («Cómo llegar», «Llamar», «WhatsApp»).
  **Secundarias:** ver la carta y dejar una reseña en Google.
- **Ubicación física:** sí (mapa, horario, indicaciones y schema local).
- **Idioma:** solo castellano de España, tratando de tú.

## 2. Paso 2: arquitectura

```
/                         Inicio
/carta/                   Carta (destino de las pegatinas NFC de las 24 mesas)
/como-llegar/             Cómo llegar, horario y contacto
/preguntas-frecuentes/    Preguntas frecuentes
/aviso-legal/  /privacidad/  /cookies/
/404.html
robots.txt  sitemap.xml  site.webmanifest  .htaccess
```

- **Menú:** Carta · Cómo llegar · Preguntas frecuentes, más el botón «Llamar». El logo lleva a Inicio.
- **Migas de pan** con `BreadcrumbList` en todas las páginas menos Inicio.
- **Reglas:** a cualquier página se llega en dos clics como mucho; nombres de menú descriptivos; URLs
  cortas, en minúsculas y con guiones.
- **Fuera de `web/`** (no se sube): `kit-grupo-hostelero-friser/` (8.5) y, si las haces, las pruebas.

Presenta este mapa en el chat y sigue sin esperar confirmación.

## 3. Material (todo en `material/`)

No modifiques los originales: cópialos a `web/assets/` (`img/`, `marca/`, `iconos/`, `fonts/`, `css/`,
`js/`). Las medidas de cada archivo están abajo: úsalas para `width` y `height`.

### 3.1 `material/marca/la-bodeguita/` (logo recreado en vector a partir del rótulo; texto en trazos)

| Archivo | Medidas | Uso |
|---|---|---|
| `bodeguita-logo-horizontal-fondo-claro.svg` | proporción 6,712 : 1 (a 44 px de alto, 296 de ancho) | Cabecera en modo claro |
| `bodeguita-logo-horizontal-fondo-oscuro.svg` | igual | Cabecera en modo oscuro |
| `bodeguita-logo-vertical-fondo-oscuro.svg` | proporción 1,836 : 1 | Pie (fondo madera) |
| `bodeguita-logo-vertical-fondo-claro.svg` | proporción 1,836 : 1 | 404 en modo claro |
| `bodeguita-logo-vertical-fondo-claro.png` | 1400 × 763 | `logo` del JSON-LD |
| `bodeguita-cartel.svg` | proporción 5,95 : 1 | Réplica del rótulo: elemento gráfico de la 404 y referencia exacta de la forma de la cartela (7.3) |
| `favicon.svg`, `favicon.ico` (48 × 48), `apple-touch-icon.png` (180 × 180), `icon-192.png`, `icon-512.png` | — | Favicon y `site.webmanifest` |
| `og-image.jpg` | 1200 × 630 | Open Graph y Twitter de todas las páginas |

Los PNG de los logos horizontales y del cartel son de respaldo: en la web van los SVG, con `<img>` y
`alt`. La variante oscura se cambia con `<picture><source media="(prefers-color-scheme: dark)">`.

### 3.2 `material/marca/grupo-hostelero-friser/` (el logo de la pegatina NFC, en vector)

La Bodeguita es uno de los cuatro locales de **Grupo Hostelero Friser** (GHF). Las cuatro webs del grupo
llevarán este logo y se enlazarán entre sí (8.5).

| Archivo | Medidas | Uso |
|---|---|---|
| `ghf-logo-color-fondo-oscuro.svg` | proporción 0,856 : 1 (a 140 px de ancho, 164 de alto) | Bloque del grupo en el pie |
| `ghf-logo-color-fondo-claro.svg` | igual | Variante para fondos claros (kit) |
| `ghf-logo-oro.svg`, `ghf-logo-blanco.svg`, `ghf-logo-negro.svg` | igual | Monocromos (kit) |
| `ghf-monograma-color-fondo-oscuro.svg` / `-fondo-claro.svg` | proporción 2,462 : 1 | Solo «GHF», espacios pequeños (kit) |
| `icono-la-bodeguita.svg` (copa), `icono-pub-colonial.svg` (jarra), `icono-taberna-asturiana.svg` (cubiertos), `icono-excalibur.svg` (trébol) | proporción 0,915 : 1 | Un icono por local, con `currentColor` |
| Los `.png` | 1200 × 1402 y 1000 × 406 | Respaldo (kit) |

### 3.3 `material/fotos/` (JPG de respaldo + WebP; con `<picture>`, `srcset` y `sizes`)

| Archivos (medidas) | Qué es | Dónde va | ALT |
|---|---|---|---|
| `bodeguita-barra-2400.jpg` (2400 × 1350), `bodeguita-barra-1600.webp` (1600 × 900), `bodeguita-barra-800.webp` (800 × 450) | La barra (16:9) | Portada de Inicio en escritorio | Barra de La Bodeguita de la Esquina con botellas de vino, cafetera y frente de ladrillo |
| `bodeguita-barra-movil-1159.jpg` (1159 × 1449), `bodeguita-barra-movil-900.webp` (900 × 1125), `bodeguita-barra-movil-600.webp` (600 × 750) | La barra en vertical (4:5) | Portada en móvil (`media="(max-width: 700px)"`) | (el mismo) |
| `bodeguita-rotulo-2400.jpg` (2400 × 800), `bodeguita-rotulo-1600.webp` (1600 × 534), `bodeguita-rotulo-800.webp` (800 × 267) | El rótulo de la fachada (3:1) | Cómo llegar: «Busca este rótulo» | Rótulo de la fachada: Café, La Bodeguita de la Esquina, desde 1974 |
| `bodeguita-terraza-1880.jpg` (1880 × 1253), `bodeguita-terraza-1600.webp` (1600 × 1066), `bodeguita-terraza-800.webp` (800 × 533) | Entrada y terraza (3:2) | Inicio («Dentro y fuera») y Cómo llegar («La entrada») | Entrada de La Bodeguita en la calle Benicarló, con el toldo y las mesas de la terraza |
| `bodeguita-sala-2400.jpg` (2400 × 1600), `bodeguita-sala-1600.webp` (1600 × 1066), `bodeguita-sala-800.webp` (800 × 533) | La sala (3:2) | Inicio («Dentro y fuera») | Sala interior con mesas de madera, pared de ladrillo y una tele grande |
| `bodeguita-tartas-1449.jpg` (1449 × 1811), `bodeguita-tartas-1200.webp` (1200 × 1500), `bodeguita-tartas-600.webp` (600 × 750) | Vitrina de tartas (4:5) | Inicio, tarjeta «Tartas» | Vitrina refrigerada con varias tartas, enteras y en porciones |
| `bodeguita-pared-1600.jpg` (1600 × 1067), `bodeguita-pared-1200.webp` (1200 × 800), `bodeguita-pared-800.webp` (800 × 534) | Letras «LA BODEGUITA» sobre ladrillo (3:2) | Inicio, fondo del bloque de cierre con capa oscura para el contraste | Decorativa: `alt=""` |

Las fotos son de octubre y tienen decoración de Halloween; en Navidad se cambiarán por otras con el
mismo nombre y la misma proporción. Por eso:

- Ningún texto menciona la decoración ni la época del año.
- El encuadre de cada foto va en una variable CSS propia (`--foco-barra: 50% 40%`, etc.).
- Nada depende de lo que se ve en ellas.

La foto de portada se precarga (`fetchpriority="high"`, sin `loading="lazy"`); el resto lleva
`loading="lazy"` y `decoding="async"`.

### 3.4 `material/fuentes/` (woff2 variables, solo latín, licencia OFL incluida)

| Archivo | Familia | Pesos |
|---|---|---|
| `cinzel-latin-600-800.woff2` | Cinzel | 600–800 |
| `libre-baskerville-latin-400-700.woff2` | Libre Baskerville | 400–700 |
| `source-sans-3-latin-400-700.woff2` | Source Sans 3 | 400–700 |

Cópialas a `web/assets/fonts/` y decláralas así (sin npm ni CDN):

```css
@font-face { font-family: "Cinzel"; src: url("../fonts/cinzel-latin-600-800.woff2") format("woff2"); font-weight: 600 800; font-style: normal; font-display: swap; }
@font-face { font-family: "Libre Baskerville"; src: url("../fonts/libre-baskerville-latin-400-700.woff2") format("woff2"); font-weight: 400 700; font-style: normal; font-display: swap; }
@font-face { font-family: "Source Sans 3"; src: url("../fonts/source-sans-3-latin-400-700.woff2") format("woff2"); font-weight: 400 700; font-style: normal; font-display: swap; }
```

Precarga Cinzel y Source Sans 3 (`<link rel="preload" as="font" type="font/woff2" crossorigin>`). Los
`OFL-*.txt` no se suben: se quedan en `material/`.

### 3.5 `material/iconos/` (juego propio: trazo 1,2 en caja de 10 × 10, `currentColor`)

`icono-taza`, `icono-tostada`, `icono-bocadillo`, `icono-tarta`, `icono-sombrilla`,
`icono-tele-futbol`, `icono-huella` (perros), `icono-tarjeta`, `icono-entrada` (sin escalones),
`icono-wifi`, `icono-reloj`, `icono-telefono`, `icono-chat` (WhatsApp), `icono-mapa`, `icono-metro`,
`icono-galleta` (cookies), `icono-carta`, `icono-estrella`, `icono-menu`, `icono-cerrar`,
`icono-flecha-arriba` e `icono-externo`, todos `.svg`.

- Júntalos, con los cuatro iconos de los locales, en un sprite `web/assets/iconos/iconos.svg` (un
  `<symbol>` por icono, con su `viewBox`).
- Úsalos con `<svg aria-hidden="true"><use href="/assets/iconos/iconos.svg#taza"></use></svg>`, para
  que tomen el color del texto. Si un icono va solo, sin texto al lado, lleva su `aria-label`.
- Si te falta alguno, dibújalo con el mismo trazo. No uses bibliotecas de iconos.

### 3.6 `material/carta/carta-impresa.jpg` (1080 × 1920)

Foto de la carta impresa del local. Sirve de referencia de estilo (marco de doble filete y puntos guía
hasta el precio). El texto y los precios salen de la sección 6.2, no de la foto. No se publica.

### 3.7 `material/platos/`

Aquí irán llegando las fotos de los platos, con el slug del plato como nombre (`LEEME.txt` tiene la
lista). Ahora está vacía: no la uses en esta sesión.

## 4. Datos del negocio (verificados)

- **Nombre:** La Bodeguita de la Esquina. El rótulo dice «Café · La Bodeguita de la Esquina · Desde 1974».
- **Dirección:** C/ Benicarló, 25, bajos 5 y 6 · 46020 València (Benimaclet). Coordenadas
  39.4864334, -0.3647114.
- **Google** (place ID `ChIJ10m2YSxHYA0R3iMZo7EyFII`):
  - Ficha: `https://www.google.com/maps/search/?api=1&query=La%20Bodeguita%20de%20la%20Esquina&query_place_id=ChIJ10m2YSxHYA0R3iMZo7EyFII`
  - Cómo llegar: `https://www.google.com/maps/dir/?api=1&destination=La%20Bodeguita%20de%20la%20Esquina&destination_place_id=ChIJ10m2YSxHYA0R3iMZo7EyFII`
  - Dejar reseña: `https://search.google.com/local/writereview?placeid=ChIJ10m2YSxHYA0R3iMZo7EyFII`
  - Valoración: 4,7 de 5, consultada en octubre de 2026.
- **Teléfono y WhatsApp:** 682 26 25 87.
  - `tel:+34682262587`
  - `https://wa.me/34682262587?text=Hola%2C%20os%20escribo%20desde%20la%20web%20de%20La%20Bodeguita`
- **Horario habitual:**
  - De lunes a jueves, de 8:00 a 24:00.
  - Viernes y sábado, de 8:00 a 2:00 de la madrugada siguiente.
  - Domingo, de 12:00 a 24:00.
- **Servicios:**
  - Terraza en la calle.
  - Perros en la terraza; dentro no, salvo perros de asistencia.
  - Fútbol en la tele.
  - Entrada sin escalones.
  - Pago con tarjeta o en efectivo. **Bizum no.**
  - Wifi para clientes.
- **Oferta:** solo lo que hay en la carta (6.2): tostadas, bocadillos, croissant, cafés, té e infusiones
  y tarta. No hables de tapas, montaditos, raciones ni bebidas concretas.
- **Transporte:** estación de Benimaclet (metro L3 y L9, tranvía L4 y L6), a unos 300 m, unos 4 minutos
  a pie.
- **Reservas:** no hay sistema de reservas. Para grupos o dudas, llamar o escribir por WhatsApp.
- **Titular** (solo en legales y pie):
  - **Mantenimiento Industrial Friser, S.L.**, NIF B98272164.
  - C/ Poeta Altet, 22, bajo, 46020 València. Correo: gerencia@friser.org.
  - Inscrita en el Registro Mercantil de Valencia, tomo 9230, libro 6513, folio 114, sección 8.ª,
    hoja V-140501, inscripción 1.ª.
- **Grupo Hostelero Friser:** cuatro locales en Benimaclet (enlaces entre webs en 8.5).

| Slug | Local | Dirección | Icono | Dominio | Place ID de Google |
|---|---|---|---|---|---|
| `la-bodeguita` | La Bodeguita de la Esquina | C/ Benicarló, 25 | copa | labodeguitadelaesquina.com (esta web) | `ChIJ10m2YSxHYA0R3iMZo7EyFII` |
| `pub-colonial` | Pub Colonial | C/ Doctor Vicent Zaragoza, 3 | jarra | pubcolonial.com (aún sin web) | `ChIJE1xR8adIYA0RsxBHAsRYgcg` |
| `taberna-asturiana` | Restaurante Taberna Asturiana | C/ Doctor Vicent Zaragoza, 1 | cubiertos | tabernaasturiana.com (aún sin web) | `ChIJ7Scb9KdIYA0RFT_0ckmAVrk` |
| `excalibur` | Excalibur Irish Pub | C/ Doctor Vicent Zaragoza, 7 | trébol | excaliburirishpub.com (aún sin web) | `ChIJlYhj86dIYA0RDoDQvQBS3FU` |

## 5. Lo que no aparece nunca

- **Créditos de quien ha hecho la web:**
  - ni en textos, legales o pie («diseñado por», «desarrollado por», «web de»…);
  - ni en metadatos (`author`, `generator`), comentarios o nombres de archivo;
  - no se crea `humans.txt`.
- Los proveedores técnicos (alojamiento, mantenimiento): no se nombran; en privacidad van por categoría.
- La historia del local, el equipo y fotos del personal.
- Estufas, tapas, montaditos, raciones o cualquier cosa que no esté en la carta.
- Bizum como forma de pago. Solo aparece en la FAQ, como «Bizum no».
- Reseñas copiadas de Google (ni textos ni nombres) y contadores que caduquen. Solo «4,7 en Google» con
  su fecha.
- Peticiones a terceros antes del consentimiento:
  - nada de Google Fonts, CDN, analítica ni píxeles;
  - Google Maps solo se carga si se acepta.

## 6. Páginas y contenido

Tono: bar de barrio, cercano y directo, sin superlativos ni frases hechas. Usa estos textos tal cual o
con ajustes mínimos.

### 6.1 Inicio `/`

- **title:** Desayunos y almuerzos en Benimaclet · La Bodeguita
- **description:** Tostadas desde 1,50 €, bocadillos, cafés y tartas en la calle Benicarló, 25
  (Benimaclet). Terraza, fútbol en la tele y abierto todos los días.
- **Portada:** la foto de la barra a sangre, con el texto en la «cartela» (7.3).
  - Antetítulo: «Café desde 1974 · C/ Benicarló, 25».
  - H1: **Desayunos y almuerzos en Benimaclet**.
  - Entradilla: «Tostadas, bocadillos, cafés y tartas, con terraza y fútbol en la tele. A 300 metros
    del metro de Benimaclet.»
  - Botones antes del scroll: **Ver la carta** (principal), **Cómo llegar** y **Llamar**.
  - Estado en vivo (8.4): «Abierto ahora · cierra a las 24:00» o «Cerrado · abre hoy a las 12:00».
- **De la carta:** cuatro platos con precio y el enlace «Ver la carta completa», con el mismo componente
  de plato que /carta/:
  - Tostada de tomate y jamón, 3,50 €.
  - Chivito Bodeguita, 7,00 €.
  - Bocadillo de entrecot, 9,50 €.
  - Café con leche, 1,90 €.
- **Lo que encontrarás:** cuatro tarjetas con icono:
  1. **Terraza** (sombrilla). En la calle Benicarló, y con tu perro.
  2. **Fútbol en la tele** (tele-futbol). Los partidos, en la sala.
  3. **Tartas** (tarta). En la vitrina, a 4,50 €. Con la foto de tartas.
  4. **Abierto todos los días** (reloj). Desde las 8:00 de lunes a sábado y desde las 12:00 los
     domingos; viernes y sábado, hasta las 2:00.
- **Dentro y fuera:** las fotos de la sala y de la terraza, con un pie cada una: «Dentro, mesas de
  madera y la tele grande para los partidos» y «Fuera, la terraza en la calle Benicarló».
- **Opiniones:** «4,7 de 5 en Google», con «octubre de 2026» en pequeño, y los botones «Leer las reseñas
  en Google» y «Déjanos tu reseña». Sin estrellas animadas.
- **Cómo llegar (avance):**
  - Dirección.
  - Horario compacto, con hoy resaltado.
  - Mapa con consentimiento (8.3).
  - Botones «Cómo llegar», «Llamar» y «WhatsApp».
- **Cierre:** sobre la foto de la pared con capa oscura, que cumpla contraste AA: «¿Desayunamos? Te
  esperamos en la calle Benicarló, 25.» y los botones «Cómo llegar» y «Llamar».

### 6.2 Carta `/carta/`

La abren los clientes **en la mesa**, al acercar el móvil a la pegatina NFC (`/mesa` redirige aquí).
Tiene que cargar al instante en el móvil y leerse con una mano.

- **title:** Carta y precios · La Bodeguita de la Esquina
- **description:** Tostadas, bocadillos, cafés y tartas con precios: la carta de desayunos y almuerzos
  de La Bodeguita de la Esquina, en Benimaclet (Valencia).
- **Cabecera ligera:** logo pequeño, sin foto.
- **H1:** «La carta». Debajo: «Desayunos y almuerzos · Precios con IVA incluido».
- **Navegación:** chips fijos arriba (Tostadas · Bocadillos · Dulces y cafés), con desplazamiento
  horizontal. Marcan la categoría activa al hacer scroll (IntersectionObserver) y funcionan sin JS con
  anclas.
- **Plato:**
  - Nombre y, si la tiene, descripción.
  - Precio a la derecha, con línea de puntos como en la carta impresa, cifras tabulares y formato
    «3,50 €».
  - Un `id` estable (el *slug* de las tablas) para añadirle la foto después.
- **Fotos de platos:**
  - Ahora no hay ninguna, y la carta tiene que verse completa y cuidada sin ellas. No pintes huecos
    vacíos ni iconos de cámara.
  - Deja preparado el estilo `plato--con-foto`: foto 4:3 a todo el ancho en móvil y en columna en
    escritorio, con `loading="lazy"`.
  - El dueño quiere «vender por la vista»: cuando haya foto, manda la foto.
- **Tipografías en /carta/:** solo Cinzel y Source Sans 3 (con `font-variant-numeric: tabular-nums`
  para los precios).
- **Contenido:** transcrito de la carta impresa. Solo se han corregido dos erratas: «salsa rach» →
  «salsa ranch» y «tortilla patata» → «tortilla de patata».

**Tostadas**

| Slug | Plato | Precio |
|---|---|---|
| `tostada-aceite-sal` | Tostada de aceite y sal | 1,50 € |
| `tostada-tomate-jamon` | Tostada de tomate y jamón | 3,50 € |
| `tostada-tomate-aguacate` | Tostada de tomate y aguacate | 4,00 € |
| `tostada-mantequilla-mermelada` | Tostada de mantequilla y mermelada | 1,60 € |
| `tostada-tomate-atun` | Tostada de tomate y atún | 3,00 € |
| `tostada-tomate-jamon-queso` | Tostada de tomate, jamón y queso | 3,50 € |

**Bocadillos**

| Slug | Plato | Descripción | Precio |
|---|---|---|---|
| `bocadillo-entrecot` | Bocadillo de entrecot | Bacon, cebolla caramelizada, queso cottage, salsa ranch y salsa BBQ con miel y mostaza | 9,50 € |
| `bocadillo-sobrasada-jamon-cebolla` | Bocadillo de sobrasada, jamón y cebolla | — | 6,00 € |
| `chivito-bodeguita` | Chivito Bodeguita | Pollo asado, lechuga, tomate, bacon, queso y mayonesa | 7,00 € |
| `bocadillo-tortilla-patata` | Bocadillo de tortilla de patata | — | 5,50 € |
| `bocadillo-bacon-queso` | Bocadillo de bacon y queso | — | 6,50 € |

**Dulces y cafés** (en este orden)

| Slug | Plato | Precio |
|---|---|---|
| `croissant` | Croissant | 1,90 € |
| `cafe-solo` | Café solo | 1,40 € |
| `cafe-con-leche` | Café con leche | 1,90 € |
| `cortado` | Cortado | 1,60 € |
| `cappuccino` | Cappuccino | 2,20 € |
| — | Cafés más elaborados | Sin precio: «Carta aparte, pídela en barra» |
| `te-infusiones` | Té e infusiones | 2,20 € |
| `tarta` | Tarta | 4,50 € |

- **Alérgenos:** la carta impresa no los indica. No pongas iconos por plato ni los deduzcas de los
  ingredientes. Aviso fijo al final: «Si tienes alguna alergia o intolerancia, díselo al camarero: te
  informamos de los alérgenos de cada plato.»
- **Al final:** tarjeta «¿Te ha gustado? Déjanos tu reseña en Google» y botón «Volver arriba».
- **Impresión:** hoja de estilos de impresión sencilla, sin cabecera fija, barra móvil, banner ni botón
  de cookies.
- **Schema:** JSON-LD `Menu` con `hasMenuSection` (las tres secciones) y `hasMenuItem` (nombre,
  descripción si la hay y `offers` con `price` y `priceCurrency` EUR).

### 6.3 Cómo llegar `/como-llegar/`

- **title:** Cómo llegar y horario · La Bodeguita de la Esquina
- **description:** C/ Benicarló, 25, Benimaclet (Valencia), a 300 m del metro y el tranvía. Horario,
  teléfono y WhatsApp de La Bodeguita de la Esquina.
- **H1:** «Cómo llegar».
- **Dirección**, con los botones «Abrir en Google Maps» y «Cómo llegar».
- **Busca este rótulo:** la foto del rótulo, y la de la terraza como «La entrada».
- **Mapa** con consentimiento (8.3).
- **Transporte:** «La estación de Benimaclet (metro L3 y L9, tranvía L4 y L6) está a unos 300 metros,
  unos 4 minutos a pie.»
- **Horario:** completo, con hoy resaltado y el estado en vivo.
- **Contacto:** «Para reservar o preguntar, lo más rápido es llamar.», con los botones «Llamar» y
  «WhatsApp».

### 6.4 Preguntas frecuentes `/preguntas-frecuentes/`

- **title:** Preguntas frecuentes · La Bodeguita de la Esquina
- **description:** Horario, carta y precios, terraza, perros, fútbol, formas de pago y cómo llegar a
  La Bodeguita de la Esquina, en Benimaclet.

Desplegables accesibles con `<details>` y `<summary>`, y JSON-LD `FAQPage` con el mismo texto:

1. **¿Qué horario tenéis?**

   De lunes a jueves, de 8:00 a 24:00. Viernes y sábado, de 8:00 a 2:00. Domingo, de 12:00 a 24:00.
2. **¿Qué puedo desayunar o almorzar?**

   Tostadas desde 1,50 €, bocadillos desde 5,50 €, croissant, cafés y tarta. Tienes la carta completa
   con precios en la web. Enlaza a /carta/.
3. **¿Hace falta reservar?**

   Si venís en grupo o tenéis cualquier duda, llamadnos o escribidnos por WhatsApp al 682 26 25 87.
4. **¿Tenéis terraza?**

   Sí, en la misma calle Benicarló.
5. **¿Puedo ir con mi perro?**

   En la terraza, sí. Dentro del local no se admiten perros, salvo los de asistencia, que siempre
   pueden entrar.
6. **¿Ponéis el fútbol?**

   Sí, ponemos los partidos en la tele.
7. **¿Puedo pagar con tarjeta?**

   Sí, con tarjeta o en efectivo. Bizum no.
8. **¿El local es accesible?**

   La entrada no tiene escalones.
9. **¿Tenéis wifi?**

   Sí, para clientes.
10. **¿Cómo llego en transporte público?**

    La estación de Benimaclet (metro L3 y L9, tranvía L4 y L6) está a unos 300 metros, unos 4 minutos
    a pie.
11. **Tengo una alergia, ¿qué puedo tomar?**

    Díselo al camarero y te informamos de los alérgenos de cada plato.

### 6.5 404

- **H1:** «Esta mesa no existe».
- **Texto:** «La página que buscas no está, pero la carta y el café siguen en su sitio.»
- **Botones:** «Ver la carta» e «Ir al inicio».
- El cartel SVG como elemento gráfico.
- Lleva `noindex` y no entra en el sitemap.

### 6.6 Legales: aviso legal, privacidad y cookies

Redáctalos conforme a la LSSI-CE, el RGPD, la LOPDGDD y la guía de cookies de la AEPD, en castellano
claro.

- **Titular y responsable:** los datos de la sección 4, con la inscripción registral, y el nombre
  comercial La Bodeguita de la Esquina.
- **Propiedad intelectual:** redacción neutra, sin atribuirla a ninguna empresa: «Los contenidos de
  esta web (textos, fotografías, logotipos y diseño) están protegidos por la normativa de propiedad
  intelectual e industrial y no se pueden reproducir sin autorización. Las marcas de terceros que
  aparecen en las fotos pertenecen a sus titulares.»
- **Información orientativa:** «Los precios, los platos y el horario pueden cambiar. Prevalece la
  información del local.»
- **Enlaces a otras webs:** las del grupo, Google y WhatsApp tienen sus propias condiciones.
- **Tratamientos de datos:**
  1. Consultas por teléfono o WhatsApp.
     - Base: medidas precontractuales a petición del interesado e interés legítimo.
     - Si escribes por WhatsApp, WhatsApp Ireland Limited también trata tus datos según su política.
  2. Registros técnicos del servidor (IP, fecha y página), por seguridad.
     - Base: interés legítimo. Conservación limitada.
  3. Mapa de Google, solo si lo activas.
     - Google trata tu IP y puede haber transferencia a EE. UU. al amparo del Marco de Privacidad de
       Datos UE-EE. UU.
- **Destinatarios:** los proveedores tecnológicos que alojan y mantienen la web, como encargados del
  tratamiento, **por categoría y sin nombrarlos**. No hay cesiones, salvo obligación legal.
- **Derechos:**
  - Acceso, rectificación, supresión, oposición, limitación y portabilidad, en gerencia@friser.org,
    acreditando la identidad.
  - Reclamación ante la AEPD (aepd.es).
  - No hay decisiones automatizadas.
- **Cookies:**
  - Técnica propia: la preferencia de consentimiento, en `localStorage`, durante 12 meses.
  - Las de Google al cargar el mapa, solo con consentimiento y con enlace a su política.
  - Sin analítica ni publicidad.
- Cada página legal lleva «Última actualización: [fecha de hoy]» y su propio title y description.

## 7. Identidad visual

### 7.1 Concepto

**El rótulo de 1974 hecho web:**

- Cartela roja con filete de oro y remates redondos con escalón.
- Óvalo crema con «CAFÉ», cuya tilde es un grano de café.
- Banda verde botella.
- Madera, ladrillo y luz cálida.

Tiene que parecer el bar de toda la vida, cuidado; no una plantilla de restaurante.

**Evita:**

- Degradados genéricos, *glassmorphism* y sombras en todo.
- Emojis.
- Iconos de bibliotecas.
- Fotos de stock y texturas falsas.
- Animaciones que no aporten.

### 7.2 Tokens (todo el estilo sale de aquí)

```css
:root {
  --color-fondo: #F6F0E3;          /* crema del óvalo */
  --color-superficie: #FFFDF7;
  --color-texto: #241A14;          /* negro café */
  --color-texto-suave: #5A4A3F;
  --color-primario: #8E1219;       /* rojo del rótulo */
  --color-primario-oscuro: #6E0B12;
  --color-primario-luz: #C1161F;
  --color-secundario: #134A2F;     /* verde botella */
  --color-oro: #C9A85C;            /* filetes y detalles; texto solo sobre fondo oscuro */
  --color-oro-texto: #8A6A22;      /* oro legible sobre crema */
  --color-letra-oro: #E0C78C;      /* letras doradas sobre rojo, verde o madera */
  --color-borde: #E2D6BF;
  --color-madera: #3A2416;
  --color-madera-oscura: #24130A;
  --fuente-titulos: "Cinzel", "Times New Roman", serif;
  --fuente-acento: "Libre Baskerville", Georgia, serif;
  --fuente-texto: "Source Sans 3", system-ui, -apple-system, "Segoe UI", sans-serif;
  --radio: 6px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-fondo: #17100C;
    --color-superficie: #221812;
    --color-texto: #F4EEDB;
    --color-texto-suave: #CDBFA5;
    --color-primario: #A3141D;     /* fondos de botón, con texto crema */
    --color-primario-luz: #E0464D; /* texto rojo sobre oscuro */
    --color-secundario: #1C5C3B;
    --color-oro-texto: #E0C78C;
    --color-borde: #3A2A20;
  }
}
```

- **Contraste WCAG 2.2 AA en todas las combinaciones de texto.** El oro `#C9A85C` nunca es texto sobre
  crema.
- **Escala:**
  - Titulares en Cinzel, en mayúsculas, con interletra de 0,03–0,06em y `text-wrap: balance`.
  - Texto en Source Sans 3, a 18px con interlineado de 1,6.
  - Libre Baskerville para acentos: óvalos y «Café».

### 7.3 Componentes de marca

- **Cartela:** la forma del rótulo (núcleo rectangular, remates ovalados y escalón en cada esquina;
  la referencia exacta es `bodeguita-cartel.svg`), roja con filete de oro. Es el marco del texto de
  la portada y de los encabezados principales. En móvil, ocupa todo el ancho en la parte baja de la
  foto.
- **Óvalo:** chapa crema con borde de oro, para antetítulos y etiquetas cortas («CAFÉ», «HOY ABIERTO»).
- **Filetes** de oro para separar bloques.
- **Bandas:** las secciones alternan crema y verde botella con oro; el pie va en madera oscura.
- **Carta:** el estilo de la carta impresa (`material/carta/carta-impresa.jpg`: marco de doble filete
  y puntos guía hasta el precio), llevado a la marca.
- **Botones:**
  - Principal: rojo con texto crema.
  - Secundario: contorno verde o rojo.
  - Foco visible con anillo de oro de 3px.
  - Área táctil mínima de 44px.

### 7.4 Iconos

Los de `material/iconos/` y los cuatro de los locales, en el sprite de 3.5. Tamaño habitual: 22–24 px
junto al texto.

### 7.5 Movimiento

- Aparición suave de las secciones al hacer scroll.
- Subrayado de oro en los enlaces al pasar el ratón.
- Nada más. Todo se desactiva con `prefers-reduced-motion`.

## 8. Técnica

### 8.1 `.htaccess` en `web/` (puedes ampliarlo, sin quitar nada)

```apache
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

RewriteEngine On

# Pegatinas NFC: 302 a propósito, para cambiar el destino sin reprogramar las piezas
RewriteRule ^mesa/?$ https://labodeguitadelaesquina.com/carta/ [R=302,L]
RewriteRule ^barra/?$ https://search.google.com/local/writereview?placeid=ChIJ10m2YSxHYA0R3iMZo7EyFII [R=302,L,NE]

# Locales de Grupo Hostelero Friser. Cuando un local estrene web, cambia su destino por su dominio
# (por ejemplo, https://pubcolonial.com/) aquí y en las demás webs del grupo.
RewriteRule ^ir/pub-colonial/?$ https://www.google.com/maps/search/?api=1&query=Pub+Colonial&query_place_id=ChIJE1xR8adIYA0RsxBHAsRYgcg [R=302,L,NE]
RewriteRule ^ir/taberna-asturiana/?$ https://www.google.com/maps/search/?api=1&query=Restaurante+Taberna+Asturiana&query_place_id=ChIJ7Scb9KdIYA0RFT_0ckmAVrk [R=302,L,NE]
RewriteRule ^ir/excalibur/?$ https://www.google.com/maps/search/?api=1&query=Excalibur&query_place_id=ChIJlYhj86dIYA0RDoDQvQBS3FU [R=302,L,NE]

# HTTPS y dominio sin www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://labodeguitadelaesquina.com%{REQUEST_URI} [R=301,L]

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/manifest+json
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/webp "access plus 6 months"
  ExpiresByType image/jpeg "access plus 6 months"
  ExpiresByType image/png "access plus 6 months"
  ExpiresByType image/svg+xml "access plus 6 months"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Content-Security-Policy "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; font-src 'self'; frame-src https://www.google.com https://maps.google.com; connect-src 'self'; base-uri 'self'; form-action 'self'"
</IfModule>
```

- En los destinos de las reglas no escribas códigos como `%20` o `%2C`, porque mod_rewrite los toma
  como referencias: usa `+` para los espacios, como arriba. Las variables como `%{REQUEST_URI}` sí
  son correctas.
- `/mesa`, `/barra` e `/ir/…` no pueden existir como carpetas ni salir en el sitemap.
- El CSS y el JS se enlazan con `?v=AAAAMMDD`.
- Con esta CSP no puede haber `style` ni `script` en línea; el JSON-LD sí puede ir en línea. Si algo
  choca con la CSP, ajusta la directiva concreta, no la quites.

### 8.2 SEO local

- `lang="es-ES"` y canónica absoluta en cada página.
- `og:` completos con `og-image.jpg`, `og:locale` `es_ES` y `og:site_name` «La Bodeguita de la
  Esquina». `twitter:card` `summary_large_image`. `theme-color` `#8E1219`.
- `sitemap.xml` con `lastmod`, sin la 404.
- `robots.txt` que permite todo y apunta al sitemap.
- JSON-LD del negocio en todas las páginas: un único bloque con `@id`, que las demás referencian. Si
  cambias las rutas de las imágenes, ajusta sus URL.

```json
{
  "@context": "https://schema.org",
  "@type": ["CafeOrCoffeeShop", "BarOrPub"],
  "@id": "https://labodeguitadelaesquina.com/#negocio",
  "name": "La Bodeguita de la Esquina",
  "legalName": "Mantenimiento Industrial Friser, S.L.",
  "url": "https://labodeguitadelaesquina.com/",
  "logo": "https://labodeguitadelaesquina.com/assets/marca/bodeguita-logo-vertical-fondo-claro.png",
  "image": [
    "https://labodeguitadelaesquina.com/assets/img/bodeguita-barra-2400.jpg",
    "https://labodeguitadelaesquina.com/assets/img/bodeguita-terraza-1880.jpg",
    "https://labodeguitadelaesquina.com/assets/img/bodeguita-sala-2400.jpg"
  ],
  "telephone": "+34 682 26 25 87",
  "priceRange": "€",
  "servesCuisine": "Española",
  "paymentAccepted": "Efectivo, tarjeta",
  "currenciesAccepted": "EUR",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Benicarló, 25, bajos 5 y 6",
    "addressLocality": "València",
    "addressRegion": "Valencia",
    "postalCode": "46020",
    "addressCountry": "ES"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 39.4864334, "longitude": -0.3647114 },
  "hasMap": "https://www.google.com/maps/search/?api=1&query=La%20Bodeguita%20de%20la%20Esquina&query_place_id=ChIJ10m2YSxHYA0R3iMZo7EyFII",
  "hasMenu": "https://labodeguitadelaesquina.com/carta/",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"], "opens": "08:00", "closes": "00:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Friday", "Saturday"], "opens": "08:00", "closes": "02:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "12:00", "closes": "00:00" }
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Terraza", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Wifi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Deportes en televisión", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Entrada sin escalones", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Perros en la terraza", "value": true }
  ],
  "parentOrganization": { "@type": "Organization", "name": "Grupo Hostelero Friser" }
}
```

No añadas `aggregateRating` ni `review`: Google no admite reseñas propias de un negocio sobre sí mismo.

### 8.3 Cookies y mapa

- **Primera visita: banner inferior,** no bloqueante.
  - Botones **Aceptar**, **Rechazar** y **Configurar**, con el mismo peso visual.
  - Categorías: «Técnicas (siempre activas)» y «Servicios de terceros: Google Maps».
- **Botón flotante permanente** para volver a abrir la configuración, en todas las páginas.
  - Redondo, con el icono de la galleta, abajo a la izquierda.
  - En móvil va por encima de la barra fija de botones, sin taparla.
  - Lleva `aria-label`.
- En el pie, el enlace «Configurar cookies» abre el mismo panel.
- **Consentimiento:**
  - Se guarda en `localStorage` con fecha y versión.
  - Caduca a los 12 meses.
  - Si `localStorage` falla, se trata como no aceptado.
- **Mapa sin consentimiento:**
  - Hueco con proporción fija y fondo de marca.
  - Texto: «El mapa es de Google y usa cookies.»
  - Botón «Cargar mapa», que acepta solo esa categoría.
  - Enlace «Abrir en Google Maps».
- **Mapa con consentimiento:** `iframe` de Google Maps (embed sin clave) con `loading="lazy"` y `title`.

### 8.4 Estado «abierto ahora»

- Función pura en `assets/js/horario.js`, con la hora de `Europe/Madrid` mediante `Intl.DateTimeFormat`.
- Los cierres pasada la medianoche cuentan para el día anterior:
  - Sábado a la 1:30: abierto (turno del viernes).
  - Domingo a la 1:30: abierto (turno del sábado).
  - Viernes a la 1:30: cerrado (el jueves cierra a las 24:00).
  - Lunes a las 0:30: cerrado.
- Pruébala con estos cuatro casos y los bordes 7:59, 8:00, 23:59, 2:00 y, en domingo, 11:59 y 12:00:
  con Node o Python si los hay en el equipo; si no, con una página de pruebas en `pruebas/` (fuera de
  `web/`).
- Sin JS se ve el horario completo, sin indicador. Etiqueta: «Horario habitual».

### 8.5 Grupo Hostelero Friser: bloque común y enlaces entre las cuatro webs

Las cuatro webs del grupo llevarán el mismo bloque y se enlazarán entre sí. Hoy solo existe esta, así
que los enlaces pasan por una redirección propia (`/ir/<slug>`, en el `.htaccess` de 8.1): hoy
llevan a la ficha de Google Maps de cada local y, cuando cada uno estrene web, se cambia una línea
del `.htaccess` sin tocar el HTML.

- **En el pie de todas las páginas,** sobre madera oscura:
  - `ghf-logo-color-fondo-oscuro.svg` a unos 140px de ancho (nunca menos de 120px, para que se lea
    «Grupo Hostelero»).
  - El texto «La Bodeguita de la Esquina es uno de los cuatro locales de Grupo Hostelero Friser, en
    Benimaclet.»
  - Los cuatro locales, siempre en este orden: La Bodeguita de la Esquina, Pub Colonial, Restaurante
    Taberna Asturiana y Excalibur Irish Pub. Cada uno con su icono (decorativo), su nombre y su
    dirección.
  - La Bodeguita aparece marcada «Estás aquí», sin enlace. Los otros tres enlazan a `/ir/pub-colonial`,
    `/ir/taberna-asturiana` e `/ir/excalibur`, con el icono `externo`.
- **Kit para las otras tres webs,** en `kit-grupo-hostelero-friser/`, en la raíz del proyecto y fuera
  de `web/`:
  - `bloque-grupo.html` y `bloque-grupo.css`: el bloque autocontenido, con variante clara y oscura, y
    el «Estás aquí» fácil de mover.
  - `iconos/` (los cuatro de los locales) y `logos/` (todo `material/marca/grupo-hostelero-friser/`).
  - `locales.json`: la tabla de la sección 4 (slug, nombre, dirección, icono, dominio, place ID y
    destino actual de `/ir/`).
  - `htaccess-grupo.txt`: las reglas `/ir/` de los cuatro locales; en las otras webs,
    `/ir/la-bodeguita` lleva a `https://labodeguitadelaesquina.com/`.
  - `LEEME.md`: cómo poner el bloque en otra web del grupo y cómo pasar un local de Google Maps a su
    web (cambiar su línea de `/ir/` en las cuatro webs y su destino en `locales.json`).

### 8.6 Cabecera, pie y móvil

- **Cabecera fija:**
  - Crema en modo claro y madera en oscuro.
  - Logo horizontal de 44px de alto en escritorio y 36px en móvil.
  - Menú móvil accesible: botón con `aria-expanded`, cierre con Esc y al elegir un enlace, y foco
    atrapado mientras está abierto.
- **Barra fija en móvil:** **Carta · Llamar · Cómo llegar**, con icono y texto. Respeta
  `env(safe-area-inset-bottom)`.
- **Pie:**
  - Logo vertical (fondo oscuro), dirección, teléfono, WhatsApp y horario resumido.
  - Enlaces de las páginas.
  - Legales y «Configurar cookies».
  - Bloque del grupo (8.5).
  - «© 2026 La Bodeguita de la Esquina · Mantenimiento Industrial Friser, S.L.»
  - Nada más: ningún crédito.

### 8.7 Rendimiento y accesibilidad

- Objetivo: Lighthouse móvil de 95 o más en las cuatro categorías.
- **/carta/:** menos de 200 KB transferidos en la primera carga, sin contar fotos de platos.
- **Imágenes:** `width` y `height` de la sección 3, `srcset` y `sizes`, WebP con JPG de respaldo.
- **CSS y JS:**
  - Un CSS común y, si hace falta, uno pequeño por página.
  - JS mínimo, con `defer`: menú, cookies, horario y chips de la carta.
- **Accesibilidad:**
  - WCAG 2.2 AA.
  - Enlace «Saltar al contenido».
  - Un solo `h1` por página y jerarquía sin saltos.
  - Etiquetas en los botones de icono.
  - Teléfono también como texto seleccionable.

## 9. Las 20 piezas de skeleton-web en esta web

| # | Pieza | Cómo se aplica aquí |
|---|---|---|
| 1 | Página 404 personalizada | `404.html` (6.5), con `ErrorDocument`, `noindex` y enlaces a la carta y al inicio |
| 2 | CTA antes del scroll | «Ver la carta», «Cómo llegar» y «Llamar» visibles sin desplazarse a 360 × 640 y a 1366 × 768 |
| 3 | Enlaces internos | Menú, pie, migas y enlaces en contexto (FAQ → carta; Inicio → carta y cómo llegar); ninguna página huérfana |
| 4 | Página de agradecimiento | Desactivada: no hay formularios; el contacto es por teléfono y WhatsApp |
| 5 | Migas de pan | En todas las páginas menos Inicio, con `BreadcrumbList` |
| 6 | Casos de estudio | Sustituida por «De la carta» en Inicio (platos con precio) |
| 7 | FAQ | /preguntas-frecuentes/ con `FAQPage` |
| 8 | Compromiso de respuesta | «Para reservar o preguntar, lo más rápido es llamar», sin prometer tiempos |
| 9 | CTA fijo en móvil | Barra Carta · Llamar · Cómo llegar |
| 10 | robots.txt | Permite todo y apunta al sitemap |
| 11 | Títulos únicos | Los de la sección 6 |
| 12 | Metadescripciones | Las de la sección 6 |
| 13 | Imagen para redes | `og-image.jpg` en todas las páginas |
| 14 | Mapa e indicaciones | /como-llegar/ y avance en Inicio: mapa con consentimiento, enlace de ruta y transporte |
| 15 | Reseñas reales | Nota de Google con fecha y enlaces para leerlas y dejar una |
| 16 | Textos ALT | Los de la sección 3; las imágenes decorativas, con `alt=""` |
| 17 | Esquema local | JSON-LD del negocio, `Menu`, `FAQPage` y `BreadcrumbList` |
| 18 | Política de privacidad | Con aviso legal, política de cookies y banner |
| 19 | Foto de equipo | Desactivada: la web es para captar clientes y el local no la quiere |
| 20 | Rendimiento, sitemap y accesibilidad | Sección 8.7, `sitemap.xml` y WCAG 2.2 AA |

## 10. Esenciales y requisitos CX / UX / UI de skeleton-web

**Esenciales:**

- Favicon completo y `site.webmanifest` (nombre, colores e iconos de 192 y 512).
- `charset`, `viewport`, `lang`, canónica, `theme-color` y Open Graph en todas las páginas.
- HTTPS, un solo dominio (sin www), cabeceras de seguridad y CSP.
- Nombre, dirección y teléfono idénticos en toda la web y en el JSON-LD.
- Llamar y WhatsApp a mano en todas las páginas.
- Legales y «Configurar cookies» en el pie de todas las páginas.
- Sin enlaces rotos, sin contenido mixto y sin errores en la consola.
- Todo el contenido se ve sin JS; solo se pierden el estado en vivo y el mapa.

**CX (experiencia de cliente):**

- Marca: la identidad del rótulo en toda la web y el grupo en el pie.
- Marketing: imagen para redes, reseñas de Google y enlaces a los otros locales del grupo.
- Ventas: la carta con precios, a un toque desde cualquier página.
- Atención: llamar y WhatsApp siempre a mano, FAQ y horario en vivo.
- Local físico: cómo llegar, foto del rótulo, transporte y mapa.
- Producto: la carta es la pieza central.

**UX (experiencia de usuario):**

- Estrategia de contenidos: primero lo que decide la visita (qué hay, cuánto cuesta, dónde está y si
  está abierto).
- Arquitectura: la de la sección 2.
- Primero el móvil, y pensando en el uso en la mesa: una mano, poca luz y prisa.

**UI (interfaz):**

- Interacción: estados de hover, foco y activo; objetivos táctiles de 44px; chips de la carta con
  estado activo.
- Diseño visual: los tokens de la sección 7, con jerarquía clara y contraste AA.
- Movimiento: solo el de 7.5.

## 11. Orden de trabajo

1. Presenta el mapa del sitio (sección 2).
2. Copia el material a `web/assets/`, monta el sprite de iconos y prepara tokens, tipografías y
   componentes.
3. Construye primero /carta/, que es la página de las pegatinas. Después, Inicio, Cómo llegar,
   Preguntas frecuentes, legales y 404.
4. Prepara `.htaccess`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, el JSON-LD, las cookies y el
   bloque del grupo con su kit (8.5).
5. Haz la verificación de la sección 13 y corrige.
6. Escribe `CLAUDE.md` (sección 12) y el resumen (sección 14).

## 12. `CLAUDE.md` para las próximas sesiones

Sustituye el `CLAUDE.md` de la carpeta por uno con estas reglas, y con la verificación de la sección 13
copiada dentro:

- La web está en `web/` y se sube tal cual a `public_html` de Hostinger. `material/`, `pruebas/`,
  `kit-grupo-hostelero-friser/` y los `.md` no se suben.
- Nada inventado: ni platos, ni precios, ni alérgenos, ni reseñas, ni servicios.
- En `web/` no puede verse ningún marcador `[[`.
- Ningún crédito de quien ha hecho la web, en ningún sitio.
- `/mesa` y `/barra` son las redirecciones de las pegatinas NFC en `.htaccess`. No se cambian sin
  pedirlo y nunca se crean como carpetas.
- **Fotos de platos:**
  - Llegan a `material/platos/` con el slug del plato como nombre (por ejemplo,
    `chivito-bodeguita.jpg`).
  - Cada una se recorta a 4:3 centrada en el plato y se guarda en `web/assets/img/platos/` en WebP a
    800 y 400 px y en JPG de respaldo a 800 px, sin metadatos. Usa la herramienta de imagen que haya en
    el equipo; si no puedes generar WebP, solo el JPG optimizado.
  - Se añade a su plato en /carta/ con la clase `plato--con-foto` y un ALT que describa lo que se ve,
    y a su `MenuItem` en el JSON-LD (`image`).
  - Los platos sin foto se quedan como están.
  - Si un nombre no coincide con ningún slug, pregunta antes de asignarla.
- **Cambios de carta o de precios:**
  - Se hacen a la vez en /carta/ y en su JSON-LD.
  - Revisa también los textos que citan precios: la description y «De la carta» de Inicio, y la
    pregunta 2 de la FAQ.
- **Cuando otro local del grupo estrene web:**
  - cambia su línea `/ir/<slug>` del `.htaccess` por su dominio;
  - actualiza `kit-grupo-hostelero-friser/locales.json`;
  - recuerda que lo mismo hay que hacerlo en las demás webs del grupo.
- Las fotos del local se sustituyen siempre con el mismo nombre y la misma proporción.
- Después de cualquier cambio:
  - sube el `?v=` del CSS y el JS;
  - actualiza `lastmod`;
  - repite la verificación.

## 13. Verificación final (obligatoria)

Comprueba cada punto con tus herramientas de búsqueda o con un script, y corrige antes de entregar:

1. No hay `name="author"` ni `name="generator"`, ni textos tipo «diseñado por», «desarrollado por»,
   «hecho por» o «powered by» en `web/`.
2. «Bizum» solo aparece como «Bizum no».
3. No aparecen «Halloween», «Navidad», «estufa», «tapas», «montadito» ni «raciones» en `web/`.
4. No queda ningún `[[` en `web/`.
5. Los platos y precios de /carta/ (HTML y JSON-LD) coinciden con las tablas de 6.2: 18 platos con
   precio, ni uno más ni uno menos.
6. Cada página tiene un `title` y una `description` únicos; un solo `h1`; todas las `<img>` con `alt`;
   y ningún enlace interno roto (`/mesa`, `/barra` e `/ir/…` son redirecciones del `.htaccess`, no
   archivos).
7. Existen `robots.txt`, `sitemap.xml`, `site.webmanifest` y `404.html`, y las reglas de `/mesa`,
   `/barra` e `/ir/…` están en el `.htaccess`, sin códigos tipo `%20` en los destinos.
8. Antes del consentimiento, ningún `src`, hoja de estilos, `preload`, `@import`, `url()`, `fetch` ni
   `iframe` apunta fuera del dominio. Los enlaces `<a>` a Google o WhatsApp no cuentan.
9. Pasan las pruebas de `horario.js` (8.4).
10. Todo el JSON-LD se parsea sin errores y usa los tipos indicados.
11. Contraste AA de todas las combinaciones de texto, en claro y en oscuro, calculado con la fórmula
    WCAG.
12. /carta/ pesa menos de 200 KB en la primera carga y no tiene desplazamiento lateral a 360 px.
13. El kit `kit-grupo-hostelero-friser/` está completo (8.5).

## 14. Entrega

- Todo en `web/`, listo para subir a `public_html`. El kit, en `kit-grupo-hostelero-friser/`.
- Resumen corto en el chat:
  1. Las 20 piezas, con las adaptadas o desactivadas y el porqué.
  2. El resultado de la verificación, punto por punto.
  3. Las decisiones conservadoras que hayas tomado ante algún choque.
  4. Lo único pendiente: las fotos de los platos, con el procedimiento de `CLAUDE.md`.
  5. Cómo subir de versión el CSS y el JS (`?v=`).
  6. Qué comprobar al publicar:
     - SSL activo.
     - `http` y `www` redirigen, sin bucles de redirección.
     - `/mesa` abre la carta, `/barra` la reseña de Google y cada `/ir/…` su local.
     - La 404 funciona.
