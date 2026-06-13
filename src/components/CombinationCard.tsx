import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import Seccion from '../models/Seccion'
import { Combinacion } from '../hooks/useCombiner'
import { DIAS, horaStrAMinutos } from '../utils/timeUtils'

interface CombinationCardProps {
  combinacion: Combinacion
  onImport: (secciones: Seccion[]) => void
  index: number
}

const MIN_HEIGHT = 8
const HORA_INICIO = 360
const HORA_FIN = 1320
const TOTAL_MIN = HORA_FIN - HORA_INICIO

const COLORS = [
  { bg: '#6366f1', text: '#fff' },
  { bg: '#22c55e', text: '#fff' },
  { bg: '#f97316', text: '#fff' },
  { bg: '#ef4444', text: '#fff' },
  { bg: '#a855f7', text: '#fff' },
  { bg: '#06b6d4', text: '#fff' },
  { bg: '#ec4899', text: '#fff' },
  { bg: '#eab308', text: '#000' },
  { bg: '#0ea5e9', text: '#fff' },
  { bg: '#10b981', text: '#fff' },
]

export default function CombinationCard({ combinacion, onImport, index }: CombinationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
    >
      {/* Mini schedule visual */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex border-b border-gray-100 dark:border-slate-700 pb-1 mb-2">
          {DIAS.map(d => {
            const labels: Record<string, string> = { l: 'L', m: 'M', i: 'I', j: 'J', v: 'V', s: 'S' }
            return (
              <div key={d} className="flex-1 text-center text-[9px] font-semibold text-gray-400 dark:text-slate-500">
                {labels[d] || d}
              </div>
            )
          })}
        </div>
        <div className="relative h-20">
          {combinacion.secciones.map((sec, si) => {
            const color = COLORS[si % COLORS.length]
            return sec.horarios
              .filter(h => h.horaInicio && h.horaFin)
              .map(h => {
                const inicio = horaStrAMinutos(h.horaInicio)
                const fin = horaStrAMinutos(h.horaFin)
                const top = ((inicio - HORA_INICIO) / TOTAL_MIN) * 80
                const height = Math.max(((fin - inicio) / TOTAL_MIN) * 80, MIN_HEIGHT)

                return h.dias.map(dia => {
                  const diaIdx = DIAS.indexOf(dia as typeof DIAS[number])
                  if (diaIdx === -1) return null
                  return (
                    <div
                      key={`${si}-${h.horaInicio}-${dia}`}
                      className="absolute rounded-[3px] flex items-center justify-center overflow-hidden"
                      style={{
                        top,
                        height,
                        left: `${(diaIdx / 6) * 100}%`,
                        width: `${100 / 6}%`,
                        background: color.bg,
                        color: color.text,
                        fontSize: height < 12 ? 6 : 7,
                        fontWeight: 600,
                        padding: '0 1px',
                        lineHeight: 1.1,
                      }}
                    >
                      {height >= 12 ? sec.curso.codigo : ''}
                    </div>
                  )
                })
              })
          })}
        </div>
      </div>

      {/* Section list */}
      <div className="px-3 pb-2 space-y-1">
        {combinacion.secciones.map((sec, si) => {
          const horarioStr = sec.horarios
            .filter(h => h.horaInicio && h.horaFin)
            .map(h => {
              const dias = h.dias.map(d => ({ l: 'L', m: 'M', i: 'I', j: 'J', v: 'V', s: 'S' })[d] || d).join('')
              return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)}-${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
            })
            .join(', ')

          return (
            <div key={sec.idUnico} className="flex items-center gap-2 text-[10px]">
              <span
                className="inline-block size-2 rounded-full flex-shrink-0"
                style={{ background: COLORS[si % COLORS.length].bg }}
              />
              <span className="font-semibold text-gray-900 dark:text-slate-100">{sec.curso.codigo}</span>
              <span className="text-gray-500 dark:text-slate-400">Sec {sec.numero}</span>
              <span className="text-gray-400 dark:text-slate-500 truncate">{horarioStr}</span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="font-semibold text-gray-700 dark:text-slate-300">
            {combinacion.totalCreditos} créd.
          </span>
          <span className="text-gray-400 dark:text-slate-500">
            ~{combinacion.totalHoras}h/sem
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onImport(combinacion.secciones)}
          className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold rounded-lg bg-brand-800 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white shadow-sm transition-colors"
        >
          Importar al plan
          <ArrowRightIcon className="size-3" />
        </motion.button>
      </div>
    </motion.div>
  )
}
