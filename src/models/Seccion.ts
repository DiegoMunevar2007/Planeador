import BloqueTiempo from './BloqueTiempo';
import Profesor from './Profesor';
import Curso from './Curso';

export default class Seccion {
  public horarios: BloqueTiempo[] = [];
  public profesores: Profesor[] = [];

  constructor(
    public nrc: string,
    public numero: string,
    public titulo: string,
    public maxEnrol: string,
    public enrolled: string,
    public campus: string,
    public fechaInicio: Date,
    public fechaFin: Date,
    public curso: Curso,
    public ptrm: string,
    public term: string,
  ) {}

  get idUnico(): string {
    return `${this.curso.codigo}-${this.numero}`;
  }
}
