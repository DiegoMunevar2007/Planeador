import Seccion from './Seccion';

export default class Horario {
  constructor(
    public id: number,
    public secciones: Seccion[],
  ) {}
}
