import Seccion from './Seccion';

export default class Curso {
  public secciones: Seccion[] = [];

  constructor(
    public programa: string,
    public curso: string,
    public creditos: string,
    public atributos: string[],
    public titulo: string,
  ) {}

  get codigo(): string {
    return `${this.programa}${this.curso}`;
  }
}
