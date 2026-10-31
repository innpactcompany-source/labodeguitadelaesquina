#!/usr/bin/env node
/*
 * Control de calidad y preparación de las fotos de platos.
 *
 *   node herramientas/procesar-fotos-platos.js [--entrada material/platos] [--salida herramientas/salida] [--centro]
 *
 * Lee las fotos de la carpeta de entrada (nombradas con el slug del plato), mide su calidad, las recorta a 4:3,
 * genera WebP y JPG a 600 y 1000 px sin metadatos y escribe la tabla de resultados.
 * NO escribe nada en web/ ni publica nada: solo deja los archivos en la carpeta de salida para que los revises.
 */
const fs = require('fs'), path = require('path');
const sharp = require('sharp');

const RAIZ = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const ENTRADA = path.resolve(RAIZ, arg('entrada', 'material/platos'));
const SALIDA = path.resolve(RAIZ, arg('salida', 'herramientas/salida'));
const CENTRADO = process.argv.includes('--centro');
if ((SALIDA + path.sep).startsWith(path.join(RAIZ, 'web') + path.sep)) { console.error('La salida no puede estar dentro de web/.'); process.exit(1); }

const SLUGS = ['tostada-aceite-sal', 'tostada-tomate-jamon', 'tostada-tomate-aguacate', 'tostada-mantequilla-mermelada', 'tostada-tomate-atun', 'tostada-tomate-jamon-queso', 'bocadillo-entrecot', 'bocadillo-sobrasada-jamon-cebolla', 'chivito-bodeguita', 'bocadillo-tortilla-patata', 'bocadillo-bacon-queso', 'croissant', 'cafe-solo', 'cafe-con-leche', 'cortado', 'cappuccino', 'te-infusiones', 'tarta'];
const EXT = /\.(jpe?g|png|webp|heic|heif|tiff?)$/i;
const LADO_MIN = 1600;     // píxeles del lado largo del original
const NITIDEZ_OK = 100;    // varianza del laplaciano (recorte 4:3 a 1000 px de ancho): por encima, nítida
const NITIDEZ_MIN = 40;    // por debajo, desenfocada

// Varianza del laplaciano sobre la imagen en grises (cuanto mayor, más nítida)
async function nitidez(buffer) {
  const { data, info } = await sharp(buffer).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height; let suma = 0, suma2 = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, l = data[i - 1] + data[i + 1] + data[i - w] + data[i + w] - 4 * data[i];
    suma += l; suma2 += l * l; n++;
  }
  const media = suma / n; return suma2 / n - media * media;
}

