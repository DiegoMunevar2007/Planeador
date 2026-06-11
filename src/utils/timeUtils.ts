export function horaStrAMinutos(hora: string): number {
  const h = parseInt(hora.substring(0, 2), 10);
  const m = parseInt(hora.substring(2, 4), 10);
  return h * 60 + m;
}

export function minutosAHoraStr(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export const DIAS = ['l', 'm', 'i', 'j', 'v', 's'] as const;

export const DIAS_LABEL: Record<string, string> = {
  l: 'Lun',
  m: 'Mar',
  i: 'Mié',
  j: 'Jue',
  v: 'Vie',
  s: 'Sáb',
};

export const DIAS_CORTO: Record<string, string> = {
  l: 'L',
  m: 'M',
  i: 'I',
  j: 'J',
  v: 'V',
  s: 'S',
};
