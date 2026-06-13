import Curso from '../models/Curso';
import Seccion from '../models/Seccion';
import Profesor from '../models/Profesor';
import BloqueTiempo from '../models/BloqueTiempo';
import type { HorarioAPI, ProfesorAPI, SeccionAPI } from '../types/ofertaDeCursosAPI';

const API = 'https://ofertadecursos.uniandes.edu.co/api/courses';
const LIMITE = 25;

function buildURL(query: string, attr: string, prog: string, periodo: string, offset: number = 0) {
  const params = new URLSearchParams()
  params.set('term', periodo)
  params.set('ptrm', '')
  params.set('prefix', prog)
  params.set('attr', '')
  // The API uses SQL LIKE wildcards — % matches any characters between words
  params.set('nameInput', query.toUpperCase().trim().split(/\s+/).join('%'))
  params.set('campus', '')
  params.set('attrs', attr)
  params.set('timeStart', '')
  params.set('offset', String(offset))
  params.set('limit', String(LIMITE))
  return `${API}?${params.toString()}`
}

async function crearCursosAPartirDePeticion(ruta: string) {
  const respuesta = await fetch(ruta);
  const data: SeccionAPI[] = await respuesta.json();
  const cursosEncontrados: { [codigoCurso: string]: Curso } = {};

  data.forEach((informacionSeccion: SeccionAPI) => {
    const codigoCurso = informacionSeccion.class + informacionSeccion.course;
    if (!(codigoCurso in cursosEncontrados)) {
      cursosEncontrados[codigoCurso] = new Curso(
        informacionSeccion.class,
        informacionSeccion.course,
        informacionSeccion.credits,
        informacionSeccion.attr.map(atributo => atributo.code),
        informacionSeccion.title,
      );
    }
    const seccion = crearSeccionDeCurso(cursosEncontrados[codigoCurso], informacionSeccion);
    cursosEncontrados[codigoCurso].secciones.push(seccion);
  });

  return { cursos: cursosEncontrados, hasMore: data.length >= LIMITE };
}

export async function buscarCurso(nombreCursoABuscar: string, periodo: string = '') {
  return await crearCursosAPartirDePeticion(buildURL(nombreCursoABuscar, '', '', periodo));
}

export async function buscarCursoConFiltros(
  query: string,
  attr: string = '',
  prog: string = '',
  periodo: string = '202620',
  offset: number = 0,
) {
  return await crearCursosAPartirDePeticion(buildURL(query, attr, prog, periodo, offset));
}

function listaDeBloquesEsIdentica(a: string[], b: string[]) {
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((valor, index) => valor === sortedB[index]);
}

function cargarHorariosSeccion(seccion: Seccion, horarios: HorarioAPI[]) {
  for (const horario of horarios) {
    const diasDondeAplica: string[] = [];
    for (const dia of 'lmijvs') {
      if (horario[dia as keyof HorarioAPI]) {
        diasDondeAplica.push(dia);
      }
    }
    const nuevoBloque = new BloqueTiempo(
      0,
      horario.classroom,
      seccion.titulo,
      diasDondeAplica,
      horario.time_ini,
      horario.time_fin,
    );
    const existe = seccion.horarios.some(
      bloque =>
        bloque.horaInicio === nuevoBloque.horaInicio &&
        bloque.horaFin === nuevoBloque.horaFin &&
        listaDeBloquesEsIdentica(bloque.dias, nuevoBloque.dias),
    );
    if (!existe) {
      seccion.horarios.push(nuevoBloque);
    }
  }
}

function cargarProfesoresSeccion(seccion: Seccion, profesores: ProfesorAPI[]) {
  if (profesores.length === 0) {
    seccion.profesores.push(new Profesor('NO DEFINIDO'));
  }
  for (const profesor of profesores) {
    const nombreProfesor = profesor.name || 'NO DEFINIDO';
    seccion.profesores.push(new Profesor(nombreProfesor));
  }
}

function obtenerDuracionSeccion(seccion: SeccionAPI) {
  let duracion = '16';
  if (seccion.ptrm === '8A' || seccion.ptrm === '8B') {
    duracion = seccion.ptrm;
  }
  return duracion;
}

function crearSeccionDeCurso(curso: Curso, informacionSeccion: SeccionAPI) {
  const seccion = new Seccion(
    informacionSeccion.nrc,
    informacionSeccion.section,
    informacionSeccion.title,
    informacionSeccion.maxenrol,
    informacionSeccion.enrolled,
    informacionSeccion.campus,
    new Date(informacionSeccion.schedules[0]?.date_ini),
    new Date(informacionSeccion.schedules[0]?.date_fin),
    curso,
    obtenerDuracionSeccion(informacionSeccion),
    informacionSeccion.term,
  );
  cargarProfesoresSeccion(seccion, informacionSeccion.instructors);
  cargarHorariosSeccion(seccion, informacionSeccion.schedules);
  return seccion;
}

export const atributosEspeciales: string[] = ['', 'EPSI', 'INGL', 'ECUR', 'BLEND', 'SEMP', 'VIRT'];

export const programasEspeciales: string[] = ['', 'ADMI', 'CBCA', 'CBCO', 'CBPC', 'CBCC', 'DEPO', 'ARQU', 'DISE', 'INGE', 'CIEN', 'MATE', 'FISI', 'QUIM', 'BIOL', 'MEDI', 'DER', 'ECON', 'ARTE', 'HUMA', 'LENG', 'FILO', 'HIST', 'PSIC', 'EDUF', 'ENFE', 'ODON', 'BACT'];
