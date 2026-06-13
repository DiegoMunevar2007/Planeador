import { useState, useCallback, useRef } from 'react'
import Curso from '../models/Curso'
import Seccion from '../models/Seccion'
import { tienenConflicto } from '../utils/conflictDetection'

export interface CombinerItem {
  curso: Curso
  seccionesSeleccionadas: Set<string> | null
}

export interface Combinacion {
  secciones: Seccion[]
  totalCreditos: number
  totalHoras: number
}

export function useCombiner(seccionesFijas: Seccion[]) {
  const [items, setItems] = useState<CombinerItem[]>([])
  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([])
  const [generando, setGenerando] = useState(false)
  const [conteo, setConteo] = useState(0)
  const stopRef = useRef(false)

  const reset = useCallback(() => {
    setItems([])
    setCombinaciones([])
    setConteo(0)
    stopRef.current = true
    setGenerando(false)
  }, [])

  const agregarCurso = useCallback((curso: Curso) => {
    setItems(prev => {
      if (prev.some(i => i.curso.codigo === curso.codigo)) return prev
      return [...prev, { curso, seccionesSeleccionadas: null }]
    })
  }, [])

  const quitarCurso = useCallback((codigo: string) => {
    setItems(prev => prev.filter(i => i.curso.codigo !== codigo))
    setCombinaciones([])
    setConteo(0)
  }, [])

  const toggleSeccionCurso = useCallback((codigo: string, nrc: string) => {
    setItems(prev => prev.map(item => {
      if (item.curso.codigo !== codigo) return item
      const set = item.seccionesSeleccionadas ?? new Set(item.curso.secciones.map(s => s.nrc))
      const newSet = new Set(set)
      if (newSet.has(nrc)) {
        newSet.delete(nrc)
      } else {
        newSet.add(nrc)
      }
      return { ...item, seccionesSeleccionadas: newSet.size === item.curso.secciones.length ? null : newSet }
    }))
    setCombinaciones([])
    setConteo(0)
  }, [])

  const calcularTotalHoras = useCallback((secciones: Seccion[]): number => {
    const minutos = new Set<number>()
    for (const sec of secciones) {
      for (const h of sec.horarios) {
        if (!h.horaInicio || !h.horaFin) continue
        const inicio = parseInt(h.horaInicio.slice(0, 2)) * 60 + parseInt(h.horaInicio.slice(2, 4))
        const fin = parseInt(h.horaFin.slice(0, 2)) * 60 + parseInt(h.horaFin.slice(2, 4))
        for (let m = inicio; m < fin; m += 30) {
          minutos.add(m)
        }
      }
    }
    return Math.round(minutos.size / 2)
  }, [])

  const generar = useCallback(() => {
    const activeItems = items.filter(i => {
      const secs = i.seccionesSeleccionadas
        ? i.curso.secciones.filter(s => i.seccionesSeleccionadas!.has(s.nrc))
        : i.curso.secciones
      return secs.length > 0
    })
    if (activeItems.length === 0) return

    setGenerando(true)
    setConteo(0)
    stopRef.current = false

    const fixed = seccionesFijas

    const groups: { idx: number; secciones: Seccion[] }[] = activeItems.map((item, idx) => ({
      idx,
      secciones: item.seccionesSeleccionadas
        ? item.curso.secciones.filter(s => item.seccionesSeleccionadas!.has(s.nrc))
        : [...item.curso.secciones],
    }))

    let globalCursor = 0
    const secToGroup: number[] = []
    const allSecs: Seccion[] = []
    const groupOffsets: number[] = []

    for (const g of groups) {
      groupOffsets.push(globalCursor)
      for (const s of g.secciones) {
        allSecs.push(s)
        secToGroup.push(g.idx)
        globalCursor++
      }
    }

    const n = allSecs.length
    const conflict: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false))

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (secToGroup[i] === secToGroup[j]) {
          conflict[i][j] = conflict[j][i] = true
        } else if (tienenConflicto(allSecs[i], allSecs[j])) {
          conflict[i][j] = conflict[j][i] = true
        }
      }
    }

    const fixedConflicts: boolean[] = allSecs.map(s => {
      for (const f of fixed) {
        if (tienenConflicto(s, f)) return true
      }
      return false
    })

    const domains: number[][] = groups.map((g, gi) => {
      const offset = groupOffsets[gi]
      return Array.from({ length: g.secciones.length }, (_, i) => offset + i)
    })

    const allResults: Combinacion[] = []

    function countConflictsForLCV(
      secIdx: number,
      restGroups: number[],
      doms: number[][],
    ): number {
      let count = 0
      for (const g of restGroups) {
        for (const s of doms[g]) {
          if (conflict[secIdx][s]) count++
        }
      }
      return count
    }

    function backtrack(
      assignment: number[],
      remaining: number[],
      doms: number[][],
    ) {
      if (stopRef.current) return

      if (remaining.length === 0) {
        const secciones = assignment.map(i => allSecs[i])
        const totalCreditos = secciones.reduce((s, sec) => s + parseInt(sec.curso.creditos || '0'), 0)
        const totalHoras = calcularTotalHoras(secciones)
        allResults.push({ secciones, totalCreditos, totalHoras })
        return
      }

      const sortedRemaining = [...remaining].sort((a, b) => doms[a].length - doms[b].length)
      const group = sortedRemaining[0]
      const rest = sortedRemaining.slice(1)

      const candidates = doms[group].filter(idx => !fixedConflicts[idx])

      candidates.sort((a, b) => {
        const impactA = countConflictsForLCV(a, rest, doms)
        const impactB = countConflictsForLCV(b, rest, doms)
        return impactA - impactB
      })

      for (const secIdx of candidates) {
        const newDomains = doms.map((d, gi) => {
          if (gi === group || !remaining.includes(gi)) return d
          return d.filter(s => !conflict[secIdx][s])
        })

        const hasEmpty = rest.some(gi => newDomains[gi].length === 0)
        if (hasEmpty) continue

        assignment.push(secIdx)
        backtrack(assignment, rest, newDomains)
        assignment.pop()

        if (stopRef.current) return
      }
    }

    const groupIndices = groups.map((_, i) => i)

    const run = () => {
      backtrack([], groupIndices, domains)
      const sorted = [...allResults].sort((a, b) => a.totalHoras - b.totalHoras)
      setConteo(sorted.length)
      setGenerando(false)
      setCombinaciones(sorted)
    }

    setTimeout(run, 0)
  }, [items, seccionesFijas, calcularTotalHoras])

  const detener = useCallback(() => {
    stopRef.current = true
    setGenerando(false)
  }, [])

  return {
    items,
    combinaciones,
    generando,
    conteo,
    agregarCurso,
    quitarCurso,
    toggleSeccionCurso,
    generar,
    detener,
    reset,
  }
}
