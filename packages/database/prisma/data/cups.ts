export const CUPS_CODES = [
  // ── Consultas ────────────────────────────────────────────────────────────────
  {
    code: '890201',
    description: 'Consulta de primera vez por medicina general',
    group: 'Consultas',
  },
  {
    code: '890202',
    description: 'Consulta de control o de seguimiento por medicina general',
    group: 'Consultas',
  },
  {
    code: '890203',
    description: 'Consulta de urgencias por medicina general',
    group: 'Consultas',
  },
  {
    code: '890205',
    description: 'Consulta de primera vez por gastroenterología',
    group: 'Consultas',
  },
  {
    code: '890206',
    description: 'Consulta de control o de seguimiento por gastroenterología',
    group: 'Consultas',
  },
  {
    code: '890401',
    description: 'Consulta de primera vez por medicina interna',
    group: 'Consultas',
  },
  {
    code: '890402',
    description: 'Consulta de control o de seguimiento por medicina interna',
    group: 'Consultas',
  },

  // ── Endoscopia digestiva alta ────────────────────────────────────────────────
  {
    code: '450001',
    description: 'Esofagogastroduodenoscopia diagnóstica',
    group: 'Endoscopia digestiva alta',
  },
  {
    code: '450002',
    description: 'Esofagoscopia diagnóstica',
    group: 'Endoscopia digestiva alta',
  },
  {
    code: '450003',
    description: 'Gastroscopia diagnóstica',
    group: 'Endoscopia digestiva alta',
  },
  {
    code: '450004',
    description: 'Esofagogastroduodenoscopia con biopsia',
    group: 'Endoscopia digestiva alta',
  },
  {
    code: '450005',
    description: 'Esofagogastroduodenoscopia con dilatación de estenosis esofágica',
    group: 'Endoscopia digestiva alta',
  },
  {
    code: '450100',
    description: 'Ligadura endoscópica de várices esofágicas',
    group: 'Endoscopia digestiva alta',
  },
  {
    code: '450101',
    description: 'Escleroterapia endoscópica de várices esofágicas',
    group: 'Endoscopia digestiva alta',
  },

  // ── Colonoscopia ─────────────────────────────────────────────────────────────
  {
    code: '451000',
    description: 'Colonoscopia diagnóstica total',
    group: 'Colonoscopia',
  },
  {
    code: '451001',
    description: 'Colonoscopia diagnóstica con biopsia',
    group: 'Colonoscopia',
  },
  {
    code: '451002',
    description: 'Colonoscopia con polipectomía',
    group: 'Colonoscopia',
  },
  {
    code: '451003',
    description: 'Colonoscopia con hemostasia',
    group: 'Colonoscopia',
  },
  {
    code: '451100',
    description: 'Colonoscopia con mucosectomía endoscópica',
    group: 'Colonoscopia',
  },
  {
    code: '451101',
    description: 'Colonoscopia con tatúaje de lesión',
    group: 'Colonoscopia',
  },

  // ── Rectosigmoidoscopia ──────────────────────────────────────────────────────
  {
    code: '452000',
    description: 'Rectosigmoidoscopia diagnóstica',
    group: 'Rectosigmoidoscopia',
  },
  {
    code: '452001',
    description: 'Rectosigmoidoscopia con biopsia',
    group: 'Rectosigmoidoscopia',
  },
  {
    code: '452100',
    description: 'Rectosigmoidoscopia con polipectomía',
    group: 'Rectosigmoidoscopia',
  },

  // ── CPRE (Colangiopancreatografía retrógrada endoscópica) ────────────────────
  {
    code: '453000',
    description: 'Colangiopancreatografía retrógrada endoscópica diagnóstica (CPRE)',
    group: 'CPRE',
  },
  {
    code: '453001',
    description: 'CPRE con esfinterotomía y extracción de cálculos',
    group: 'CPRE',
  },
  {
    code: '453100',
    description: 'CPRE con colocación de prótesis biliar',
    group: 'CPRE',
  },

  // ── Biopsias ─────────────────────────────────────────────────────────────────
  {
    code: '460000',
    description: 'Biopsia endoscópica del esófago',
    group: 'Biopsias',
  },
  {
    code: '460001',
    description: 'Biopsia endoscópica del estómago',
    group: 'Biopsias',
  },
  {
    code: '460002',
    description: 'Biopsia endoscópica del intestino delgado',
    group: 'Biopsias',
  },
  {
    code: '460100',
    description: 'Biopsia hepática percutánea guiada por imagen',
    group: 'Biopsias',
  },

  // ── Ultrasonido ──────────────────────────────────────────────────────────────
  {
    code: '880001',
    description: 'Ecografía abdominal total',
    group: 'Ultrasonido',
  },
  {
    code: '880002',
    description: 'Ecografía del hígado y vías biliares',
    group: 'Ultrasonido',
  },
  {
    code: '880100',
    description: 'Ecografía abdominal con Doppler de vasos abdominales',
    group: 'Ultrasonido',
  },
  {
    code: '880200',
    description: 'Ultrasonido endoscópico del tracto gastrointestinal superior (USE)',
    group: 'Ultrasonido',
  },
  {
    code: '880201',
    description: 'Ultrasonido endoscópico con punción aspiración con aguja fina (USE-PAAF)',
    group: 'Ultrasonido',
  },

  // ── Laboratorios clínicos comunes en gastroenterología ───────────────────────
  {
    code: '903000',
    description: 'Cuadro hemático completo (hemograma)',
    group: 'Laboratorios',
  },
  {
    code: '903001',
    description: 'Parcial de orina',
    group: 'Laboratorios',
  },
  {
    code: '903100',
    description: 'Perfil hepático: ALT, AST, bilirrubinas, fosfatasa alcalina, GGT',
    group: 'Laboratorios',
  },
  {
    code: '903200',
    description: 'Coprológico con coproscopia',
    group: 'Laboratorios',
  },
  {
    code: '904000',
    description: 'Antígeno de superficie para hepatitis B (HBsAg)',
    group: 'Laboratorios',
  },
  {
    code: '904001',
    description: 'Anticuerpos contra hepatitis C (Anti-VHC)',
    group: 'Laboratorios',
  },

  // ── Cirugías y procedimientos ────────────────────────────────────────────────
  {
    code: '470000',
    description: 'Colecistectomía laparoscópica',
    group: 'Cirugías y procedimientos',
  },
  {
    code: '470001',
    description: 'Colecistectomía abierta',
    group: 'Cirugías y procedimientos',
  },
  {
    code: '470002',
    description: 'Apendicectomía laparoscópica',
    group: 'Cirugías y procedimientos',
  },
  {
    code: '471000',
    description: 'Hemicolectomía derecha laparoscópica',
    group: 'Cirugías y procedimientos',
  },
  {
    code: '471001',
    description: 'Resección anterior de recto por laparoscopia',
    group: 'Cirugías y procedimientos',
  },
  {
    code: '472000',
    description: 'Hemorroidectomía',
    group: 'Cirugías y procedimientos',
  },
] as const
