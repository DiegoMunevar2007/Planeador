import { motion } from 'framer-motion'
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
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
      className={`flex items-start gap-2.5 px-3 py-2.5 border-t border-gray-100 dark:border-slate-700 cursor-pointer transition-colors ${
        enConflicto && seleccionada
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
      }`}
      onClick={onToggle}
    >
      <div className="relative mt-0.5">
        <motion.div
          animate={seleccionada ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`size-4 rounded border-2 flex items-center justify-center transition-colors ${
            seleccionada
              ? 'bg-brand-800 dark:bg-brand-600 border-brand-800 dark:border-brand-600'
              : 'border-gray-300 dark:border-slate-600'
          }`}
        >
          {seleccionada && (
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
              className="size-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </motion.svg>
          )}
        </motion.div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-900 dark:text-slate-100">NRC {seccion.nrc}</span>
          <span className="text-[11px] text-gray-500 dark:text-slate-400">— Sec. {seccion.numero}</span>
          {enConflicto && seleccionada && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-500 text-white"
            >
              Conflicto
            </motion.span>
          )}
        </div>
        {seccion.ptrm !== '16' && (
          <div className="text-[10px] text-brand-800 dark:text-brand-400 mt-0.5">Duración: {seccion.ptrm}</div>
        )}
        {horarioStr && <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{horarioStr}</div>}
        {profesStr && <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">{profesStr}</div>}
        <div className={`text-[10px] mt-0.5 font-medium ${disponibles > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          {disponibles > 0 ? `${disponibles} cupo(s) disponible(s)` : 'LLENO'}
        </div>
      </div>
    </motion.div>
  )
}
