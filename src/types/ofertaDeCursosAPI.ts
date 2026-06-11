export interface HorarioAPI {
  time_ini: string;
  time_fin: string;
  classroom: string;
  l: string | null;
  m: string | null;
  i: string | null;
  j: string | null;
  v: string | null;
  s: string | null;
  d: string | null;
  date_ini: string;
  date_fin: string;
  building: string;
  patron: string;
}

export interface ProfesorAPI {
  name: string;
  ind: string | null;
}

export interface SeccionAPI {
  llave: string;
  nrc: string;
  class: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  maxenrol: string;
  enrolled: string;
  term: string;
  ptrm: string;
  ptrmdesc: string;
  seatsavail: string;
  campus: string;
  projenrl: string;
  schedules: HorarioAPI[];
  instructors: ProfesorAPI[];
  levele: string;
  comments: string | null;
  attr: { code: string }[];
}
