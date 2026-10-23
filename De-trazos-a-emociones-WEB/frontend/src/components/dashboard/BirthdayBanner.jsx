import './BirthdayBanner.css';
import { emocionPredominante } from '../../utils/emociones';
import { actividadesPara } from '../../data/actividades';

const BirthdayBanner = ({ cumples = [] }) => {
  if (cumples.length === 0) return null;

  return (
    <div className="bday-list">
      {cumples.map(({ nino, cumple }) => {
        const emocion = emocionPredominante(nino.analisis);
        const sugerencia = emocion ? actividadesPara(emocion).actividades[0] : null;
        const cuando = cumple.cuando === 'hoy' ? 'hoy' : 'mañana';
        return (
          <div className="bday-card" key={nino.nombre}>
            <div className="bday-emoji">🎂</div>
            <div className="bday-text">
              <div className="bday-title">
                {nino.nombre} cumple {cumple.edad} años {cuando}
              </div>
              {sugerencia ? (
                <div className="bday-sub">
                  En sus últimos dibujos mostró sobre todo <strong>{emocion}</strong>. Una idea para acompañar su día:
                  {' '}<strong>{sugerencia.nombre}</strong> — {sugerencia.desc}
                </div>
              ) : (
                <div className="bday-sub">¡Un buen momento para celebrarlo y acompañarlo en su día!</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BirthdayBanner;
