import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import Seccion from '../models/Seccion'
import { useCombiner } from '../hooks/useCombiner'
import CombinerCourses from './CombinerCourses'
import CombinationCard from './CombinationCard'

interface CombinerPageProps {
  seccionesActivas: Seccion[]
  onToggleSeccion: (idUnico: string) => void
  onVolver: () => void
}

export default function CombinerPage({ seccionesActivas, onToggleSeccion, onVolver }: CombinerPageProps) {
  const {
    items,
    combinaciones,
    generando,
    conteo,
    agregarCurso,
    quitarCurso,
    toggleSeccionCurso,
    generar,
    detener,
  } = useCombiner(seccionesActivas)

  const handleImport = (secciones: Seccion[]) => {
    for (const sec of secciones) {
      onToggleSeccion(sec.idUnico)
    }
    onVolver()
  }

  const totalSecciones = items.reduce((sum, item) => {
    const secs = item.seccionesSeleccionadas
      ? item.curso.secciones.filter(s => item.seccionesSeleccionadas!.has(s.nrc))
      : item.curso.secciones
    return sum + secs.length
  }, 0)

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-800 to-indigo-700 dark:from-slate-900 dark:to-slate-800 text-white px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onVolver}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            title="Volver al planeador"
          >
            <ArrowLeftIcon className="size-4" />
          </motion.button>
          <h1 className="text-base md:text-lg font-bold tracking-tight">Combinador de Horarios</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <CombinerCourses
            items={items}
            onAgregarCurso={agregarCurso}
            onQuitarCurso={quitarCurso}
            onToggleSeccion={toggleSeccionCurso}
          />

          {items.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 dark:text-slate-500">
                {items.length} curso(s), {totalSecciones} sección(es)
                {seccionesActivas.length > 0 && `, ${seccionesActivas.length} sección(es) fija(s)`}
              </span>
              <div className="flex gap-2">
                {generando ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={detener}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
                  >
                    <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Detener
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={generar}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-800 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white shadow-sm transition-colors"
                  >
                    Generar combinaciones
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {combinaciones.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Resultados
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                  {conteo} combinación(es) encontrada(s), ordenadas por horas totales
                </span>
              </div>
              <div className="grid gap-3">
                {combinaciones.map((combo, i) => (
                  <CombinationCard
                    key={i}
                    combinacion={combo}
                    onImport={handleImport}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {items.length > 0 && combinaciones.length === 0 && !generando && (
            <div className="text-center py-8 text-[11px] text-gray-400 dark:text-slate-500">
              Presiona "Generar combinaciones" para buscar combinaciones sin conflicto
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
