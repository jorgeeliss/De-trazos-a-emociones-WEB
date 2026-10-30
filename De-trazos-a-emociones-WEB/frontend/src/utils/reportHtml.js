// Construye el HTML (con estilos en línea) de los informes que luego se capturan
// con html2canvas para el PDF. Se usa un documento claro con el estilo visual de
// la app (tarjetas, chips de emoción con color, gráfica). Todo el lenguaje es
// orientativo, nunca clínico.

import { limpiarResultadoIA } from './textoIA';
import {
  intensityInfo,
  formatFechaHora,
  textoEdad,
  emocionPredominante,
} from './emociones';

// Paleta sobria para impresión (sin colores fluorescentes).
const ACCENT = '#4a4878';     // indigo apagado, para títulos de sección
const TEXT = '#1f2433';       // texto principal
const MUTED = '#6b6880';      // texto secundario
const BORDER = '#e4e2ee';     // bordes sutiles
const HEADER_BG = '#352f5e';  // banda superior, indigo profundo
const CHIP_BG = '#f1f0f6';    // fondo neutro de los chips de emoción
const CHIP_TEXT = '#3a3752';  // texto de los chips
const BAR_TRACK = '#eceaf3';  // fondo de las barras
const BAR_FILL = '#6f6c99';   // relleno sobrio y uniforme de las barras

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const chipEmocion = (emocion) =>
  `<span style="display:inline-block;background:${CHIP_BG};color:${CHIP_TEXT};
    border:1px solid ${BORDER};padding:5px 14px;border-radius:999px;font-size:14px;font-weight:700;">
    ${esc(emocion || 'Sin dato')}</span>`;

const tituloSeccion = (texto) =>
  `<div style="font-size:16px;font-weight:800;color:${ACCENT};margin:0 0 12px;">${esc(texto)}</div>`;

const card = (inner) =>
  `<div style="background:#ffffff;border:1px solid ${BORDER};border-radius:16px;
    padding:22px;margin:0 0 18px;">${inner}</div>`;

// Gráfica de distribución de emociones (barras horizontales).
const graficoDistribucion = (lista) => {
  const conteo = {};
  lista.forEach((a) => {
    const e = (a.resultado_ia?.emocion_predominante || 'Sin dato').toLowerCase();
    conteo[e] = (conteo[e] || 0) + 1;
  });
  const entradas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entradas.map(([, n]) => n));

  const filas = entradas
    .map(([emo, n]) => {
      const ancho = Math.round((n / max) * 100);
      return `<div style="display:flex;align-items:center;gap:10px;margin:0 0 9px;">
        <div style="width:120px;font-size:12px;color:${TEXT};text-transform:capitalize;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(emo)}</div>
        <div style="flex:1;background:${BAR_TRACK};border-radius:8px;height:18px;position:relative;">
          <div style="width:${ancho}%;background:${BAR_FILL};height:18px;border-radius:8px;"></div>
        </div>
        <div style="width:24px;text-align:right;font-size:12px;font-weight:700;color:${TEXT};">${n}</div>
      </div>`;
    })
    .join('');

  return `<div>${tituloSeccion('Distribución de emociones')}${filas || `<div style="color:${MUTED};font-size:13px;">Sin datos.</div>`}</div>`;
};

// Línea de tiempo (lista cronológica de análisis).
const listaHistorial = (lista) => {
  const ordenados = [...lista].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  const filas = ordenados
    .map((a) => {
      const r = limpiarResultadoIA(a.resultado_ia || {});
      const inten = intensityInfo(r.intensidad || '');
      return `<div style="display:flex;align-items:center;justify-content:space-between;
        padding:9px 0;border-bottom:1px solid ${BORDER};">
        <span style="font-size:13px;color:${TEXT};">${esc(formatFechaHora(a.fecha))}</span>
        <span>${chipEmocion(r.emocion_predominante)}</span>
        <span style="font-size:12px;color:${MUTED};width:110px;text-align:right;">Intensidad ${esc(inten.label)}</span>
      </div>`;
    })
    .join('');
  return `${tituloSeccion('Análisis registrados')}${filas}`;
};

