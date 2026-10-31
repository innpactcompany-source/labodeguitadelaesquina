# Prompts para las siguientes fases

Cada bloque se pega en una sesión nueva de Claude Code abierta en esta misma carpeta. Lo que va entre
corchetes se sustituye antes de pegar.

---

## 1. Fotos de platos (cada vez que lleguen)

Antes de pegarlo, guarda las fotos en `material/platos/` con el nombre de su plato. Por ejemplo:
`chivito-bodeguita.jpg` o `bocadillo-entrecot.jpg`. La lista de nombres está en
`material/platos/LEEME.txt`.

```
Hay fotos nuevas de platos en material/platos/. Añádelas a la carta siguiendo CLAUDE.md:
- recorte 4:3, WebP y JPG optimizados;
- su plato con plato--con-foto y un ALT que describa lo que se ve;
- image en el JSON-LD.
Si alguna no coincide con ningún plato, pregúntame antes. Después, haz la verificación completa.
```

---

## 2. Fotos de Navidad

Antes de pegarlo, guarda las fotos nuevas en `material/fotos-navidad/`.

```
Tengo las fotos nuevas del local en material/fotos-navidad/. Se quedan como definitivas.

1. Elige la mejor foto para cada uso actual:
   - barra: escritorio 16:9 y móvil 4:5;
   - rótulo: 3:1;
   - terraza: 3:2;
   - sala: 3:2;
   - tartas: 4:5;
   - pared: 3:2.
   Si para un uso no hay ninguna buena, mantén la actual y dímelo.
2. Antes de sustituir nada, enséñame los recortes. Descarta o recorta lo que tenga personas reconocibles, pantallas con contenido de terceros o matrículas legibles.
3. Sustituye los archivos de web/assets/img/ con los mismos nombres, proporciones y anchos: JPG de respaldo y WebP, sin metadatos.
4. Ajusta las variables --foco-* si hace falta y revisa los ALT. Ningún texto menciona la Navidad ni la decoración.
5. Sube el ?v=, actualiza lastmod y haz la verificación completa.
```

---

## 3. Redes sociales

```
La Bodeguita tiene estas redes: [URL de Instagram, Facebook…].
Añádelas al pie con iconos del mismo trazo que el resto, y a sameAs en el JSON-LD.
Sube el ?v= y haz la verificación completa.
```

---

## 4. Cuando otro local del grupo estrene web

```
[Pub Colonial / Restaurante Taberna Asturiana / Excalibur Irish Pub] ya tiene web en [https://dominio.com/].

1. Cambia el destino de su redirección /ir/[pub-colonial / taberna-asturiana / excalibur] en web/.htaccess por esa dirección.
2. Actualiza kit-grupo-hostelero-friser/locales.json.
3. Sube el ?v= y comprueba que la redirección funciona.
4. Dime las líneas exactas que hay que cambiar también en las demás webs del grupo.
```
