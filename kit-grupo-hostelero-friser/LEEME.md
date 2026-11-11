# Kit de Grupo Hostelero Friser

Bloque común que llevan las cuatro webs del grupo en el pie, y las reglas para que se enlacen entre sí.

## Qué hay aquí

- `bloque-grupo.html`: el bloque autocontenido, en variante oscura y clara. Los iconos van incrustados.
- `bloque-grupo.css`: sus estilos. Se pueden pegar en el CSS de la web o enlazar tal cual.
- `logos/`: todos los logos del grupo en SVG y PNG. En el bloque se usa `ghf-logo-color-fondo-oscuro.svg` (o la variante clara) a unos 140 px de ancho; nunca por debajo de 120 px, para que se lea «Grupo Hostelero».
- `iconos/`: un icono por local (copa, jarra, cubiertos, trébol), con `currentColor`.
- `locales.json`: slug, nombre, dirección, icono, dominio, place ID de Google y destino actual de `/ir/<slug>` y, si el local tiene web en inglés, de `/ir/en/<slug>`.
- `htaccess-grupo.txt`: las reglas `/ir/` de los cuatro locales.

## Poner el bloque en otra web del grupo

1. Copia `logos/ghf-logo-color-fondo-oscuro.svg` (o la clara) a la carpeta de imágenes de la web y ajusta la ruta en el `<img>`.
2. Pega el contenido de `bloque-grupo.css` en el CSS de la web.
3. Pega en el pie el `<section class="grupo grupo--oscuro">` de `bloque-grupo.html`.
4. Marca el local de esa web con «Estás aquí» (sin enlace) y deja los otros tres con su enlace `/ir/<slug>`. En el propio `bloque-grupo.html` hay un comentario con los tres pasos. Cambia también la frase inicial por el nombre del local.
5. Copia las reglas de `htaccess-grupo.txt` en el `.htaccess` de la web, justo después de `RewriteEngine On` y antes de la regla de HTTPS.

Los enlaces del bloque pasan siempre por `/ir/<slug>` y no apuntan directamente a Google Maps ni a otro dominio. Así, cambiar el destino de un local no obliga a tocar el HTML de ninguna web.

## Pasar un local de Google Maps a su propia web

Cuando un local estrene web (así se hizo con Pub Colonial, `https://pubcolonial.com/`, y Excalibur, `https://excaliburirishpub.com/`, en noviembre de 2026):

1. En el `.htaccess` de **las cuatro webs**, cambia la línea `RewriteRule ^ir/pub-colonial/?$ …` por `RewriteRule ^ir/pub-colonial/?$ https://pubcolonial.com/ [R=302,L]`.
2. En `locales.json`, cambia `destino_ir` de ese local por su dominio y pon `web_activa` a `true`.
   Si la web tiene versión inglesa, añade `RewriteRule ^ir/en/<slug>/?$ https://<dominio>/en/ [R=302,L]` y rellena `destino_ir_en`:
   las páginas en inglés de cada web del grupo enlazan a `/ir/en/<slug>` (en La Bodeguita lo hace solo `herramientas/generar-ingles.js`).
3. Actualiza `htaccess-grupo.txt` con la misma línea.
4. Comprueba en cada web que `/ir/pub-colonial` (y `/ir/en/pub-colonial`) abre la web nueva en su idioma.

La web nueva del local debe llevar este mismo bloque, con su propio «Estás aquí», y su `.htaccess` con `/ir/la-bodeguita` apuntando a `https://labodeguitadelaesquina.com/`.

Las redirecciones son 302 a propósito, para poder cambiar el destino más adelante.
