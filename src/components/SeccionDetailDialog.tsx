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
import { DIAS_LABEL } from '../utils/timeUtils'

interface SeccionDetailDialogProps {
  seccion: Seccion | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemoveSeccion?: (seccion: Seccion) => void
  enConflicto?: boolean
  colorAccent?: string
}

function formatSchedule(sec: Seccion) {
  return sec.horarios
    .filter(h => h.horaInicio && h.horaFin)
    .map(h => {
      const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
      return `${dias} ${h.horaInicio.slice(0, 2)}:${h.horaInicio.slice(2, 4)} - ${h.horaFin.slice(0, 2)}:${h.horaFin.slice(2, 4)}`
    })
}

function formatDateRange(sec: Seccion) {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const inicio = sec.fechaInicio.toLocaleDateString('es', opts)
  const fin = sec.fechaFin.toLocaleDateString('es', opts)
  return `${inicio} — ${fin}`
}

function duracionLabel(ptrm: string) {
  if (ptrm === '8A') return '½ semestre — Bloque A'
  if (ptrm === '8B') return '½ semestre — Bloque B'
  return 'Semestral'
}

export default function SeccionDetailDialog({
  seccion: dialogSeccion,
  open,
  onOpenChange,
  onRemoveSeccion,
  enConflicto = false,
  colorAccent,
}: SeccionDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {dialogSeccion && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-tight text-white"
                  style={{ background: colorAccent || '#6366f1' }}
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
                    {dialogSeccion.campus} — {duracionLabel(dialogSeccion.ptrm)}
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
                  {parseInt(dialogSeccion.enrolled) > 0 && (
                    <p className="text-[10px] text-muted-foreground/70">{dialogSeccion.enrolled} inscritos</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="text-xs font-medium">Fecha</p>
                  <p className="text-xs text-muted-foreground">{formatDateRange(dialogSeccion)}</p>
                </div>
              </div>

              {dialogSeccion.curso.atributos.length > 0 && (
                <div className="flex items-start gap-3">
                  <svg className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium">Atributos</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {dialogSeccion.curso.atributos.map(attr => (
                        <span key={attr} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dialogSeccion.horarios.some(h => h.horaInicio && h.salon) && (
                <div className="flex items-start gap-3">
                  <svg className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium">Salones</p>
                    {dialogSeccion.horarios.filter(h => h.horaInicio && h.salon).map((h, i) => {
                      const dias = h.dias.map(d => DIAS_LABEL[d] || d).join(' ')
                      return (
                        <p key={i} className="text-xs text-muted-foreground">
                          {dias} {h.horaInicio.slice(0, 2)}:{h.horaInicio.slice(2, 4)} — {h.salon}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              {onRemoveSeccion && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { onRemoveSeccion(dialogSeccion); onOpenChange(false) }}
                >
                  Quitar del plan
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