(async () => {
  if (!fs.existsSync(ENTRADA)) { console.error('No existe la carpeta de entrada: ' + ENTRADA); process.exit(1); }
  fs.mkdirSync(SALIDA, { recursive: true });
  const archivos = fs.readdirSync(ENTRADA).filter(f => EXT.test(f)).sort();
  if (!archivos.length) { console.log('No hay fotos en ' + ENTRADA); return; }
  const filas = [], vistos = new Set();

  for (const f of archivos) {
    const slug = path.basename(f, path.extname(f)).toLowerCase();
    const fila = { archivo: f, slug, lado: '', nitidez: '', estado: '', notas: [] };
    if (!SLUGS.includes(slug)) { fila.estado = 'PREGUNTAR'; fila.notas.push('el nombre no coincide con ningún plato'); filas.push(fila); continue; }
    if (vistos.has(slug)) { fila.estado = 'PREGUNTAR'; fila.notas.push('hay más de una foto para este plato'); filas.push(fila); continue; }
    vistos.add(slug);
    let origen;
    try {
      origen = await sharp(path.join(ENTRADA, f)).rotate().toBuffer({ resolveWithObject: true });
    } catch (e) {
      fila.estado = 'NO SE PUEDE LEER'; fila.notas.push('formato no soportado (' + path.extname(f).slice(1) + '): conviértela a JPG'); filas.push(fila); continue;
    }
    const { width, height } = origen.info; fila.lado = Math.max(width, height);
    const problemas = [], avisos = [];
    if (fila.lado < LADO_MIN) problemas.push(`lado largo ${fila.lado} px (mínimo ${LADO_MIN})`);

    // Recorte 4:3: por defecto hacia la zona con más detalle; con --centro, centrado
    const posicion = CENTRADO ? 'centre' : sharp.strategy.attention;
    const recorte = await sharp(origen.data).resize(1000, 750, { fit: 'cover', position: posicion, kernel: 'lanczos3' }).toBuffer();
    const v = await nitidez(recorte); fila.nitidez = Math.round(v);
    if (v < NITIDEZ_MIN) problemas.push(`desenfocada (varianza ${Math.round(v)}, mínimo ${NITIDEZ_MIN})`);
    else if (v < NITIDEZ_OK) avisos.push(`nitidez justa (${Math.round(v)})`);

    // Salida: WebP y JPG a 600 y 1000 px, sin metadatos (sharp no copia EXIF ni perfiles por defecto)
    for (const ancho of [600, 1000]) {
      const base = sharp(recorte).resize(ancho, Math.round(ancho * 3 / 4), { kernel: 'lanczos3' });
      await base.clone().webp({ quality: 78 }).toFile(path.join(SALIDA, `${slug}-${ancho}.webp`));
      await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(SALIDA, `${slug}-${ancho}.jpg`));
    }
    // Para la revisión visual: el original reducido
    await sharp(origen.data).resize(500, 500, { fit: 'inside' }).jpeg({ quality: 70 }).toFile(path.join(SALIDA, `_original-${slug}.jpg`));

    fila.estado = problemas.length ? 'NO APTA' : (avisos.length ? 'REVISAR' : 'APTA');
    fila.notas.push(...problemas, ...avisos);
    filas.push(fila);
  }

  // Lo que ninguna máquina mide bien se revisa a mano en revision.html
  const manual = 'plato entero · sin personas · sin pantallas';
  const sig = { 'APTA': 'APTA (falta revisión a mano)', 'REVISAR': 'REVISAR', 'NO APTA': 'NO APTA' };
  let md = `# Resultado del control de calidad de las fotos de platos\n\nCarpeta de entrada: \`${path.relative(RAIZ, ENTRADA)}\` · salida: \`${path.relative(RAIZ, SALIDA)}\` · recorte 4:3 ${CENTRADO ? 'centrado' : 'hacia el detalle'}\n\n`;
  md += `| Foto | Plato | Lado largo (px) | Nitidez (laplaciano) | Estado automático | Notas |\n|---|---|---|---|---|---|\n`;
  for (const r of filas) md += `| ${r.archivo} | ${SLUGS.includes(r.slug) ? r.slug : '—'} | ${r.lado || '—'} | ${r.nitidez === '' ? '—' : r.nitidez} | ${sig[r.estado] || r.estado} | ${r.notas.join('; ') || '—'} |\n`;
  md += `\n**Revisión manual obligatoria** (no la mide el script): ${manual}. Abre \`revision.html\`, comprueba que el plato entero cabe en el recorte 4:3 y descarta las fotos con personas reconocibles o con pantallas con contenido de terceros.\n\nUmbrales: lado largo ≥ ${LADO_MIN} px; nitidez ≥ ${NITIDEZ_OK} (entre ${NITIDEZ_MIN} y ${NITIDEZ_OK}: revisar; por debajo: no apta). La nitidez es orientativa: depende del tipo de plato.\n\nNo se ha tocado \`web/\`. Para publicar, aprueba esta tabla y pide que se añadan las fotos aprobadas.\n`;
  fs.writeFileSync(path.join(SALIDA, 'tabla-resultado.md'), md);

  let html = `<!doctype html><meta charset="utf-8"><title>Revisión de fotos de platos</title><style>body{font:16px/1.4 system-ui;margin:1.5rem;background:#f6f0e3;color:#241a14}.f{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:0 0 1.5rem;padding:1rem;background:#fff;border:1px solid #ccc}img{max-width:100%;height:auto;border:1px solid #888}h2{margin:.2rem 0}.NO{color:#8e1219}</style><h1>Revisión de fotos de platos</h1><p>Comprueba en cada una: <b>${manual}</b>. A la izquierda el original, a la derecha el recorte 4:3 que se publicaría.</p>`;
  for (const r of filas.filter(x => fs.existsSync(path.join(SALIDA, `${x.slug}-1000.jpg`)))) html += `<div class="f"><div><h2>${r.slug} <small class="${r.estado === 'NO APTA' ? 'NO' : ''}">${r.estado}</small></h2><p>${r.notas.join('; ') || 'sin avisos automáticos'}</p><img src="_original-${r.slug}.jpg" alt=""></div><div><img src="${r.slug}-1000.jpg" alt=""></div></div>`;
  fs.writeFileSync(path.join(SALIDA, 'revision.html'), html);

  console.log(md);
  console.log('Archivos en: ' + SALIDA);
})().catch(e => { console.error(e); process.exit(1); });
