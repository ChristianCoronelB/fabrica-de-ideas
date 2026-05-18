const { PrismaClient, RoleType, ProjectStatus } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || 'fabrica-de-ideas-salt-2024'
  return crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex')
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Clean existing data (in reverse dependency order)
  console.log('🗑️  Limpiando datos existentes...')
  await prisma.evaluationScore.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.projectEvaluator.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.evaluationCriteria.deleteMany()
  await prisma.area.deleteMany()
  await prisma.category.deleteMany()
  await prisma.institution.deleteMany()

  // ─── Areas ─────────────────────────────────────────────
  console.log('📋 Creando áreas...')
  const areas = await Promise.all([
    prisma.area.create({
      data: { name: 'Agrotecnología y soberanía alimentaria' },
    }),
    prisma.area.create({
      data: { name: 'Bioeconomía y Biofuturo' },
    }),
    prisma.area.create({
      data: { name: 'Economía circular y sostenibilidad ambiental' },
    }),
    prisma.area.create({
      data: { name: 'Salud, bienestar y biofarmacia' },
    }),
    prisma.area.create({
      data: { name: 'Innovación y Servicios Tecnológicos Digitales' },
    }),
    prisma.area.create({
      data: { name: 'Turismo sostenible y Experiencias' },
    }),
    prisma.area.create({
      data: { name: 'Innovación Abierta y Nuevos Modelos de Negocio' },
    }),
  ])

  // ─── Categories ────────────────────────────────────────
  console.log('📂 Creando categorías...')
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Emprendimiento Escolar' },
    }),
    prisma.category.create({
      data: { name: 'Poster de Emprendimiento' },
    }),
    prisma.category.create({
      data: { name: 'Producto Mínimo Viable' },
    }),
    prisma.category.create({
      data: { name: 'Emprendimiento en Ejecución' },
    }),
  ])

  // ─── Institutions ──────────────────────────────────────
  console.log('🏫 Creando instituciones...')
  const institutions = await Promise.all([
    prisma.institution.create({
      data: { name: 'Universidad Central' },
    }),
    prisma.institution.create({
      data: { name: 'Instituto Tecnológico Nacional' },
    }),
    prisma.institution.create({
      data: { name: 'Universidad de Innovación' },
    }),
  ])

  // ─── Evaluation Criteria ──────────────────────────────
  console.log('📊 Creando criterios de evaluación...')
  const criteria = await Promise.all([
    prisma.evaluationCriteria.create({
      data: {
        name: 'Innovación y Creatividad',
        description:
          'Evalúa el grado de originalidad de la idea, la creatividad en la solución propuesta y la diferenciación frente a alternativas existentes en el mercado.',
        weight: 20,
        evidence:
          'Descripción de la innovación, análisis comparativo con soluciones existentes, elementos diferenciadores del proyecto.',
        order: 1,
      },
    }),
    prisma.evaluationCriteria.create({
      data: {
        name: 'Viabilidad del Negocio',
        description:
          'Analiza la factibilidad comercial y financiera del proyecto, incluyendo modelo de negocio, mercado objetivo, proyecciones financieras y plan de sostenibilidad.',
        weight: 15,
        evidence:
          'Modelo Canvas, análisis de mercado, proyecciones financieras, estrategia de precios, plan de comercialización.',
        order: 2,
      },
    }),
    prisma.evaluationCriteria.create({
      data: {
        name: 'Impacto Social/Ambiental',
        description:
          'Mide el potencial del proyecto para generar un impacto positivo en la comunidad, el medio ambiente o grupos vulnerables, alineado con los ODS.',
        weight: 15,
        evidence:
          'Descripción del impacto, indicadores de medición, alineación con ODS, beneficiarios directos e indirectos.',
        order: 3,
      },
    }),
    prisma.evaluationCriteria.create({
      data: {
        name: 'Pitch (Presentación y Comunicación)',
        description:
          'Evalúa la calidad de la presentación oral, claridad del mensaje, capacidad de persuasión, uso de recursos visuales y manejo del tiempo.',
        weight: 20,
        evidence:
          'Video de pitch, diapositivas de presentación, claridad en la comunicación de la propuesta de valor.',
        order: 4,
      },
    }),
    prisma.evaluationCriteria.create({
      data: {
        name: 'Potencial de Escalamiento',
        description:
          'Analiza la capacidad del proyecto para crecer y expandirse a nuevos mercados o regiones, considerando la escalabilidad del modelo de negocio.',
        weight: 10,
        evidence:
          'Plan de crecimiento, estrategia de expansión, análisis de escalabilidad tecnológica y operativa.',
        order: 5,
      },
    }),
    prisma.evaluationCriteria.create({
      data: {
        name: 'Entregable',
        description:
          'Evalúa la calidad, completitud y presentación de los documentos y materiales entregados como parte del proyecto (plan de negocio, prototipo, evidencias, etc.).',
        weight: 20,
        evidence:
          'Documentación completa del proyecto, prototipo o MVP funcional, evidencias de validación, reportes técnicos.',
        order: 6,
      },
    }),
  ])

  // ─── Users ─────────────────────────────────────────────
  console.log('👥 Creando usuarios...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@fabrica.com',
        password: hashPassword('admin123'),
        name: 'Administrador General',
        role: RoleType.ADMIN,
        phone: '+593 99 000 0001',
      },
    }),
    prisma.user.create({
      data: {
        email: 'participante@fabrica.com',
        password: hashPassword('part123'),
        name: 'María García',
        role: RoleType.PARTICIPANT,
        phone: '+593 99 111 0001',
      },
    }),
    prisma.user.create({
      data: {
        email: 'evaluador@fabrica.com',
        password: hashPassword('eval123'),
        name: 'Dr. Carlos Mendoza',
        role: RoleType.EVALUATOR,
        phone: '+593 99 222 0001',
      },
    }),
    prisma.user.create({
      data: {
        email: 'evaluador2@fabrica.com',
        password: hashPassword('eval123'),
        name: 'Ing. Ana Rodríguez',
        role: RoleType.EVALUATOR,
        phone: '+593 99 222 0002',
      },
    }),
    prisma.user.create({
      data: {
        email: 'participante2@fabrica.com',
        password: hashPassword('part123'),
        name: 'Juan Pérez',
        role: RoleType.PARTICIPANT,
        phone: '+593 99 111 0002',
      },
    }),
    prisma.user.create({
      data: {
        email: 'participante3@fabrica.com',
        password: hashPassword('part123'),
        name: 'Laura Sánchez',
        role: RoleType.PARTICIPANT,
        phone: '+593 99 111 0003',
      },
    }),
  ])

  const [admin, participant1, evaluator1, evaluator2, participant2, participant3] = users

  // ─── Projects ──────────────────────────────────────────
  console.log('🚀 Creando proyectos...')
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'AgroSense',
        pitch:
          'Plataforma IoT para monitoreo de cultivos en tiempo real que permite a pequeños agricultores optimizar el uso de agua y fertilizantes mediante sensores inteligentes.',
        description:
          'AgroSense es una solución integral que combina sensores IoT, inteligencia artificial y una aplicación móvil para proporcionar recomendaciones precisas a agricultores sobre el riego, fertilización y manejo de plagas. Nuestro sistema reduce hasta un 40% el desperdicio de agua y aumenta el rendimiento de los cultivos en un 25%.',
        team: 'María García, Pedro López, Sofía Hernández',
        status: ProjectStatus.SUBMITTED,
        leaderName: 'María García',
        leaderEmail: 'participante@fabrica.com',
        leaderPhone: '+593 99 111 0001',
        leaderCourse: 'Ingeniería Agrónoma - 8vo Semestre',
        leaderParallel: 'A',
        tutorName: 'Dr. Roberto Fuentes',
        locationMatrix: 'Matriz Quito',
        locationSede: 'Sede Norte',
        areaId: areas[0].id,
        categoryId: categories[2].id,
        institutionId: institutions[0].id,
        ownerId: participant1.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'BioPack',
        pitch:
          'Empaques biodegradables a base de cáscara de plátano que reemplazan el plástico de un solo uso en la industria alimentaria.',
        description:
          'BioPack transforma residuos de cáscara de plátano en empaques 100% biodegradables y compostables. Nuestros empaques se descomponen en 45 días versus los 400 años del plástico convencional. Ya contamos con prototipos validados y primeras cartas de intención de restaurantes locales.',
        team: 'Juan Pérez, Daniela Vargas, Andrés Mejía',
        status: ProjectStatus.APPROVED,
        leaderName: 'Juan Pérez',
        leaderEmail: 'participante2@fabrica.com',
        leaderPhone: '+593 99 111 0002',
        leaderCourse: 'Ingeniería Ambiental - 6to Semestre',
        leaderParallel: 'B',
        tutorName: 'Ing. Patricia Vallejo',
        locationMatrix: 'Matriz Guayaquil',
        locationSede: 'Sede Central',
        locationExtension: 'Ext. Durán',
        areaId: areas[2].id,
        categoryId: categories[3].id,
        institutionId: institutions[1].id,
        ownerId: participant2.id,
        totalScore: 82.5,
        averageScore: 82.5,
      },
    }),
    prisma.project.create({
      data: {
        name: 'SaludConecta',
        pitch:
          'Aplicación de telemedicina que conecta comunidades rurales con especialistas médicos mediante consultas virtuales y diagnóstico asistido por IA.',
        description:
          'SaludConecta reduce la brecha de acceso a salud en zonas rurales del Ecuador. Nuestra plataforma permite consultas virtuales, triaje automatizado con IA, y gestión de historias clínicas digitales. Hemos atendido más de 500 pacientes en prueba piloto con 95% de satisfacción.',
        team: 'Laura Sánchez, Miguel Torres, Carmen Guzmán',
        status: ProjectStatus.FINALIST,
        leaderName: 'Laura Sánchez',
        leaderEmail: 'participante3@fabrica.com',
        leaderPhone: '+593 99 111 0003',
        leaderCourse: 'Medicina - Internado Rotativo',
        leaderParallel: 'C',
        tutorName: 'Dra. Lucía Paredes',
        locationMatrix: 'Matriz Cuenca',
        locationSede: 'Sede Sur',
        areaId: areas[3].id,
        categoryId: categories[2].id,
        institutionId: institutions[2].id,
        ownerId: participant3.id,
        totalScore: 90.0,
        averageScore: 90.0,
      },
    }),
    prisma.project.create({
      data: {
        name: 'EcoTurismo360',
        pitch:
          'Plataforma digital que promueve el turismo sostenible conectando viajeros conscientes con comunidades anfitrionas y experiencias auténticas.',
        description:
          'EcoTurismo360 es una plataforma que certifica y promociona experiencias turísticas sostenibles. Los viajeros pueden reservar experiencias directamente con comunidades locales, asegurando que el 70% de los ingresos se queden en la comunidad. Incluye sistema de certificación de sostenibilidad.',
        team: 'María García, Fernando Ríos, Valentina Cruz',
        status: ProjectStatus.DRAFT,
        leaderName: 'María García',
        leaderEmail: 'participante@fabrica.com',
        leaderPhone: '+593 99 111 0001',
        leaderCourse: 'Turismo Sostenible - 5to Semestre',
        leaderParallel: 'A',
        tutorName: 'Mg. Rosa Alvarado',
        locationMatrix: 'Matriz Quito',
        locationSede: 'Sede Turismo',
        areaId: areas[5].id,
        categoryId: categories[1].id,
        institutionId: institutions[0].id,
        ownerId: participant1.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'FinVerde',
        pitch:
          'Fintech para inclusión financiera de pequeños productores agrícolas mediante microcréditos basados en datos de productividad.',
        description:
          'FinVerde utiliza datos satelitales y de sensores para evaluar la productividad de pequeñas fincas y ofrecer microcréditos con tasas justas. Nuestro modelo de scoring alternativo permite acceder a crédito a productores que tradicionalmente son excluidos del sistema financiero.',
        team: 'Juan Pérez, Ricardo Mora, Diana Castillo',
        status: ProjectStatus.SUBMITTED,
        leaderName: 'Juan Pérez',
        leaderEmail: 'participante2@fabrica.com',
        leaderPhone: '+593 99 111 0002',
        leaderCourse: 'Economía - 7mo Semestre',
        leaderParallel: 'A',
        tutorName: 'PhD. Ernesto Palacios',
        locationMatrix: 'Matriz Guayaquil',
        locationSede: 'Sede Económicas',
        areaId: areas[6].id,
        categoryId: categories[2].id,
        institutionId: institutions[1].id,
        ownerId: participant2.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'BioFarma Ecuador',
        pitch:
          'Desarrollo de fitofármacos a partir de plantas medicinales ecuatorianas con validación científica para el tratamiento de enfermedades tropicales.',
        description:
          'BioFarma Ecuador investiga y desarrolla medicamentos a base de plantas medicinales nativas con evidencia científica rigurosa. Nuestro primer producto, un antiparasitario natural basado en ajo ecuatoriano, ha mostrado 89% de eficacia en estudios preclínicos. Buscamos preservar el conocimiento ancestral con estándares modernos.',
        team: 'Laura Sánchez, Dr. Víctor Jaramillo, Bsc. Elena Andrade',
        status: ProjectStatus.WINNER,
        leaderName: 'Laura Sánchez',
        leaderEmail: 'participante3@fabrica.com',
        leaderPhone: '+593 99 111 0003',
        leaderCourse: 'Biotecnología - 9no Semestre',
        leaderParallel: 'A',
        tutorName: 'Dr. Manuel Espinoza',
        locationMatrix: 'Matriz Cuenca',
        locationSede: 'Sede Investigación',
        areaId: areas[3].id,
        categoryId: categories[3].id,
        institutionId: institutions[2].id,
        ownerId: participant3.id,
        totalScore: 95.0,
        averageScore: 95.0,
      },
    }),
    prisma.project.create({
      data: {
        name: 'AgriData',
        pitch:
          'Sistema de big data agrícola que utiliza imágenes satelitales y machine learning para predecir rendimientos y optimizar la cadena de suministro.',
        description:
          'AgriData procesa imágenes satelitales y datos meteorológicos para generar predicciones de rendimiento de cultivos a nivel de finca. Ayudamos a cooperativas y exportadores a planificar mejor su cadena de suministro, reduciendo pérdidas post-cosecha en un 30%.',
        team: 'María García, Ing. Sebastián Molina, Lic. Gabriela Pardo',
        status: ProjectStatus.REJECTED,
        leaderName: 'María García',
        leaderEmail: 'participante@fabrica.com',
        leaderPhone: '+593 99 111 0001',
        leaderCourse: 'Ingeniería de Sistemas - 8vo Semestre',
        leaderParallel: 'B',
        tutorName: 'Ing. Marcos Delgado',
        locationMatrix: 'Matriz Quito',
        locationSede: 'Sede Tecnológica',
        areaId: areas[4].id,
        categoryId: categories[0].id,
        institutionId: institutions[0].id,
        ownerId: participant1.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'CirculaEC',
        pitch:
          'Marketplace de economía circular que conecta empresas generadoras de residuos industriales con recicladores y transformadores locales.',
        description:
          'CirculaEC facilita la transición hacia la economía circular al conectar empresas que generan residuos con quienes pueden transformarlos en nuevos productos. Nuestra plataforma gestiona la logística, trazabilidad y certificación ambiental de cada transacción.',
        team: 'Juan Pérez, Arq. Silvia Narváez, Eco. Pablo Herrera',
        status: ProjectStatus.APPROVED,
        leaderName: 'Juan Pérez',
        leaderEmail: 'participante2@fabrica.com',
        leaderPhone: '+593 99 111 0002',
        leaderCourse: 'Ingeniería Ambiental - 6to Semestre',
        leaderParallel: 'B',
        tutorName: 'Ing. Patricia Vallejo',
        locationMatrix: 'Matriz Guayaquil',
        locationSede: 'Sede Central',
        areaId: areas[2].id,
        categoryId: categories[1].id,
        institutionId: institutions[1].id,
        ownerId: participant2.id,
        totalScore: 75.0,
        averageScore: 75.0,
      },
    }),
  ])

  // ─── Project-Evaluator Assignments ────────────────────
  console.log('📝 Asignando evaluadores...')
  await Promise.all([
    prisma.projectEvaluator.create({
      data: { projectId: projects[0].id, evaluatorId: evaluator1.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[0].id, evaluatorId: evaluator2.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[1].id, evaluatorId: evaluator1.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[1].id, evaluatorId: evaluator2.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[2].id, evaluatorId: evaluator1.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[2].id, evaluatorId: evaluator2.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[5].id, evaluatorId: evaluator1.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[5].id, evaluatorId: evaluator2.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[4].id, evaluatorId: evaluator1.id },
    }),
    prisma.projectEvaluator.create({
      data: { projectId: projects[7].id, evaluatorId: evaluator2.id },
    }),
  ])

  // ─── Evaluations ──────────────────────────────────────
  console.log('⭐ Creando evaluaciones...')

  const eval1 = await prisma.evaluation.create({
    data: {
      projectId: projects[1].id,
      evaluatorId: evaluator1.id,
      totalScore: 85,
      comments:
        'Proyecto con excelente potencial. La validación con clientes reales demuestra tracción. Recomendar fortalecer el modelo de escalabilidad.',
      isDraft: false,
      submittedAt: new Date('2024-11-15'),
    },
  })

  await prisma.evaluationScore.createMany({
    data: [
      { evaluationId: eval1.id, criteriaId: criteria[0].id, score: 17, maxScore: 20, observation: 'Solución creativa con buen enfoque diferenciador.' },
      { evaluationId: eval1.id, criteriaId: criteria[1].id, score: 13, maxScore: 15, observation: 'Modelo de negocio claro con proyecciones realistas.' },
      { evaluationId: eval1.id, criteriaId: criteria[2].id, score: 14, maxScore: 15, observation: 'Excelente impacto ambiental demostrado.' },
      { evaluationId: eval1.id, criteriaId: criteria[3].id, score: 16, maxScore: 20, observation: 'Buena presentación, podría mejorar el manejo del tiempo.' },
      { evaluationId: eval1.id, criteriaId: criteria[4].id, score: 8, maxScore: 10, observation: 'Potencial de expansión a otras regiones agrícolas.' },
      { evaluationId: eval1.id, criteriaId: criteria[5].id, score: 17, maxScore: 20, observation: 'Documentación completa y bien presentada.' },
    ],
  })

  const eval2 = await prisma.evaluation.create({
    data: {
      projectId: projects[1].id,
      evaluatorId: evaluator2.id,
      totalScore: 80,
      comments:
        'Proyecto prometedor con impacto ambiental significativo. Sugerir explorar alianzas con supermercados para distribución.',
      isDraft: false,
      submittedAt: new Date('2024-11-16'),
    },
  })

  await prisma.evaluationScore.createMany({
    data: [
      { evaluationId: eval2.id, criteriaId: criteria[0].id, score: 16, maxScore: 20, observation: 'Innovación moderada, existen alternativas similares.' },
      { evaluationId: eval2.id, criteriaId: criteria[1].id, score: 12, maxScore: 15, observation: 'Viabilidad comercial demostrada con cartas de intención.' },
      { evaluationId: eval2.id, criteriaId: criteria[2].id, score: 15, maxScore: 15, observation: 'Impacto ambiental excepcional y medible.' },
      { evaluationId: eval2.id, criteriaId: criteria[3].id, score: 14, maxScore: 20, observation: 'Presentación correcta pero falta más pasión en el pitch.' },
      { evaluationId: eval2.id, criteriaId: criteria[4].id, score: 7, maxScore: 10, observation: 'Escalabilidad limitada por disponibilidad de materia prima.' },
      { evaluationId: eval2.id, criteriaId: criteria[5].id, score: 16, maxScore: 20, observation: 'Entregables completos y bien organizados.' },
    ],
  })

  const eval3 = await prisma.evaluation.create({
    data: {
      projectId: projects[2].id,
      evaluatorId: evaluator1.id,
      totalScore: 92,
      comments:
        'Proyecto excepcional con impacto social demostrado. Los 500 pacientes atendidos en prueba piloto son una prueba contundente. Recomendado como finalista.',
      isDraft: false,
      submittedAt: new Date('2024-11-18'),
    },
  })

  await prisma.evaluationScore.createMany({
    data: [
      { evaluationId: eval3.id, criteriaId: criteria[0].id, score: 19, maxScore: 20, observation: 'Innovación destacada con IA para triaje automatizado.' },
      { evaluationId: eval3.id, criteriaId: criteria[1].id, score: 14, maxScore: 15, observation: 'Modelo de negocio sostenible con múltiples fuentes de ingreso.' },
      { evaluationId: eval3.id, criteriaId: criteria[2].id, score: 15, maxScore: 15, observation: 'Impacto social transformador en comunidades vulnerables.' },
      { evaluationId: eval3.id, criteriaId: criteria[3].id, score: 17, maxScore: 20, observation: 'Pitch convincente con datos duros que respaldan.' },
      { evaluationId: eval3.id, criteriaId: criteria[4].id, score: 9, maxScore: 10, observation: 'Alto potencial de replicabilidad en toda la región.' },
      { evaluationId: eval3.id, criteriaId: criteria[5].id, score: 18, maxScore: 20, observation: 'Entregables de calidad profesional.' },
    ],
  })

  const eval4 = await prisma.evaluation.create({
    data: {
      projectId: projects[2].id,
      evaluatorId: evaluator2.id,
      totalScore: 88,
      comments:
        'Excelente proyecto. La validación con usuarios reales es un gran diferenciador. Sugerir integrar más especialidades médicas.',
      isDraft: false,
      submittedAt: new Date('2024-11-19'),
    },
  })

  await prisma.evaluationScore.createMany({
    data: [
      { evaluationId: eval4.id, criteriaId: criteria[0].id, score: 18, maxScore: 20, observation: 'Buena innovación tecnológica, clara diferenciación.' },
      { evaluationId: eval4.id, criteriaId: criteria[1].id, score: 13, maxScore: 15, observation: 'Viabilidad comprobada con datos de la prueba piloto.' },
      { evaluationId: eval4.id, criteriaId: criteria[2].id, score: 14, maxScore: 15, observation: 'Impacto social significativo y medible.' },
      { evaluationId: eval4.id, criteriaId: criteria[3].id, score: 16, maxScore: 20, observation: 'Buena presentación, datos claros.' },
      { evaluationId: eval4.id, criteriaId: criteria[4].id, score: 8, maxScore: 10, observation: 'Escalable a otras zonas rurales del país.' },
      { evaluationId: eval4.id, criteriaId: criteria[5].id, score: 19, maxScore: 20, observation: 'Documentación exhaustiva y profesional.' },
    ],
  })

  const eval5 = await prisma.evaluation.create({
    data: {
      projectId: projects[5].id,
      evaluatorId: evaluator1.id,
      totalScore: 96,
      comments:
        'Proyecto sobresaliente. La combinación de conocimiento ancestral con validación científica rigurosa es un modelo a seguir. Recomiendo como ganador.',
      isDraft: false,
      submittedAt: new Date('2024-11-20'),
    },
  })

  await prisma.evaluationScore.createMany({
    data: [
      { evaluationId: eval5.id, criteriaId: criteria[0].id, score: 20, maxScore: 20, observation: 'Innovación excepcional al combinar saberes ancestrales con ciencia moderna.' },
      { evaluationId: eval5.id, criteriaId: criteria[1].id, score: 14, maxScore: 15, observation: 'Mercado farmacéutico claro con alto potencial.' },
      { evaluationId: eval5.id, criteriaId: criteria[2].id, score: 15, maxScore: 15, observation: 'Impacto social y cultural extraordinario.' },
      { evaluationId: eval5.id, criteriaId: criteria[3].id, score: 18, maxScore: 20, observation: 'Pitch inspirador con narrativa impactante.' },
      { evaluationId: eval5.id, criteriaId: criteria[4].id, score: 9, maxScore: 10, observation: 'Potencial de expansión a toda la región andina.' },
      { evaluationId: eval5.id, criteriaId: criteria[5].id, score: 20, maxScore: 20, observation: 'Entregables impecables, nivel de publicación científica.' },
    ],
  })

  const eval6 = await prisma.evaluation.create({
    data: {
      projectId: projects[5].id,
      evaluatorId: evaluator2.id,
      totalScore: 94,
      comments:
        'Proyecto de excelencia. Los estudios preclínicos son prometedores y el enfoque de preservar conocimiento ancestral con estándares modernos es visionary.',
      isDraft: false,
      submittedAt: new Date('2024-11-21'),
    },
  })

  await prisma.evaluationScore.createMany({
    data: [
      { evaluationId: eval6.id, criteriaId: criteria[0].id, score: 19, maxScore: 20, observation: 'Innovación destacable en el sector farmacéutico.' },
      { evaluationId: eval6.id, criteriaId: criteria[1].id, score: 14, maxScore: 15, observation: 'Excelente proyección comercial.' },
      { evaluationId: eval6.id, criteriaId: criteria[2].id, score: 15, maxScore: 15, observation: 'Impacto cultural y sanitario excepcional.' },
      { evaluationId: eval6.id, criteriaId: criteria[3].id, score: 17, maxScore: 20, observation: 'Presentación sólida y bien estructurada.' },
      { evaluationId: eval6.id, criteriaId: criteria[4].id, score: 9, maxScore: 10, observation: 'Alto potencial de escalamiento internacional.' },
      { evaluationId: eval6.id, criteriaId: criteria[5].id, score: 20, maxScore: 20, observation: 'Documentación de calidad excepcional.' },
    ],
  })

  const eval7 = await prisma.evaluation.create({
    data: {
      projectId: projects[0].id,
      evaluatorId: evaluator1.id,
      totalScore: 12,
      comments: '',
      isDraft: true,
    },
  })

  await prisma.evaluationScore.createMany({
    data: [
      { evaluationId: eval7.id, criteriaId: criteria[0].id, score: 12, maxScore: 20, observation: 'En revisión...' },
      { evaluationId: eval7.id, criteriaId: criteria[1].id, score: 0, maxScore: 15 },
      { evaluationId: eval7.id, criteriaId: criteria[2].id, score: 0, maxScore: 15 },
      { evaluationId: eval7.id, criteriaId: criteria[3].id, score: 0, maxScore: 20 },
      { evaluationId: eval7.id, criteriaId: criteria[4].id, score: 0, maxScore: 10 },
      { evaluationId: eval7.id, criteriaId: criteria[5].id, score: 0, maxScore: 20 },
    ],
  })

  // ─── Notifications ────────────────────────────────────
  console.log('🔔 Creando notificaciones...')
  await prisma.notification.createMany({
    data: [
      {
        userId: participant1.id,
        title: 'Proyecto AgroSense recibido',
        message:
          'Tu proyecto "AgroSense" ha sido recibido exitosamente y está en revisión por los evaluadores asignados.',
        type: 'success',
      },
      {
        userId: participant1.id,
        title: 'Evaluador asignado',
        message:
          'Se han asignado evaluadores a tu proyecto "AgroSense". Recibirás los resultados pronto.',
        type: 'info',
      },
      {
        userId: participant2.id,
        title: 'Proyecto BioPack aprobado',
        message:
          '¡Felicitaciones! Tu proyecto "BioPack" ha sido aprobado y pasará a la siguiente fase del concurso.',
        type: 'success',
      },
      {
        userId: participant2.id,
        title: 'Proyecto AgriData no aprobado',
        message:
          'Tu proyecto "AgriData" no fue aprobado en esta convocatoria. Puedes revisar los comentarios de los evaluadores y volver a postular.',
        type: 'warning',
      },
      {
        userId: participant3.id,
        title: '¡Proyecto BioFarma Ecuador es el ganador!',
        message:
          '¡Felicidades! Tu proyecto "BioFarma Ecuador" ha sido seleccionado como ganador de la convocatoria. Nos comunicaremos contigo para los siguientes pasos.',
        type: 'success',
      },
      {
        userId: participant3.id,
        title: 'Proyecto SaludConecta - Finalista',
        message:
          'Tu proyecto "SaludConecta" ha sido seleccionado como finalista. Prepárate para la presentación final.',
        type: 'info',
      },
      {
        userId: evaluator1.id,
        title: 'Nuevos proyectos asignados',
        message:
          'Se te han asignado 5 proyectos para evaluar. Por favor completa las evaluaciones antes de la fecha límite.',
        type: 'info',
      },
      {
        userId: evaluator2.id,
        title: 'Nuevos proyectos asignados',
        message:
          'Se te han asignado 5 proyectos para evaluar. Por favor completa las evaluaciones antes de la fecha límite.',
        type: 'info',
      },
      {
        userId: admin.id,
        title: 'Nueva convocatoria disponible',
        message:
          'Se ha abierto una nueva convocatoria para la Fábrica de Ideas 2024. Ya se pueden registrar nuevos proyectos.',
        type: 'info',
      },
      {
        userId: participant1.id,
        title: 'Proyecto EcoTurismo360 en borrador',
        message:
          'Recuerda que tu proyecto "EcoTurismo360" está en estado borrador. Completa y envía tu propuesta antes de la fecha límite.',
        type: 'warning',
        read: true,
      },
    ],
  })

  // ─── Audit Logs ──────────────────────────────────────
  console.log('📋 Creando registros de auditoría...')
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATE_USER',
        details: 'Creación de cuenta de administrador',
      },
      {
        userId: participant1.id,
        action: 'CREATE_PROJECT',
        projectId: projects[0].id,
        details: 'Proyecto AgroSense creado',
      },
      {
        userId: participant2.id,
        action: 'CREATE_PROJECT',
        projectId: projects[1].id,
        details: 'Proyecto BioPack creado',
      },
      {
        userId: participant3.id,
        action: 'CREATE_PROJECT',
        projectId: projects[2].id,
        details: 'Proyecto SaludConecta creado',
      },
      {
        userId: admin.id,
        action: 'ASSIGN_EVALUATOR',
        projectId: projects[0].id,
        details: 'Evaluadores asignados al proyecto AgroSense',
      },
      {
        userId: evaluator1.id,
        action: 'SUBMIT_EVALUATION',
        projectId: projects[1].id,
        details: 'Evaluación enviada para BioPack',
      },
      {
        userId: evaluator2.id,
        action: 'SUBMIT_EVALUATION',
        projectId: projects[1].id,
        details: 'Evaluación enviada para BioPack',
      },
      {
        userId: admin.id,
        action: 'APPROVE_PROJECT',
        projectId: projects[1].id,
        details: 'Proyecto BioPack aprobado',
      },
      {
        userId: admin.id,
        action: 'MARK_FINALIST',
        projectId: projects[2].id,
        details: 'Proyecto SaludConecta marcado como finalista',
      },
      {
        userId: admin.id,
        action: 'MARK_WINNER',
        projectId: projects[5].id,
        details: 'Proyecto BioFarma Ecuador declarado ganador',
      },
    ],
  })

  console.log('')
  console.log('✅ Seed completado exitosamente!')
  console.log('')
  console.log('📊 Resumen:')
  console.log('   Áreas: ' + areas.length)
  console.log('   Categorías: ' + categories.length)
  console.log('   Instituciones: ' + institutions.length)
  console.log('   Criterios de evaluación: ' + criteria.length)
  console.log('   Usuarios: ' + users.length)
  console.log('   Proyectos: ' + projects.length)
  console.log('')
  console.log('👥 Credenciales de acceso:')
  console.log('   Admin:         admin@fabrica.com / admin123')
  console.log('   Participante:  participante@fabrica.com / part123')
  console.log('   Evaluador:     evaluador@fabrica.com / eval123')
  console.log('   Evaluador 2:   evaluador2@fabrica.com / eval123')
  console.log('   Participante 2: participante2@fabrica.com / part123')
  console.log('   Participante 3: participante3@fabrica.com / part123')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
