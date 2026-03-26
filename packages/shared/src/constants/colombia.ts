// =============================================================================
// Constantes específicas de Colombia para el sector salud
// =============================================================================

export const DOCUMENT_TYPES = [
  { code: 'CC', label: 'Cédula de Ciudadanía' },
  { code: 'CE', label: 'Cédula de Extranjería' },
  { code: 'TI', label: 'Tarjeta de Identidad' },
  { code: 'RC', label: 'Registro Civil' },
  { code: 'PA', label: 'Pasaporte' },
  { code: 'MS', label: 'Menor sin identificación' },
  { code: 'AS', label: 'Adulto sin identificación' },
  { code: 'NIT', label: 'NIT (persona jurídica)' },
  { code: 'PE', label: 'Permiso Especial de Permanencia' },
  { code: 'PT', label: 'Permiso Temporal de Protección' },
] as const

export type DocumentTypeCode = (typeof DOCUMENT_TYPES)[number]['code']

export const GENDER_OPTIONS = [
  { code: 'M', label: 'Masculino' },
  { code: 'F', label: 'Femenino' },
  { code: 'I', label: 'Indeterminado / Intersexual' },
] as const

export type GenderCode = (typeof GENDER_OPTIONS)[number]['code']

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
export type BloodType = (typeof BLOOD_TYPES)[number]

export const MARITAL_STATUS = [
  { code: 'single', label: 'Soltero/a' },
  { code: 'married', label: 'Casado/a' },
  { code: 'free_union', label: 'Unión libre' },
  { code: 'divorced', label: 'Divorciado/a' },
  { code: 'widowed', label: 'Viudo/a' },
  { code: 'separated', label: 'Separado/a' },
] as const

export const EDUCATION_LEVELS = [
  { code: 'none', label: 'Ninguno' },
  { code: 'primary', label: 'Primaria' },
  { code: 'secondary', label: 'Secundaria' },
  { code: 'technical', label: 'Técnico / Tecnológico' },
  { code: 'university', label: 'Universitario' },
  { code: 'postgraduate', label: 'Postgrado' },
] as const

export const STRATUM_OPTIONS = [1, 2, 3, 4, 5, 6] as const

// Regímenes del sistema de salud colombiano (SGSSS)
export const HEALTH_REGIMES = [
  { code: 'contributivo', label: 'Contributivo' },
  { code: 'subsidiado', label: 'Subsidiado' },
  { code: 'especial', label: 'Especial / Excepción' },
  { code: 'vinculado', label: 'Vinculado' },
  { code: 'particular', label: 'Particular' },
] as const

export type HealthRegimeCode = (typeof HEALTH_REGIMES)[number]['code']

// Tipo de usuario en salud (RIPS)
export const PATIENT_TYPES = [
  { code: '01', label: 'No asegurado' },
  { code: '02', label: 'Asegurado contributivo' },
  { code: '03', label: 'Asegurado subsidiado' },
  { code: '04', label: 'Asegurado especial / excepción' },
] as const

// Complejidad IPS (MinSalud)
export const IPS_COMPLEXITY_LEVELS = [
  { code: '1', label: 'Nivel 1 - Básico' },
  { code: '2', label: 'Nivel 2 - Mediano' },
  { code: '3', label: 'Nivel 3 - Alto' },
] as const

// Tipo IPS
export const IPS_TYPES = [
  { code: 'hospital', label: 'Hospital' },
  { code: 'clinica', label: 'Clínica' },
  { code: 'consultorio', label: 'Consultorio' },
  { code: 'centro_medico', label: 'Centro Médico' },
  { code: 'laboratorio', label: 'Laboratorio' },
  { code: 'imagenologia', label: 'Imagenología' },
] as const
