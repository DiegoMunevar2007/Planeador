export default class BloqueTiempo {
  constructor(
    public id: number,
    public salon: string,
    public tituloCurso: string,
    public dias: string[],
    public horaInicio: string,
    public horaFin: string,
  ) {}
}
