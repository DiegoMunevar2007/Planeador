import Seccion from '../models/Seccion'
import { DIAS, DIAS_CORTO, horaStrAMinutos } from '../utils/timeUtils'

const COLORES = [
  '#0052cc', '#00875a', '#de350b', '#ff8b00',
  '#5243aa', '#00b8d9', '#e3495c', '#8777d9',
  '#f5a623', '#36b37e', '#6554c0', '#00a3bf',
]

const HORA_INICIO = 360
const HORA_FIN = 1320
const TOTAL_MIN = HORA_FIN - HORA_INICIO
const PX_POR_HORA = 60
const ALTURA_TOTAL = (TOTAL_MIN / 60) * PX_POR_HORA

interface ScheduleGridProps {
  secciones: Seccion[]
  seccionesEnConflicto: Set<Seccion>
  onRemoveSeccion: (seccion: Seccion) => void
}

export default function ScheduleGrid({ secciones, seccionesEnConflicto, onRemoveSeccion }: ScheduleGridProps) {
  if (secciones.length === 0) {
    return (
      <div className="schedule-container">
        <div className="grid-empty">
          Busca cursos y selecciona secciones para ver el horario
        </div>
      </div>
    )
  }

  const bloques = secciones.flatMap((seccion, idx) =>
    seccion.horarios
      .filter(bloque => bloque.horaInicio && bloque.horaFin)
      .map(bloque => ({
        bloque,
        seccion,
        color: COLORES[idx % COLORES.length],
        enConflicto: seccionesEnConflicto.has(seccion),
      })),
  )

  const horas: number[] = []
  for (let m = HORA_INICIO; m <= HORA_FIN; m += 60) {
    horas.push(m)
  }

  return (
    <div className="schedule-container">
      <div className="schedule-scroll">
        <div className="schedule-grid">
          <div className="schedule-header-row">
            <div className="time-gutter" />
            {DIAS.map(d => (
              <div key={d} className="day-header-cell">
                {DIAS_CORTO[d]}
              </div>
            ))}
          </div>
          <div className="schedule-body-row">
            <div className="time-gutter">
              {horas.map(m => (
                <div
                  key={m}
                  style={{ height: PX_POR_HORA, display: 'flex', alignItems: 'flex-start', paddingTop: 0 }}
                >
                  {`${Math.floor(m / 60)
                    .toString()
                    .padStart(2, '0')}:00`}
                </div>
              ))}
            </div>
            <div className="day-columns" style={{ height: ALTURA_TOTAL }}>
              {Array.from({ length: 6 }).map((_, diaIdx) => (
                <div key={diaIdx} className="day-column">
                  {horas.map(m => (
                    <div
                      key={m}
                      className="hour-line"
                      style={{ top: ((m - HORA_INICIO) / TOTAL_MIN) * ALTURA_TOTAL }}
                    />
                  ))}
                </div>
              ))}
              {bloques.map((item, i) =>
                item.bloque.dias.map(dia => {
                  const diaIdx = DIAS.indexOf(dia as (typeof DIAS)[number])
                  if (diaIdx === -1) return null

                  const inicio = horaStrAMinutos(item.bloque.horaInicio)
                  const fin = horaStrAMinutos(item.bloque.horaFin)
                  const top = ((inicio - HORA_INICIO) / TOTAL_MIN) * ALTURA_TOTAL
                  const height = Math.max(((fin - inicio) / TOTAL_MIN) * ALTURA_TOTAL, 18)

                  return (
                    <div
                      key={`${i}-${dia}`}
                      className={`section-block${item.enConflicto ? ' conflicto' : ''}`}
                      style={{
                        top,
                        height,
                        left: `${(diaIdx / 6) * 100}%`,
                        width: `${100 / 6}%`,
                        background: item.enConflicto
                          ? 'rgba(222, 53, 11, 0.15)'
                          : `${item.color}18`,
                        borderColor: item.enConflicto ? '#de350b' : item.color,
                      }}
                      title={`${item.seccion.curso.titulo}\nSec. ${item.seccion.numero} - NRC ${item.seccion.nrc}\n${item.bloque.horaInicio?.slice(0, 2) || '??'}:${item.bloque.horaInicio?.slice(2, 4) || '??'} - ${item.bloque.horaFin?.slice(0, 2) || '??'}:${item.bloque.horaFin?.slice(2, 4) || '??'}`}
                    >
                      <button
                        className="block-remove"
                        onClick={e => {
                          e.stopPropagation()
                          onRemoveSeccion(item.seccion)
                        }}
                        title="Quitar sección"
                      >
                        ✕
                      </button>
                      <span className="block-code" style={{ color: item.color }}>
                        {item.seccion.curso.codigo}
                      </span>
                      <span className="block-section">
                        Sec {item.seccion.numero}
                      </span>
                    </div>
                  )
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
