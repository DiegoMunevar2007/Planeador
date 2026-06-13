import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import Curso from '../models/Curso'
import { CombinerItem } from '../hooks/useCombiner'
import { useCourses } from '../hooks/useCourses'
import { DIAS_LABEL } from '../utils/timeUtils'

interface CombinerCoursesProps {
  items: CombinerItem[]
  onAgregarCurso: (curso: Curso) => void
  onQuitarCurso: (codigo: string) => void
  onToggleSeccion: (codigo: string, nrc: string) => void
}

export default function CombinerCourses({
  items,
  onAgregarCurso,
  onQuitarCurso,
  onToggleSeccion,
}: CombinerCoursesProps) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { resultados, loading, buscar } = useCourses()

  const handleSearch = () => {
    if (query.trim()) buscar(query.trim())
  }

  const toggleExpand = (codigo: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(codigo)) next.delete(codigo)
      else next.add(codigo)
      return next
    })
  }

  const yaAgregado = (codigo: string) => items.some(i => i.curso.codigo === codigo)

  function seccionSeleccionada(item: CombinerItem, nrc: string): boolean {
    if (item.seccionesSeleccionadas === null) return true
    return item.seccionesSeleccionadas.has(nrc)
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            placeholder="Buscar curso por código o nombre..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-shadow"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-800 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : 'Buscar'}
        </motion.button>
      </div>

      {/* Search results */}
      {resultados.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {resultados.map(curso => (
            <div
              key={curso.codigo}
              className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-slate-700 last:border-b-0"
            >
              <div className="min-w-0">
                <span className="text-xs font-semibold text-gray-900 dark:text-slate-100">{curso.codigo}</span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 ml-2">{curso.titulo}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">{curso.creditos} créd.</span>
              </div>
              <button
                onClick={() => onAgregarCurso(curso)}
                disabled={yaAgregado(curso.codigo)}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                  yaAgregado(curso.codigo)
                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-default'
                    : 'bg-brand-800 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white'
                }`}
              >
                <PlusIcon className="size-3" />
                {yaAgregado(curso.codigo) ? 'Agregado' : 'Agregar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Added courses */}
      {items.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800 text-[10px] font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
            Cursos en el combinador ({items.length})
          </div>
          {items.map(item => {
            const isOpen = expanded.has(item.curso.codigo)
            const seccionesVisibles = item.seccionesSeleccionadas === null
              ? item.curso.secciones
              : item.curso.secciones.filter(s => item.seccionesSeleccionadas!.has(s.nrc))
            const todasSeleccionadas = item.seccionesSeleccionadas === null

            return (
              <div key={item.curso.codigo}>
                <div
                  className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => toggleExpand(item.curso.codigo)}
                >
                  {isOpen ? (
                    <ChevronDownIcon className="size-3 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronRightIcon className="size-3 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-xs font-semibold text-gray-900 dark:text-slate-100">
                    {item.curso.codigo}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">
                    {todasSeleccionadas
                      ? `${item.curso.secciones.length} sec.`
                      : `${seccionesVisibles.length} / ${item.curso.secciones.length} sec.`}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">{item.curso.creditos} créd.</span>
                  <button
                    onClick={e => { e.stopPropagation(); onQuitarCurso(item.curso.codigo) }}
                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <XMarkIcon className="size-3.5" />
                  </button>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      {item.curso.secciones.map(sec => {
                        const checked = seccionSeleccionada(item, sec.nrc)
                        const horarioStr = sec.horarios
                          .filter(h => h.horaInicio && h.horaFin)
                          .map(h => {
                            const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
                            return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)}-${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
                          })
                          .join(', ')
                        const profesStr = sec.profesores.map(p => p.nombre).join(', ')

                        return (
                          <label
                            key={sec.nrc}
                            className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-50 dark:border-slate-800 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors text-[10px]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onToggleSeccion(item.curso.codigo, sec.nrc)}
                              className="accent-brand-800 dark:accent-brand-600 size-3 rounded"
                            />
                            <span className="font-medium text-gray-700 dark:text-slate-300 min-w-[4rem]">NRC {sec.nrc}</span>
                            <span className="text-gray-500 dark:text-slate-400">Sec {sec.numero}</span>
                            {horarioStr && (
                              <span className="text-gray-400 dark:text-slate-500 truncate">{horarioStr}</span>
                            )}
                            {profesStr && (
                              <span className="text-gray-400 dark:text-slate-500 truncate hidden sm:inline">{profesStr}</span>
                            )}
                          </label>
                        )
                      })}
                      {todasSeleccionadas && (
                        <div className="px-3 py-1 text-[9px] text-gray-400 dark:text-slate-500 italic">
                          Usando todas las secciones. Desmarca algunas para limitar.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      {items.length === 0 && resultados.length === 0 && (
        <div className="text-center py-8 text-[11px] text-gray-400 dark:text-slate-500">
          Busca cursos para agregar al combinador
        </div>
      )}
    </div>
  )
}