// Sección: detalle de un análisis.
export const seccionDetalle = (analisis, imagenDataUrl) => {
  const r = limpiarResultadoIA(analisis.resultado_ia || {});
  const nombre = analisis.contexto_nino?.nombre;
  const esIndep = analisis.independiente || !nombre || nombre === 'Sin nombre';
  const inten = intensityInfo(r.intensidad || '');
  const edad = textoEdad(analisis.contexto_nino || {});

  const meta = [];
  if (!esIndep && edad) meta.push(esc(edad));
  if (analisis.contexto_nino?.genero) meta.push(esc(analisis.contexto_nino.genero));
  if (analisis.fecha) meta.push(`Fecha: ${esc(formatFechaHora(analisis.fecha))}`);

  const rasgos = Array.isArray(r.rasgos_observados) ? r.rasgos_observados.filter(Boolean) : [];
  const lectura = r.lectura_orientativa || r.analisis_completo || '';

  const imagenHtml = imagenDataUrl
    ? `<div style="text-align:center;margin:0 0 16px;">
        <img src="${imagenDataUrl}" style="max-width:320px;max-height:320px;border-radius:12px;border:1px solid ${BORDER};" />
      </div>`
    : '';

  const rasgosHtml = rasgos.length
    ? `<div style="margin:0 0 14px;">${tituloSeccion('Rasgos observados')}
        <ul style="margin:0;padding-left:20px;color:${TEXT};font-size:13px;line-height:1.6;">
          ${rasgos.map((x) => `<li>${esc(x)}</li>`).join('')}
        </ul></div>`
    : '';

  const interpHtml = r.interpretacion
    ? `<div style="margin:0 0 14px;">${tituloSeccion('Interpretación')}
        <div style="color:${TEXT};font-size:13px;line-height:1.6;">${esc(r.interpretacion)}</div></div>`
    : '';

  const lecturaHtml = lectura
    ? `<div>${tituloSeccion('Lectura orientativa')}
        <div style="color:${TEXT};font-size:13px;line-height:1.6;">${esc(lectura)}</div></div>`
    : '';

  return card(`
    <div style="font-size:18px;font-weight:800;color:${TEXT};margin:0 0 4px;">
      ${esIndep ? 'Detalle del análisis' : `Análisis de ${esc(nombre)}`}
    </div>
    ${meta.length ? `<div style="font-size:12px;color:${MUTED};margin:0 0 12px;">${meta.join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</div>` : ''}
    <div style="margin:0 0 16px;">
      ${chipEmocion(r.emocion_predominante)}
      <span style="margin-left:10px;font-size:13px;font-weight:700;color:${TEXT};">Intensidad ${esc(inten.label)}</span>
    </div>
    ${imagenHtml}
    ${rasgosHtml}
    ${interpHtml}
    ${lecturaHtml}
  `);
};

// Sección: historial de un niño (con gráfica).
export const seccionHistorial = (nombre, lista) => {
  const emo = emocionPredominante(lista);
  return card(`
    <div style="font-size:18px;font-weight:800;color:${TEXT};margin:0 0 4px;">Historial de ${esc(nombre)}</div>
    <div style="font-size:12px;color:${MUTED};margin:0 0 16px;">
      ${lista.length} análisis · emoción predominante: ${esc(emo || 'sin datos')}
    </div>
    <div style="margin:0 0 18px;">${graficoDistribucion(lista)}</div>
    ${listaHistorial(lista)}
  `);
};

// Reporte consolidado de varios niños.
export const seccionConsolidado = (ninos) => {
  if (!ninos.length) {
    return card(`<div style="color:${MUTED};font-size:14px;">Aún no hay niños con análisis para incluir en el reporte.</div>`);
  }
  return ninos
    .map((n) => {
      const emo = emocionPredominante(n.analisis);
      const edad = textoEdad(n.contexto || {});
      const sit = n.contexto?.situacion_actual;
      return card(`
        <div style="font-size:17px;font-weight:800;color:${TEXT};margin:0 0 4px;">${esc(n.nombre)}</div>
        <div style="font-size:12px;color:${MUTED};margin:0 0 12px;">
          ${[edad && esc(edad), n.contexto?.genero && esc(n.contexto.genero), `${n.analisis.length} análisis`].filter(Boolean).join('&nbsp;&nbsp;·&nbsp;&nbsp;')}
        </div>
        <div style="margin:0 0 14px;">${chipEmocion(emo)}</div>
        ${sit ? `<div style="font-size:13px;color:${TEXT};margin:0 0 14px;"><b>Situación actual:</b> ${esc(sit)}</div>` : ''}
        <div>${graficoDistribucion(n.analisis)}</div>
      `);
    })
    .join('');
};

// Envuelve el contenido en un documento con cabecera y pie, ancho de página A4.
export const documento = (innerHtml, subtitulo) => `
  <div style="width:794px;box-sizing:border-box;background:#ffffff;font-family:'DM Sans',Arial,sans-serif;color:${TEXT};">
    <div style="background:${HEADER_BG};padding:26px 32px;color:#ffffff;">
      <div style="font-size:22px;font-weight:800;">De trazos a emociones</div>
      <div style="font-size:12px;opacity:0.9;margin-top:2px;letter-spacing:0.04em;">${esc(subtitulo || 'Apoyo orientativo · Psicología infantil')}</div>
    </div>
    <div style="padding:28px 32px;">
      ${innerHtml}
      <div style="margin-top:8px;font-size:10px;color:${MUTED};font-style:italic;line-height:1.5;">
        Este documento es un apoyo orientativo y no reemplaza el diagnóstico ni el criterio de un profesional.
        La interpretación de los dibujos considera siempre el contexto del niño.
      </div>
    </div>
  </div>
`;
