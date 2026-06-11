import Seccion from '../models/Seccion'
import { DIAS_LABEL } from '../utils/timeUtils'

interface SeccionItemProps {
  seccion: Seccion
  seleccionada: boolean
  enConflicto: boolean
  onToggle: () => void
}

export default function SeccionItem({ seccion, seleccionada, enConflicto, onToggle }: SeccionItemProps) {
  const horarioStr = seccion.horarios
    .filter(h => h.horaInicio && h.horaFin)
    .map(h => {
      const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
      return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)} - ${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
    })
    .join(', ')

  const profesStr = seccion.profesores.map(p => p.nombre).join(', ')
  const disponibles = parseInt(seccion.maxEnrol) - parseInt(seccion.enrolled)

  return (
    <div
      className={`seccion-item${enConflicto && seleccionada ? ' conflicto' : ''}`}
      onClick={onToggle}
    >
      <input type="checkbox" checked={seleccionada} readOnly />
      <div className="seccion-info">
        <div>
          <span className="seccion-nrc">NRC {seccion.nrc}</span>
          <span className="seccion-numero"> — Sec. {seccion.numero}</span>
          {enConflicto && seleccionada && <span className="conflicto-badge">Conflicto</span>}
        </div>
        {seccion.ptrm !== '16' && <div style={{ fontSize: 11, color: '#0747a6' }}>Duración: {seccion.ptrm}</div>}
        {horarioStr && <div className="seccion-horarios">{horarioStr}</div>}
        {profesStr && <div className="seccion-profes">{profesStr}</div>}
        <div className={`seccion-cupos ${disponibles > 0 ? 'disponible' : 'lleno'}`}>
          {disponibles > 0 ? `${disponibles} cupo(s) disponible(s)` : 'LLENO'}
        </div>
      </div>
    </div>
  )
}
