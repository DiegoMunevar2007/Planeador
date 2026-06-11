import { useState } from 'react';
import { buscarCurso, buscarCursoConFiltros } from '../api/ofertaCursos';
import Curso from '../models/Curso';

export function useCourses() {
  const [resultados, setResultados] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = async (query: string, attr: string = '', prog: string = '') => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let cursos: { [codigo: string]: Curso }
      if (attr || prog) {
        cursos = await buscarCursoConFiltros(query.trim(), attr, prog)
      } else {
        cursos = await buscarCurso(query.trim(), '202620');
      }
      setResultados(Object.values(cursos));
    } catch {
      setError('Error al buscar cursos. Verifica el código e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return { resultados, loading, error, buscar };
}
