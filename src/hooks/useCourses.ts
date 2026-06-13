import { useState, useCallback } from 'react';
import { buscarCurso, buscarCursoConFiltros } from '../api/ofertaCursos';
import Curso from '../models/Curso';

export function useCourses() {
  const [resultados, setResultados] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState({ query: '', attr: '', prog: '' });
  const [offset, setOffset] = useState(0);

  function mergeCourses(
    existing: { [code: string]: Curso },
    incoming: { [code: string]: Curso },
  ): { [code: string]: Curso } {
    const merged = { ...existing };
    for (const code in incoming) {
      if (merged[code]) {
        const existingSecciones = new Set(merged[code].secciones.map(s => s.nrc));
        for (const seccion of incoming[code].secciones) {
          if (!existingSecciones.has(seccion.nrc)) {
            merged[code].secciones.push(seccion);
          }
        }
      } else {
        merged[code] = incoming[code];
      }
    }
    return merged;
  }

  const buscar = useCallback(async (query: string, attr: string = '', prog: string = '') => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setOffset(0);
    setLastQuery({ query: query.trim(), attr, prog });
    try {
      let result: { cursos: { [codigo: string]: Curso }; hasMore: boolean }
      if (attr || prog) {
        result = await buscarCursoConFiltros(query.trim(), attr, prog, '202620', 0)
      } else {
        result = await buscarCurso(query.trim(), '202620');
      }
      setResultados(Object.values(result.cursos));
      setHasMore(result.hasMore);
    } catch {
      setError('Error al buscar cursos. Verifica el código e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarMas = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const newOffset = offset + 25;
    setLoadingMore(true);
    try {
      const result = await buscarCursoConFiltros(
        lastQuery.query,
        lastQuery.attr,
        lastQuery.prog,
        '202620',
        newOffset,
      );
      setResultados(prev => Object.values(mergeCourses(
        prev.reduce((acc, c) => { acc[c.codigo] = c; return acc }, {} as { [code: string]: Curso }),
        result.cursos,
      )));
      setOffset(newOffset);
      setHasMore(result.hasMore);
    } catch {
      setError('Error al cargar más resultados.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, lastQuery]);

  return { resultados, loading, loadingMore, hasMore, error, buscar, cargarMas };
}
