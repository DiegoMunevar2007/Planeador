import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LightBulbIcon, PlusIcon } from '@heroicons/react/24/solid'
import { buscarCurso } from '../api/ofertaCursos'
import { tienenConflicto } from '../utils/conflictDetection'
import Seccion from '../models/Seccion'
import { DIAS_LABEL } from '../utils/timeUtils'

interface SugerenciasTabProps {
  seccionesActivas: Seccion[]
  onToggleSeccion: (idUnico: string) => void
}

const CODIGOS_CBU = ['CBUH', 'CBUT']

type SuggestionState = 'idle' | 'loading' | 'loaded'

export default function SugerenciasTab({ seccionesActivas, onToggleSeccion }: SugerenciasTabProps) {
  const [state, setState] = useState<SuggestionState>('idle')
  const [rawSections, setRawSections] = useState<{ curso: string; titulo: string; seccion: Seccion }[]>([])

  useEffect(() => {
    if (state !== 'idle') return
    setState('loading')
    ;(async () => {
      const all: { curso: string; titulo: string; seccion: Seccion }[] = []
      for (const codigo of CODIGOS_CBU) {
        try {
          const result = await buscarCurso(codigo, '202620')
          for (const curso of Object.values(result.cursos)) {
            for (const sec of curso.secciones) {
              all.push({ curso: curso.codigo, titulo: curso.titulo, seccion: sec })
            }
          }
        } catch { /* ignore */ }
      }
      setRawSections(all)
      setState('loaded')
    })()
  }, [state])

  const sugerencias = useMemo(() =>
    rawSections.map(item => ({
      ...item,
      compatible: !seccionesActivas.some(activa => tienenConflicto(item.seccion, activa)),
    })),
    [rawSections, seccionesActivas],
  )

  const compatibles = sugerencias.filter(s => s.compatible)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <LightBulbIcon className="size-4 text-amber-500" />
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
          Cursos CBUH y CBUT
        </span>
      </div>

      {state === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-8 text-gray-400 dark:text-slate-500">
          <svg className="animate-spin size-6 text-brand-800 dark:text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs">Buscando sugerencias...</span>
        </div>
      )}

      {state === 'loaded' && compatibles.length === 0 && (
        <div className="text-[11px] text-gray-400 dark:text-slate-500 px-1 mb-2">
          No se encontraron cursos CBUH/CBUT sin conflicto con tu horario actual
        </div>
      )}

      {state === 'loaded' && sugerencias.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          {sugerencias.map((item, i) => {
            const sec = item.seccion
            const horarioStr = sec.horarios
              .filter(h => h.horaInicio && h.horaFin)
              .map(h => {
                const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
                return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)}-${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
              })
              .join(', ')
            const profesStr = sec.profesores.map(p => p.nombre).join(', ')
            const disponibles = parseInt(sec.maxEnrol) - parseInt(sec.enrolled)

            return (
              <motion.div
                key={sec.idUnico}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`px-3 py-2 ${!item.compatible ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-gray-900 dark:text-slate-100">{item.curso}</span>
                      <span className="text-[10px] text-gray-500 dark:text-slate-400">— Sec. {sec.numero}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">NRC {sec.nrc}</span>
                      <span className="text-[10px] text-gray-500 dark:text-slate-400">{sec.curso.creditos} créd.</span>
                      {!item.compatible && (
                        <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Conflicto
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.titulo}</p>
                    {horarioStr && (
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{horarioStr}</p>
                    )}
                    {profesStr && (
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{profesStr}</p>
                    )}
                    <p className={`text-[10px] mt-0.5 font-medium ${disponibles > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {disponibles > 0 ? `${disponibles} cupo(s)` : 'LLENO'}
                    </p>
                  </div>
                  {item.compatible && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggleSeccion(sec.idUnico)}
                      className="flex-shrink-0 self-center flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-brand-800 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white transition-colors"
                    >
                      <PlusIcon className="size-3" />
                      Agregar
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
