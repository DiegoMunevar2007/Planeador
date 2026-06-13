import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'

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
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
      <div className="flex items-stretch overflow-x-auto px-1">
        <AnimatePresence mode="popLayout">
          {planes.map(plan => (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 text-xs cursor-pointer border-b-2 select-none ${
                plan.id === planActivoId
                  ? 'text-brand-800 dark:text-brand-400 font-semibold border-brand-800 dark:border-brand-400'
                  : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => onSelect(plan.id)}
            >
              {plan.id === planActivoId && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-800 dark:bg-brand-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              {editandoId === plan.id ? (
                <input
                  className="text-xs px-1.5 py-0.5 border-2 border-brand-800 dark:border-brand-500 rounded outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 w-24"
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
                  className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap"
                  onDoubleClick={e => {
                    e.stopPropagation()
                    iniciarEdicion(plan.id, plan.nombre)
                  }}
                >
                  {plan.nombre}
                </span>
              )}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  plan.id === planActivoId
                    ? 'bg-brand-800 text-white dark:bg-brand-500 dark:text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {plan.seccionIds.length}
              </span>
              {planes.length > 1 && (
                <button
                  className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                  onClick={e => {
                    e.stopPropagation()
                    onEliminar(plan.id)
                  }}
                  title="Eliminar plan"
                >
                  <XMarkIcon className="size-3" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 px-3 py-1.5 m-1 text-xs font-semibold text-gray-500 dark:text-slate-400 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:border-brand-800 dark:hover:border-brand-500 hover:text-brand-800 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors flex-shrink-0"
          onClick={onCrear}
          title="Nuevo plan"
        >
          <PlusIcon className="size-3.5" />
          Nuevo
        </motion.button>
      </div>
      <div className="flex justify-end px-4 py-1 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800">
        Créditos: <strong className="ml-1 text-gray-900 dark:text-slate-100">{totalCreditos}</strong>
      </div>
    </div>
  )
}
