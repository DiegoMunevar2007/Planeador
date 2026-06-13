import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SunIcon, MoonIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon, AcademicCapIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useCourses } from './hooks/useCourses'
import { usePlans } from './hooks/usePlans'
import { detectarConflictos } from './utils/conflictDetection'
import ScheduleGrid from './components/ScheduleGrid'
import SeccionItem from './components/SeccionItem'
import PlanTabs from './components/PlanTabs'
import FilterBar from './components/FilterBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Curso from './models/Curso'
import Seccion from './models/Seccion'
import { DIAS_LABEL } from './utils/timeUtils'

type Pestaña = 'buscar' | 'seleccionadas'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode')
      const isDark = stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
      return isDark
    }
    return false
  })

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('darkMode', String(next))
      return next
    })
  }

  const { resultados, loading, error, buscar } = useCourses()
  const {
    planes,
    planActivoId,
    seccionesActivas,
    totalCreditos,
    loading: loadingSections,
    toggleSeccion,
    crearPlan,
    renombrarPlan,
    eliminarPlan,
    limpiarPlan,
    exportarPlan,
    setPlanActivoId,
  } = usePlans(resultados)

  const [pestaña, setPestaña] = useState<Pestaña>('buscar')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const conflictos = useMemo(() => detectarConflictos(seccionesActivas), [seccionesActivas])

  const seccionesEnConflicto = useMemo(() => {
    const set = new Set<Seccion>()
    conflictos.forEach(c => {
      set.add(c.seccionA)
      set.add(c.seccionB)
    })
    return set
  }, [conflictos])

  const handleSearch = useCallback(
    (query: string, attr: string, prog: string) => {
      buscar(query, attr, prog)
    },
    [buscar],
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-800 to-indigo-700 dark:from-slate-900 dark:to-slate-800 text-white px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-base md:text-lg font-bold tracking-tight">Planeador de Horarios</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] md:text-xs opacity-80 hidden sm:block">Universidad de los Andes — 202620</span>
          {seccionesActivas.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              onClick={exportarPlan}
            >
              <ArrowDownTrayIcon className="size-3.5" />
              Exportar
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            onClick={toggleDarkMode}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </motion.button>
        </div>
      </header>

      {/* Plan tabs */}
      <PlanTabs
        planes={planes}
        planActivoId={planActivoId}
        totalCreditos={totalCreditos}
        onSelect={setPlanActivoId}
        onCrear={crearPlan}
        onEliminar={eliminarPlan}
        onRenombrar={renombrarPlan}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden app-content-responsive">
        {/* Left panel - collapsible */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0, overflow: 'hidden' }}
              animate={{ width: 380, opacity: 1, overflow: 'hidden' }}
              exit={{ width: 0, opacity: 0, overflow: 'hidden' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col flex-shrink-0"
              style={{ minWidth: 0 }}
            >
              <div className="flex flex-col h-full min-w-0">
                {/* Panel tabs */}
                <div className="flex border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                  <button
                    className={`flex-1 px-3 py-2.5 text-xs font-semibold relative transition-colors ${
                      pestaña === 'buscar'
                        ? 'text-brand-800 dark:text-brand-400'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                    onClick={() => setPestaña('buscar')}
                  >
                    Buscar
                    {pestaña === 'buscar' && (
                      <motion.div
                        layoutId="panel-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-800 dark:bg-brand-500 rounded-full"
                      />
                    )}
                  </button>
                  <button
                    className={`flex-1 px-3 py-2.5 text-xs font-semibold relative transition-colors ${
                      pestaña === 'seleccionadas'
                        ? 'text-brand-800 dark:text-brand-400'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                    onClick={() => setPestaña('seleccionadas')}
                  >
                    Seleccionadas
                    {seccionesActivas.length > 0 && (
                      <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-800 text-white dark:bg-brand-600">
                        {seccionesActivas.length}
                      </span>
                    )}
                    {pestaña === 'seleccionadas' && (
                      <motion.div
                        layoutId="panel-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-800 dark:bg-brand-500 rounded-full"
                      />
                    )}
                  </button>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-y-auto panel-content">
                  <AnimatePresence mode="wait">
                    {pestaña === 'buscar' ? (
                      <motion.div
                        key="buscar"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <FilterBar onSearch={handleSearch} loading={loading} />

                        <div className="p-3">
                          {loading && (
                            <div className="flex flex-col items-center gap-3 py-8 text-gray-400 dark:text-slate-500">
                              <svg className="animate-spin size-8 text-brand-800 dark:text-brand-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              <span className="text-xs">Cargando...</span>
                            </div>
                          )}
                          {error && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-8 text-xs text-red-500 dark:text-red-400"
                            >
                              {error}
                            </motion.div>
                          )}
                          {!loading && !error && resultados.length === 0 && (
                            <div className="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
                              Busca un curso por código o nombre
                            </div>
                          )}
                          {resultados.map((curso: Curso) => (
                            <motion.div
                              key={curso.codigo}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-3 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
                            >
                              <div className="px-3 py-2.5 bg-gray-50 dark:bg-slate-800 font-semibold text-xs flex justify-between items-center">
                                <span className="text-gray-900 dark:text-slate-100">
                                  {curso.codigo} — {curso.titulo}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">{curso.creditos} créd.</span>
                              </div>
                              {curso.secciones.map((seccion: Seccion) => (
                                <SeccionItem
                                  key={seccion.idUnico}
                                  seccion={seccion}
                                  seleccionada={seccionesActivas.some(s => s.idUnico === seccion.idUnico)}
                                  enConflicto={seccionesEnConflicto.has(seccion)}
                                  onToggle={() => toggleSeccion(seccion.idUnico)}
                                />
                              ))}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="seleccionadas"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="p-3"
                      >
                        {seccionesActivas.length === 0 ? (
                          <div className="flex flex-col items-center gap-3 py-12 text-gray-400 dark:text-slate-500">
                            <AcademicCapIcon className="size-10 opacity-50" />
                            <span className="text-xs">No has seleccionado ninguna sección en este plan</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-gray-200 dark:border-slate-700">
                              <span className="text-xs font-semibold">
                                {seccionesActivas.length} sección{seccionesActivas.length !== 1 ? 'es' : ''}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-400 font-medium">
                                  {totalCreditos} créd.
                                </span>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={limpiarPlan}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <TrashIcon className="size-3" />
                                  Limpiar
                                </Button>
                              </div>
                            </div>
                            <AnimatePresence>
                              {seccionesActivas.map((sec, idx) => {
                                const horarioStr = sec.horarios
                                  .filter(h => h.horaInicio && h.horaFin)
                                  .map(h => {
                                    const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
                                    return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)} - ${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
                                  })
                                  .join(', ')
                                const profesStr = sec.profesores.map(p => p.nombre).join(', ')
                                const enConflicto = seccionesEnConflicto.has(sec)

                                return (
                                  <motion.div
                                    key={sec.idUnico}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                                  >
                                    <Card
                                      size="sm"
                                      className={`mb-2 ${enConflicto ? 'ring-1 ring-red-400 dark:ring-red-500' : ''}`}
                                    >
                                      <CardContent className="flex gap-2.5 pt-3">
                                        <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                          onClick={() => toggleSeccion(sec.idUnico)}
                                          title="Quitar sección"
                                        >
                                          <XMarkIcon className="size-3" />
                                        </Button>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-semibold mb-0.5">
                                            <span>{sec.curso.codigo}</span> — Sec. {sec.numero}
                                            {enConflicto && (
                                              <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="ml-1.5 inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-500 text-white"
                                              >
                                                Conflicto
                                              </motion.span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground">NRC {sec.nrc}</div>
                                          {horarioStr && <div className="text-[10px] text-muted-foreground mt-0.5">{horarioStr}</div>}
                                          {profesStr && <div className="text-[10px] text-muted-foreground mt-0.5">{profesStr}</div>}
                                          <div className="text-[10px] text-brand-800 dark:text-brand-400 mt-0.5">
                                            {sec.ptrm !== '16' ? `Duración: ${sec.ptrm}` : 'Duración completa'}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )
                              })}
                            </AnimatePresence>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar toggle button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 self-center w-5 h-10 -ml-2.5 z-10 flex items-center justify-center rounded-r-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 border-l-0 shadow-sm text-gray-400 hover:text-brand-800 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => setSidebarOpen(v => !v)}
          title={sidebarOpen ? 'Cerrar panel' : 'Abrir panel'}
        >
          {sidebarOpen ? <ChevronLeftIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
        </motion.button>

        {/* Calendar */}
        <ScheduleGrid
          secciones={seccionesActivas}
          seccionesEnConflicto={seccionesEnConflicto}
          loading={loadingSections}
          onRemoveSeccion={(sec: Seccion) => toggleSeccion(sec.idUnico)}
        />
      </div>
    </div>
  )
}
