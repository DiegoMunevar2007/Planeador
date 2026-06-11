import Seccion from '../models/Seccion';
import { horaStrAMinutos } from './timeUtils';

export interface Conflicto {
  seccionA: Seccion;
  seccionB: Seccion;
}

export function detectarConflictos(secciones: Seccion[]): Conflicto[] {
  const conflictos: Conflicto[] = [];
  const todosLosBloques = secciones.flatMap(seccion =>
    seccion.horarios.map(bloque => ({ seccion, bloque })),
  );

  for (let i = 0; i < todosLosBloques.length; i++) {
    for (let j = i + 1; j < todosLosBloques.length; j++) {
      const a = todosLosBloques[i];
      const b = todosLosBloques[j];
      const diasComunes = a.bloque.dias.filter(dia => b.bloque.dias.includes(dia));
      if (diasComunes.length === 0) continue;

      const inicioA = horaStrAMinutos(a.bloque.horaInicio);
      const finA = horaStrAMinutos(a.bloque.horaFin);
      const inicioB = horaStrAMinutos(b.bloque.horaInicio);
      const finB = horaStrAMinutos(b.bloque.horaFin);

      if (inicioA < finB && finA > inicioB) {
        conflictos.push({ seccionA: a.seccion, seccionB: b.seccion });
        break;
      }
    }
  }

  return conflictos;
}
