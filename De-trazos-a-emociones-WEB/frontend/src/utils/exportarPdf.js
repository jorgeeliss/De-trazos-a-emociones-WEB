import { documento, seccionDetalle, seccionHistorial, seccionConsolidado } from './reportHtml';

// Espera a que las imágenes del nodo terminen de cargar antes de capturar.
const esperarImagenes = (nodo) => {
  const imgs = Array.from(nodo.querySelectorAll('img'));
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          })
    )
  );
};

// Captura un HTML con estilo y lo vuelca a un PDF A4 multipágina.
// jsPDF y html2canvas se cargan bajo demanda (chunks aparte).
const htmlAPdf = async (html, nombreArchivo) => {
  const [{ jsPDF }, html2canvasMod] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const html2canvas = html2canvasMod.default;

  const cont = document.createElement('div');
  cont.style.position = 'fixed';
  cont.style.left = '-10000px';
  cont.style.top = '0';
  cont.style.width = '794px';
  cont.style.background = '#ffffff';
  cont.innerHTML = html;
  document.body.appendChild(cont);

  try {
    await esperarImagenes(cont);
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* las fuentes de respaldo sirven igual */
      }
    }

    const canvas = await html2canvas(cont, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const imgW = anchoPagina;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    let restante = imgH;
    let posicion = 0;

    doc.addImage(imgData, 'JPEG', 0, posicion, imgW, imgH);
    restante -= altoPagina;
    while (restante > 0) {
      posicion -= altoPagina;
      doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, posicion, imgW, imgH);
      restante -= altoPagina;
    }

    doc.save(nombreArchivo || 'de-trazos-a-emociones.pdf');
  } finally {
    document.body.removeChild(cont);
  }
};

// Informe de un análisis (detalle y/o historial del niño), con el estilo de la app.
export async function exportarAnalisis({ detalle, imagenDataUrl, historial, nombreArchivo }) {
  let inner = '';
  if (detalle) inner += seccionDetalle(detalle, imagenDataUrl);
  if (historial && historial.lista?.length) inner += seccionHistorial(historial.nombre, historial.lista);
  const html = documento(inner, 'Informe de análisis');
  await htmlAPdf(html, nombreArchivo);
}

// Reporte consolidado de todos los niños.
export async function exportarReporte(ninos, nombreArchivo) {
  const html = documento(seccionConsolidado(ninos), 'Reporte consolidado');
  await htmlAPdf(html, nombreArchivo || 'de-trazos-reporte.pdf');
}
