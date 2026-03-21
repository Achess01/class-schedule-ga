export enum ViolationCode {
  PROFESSOR_COLLISION = 'PROFESSOR_COLLISION',
  CLASSROOM_COLLISION = 'CLASSROOM_COLLISION',
  SECTION_COLLISION = 'SECTION_COLLISION',
  MANDATORY_ACADEMIC_COLLISION = 'MANDATORY_ACADEMIC_COLLISION',
  INVALID_LAB_BLOCK = 'INVALID_LAB_BLOCK',
  INVALID_CLASS_LAB_DAY_BLOCK = 'INVALID_CLASS_LAB_DAY_BLOCK',
  INVALID_FIXED_ASSIGNMENT = 'INVALID_FIXED_ASSIGNMENT',
  PROFESSOR_UNAVAILABLE = 'PROFESSOR_UNAVAILABLE',
  UNASSIGNED_CLASSROOM = 'UNASSIGNED_CLASSROOM',
  UNASSIGNED_PROFESSOR = 'UNASSIGNED_PROFESSOR',
}

export const VIOLATION_MESSAGES_ES: Record<ViolationCode, string> = {
  [ViolationCode.PROFESSOR_COLLISION]:
    'Choque de docente: el docente ya esta asignado en ese horario.',
  [ViolationCode.CLASSROOM_COLLISION]:
    'Choque de salon: el salon ya esta ocupado en ese horario.',
  [ViolationCode.SECTION_COLLISION]:
    'Choque de seccion: la seccion ya tiene una asignacion en ese horario.',
  [ViolationCode.MANDATORY_ACADEMIC_COLLISION]:
    'Choque academico: cursos obligatorios incompatibles en el mismo horario.',
  [ViolationCode.INVALID_LAB_BLOCK]:
    'Bloque de laboratorio invalido: debe cumplir con la estructura requerida.',
  [ViolationCode.INVALID_CLASS_LAB_DAY_BLOCK]:
    'Bloque invalido en dia de laboratorio: la clase debe ocupar 3 periodos contiguos.',
  [ViolationCode.INVALID_FIXED_ASSIGNMENT]:
    'Asignacion fija invalida: no respeta el dia y slot fijado en la configuracion.',
  [ViolationCode.PROFESSOR_UNAVAILABLE]:
    'Docente fuera de disponibilidad horaria.',
  [ViolationCode.UNASSIGNED_CLASSROOM]: 'Curso sin salon asignado.',
  [ViolationCode.UNASSIGNED_PROFESSOR]: 'Curso sin docente asignado.',
};

export function getViolationMessageEs(code: ViolationCode): string {
  return VIOLATION_MESSAGES_ES[code] ?? 'Violacion no identificada.';
}
