import { intensityInfo, formatFecha, textoEdad } from './emociones';

const MARGIN = 18;
const LINE = 6;
const ACCENT = [124, 92, 252];
const TEXT = [38, 34, 52];
const MUTED = [110, 110, 125];

// Carga una imagen (dataURL) para conocer su tamaño antes de insertarla.
const cargarImagen = (dataUrl) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });

const saltoSiHaceFalta = (doc, y, necesario = LINE) => {
  const alto = doc.internal.pageSize.getHeight();
  if (y + necesario > alto - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
};

const escribir = (doc, texto, x, y, maxW, opts = {}) => {
  const { size = 11, style = 'normal', color = TEXT, gap = LINE } = opts;
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lineas = doc.splitTextToSize(String(texto || ''), maxW);
  for (const linea of lineas) {
    y = saltoSiHaceFalta(doc, y, gap);
    doc.text(linea, x, y);
    y += gap;
  }
  return y;
};

const encabezadoMarca = (doc, x, y, ancho) => {
  y = escribir(doc, 'De trazos a emociones', x, y, ancho, {
    size: 17,
    style: 'bold',
    color: ACCENT,
    gap: 7,
  });
  y = escribir(doc, 'Apoyo orientativo · Psicología infantil', x, y, ancho, {
    size: 9,
    color: MUTED,
    gap: 5,
  });
  doc.setDrawColor(220, 216, 235);
  doc.line(x, y, x + ancho, y);
  return y + 8;
};

const tituloSeccion = (doc, texto, x, y, ancho) => {
  y = saltoSiHaceFalta(doc, y, 10);
  return escribir(doc, texto, x, y, ancho, {
    size: 13,
    style: 'bold',
    color: ACCENT,
    gap: 7,
  });
};

const bloqueDetalle = async (doc, analisis, imagenDataUrl, x, y, ancho) => {
  const r = analisis.resultado_ia || {};
  const nombre = analisis.contexto_nino?.nombre;
  const esIndep = analisis.independiente || !nombre || nombre === 'Sin nombre';

  y = tituloSeccion(
    doc,
    esIndep ? 'Detalle del análisis' : `Detalle del análisis de ${nombre}`,
    x,
    y,
    ancho
  );

  // Datos del niño / fecha
  const edad = textoEdad(analisis.contexto_nino || {});
  const metaPartes = [];
  if (!esIndep && edad) metaPartes.push(edad);
  if (analisis.contexto_nino?.genero) metaPartes.push(analisis.contexto_nino.genero);
  if (analisis.fecha) metaPartes.push(`Fecha: ${formatFecha(analisis.fecha)}`);
  if (metaPartes.length) {
    y = escribir(doc, metaPartes.join('  ·  '), x, y, ancho, { size: 9, color: MUTED, gap: 5 });
  }

  // Emoción e intensidad
  const inten = intensityInfo(r.intensidad || '');
  y = escribir(
    doc,
    `Emoción predominante: ${r.emocion_predominante || 'Sin dato'}   |   Intensidad: ${inten.label}`,
    x,
    y + 1,
    ancho,
    { size: 11, style: 'bold', gap: 6 }
  );
  y += 3;

  // Imagen del dibujo
  if (imagenDataUrl) {
    const img = await cargarImagen(imagenDataUrl);
    if (img && img.width && img.height) {
      const maxW = Math.min(ancho, 95);
      const w = maxW;
      const h = (img.height / img.width) * w;
      y = saltoSiHaceFalta(doc, y, h + 4);
      try {
        doc.addImage(img, 'JPEG', x, y, w, h);
        y += h + 6;
      } catch {
        /* si la imagen falla, se omite */
      }
    }
  }

  // Rasgos observados
  const rasgos = Array.isArray(r.rasgos_observados) ? r.rasgos_observados.filter(Boolean) : [];
  if (rasgos.length) {
    y = escribir(doc, 'Rasgos observados', x, y, ancho, { size: 11, style: 'bold', gap: 6 });
    for (const rasgo of rasgos) {
      y = escribir(doc, `•  ${rasgo}`, x + 2, y, ancho - 2, { size: 10, gap: 5.5 });
    }
    y += 2;
  }

  // Interpretación
  if (r.interpretacion) {
    y = escribir(doc, 'Interpretación', x, y, ancho, { size: 11, style: 'bold', gap: 6 });
    y = escribir(doc, r.interpretacion, x, y, ancho, { size: 10, gap: 5.5 });
    y += 2;
  }

  // Lectura orientativa
  const lectura = r.lectura_orientativa || r.analisis_completo;
  if (lectura) {
    y = escribir(doc, 'Lectura orientativa', x, y, ancho, { size: 11, style: 'bold', gap: 6 });
    y = escribir(doc, lectura, x, y, ancho, { size: 10, gap: 5.5 });
  }

  return y;
};

const bloqueHistorial = (doc, nombre, lista, x, y, ancho) => {
  y = tituloSeccion(doc, `Historial de ${nombre}`, x, y, ancho);
  y = escribir(doc, `${lista.length} análisis registrados`, x, y, ancho, {
    size: 9,
    color: MUTED,
    gap: 6,
  });

  const ordenados = [...lista].sort(
    (a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)
  );

  for (const a of ordenados) {
    const r = a.resultado_ia || {};
    const inten = intensityInfo(r.intensidad || '');
    const linea = `•  ${formatFecha(a.fecha)} — ${r.emocion_predominante || 'Sin dato'} (intensidad ${inten.label})`;
    y = escribir(doc, linea, x + 2, y, ancho - 2, { size: 10, gap: 5.5 });
  }

  return y;
};

const pieOrientativo = (doc, x, ancho) => {
  const alto = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const nota =
    'Este documento es un apoyo orientativo y no reemplaza el diagnóstico ni el criterio de un profesional.';
  const lineas = doc.splitTextToSize(nota, ancho);
  doc.text(lineas, x, alto - 10);
};

// Genera y descarga el PDF con las secciones seleccionadas.
// opciones: { detalle, imagenDataUrl, historial: { nombre, lista }, nombreArchivo }
export async function exportarPdf({ detalle, imagenDataUrl, historial, nombreArchivo }) {
  // jsPDF se carga bajo demanda (chunk aparte) solo al exportar.
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ancho = doc.internal.pageSize.getWidth() - MARGIN * 2;

  const yTrasEncabezado = encabezadoMarca(doc, MARGIN, MARGIN, ancho);
  const hayHistorial = Boolean(historial && historial.lista?.length);

  if (detalle) {
    await bloqueDetalle(doc, detalle, imagenDataUrl, MARGIN, yTrasEncabezado, ancho);
  }

  if (hayHistorial) {
    if (detalle) doc.addPage();
    const yInicio = detalle ? MARGIN : yTrasEncabezado;
    bloqueHistorial(doc, historial.nombre, historial.lista, MARGIN, yInicio, ancho);
  }

  // Pie en todas las páginas.
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    pieOrientativo(doc, MARGIN, ancho);
  }

  doc.save(nombreArchivo || 'de-trazos-a-emociones.pdf');
}
