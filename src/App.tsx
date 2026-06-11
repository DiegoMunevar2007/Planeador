import { useState, useMemo, useCallback } from 'react'
import { useCourses } from './hooks/useCourses'
import { usePlans } from './hooks/usePlans'
import { detectarConflictos } from './utils/conflictDetection'
import ScheduleGrid from './components/ScheduleGrid'
import SeccionItem from './components/SeccionItem'
import PlanTabs from './components/PlanTabs'
import FilterBar from './components/FilterBar'
import Curso from './models/Curso'
import Seccion from './models/Seccion'
import { DIAS_LABEL } from './utils/timeUtils'

type Pestaña = 'buscar' | 'seleccionadas'

export default function App() {
  const { resultados, loading, error, buscar } = useCourses()
  const {
    planes,
    planActivoId,
    seccionesActivas,
    totalCreditos,
    toggleSeccion,
    crearPlan,
    renombrarPlan,
    eliminarPlan,
    limpiarPlan,
    exportarPlan,
    setPlanActivoId,
  } = usePlans(resultados)

  const [pestaña, setPestaña] = useState<Pestaña>('buscar')

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
    <>
      <header className="app-header">
        <h1>Planeador de Horarios</h1>
        <div className="header-actions">
          <span>Universidad de los Andes — 202620</span>
          {seccionesActivas.length > 0 && (
            <button className="btn-export" onClick={exportarPlan}>
              Exportar TXT
            </button>
          )}
        </div>
      </header>
      <PlanTabs
        planes={planes}
        planActivoId={planActivoId}
        totalCreditos={totalCreditos}
        onSelect={setPlanActivoId}
        onCrear={crearPlan}
        onEliminar={eliminarPlan}
        onRenombrar={renombrarPlan}
      />
      <div className="app-content">
        <div className="left-panel">
          <div className="panel-tabs">
            <button
              className={`panel-tab${pestaña === 'buscar' ? ' active' : ''}`}
              onClick={() => setPestaña('buscar')}
            >
              Buscar
            </button>
            <button
              className={`panel-tab${pestaña === 'seleccionadas' ? ' active' : ''}`}
              onClick={() => setPestaña('seleccionadas')}
            >
              Seleccionadas{seccionesActivas.length > 0 ? ` (${seccionesActivas.length})` : ''}
            </button>
          </div>

          {pestaña === 'buscar' ? (
            <>
              <FilterBar onSearch={handleSearch} loading={loading} />

              <div className="panel-content">
                {loading && <div className="loading">Cargando...</div>}
                {error && <div className="error">{error}</div>}
                {!loading && !error && resultados.length === 0 && (
                  <div className="empty">
                    Busca un curso por código o nombre
                  </div>
                )}
                {resultados.map((curso: Curso) => (
                  <div key={curso.codigo} className="curso-card">
                    <div className="curso-header">
                      <span>
                        {curso.codigo} — {curso.titulo}
                      </span>
                      <span className="curso-creditos">{curso.creditos} créd.</span>
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
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="panel-content">
              {seccionesActivas.length === 0 ? (
                <div className="empty">No has seleccionado ninguna sección en este plan</div>
              ) : (
                <>
                  <div className="seleccionadas-actions">
                    <span className="seleccionadas-count">
                      {seccionesActivas.length} sección{seccionesActivas.length !== 1 ? 'es' : ''}
                    </span>
                    <div>
                      <span className="seleccionadas-creditos">
                        {totalCreditos} créd. —
                      </span>
                      <button className="btn-limpiar-todo" onClick={limpiarPlan}>
                        Limpiar
                      </button>
                    </div>
                  </div>
                  {seccionesActivas.map(sec => {
                    const horarioStr = sec.horarios
                      .filter(h => h.horaInicio && h.horaFin)
                      .map(h => {
                        const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
                        return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)} - ${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
                      })
                      .join(', ')
                    const profesStr = sec.profesores.map(p => p.nombre).join(', ')

                    return (
                      <div
                        key={sec.idUnico}
                        className={`seleccionada-card${seccionesEnConflicto.has(sec) ? ' conflicto' : ''}`}
                      >
                        <button
                          className="seleccionada-remove"
                          onClick={() => toggleSeccion(sec.idUnico)}
                          title="Quitar sección"
                        >
                          ✕
                        </button>
                        <div className="seleccionada-info">
                          <div className="seleccionada-titulo">
                            <strong>{sec.curso.codigo}</strong> — Sec. {sec.numero}
                            {seccionesEnConflicto.has(sec) && (
                              <span className="conflicto-badge">Conflicto</span>
                            )}
                          </div>
                          <div className="seleccionada-nrc">NRC {sec.nrc}</div>
                          {horarioStr && <div className="seleccionada-detalle">{horarioStr}</div>}
                          {profesStr && <div className="seleccionada-detalle">{profesStr}</div>}
                          <div className="seleccionada-ptrm">
                            {sec.ptrm !== '16' ? `Duración: ${sec.ptrm}` : 'Duración completa'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        <ScheduleGrid
          secciones={seccionesActivas}
          seccionesEnConflicto={seccionesEnConflicto}
          onRemoveSeccion={(sec: Seccion) => toggleSeccion(sec.idUnico)}
        />
      </div>
    </>
  )
}
