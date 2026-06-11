import { useState } from 'react'
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
    <form className="filter-bar" onSubmit={handleSubmit}>
      <div className="filter-row">
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por código o nombre (ej: ADMI1101, fundamentos)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="filter-btn" disabled={loading || !query.trim()}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      <div className="filter-row filter-row-narrow">
        <select
          className="filter-select"
          value={attr}
          onChange={e => setAttr(e.target.value)}
        >
          <option value="">Todos los atributos</option>
          {atributosEspeciales.filter(a => a).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          className="filter-select"
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
