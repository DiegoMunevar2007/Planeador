import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AcademicCapIcon, CalendarDaysIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/solid'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Seccion from '../models/Seccion'
import { DIAS, DIAS_CORTO, DIAS_LABEL, horaStrAMinutos } from '../utils/timeUtils'

interface ColorScheme {
  bg: string; border: string; text: string; accent: string
}

const COLORES_LIGHT: ColorScheme[] = [
  { bg: '#eef2ff', border: '#6366f1', text: '#4338ca', accent: '#6366f1' },
  { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', accent: '#22c55e' },
  { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', accent: '#ef4444' },
  { bg: '#fff7ed', border: '#f97316', text: '#c2410c', accent: '#f97316' },
  { bg: '#faf5ff', border: '#a855f7', text: '#7e22ce', accent: '#a855f7' },
  { bg: '#ecfeff', border: '#06b6d4', text: '#0e7490', accent: '#06b6d4' },
  { bg: '#fdf2f8', border: '#ec4899', text: '#be185d', accent: '#ec4899' },
  { bg: '#fefce8', border: '#eab308', text: '#a16207', accent: '#eab308' },
  { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1', accent: '#0ea5e9' },
  { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9', accent: '#8b5cf6' },
  { bg: '#ecfdf5', border: '#10b981', text: '#047857', accent: '#10b981' },
  { bg: '#fff1f2', border: '#e11d48', text: '#9f1239', accent: '#e11d48' },
]

const COLORES_DARK: ColorScheme[] = [
  { bg: 'rgba(99,102,241,0.12)', border: '#6366f1', text: '#a5b4fc', accent: '#818cf8' },
  { bg: 'rgba(34,197,94,0.12)', border: '#22c55e', text: '#86efac', accent: '#4ade80' },
  { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#fca5a5', accent: '#f87171' },
  { bg: 'rgba(249,115,22,0.12)', border: '#f97316', text: '#fdba74', accent: '#fb923c' },
  { bg: 'rgba(168,85,247,0.12)', border: '#a855f7', text: '#d8b4fe', accent: '#c084fc' },
  { bg: 'rgba(6,182,212,0.12)', border: '#06b6d4', text: '#67e8f9', accent: '#22d3ee' },
  { bg: 'rgba(236,72,153,0.12)', border: '#ec4899', text: '#f9a8d4', accent: '#f472b6' },
  { bg: 'rgba(234,179,8,0.12)', border: '#eab308', text: '#fde047', accent: '#facc15' },
  { bg: 'rgba(14,165,233,0.12)', border: '#0ea5e9', text: '#7dd3fc', accent: '#38bdf8' },
  { bg: 'rgba(139,92,246,0.12)', border: '#8b5cf6', text: '#c4b5fd', accent: '#a78bfa' },
  { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#6ee7b7', accent: '#34d399' },
  { bg: 'rgba(225,29,72,0.12)', border: '#e11d48', text: '#fda4af', accent: '#fb7185' },
]

const HORA_INICIO = 360
const HORA_FIN = 1320
const TOTAL_MIN = HORA_FIN - HORA_INICIO
const PX_POR_HORA = 60
const ALTURA_TOTAL = (TOTAL_MIN / 60) * PX_POR_HORA

interface ScheduleGridProps {
  secciones: Seccion[]
  seccionesEnConflicto: Set<Seccion>
  loading?: boolean
  onRemoveSeccion: (seccion: Seccion) => void
}

function formatMinutos(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export default function ScheduleGrid({ secciones, seccionesEnConflicto, loading = false, onRemoveSeccion }: ScheduleGridProps) {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(null)

  useEffect(() => {
    const el = document.documentElement
    setIsDark(el.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(el.classList.contains('dark'))
    })
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const COLORES = isDark ? COLORES_DARK : COLORES_LIGHT
  const conflictoBg = isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2'
  const conflictoBorder = '#ef4444'

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500"
        >
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="size-8 text-brand-800 dark:text-brand-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </motion.svg>
          <span className="text-sm">Cargando horario...</span>
        </motion.div>
      </div>
    )
  }

  if (secciones.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500"
        >
          <svg className="size-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Busca cursos y selecciona secciones para ver el horario</span>
        </motion.div>
      </div>
    )
  }

  const bloques = secciones.flatMap((seccion, idx) =>
    seccion.horarios
      .filter(bloque => bloque.horaInicio && bloque.horaFin)
      .map(bloque => ({
        bloque,
        seccion,
        color: COLORES[idx % COLORES.length],
        enConflicto: seccionesEnConflicto.has(seccion),
      })),
  )

  const horas: number[] = []
  for (let m = HORA_INICIO; m <= HORA_FIN; m += 60) {
    horas.push(m)
  }

  const dialogSeccion = selectedSeccion
  const enConflicto = dialogSeccion ? seccionesEnConflicto.has(dialogSeccion) : false

  const formatSchedule = (sec: Seccion) => {
    return sec.horarios
      .filter(h => h.horaInicio && h.horaFin)
      .map(h => {
        const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
        return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)} - ${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
      })
  }

  return (
    <>
      <div className="flex-1 overflow-auto p-4">
        <div className="schedule-scroll">
          <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex border-b-2 border-brand-800 dark:border-brand-600">
              <div className="time-gutter-width flex-shrink-0" />
              {DIAS.map(d => (
                <div
                  key={d}
                  className="flex-1 text-center font-semibold text-[11px] py-1.5 text-gray-700 dark:text-slate-300 border-l border-gray-200 dark:border-slate-700"
                >
                  {DIAS_CORTO[d]}
                </div>
              ))}
            </div>

            <div className="flex">
              <div className="time-gutter-width flex-shrink-0 text-[9px] text-gray-400 dark:text-slate-500 text-right pr-1.5 select-none">
                {horas.map(m => (
                  <div key={m} style={{ height: PX_POR_HORA }} className="flex items-start pt-0 leading-[60px]">
                    {formatMinutos(m)}
                  </div>
                ))}
              </div>

              <div className="day-columns relative" style={{ height: ALTURA_TOTAL }}>
                {Array.from({ length: 6 }).map((_, diaIdx) => (
                  <div key={diaIdx} className="day-column">
                    {horas.map(m => (
                      <div
                        key={m}
                        className="hour-line"
                        style={{ top: ((m - HORA_INICIO) / TOTAL_MIN) * ALTURA_TOTAL }}
                      />
                    ))}
                  </div>
                ))}

                {bloques.map((item) =>
                  item.bloque.dias.map(dia => {
                    const diaIdx = DIAS.indexOf(dia as (typeof DIAS)[number])
                    if (diaIdx === -1) return null

                    const inicio = horaStrAMinutos(item.bloque.horaInicio)
                    const fin = horaStrAMinutos(item.bloque.horaFin)
                    const top = ((inicio - HORA_INICIO) / TOTAL_MIN) * ALTURA_TOTAL
                    const height = Math.max(((fin - inicio) / TOTAL_MIN) * ALTURA_TOTAL, 18)

                    const curso = item.seccion.curso
                    const profesStr = item.seccion.profesores.map(p => p.nombre).join(', ')

                    const showFull = height >= 60
                    const showCompact = height >= 32

                    return (
                      <motion.div
                        key={`${item.seccion.idUnico}-${dia}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                        className={`section-block cursor-pointer ${item.enConflicto ? 'conflicto' : ''}`}
                        style={{
                          top,
                          height,
                          left: `${(diaIdx / 6) * 100}%`,
                          width: `${100 / 6}%`,
                          background: item.enConflicto
                            ? conflictoBg
                            : item.color.bg,
                          borderColor: item.enConflicto ? conflictoBorder : item.color.border,
                          color: item.color.text,
                        }}
                        title={profesStr || 'Sin profesor'}
                        whileHover={{ scale: 1.03, zIndex: 10, transition: { duration: 0.15 } }}
                        onClick={() => setSelectedSeccion(item.seccion)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedSeccion(item.seccion) }}
                        role="button"
                        tabIndex={0}
                      >
                        <button
                          className="block-remove"
                          onClick={e => {
                            e.stopPropagation()
                            onRemoveSeccion(item.seccion)
                          }}
                          title="Quitar sección"
                        >
                          ✕
                        </button>
                        <span
                          className="block font-bold tracking-tight"
                          style={{ color: item.color.accent, fontSize: showCompact ? 11 : 10 }}
                        >
                          {item.seccion.curso.codigo}
                        </span>
                        {showFull && (
                          <span className="block text-[10px] font-medium leading-tight truncate text-gray-700 dark:text-gray-200">
                            {curso.titulo.length > 35 ? curso.titulo.slice(0, 33) + '…' : curso.titulo}
                          </span>
                        )}
                        {showCompact && (
                          <span className="block text-[9px] opacity-80 leading-tight">
                            Sec {item.seccion.numero}
                          </span>
                        )}
                        {showFull && profesStr && (
                          <span className="block text-[8px] opacity-60 leading-tight truncate">
                            {profesStr}
                          </span>
                        )}
                      </motion.div>
                    )
                  }),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info dialog */}
      <Dialog open={!!dialogSeccion} onOpenChange={(open) => { if (!open) setSelectedSeccion(null) }}>
        <DialogContent className="sm:max-w-md">
          {dialogSeccion && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-tight text-white"
                    style={{ background: COLORES[secciones.indexOf(dialogSeccion) % COLORES.length]?.accent || '#6366f1' }}
                  >
                    {dialogSeccion.curso.codigo}
                  </span>
                  <DialogTitle>{dialogSeccion.curso.titulo}</DialogTitle>
                </div>
                <DialogDescription>
                  Sección {dialogSeccion.numero} — NRC {dialogSeccion.nrc}
                  {enConflicto && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Conflicto de horario
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 py-2">
                <div className="flex items-start gap-3">
                  <CalendarDaysIcon className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Horario</p>
                    {formatSchedule(dialogSeccion).map((s, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{s}</p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserGroupIcon className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Profesor{dialogSeccion.profesores.length !== 1 ? 'es' : ''}</p>
                    <p className="text-xs text-muted-foreground">
                      {dialogSeccion.profesores.length > 0
                        ? dialogSeccion.profesores.map(p => p.nombre).join(', ')
                        : 'Sin asignar'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Créditos</p>
                    <p className="text-xs text-muted-foreground">{dialogSeccion.curso.creditos} créd.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPinIcon className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Campus y duración</p>
                    <p className="text-xs text-muted-foreground">
                      {dialogSeccion.campus}
                      {dialogSeccion.ptrm !== '16' ? ` — ${dialogSeccion.ptrm}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium">Cupos</p>
                    <p className="text-xs text-muted-foreground">
                      {parseInt(dialogSeccion.maxEnrol) - parseInt(dialogSeccion.enrolled)} / {dialogSeccion.maxEnrol} disponibles
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { onRemoveSeccion(dialogSeccion); setSelectedSeccion(null) }}
                >
                  Quitar del plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSeccion(null)}
                >
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
