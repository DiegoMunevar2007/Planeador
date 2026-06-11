import { useState } from 'react'

interface PlanData {
  id: string
  nombre: string
  seccionIds: string[]
}

interface PlanTabsProps {
  planes: PlanData[]
  planActivoId: string
  totalCreditos: number
  onSelect: (id: string) => void
  onCrear: () => void
  onEliminar: (id: string) => void
  onRenombrar: (id: string, nombre: string) => void
}

export default function PlanTabs({
  planes,
  planActivoId,
  totalCreditos,
  onSelect,
  onCrear,
  onEliminar,
  onRenombrar,
}: PlanTabsProps) {
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editValor, setEditValor] = useState('')

  const iniciarEdicion = (id: string, nombre: string) => {
    setEditandoId(id)
    setEditValor(nombre)
  }

  const confirmarEdicion = () => {
    if (editandoId && editValor.trim()) {
      onRenombrar(editandoId, editValor.trim())
    }
    setEditandoId(null)
  }

  return (
    <div className="plan-tabs">
      <div className="plan-tabs-scroll">
        {planes.map(plan => (
          <div
            key={plan.id}
            className={`plan-tab${plan.id === planActivoId ? ' active' : ''}`}
            onClick={() => onSelect(plan.id)}
          >
            {editandoId === plan.id ? (
              <input
                className="plan-tab-input"
                value={editValor}
                onChange={e => setEditValor(e.target.value)}
                onBlur={confirmarEdicion}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmarEdicion()
                  if (e.key === 'Escape') setEditandoId(null)
                }}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span
                className="plan-tab-nombre"
                onDoubleClick={e => {
                  e.stopPropagation()
                  iniciarEdicion(plan.id, plan.nombre)
                }}
              >
                {plan.nombre}
              </span>
            )}
            <span className="plan-tab-count">{plan.seccionIds.length}</span>
            {planes.length > 1 && (
              <button
                className="plan-tab-close"
                onClick={e => {
                  e.stopPropagation()
                  onEliminar(plan.id)
                }}
                title="Eliminar plan"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button className="plan-tab-add" onClick={onCrear} title="Nuevo plan">
          +
        </button>
      </div>
      <div className="plan-creditos-bar">
        <span>Créditos: <strong>{totalCreditos}</strong></span>
      </div>
    </div>
  )
}
