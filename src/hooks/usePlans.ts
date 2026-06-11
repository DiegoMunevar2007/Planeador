import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import Seccion from '../models/Seccion'
import Curso from '../models/Curso'
import { buscarCurso } from '../api/ofertaCursos'

interface PlanData {
  id: string
  nombre: string
  seccionIds: string[]
}

const STORAGE_KEY = 'planeador_planes'

function cargarPlanes(): PlanData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : [{ id: 'default', nombre: 'Plan 1', seccionIds: [] }]
  } catch {
    return [{ id: 'default', nombre: 'Plan 1', seccionIds: [] }]
  }
}

function guardarPlanes(planes: PlanData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planes))
  } catch { /* empty */ }
}

function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function usePlans(cursos: Curso[]) {
  const [planes, setPlanes] = useState<PlanData[]>(cargarPlanes)
  const [planActivoId, setPlanActivoId] = useState(planes[0]?.id || 'default')
  const [cacheCursos, setCacheCursos] = useState<Map<string, Curso>>(new Map())
  const fetching = useRef(new Set<string>())

  useEffect(() => {
    guardarPlanes(planes)
  }, [planes])

  const cursosCombinados = useMemo(() => {
    const map = new Map<string, Curso>()
    for (const c of cursos) map.set(c.codigo, c)
    for (const [, c] of cacheCursos) {
      if (!map.has(c.codigo)) map.set(c.codigo, c)
    }
    return Array.from(map.values())
  }, [cursos, cacheCursos])

  /* Al cambiar de plan activo, busca automáticamente los cursos
     que tengan secciones guardadas pero aún no estén cargados */
  useEffect(() => {
    if (!planActivo) return
    const cargados = new Set(cursosCombinados.map(c => c.codigo))
    for (const id of planActivo.seccionIds) {
      const match = id.match(/^([A-Z]+\d+)-/)
      if (match && !cargados.has(match[1]) && !fetching.current.has(match[1])) {
        fetching.current.add(match[1])
        buscarCurso(match[1], '202620')
          .then(result => {
            const nuevos = Object.values(result)
            setCacheCursos(prev => {
              const next = new Map(prev)
              for (const c of nuevos) next.set(c.codigo, c)
              return next
            })
          })
          .catch(() => { /* ignore */ })
          .finally(() => { fetching.current.delete(match[1]) })
      }
    }
  }, [planActivoId])

  const planActivo = useMemo(
    () => planes.find(p => p.id === planActivoId) || planes[0],
    [planes, planActivoId],
  )

  const seccionesMap = useMemo(() => {
    const map = new Map<string, Seccion>()
    for (const curso of cursosCombinados) {
      for (const sec of curso.secciones) {
        map.set(sec.idUnico, sec)
      }
    }
    return map
  }, [cursosCombinados])

  const seccionesActivas = useMemo(() => {
    return (planActivo?.seccionIds || [])
      .map(id => seccionesMap.get(id))
      .filter((s): s is Seccion => s !== undefined)
  }, [planActivo, seccionesMap])

  const totalCreditos = useMemo(() => {
    const cursosUnicos = new Set<string>()
    let total = 0
    for (const sec of seccionesActivas) {
      const codigo = sec.curso.codigo
      if (!cursosUnicos.has(codigo)) {
        cursosUnicos.add(codigo)
        total += parseInt(sec.curso.creditos, 10) || 0
      }
    }
    return total
  }, [seccionesActivas])

  const toggleSeccion = useCallback(
    (seccionId: string) => {
      setPlanes(prev =>
        prev.map(p => {
          if (p.id !== planActivoId) return p
          const existe = p.seccionIds.includes(seccionId)
          return {
            ...p,
            seccionIds: existe
              ? p.seccionIds.filter(id => id !== seccionId)
              : [...p.seccionIds, seccionId],
          }
        }),
      )
    },
    [planActivoId],
  )

  const estaSeleccionada = useCallback(
    (seccionId: string): boolean => {
      return planActivo?.seccionIds.includes(seccionId) || false
    },
    [planActivo],
  )

  const crearPlan = useCallback(() => {
    const nuevo: PlanData = {
      id: generarId(),
      nombre: `Plan ${planes.length + 1}`,
      seccionIds: [],
    }
    setPlanes(prev => [...prev, nuevo])
    setPlanActivoId(nuevo.id)
  }, [planes.length])

  const renombrarPlan = useCallback((id: string, nombre: string) => {
    setPlanes(prev => prev.map(p => (p.id === id ? { ...p, nombre } : p)))
  }, [])

  const eliminarPlan = useCallback(
    (id: string) => {
      setPlanes(prev => {
        const restantes = prev.filter(p => p.id !== id)
        if (restantes.length === 0) {
          const nuevo: PlanData = { id: generarId(), nombre: 'Plan 1', seccionIds: [] }
          setPlanActivoId(nuevo.id)
          return [nuevo]
        }
        if (planActivoId === id) {
          setPlanActivoId(restantes[0].id)
        }
        return restantes
      })
    },
    [planActivoId],
  )

  const limpiarPlan = useCallback(() => {
    setPlanes(prev =>
      prev.map(p => (p.id === planActivoId ? { ...p, seccionIds: [] } : p)),
    )
  }, [planActivoId])

  const exportarPlan = useCallback(() => {
    const mapaDias: Record<string, string> = {
      l: 'Lun', m: 'Mar', i: 'Mié', j: 'Jue', v: 'Vie', s: 'Sáb',
    }
    const lineas = [
      `Plan: ${planActivo?.nombre || 'Sin nombre'}`,
      `Semestre: 202620`,
      ``,
      ...seccionesActivas.map(sec => {
        const horarioStr = sec.horarios
          .filter(h => h.horaInicio && h.horaFin)
          .map(h => {
            const dias = h.dias.map(d => mapaDias[d] || d).join(' ')
            return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)} - ${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
          })
          .join(', ')
        const profes = sec.profesores.map(p => p.nombre).join(', ')
        return [
          `${sec.curso.codigo} - ${sec.curso.titulo}`,
          `  NRC: ${sec.nrc} - Sec ${sec.numero}`,
          `  Horario: ${horarioStr}`,
          `  Profesor(es): ${profes}`,
          `  Campus: ${sec.campus}`,
          `  Duración: ${sec.ptrm === '16' ? 'Completa' : sec.ptrm}`,
        ].join('\n')
      }),
      ``,
      `Total créditos: ${totalCreditos}`,
    ].join('\n')

    const blob = new Blob([lineas], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plan-${(planActivo?.nombre || 'sin-nombre').toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [planActivo, seccionesActivas, totalCreditos])

  return {
    planes,
    planActivoId,
    planActivo,
    seccionesActivas,
    totalCreditos,
    toggleSeccion,
    estaSeleccionada,
    crearPlan,
    renombrarPlan,
    eliminarPlan,
    limpiarPlan,
    exportarPlan,
    setPlanActivoId,
  }
}
