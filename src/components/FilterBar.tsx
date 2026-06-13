import { useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { atributosEspeciales, programasEspeciales } from '../api/ofertaCursos'

interface FilterBarProps {
  onSearch: (query: string, attr: string, prog: string) => void
  loading: boolean
}

export default function FilterBar({ onSearch, loading }: FilterBarProps) {
  const [query, setQuery] = useState('')
  const [attr, setAttr] = useState('')
  const [prog, setProg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, attr, prog)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch(query, attr, prog)
    }
  }

  return (
    <form className="p-3 border-b border-gray-200 dark:border-slate-700 flex flex-col gap-2 flex-shrink-0" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 text-xs border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 transition-all duration-200 focus:border-brand-800 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-800/15 dark:focus:ring-brand-500/20"
            placeholder="Buscar por código o nombre (ej: ADMI1101)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <motion.button
          whileHover={!loading && query.trim() ? { scale: 1.02 } : {}}
          whileTap={!loading && query.trim() ? { scale: 0.98 } : {}}
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-800 text-white hover:bg-brand-900 dark:bg-brand-600 dark:hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Buscando...
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="size-3.5" />
              Buscar
            </>
          )}
        </motion.button>
      </div>
      <div className="flex gap-1.5">
        <select
          className="flex-1 px-2 py-1.5 text-[11px] border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 cursor-pointer transition-colors focus:border-brand-800 dark:focus:border-brand-500"
          value={attr}
          onChange={e => setAttr(e.target.value)}
        >
          <option value="">Todos los atributos</option>
          {atributosEspeciales.filter(a => a).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          className="flex-1 px-2 py-1.5 text-[11px] border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 cursor-pointer transition-colors focus:border-brand-800 dark:focus:border-brand-500"
          value={prog}
          onChange={e => setProg(e.target.value)}
        >
          <option value="">Todos los programas</option>
          {programasEspeciales.filter(p => p).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    </form>
  )
}
