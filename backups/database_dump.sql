-- Fábrica de Ideas Database Dump
-- Generated at: 2026-05-17T23:56:34.076Z
-- ============================================

-- Table: Area
DROP TABLE IF EXISTS "Area";
CREATE TABLE "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgn0000ojvq8q81ehij', 'Bioeconomía y Biofuturo', 1778544390264, 1778544390264);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgo0003ojvq92q556bi', 'Innovación y Servicios Tecnológicos Digitales', 1778544390265, 1778544390265);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgo0001ojvquiv3ilsp', 'Economía circular y sostenibilidad ambiental', 1778544390264, 1778544390264);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgp0004ojvqnhpe7pax', 'Agrotecnología y soberanía alimentaria', 1778544390264, 1778544390264);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgs0006ojvq4ycwqdoa', 'Innovación Abierta y Nuevos Modelos de Negocio', 1778544390268, 1778544390268);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgq0005ojvq8denzztz', 'Turismo sostenible y Experiencias', 1778544390266, 1778544390266);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgo0002ojvqyaw4qle0', 'Salud, bienestar y biofarmacia', 1778544390264, 1778544390264);

-- Table: Attachment
DROP TABLE IF EXISTS "Attachment";
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Attachment" ("id", "projectId", "fileName", "filePath", "fileType", "fileSize", "category", "createdAt") VALUES ('cmp1wld3a0006ojkjv12qm67c', 'cmp1veqi20015ojvqpgvw810b', 'Compra de Materia Prima.pdf', '/uploads/1778546379139-crktoan.pdf', 'application/pdf', 64820, 'evidence', 1778546379142);
INSERT INTO "Attachment" ("id", "projectId", "fileName", "filePath", "fileType", "fileSize", "category", "createdAt") VALUES ('cmp1wuih7000pojkjfbhko8xq', 'cmp1wuhhe000lojkjzd3x35ub', 'IASERVICIOEPS.pdf', '/uploads/1778546806025-8juhdia.pdf', 'application/pdf', 26710, 'evidence', 1778546806027);
INSERT INTO "Attachment" ("id", "projectId", "fileName", "filePath", "fileType", "fileSize", "category", "createdAt") VALUES ('cmpafao0r0001oihz6gr04wsv', 'cmp1veqi20015ojvqpgvw810b', 'IMG_20260302_120335_914.jpg', '/uploads/50f875cb-b99d-495c-8f27-c5c5be3beaf6.jpg', 'image/jpeg', 3238041, 'image', 1779061522204);
INSERT INTO "Attachment" ("id", "projectId", "fileName", "filePath", "fileType", "fileSize", "category", "createdAt") VALUES ('cmpafbh740007oihz0vsb89do', 'cmp1veqi20015ojvqpgvw810b', 'IMG_20260313_144138_941.jpg', '/uploads/1620e799-c61a-489b-ac3a-1a42111ff4ac.jpg', 'image/jpeg', 131134, 'evidence', 1779061560016);
INSERT INTO "Attachment" ("id", "projectId", "fileName", "filePath", "fileType", "fileSize", "category", "createdAt") VALUES ('cmpafbhhy000boihz3hhedufc', 'cmp1veqi20015ojvqpgvw810b', 'Datos.P.D.P.ARTKAM.xlsx', '/uploads/a6baff9e-1825-449c-bd75-91b05d6cd1b9.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 12201, 'evidence', 1779061560407);

-- Table: AuditLog
DROP TABLE IF EXISTS "AuditLog";
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "projectId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003kojvq4kxs17jt', 'cmp1veqhd000kojvqwb3bxzsa', NULL, 'CREATE_USER', 'Creación de cuenta de administrador', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003lojvqw1sm05ma', 'cmp1veqhf000pojvqew910kq8', 'cmp1veqhz000rojvqie6t489l', 'CREATE_PROJECT', 'Proyecto AgroSense creado', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003mojvq3zvd8mlv', 'cmp1veqhd000nojvqvc7722t1', 'cmp1veqi10013ojvqwink52j6', 'CREATE_PROJECT', 'Proyecto BioPack creado', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003nojvqqnci2iin', 'cmp1veqhd000mojvqh3vxjztj', 'cmp1veqi0000xojvqdw56x9mc', 'CREATE_PROJECT', 'Proyecto SaludConecta creado', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003oojvq7m8k99kp', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqhz000rojvqie6t489l', 'ASSIGN_EVALUATOR', 'Evaluadores asignados al proyecto AgroSense', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003pojvqmqwt3h1v', 'cmp1veqhd000lojvqgz8j556g', 'cmp1veqi10013ojvqwink52j6', 'SUBMIT_EVALUATION', 'Evaluación enviada para BioPack', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003qojvqm9y9z5hu', 'cmp1veqhe000oojvqong8oiwc', 'cmp1veqi10013ojvqwink52j6', 'SUBMIT_EVALUATION', 'Evaluación enviada para BioPack', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003rojvqh6ourfzm', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqi10013ojvqwink52j6', 'APPROVE_PROJECT', 'Proyecto BioPack aprobado', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003sojvqxbc9xpp2', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqi0000xojvqdw56x9mc', 'MARK_FINALIST', 'Proyecto SaludConecta marcado como finalista', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1veqj0003tojvq399t5t0z', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqhz000uojvqm0j6hvuw', 'MARK_WINNER', 'Proyecto BioFarma Ecuador declarado ganador', 1778544390349);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wlbh80004ojkjli9857sd', 'cmp1veqhf000pojvqew910kq8', 'cmp1veqi20015ojvqpgvw810b', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1778546377052);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wld3c0008ojkj2gihy10a', 'cmp1veqhf000pojvqew910kq8', 'cmp1veqi20015ojvqpgvw810b', 'FILE_UPLOADED', 'Archivo "Compra de Materia Prima.pdf" subido al proyecto', 1778546379144);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wnmwh000jojkjt7ddyaww', 'cmp1veqhd000lojvqgz8j556g', 'cmp1veqhz000vojvq92bh2rhe', 'EVALUATION_STARTED', 'Evaluación iniciada para el proyecto "FinVerde"', 1778546485169);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wuhhg000nojkjo58mwwy7', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1wuhhe000lojkjzd3x35ub', 'PROJECT_CREATED', 'Proyecto "ChrisCor" creado', 1778546804741);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wuih8000rojkjj2lea89t', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1wuhhe000lojkjzd3x35ub', 'FILE_UPLOADED', 'Archivo "IASERVICIOEPS.pdf" subido al proyecto', 1778546806028);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wuiwg000tojkjsahou7pt', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1wuhhe000lojkjzd3x35ub', 'PROJECT_STATUS_CHANGED', 'Estado cambiado de DRAFT a SUBMITTED', 1778546806576);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wvbuu000zojkjloqv26j6', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1wuhhe000lojkjzd3x35ub', 'EVALUATORS_ASSIGNED', 'Evaluadores asignados: 1 nuevos', 1778546844103);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1wwq5e001aojkjpkx49pku', 'cmp1veqhd000lojvqgz8j556g', 'cmp1wuhhe000lojkjzd3x35ub', 'EVALUATION_STARTED', 'Evaluación iniciada para el proyecto "ChrisCor"', 1778546909283);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmp1x1cu2008oojkjt69cqq3a', 'cmp1veqhd000lojvqgz8j556g', 'cmp1wuhhe000lojkjzd3x35ub', 'EVALUATION_SUBMITTED', 'Evaluación enviada para el proyecto "ChrisCor" con puntaje 84', 1778547125306);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpafao0u0003oihzgsd8yywk', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqi20015ojvqpgvw810b', 'FILE_UPLOADED', 'Archivo "IMG_20260302_120335_914.jpg" subido al proyecto', 1779061522207);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpafbdr10005oihz4irv7xp3', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqi20015ojvqpgvw810b', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1779061555550);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpafbh750009oihzz9r1rhqc', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqi20015ojvqpgvw810b', 'FILE_UPLOADED', 'Archivo "IMG_20260313_144138_941.jpg" subido al proyecto', 1779061560017);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpafbhhz000doihz4k581r05', 'cmp1veqhd000kojvqwb3bxzsa', 'cmp1veqi20015ojvqpgvw810b', 'FILE_UPLOADED', 'Archivo "Datos.P.D.P.ARTKAM.xlsx" subido al proyecto', 1779061560408);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpafecs4000foihzr4qawhth', 'cmp1veqhf000pojvqew910kq8', 'cmp1veqi20015ojvqpgvw810b', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1779061694260);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpaffiag000hoihz2jkvwi1c', 'cmp1veqhf000pojvqew910kq8', 'cmp1veqi20015ojvqpgvw810b', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1779061748057);

-- Table: Category
DROP TABLE IF EXISTS "Category";
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgz0007ojvqwuwvrcwn', 'Poster de Emprendimiento', 1778544390275, 1778544390275);
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgz000aojvqh8hi7r9f', 'Emprendimiento Escolar', 1778544390276, 1778544390276);
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgz0009ojvq7xa2zo93', 'Emprendimiento en Ejecución', 1778544390275, 1778544390275);
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqgz0008ojvq1xtgqux6', 'Producto Mínimo Viable', 1778544390275, 1778544390275);

-- Table: Evaluation
DROP TABLE IF EXISTS "Evaluation";
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "comments" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evaluation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1veqio001rojvqnlz6c721', 'cmp1veqi10013ojvqwink52j6', 'cmp1veqhd000lojvqgz8j556g', 85, 'Proyecto con excelente potencial. La validación con clientes reales demuestra tracción. Recomendar fortalecer el modelo de escalabilidad.', 0, 1731628800000, 1778544390336, 1778544390336);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1veqiq001zojvq8o662sun', 'cmp1veqi10013ojvqwink52j6', 'cmp1veqhe000oojvqong8oiwc', 80, 'Proyecto prometedor con impacto ambiental significativo. Sugerir explorar alianzas con supermercados para distribución.', 0, 1731715200000, 1778544390338, 1778544390338);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1veqir0027ojvqv5c4hxs1', 'cmp1veqi0000xojvqdw56x9mc', 'cmp1veqhd000lojvqgz8j556g', 92, 'Proyecto excepcional con impacto social demostrado. Los 500 pacientes atendidos en prueba piloto son una prueba contundente. Recomendado como finalista.', 0, 1731888000000, 1778544390339, 1778544390339);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1veqis002fojvqvvaf87lm', 'cmp1veqi0000xojvqdw56x9mc', 'cmp1veqhe000oojvqong8oiwc', 88, 'Excelente proyecto. La validación con usuarios reales es un gran diferenciador. Sugerir integrar más especialidades médicas.', 0, 1731974400000, 1778544390341, 1778544390341);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1veqit002nojvqbe4a6899', 'cmp1veqhz000uojvqm0j6hvuw', 'cmp1veqhd000lojvqgz8j556g', 96, 'Proyecto sobresaliente. La combinación de conocimiento ancestral con validación científica rigurosa es un modelo a seguir. Recomiendo como ganador.', 0, 1732060800000, 1778544390342, 1778544390342);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1veqiv002vojvq17z20gyv', 'cmp1veqhz000uojvqm0j6hvuw', 'cmp1veqhe000oojvqong8oiwc', 94, 'Proyecto de excelencia. Los estudios preclínicos son prometedores y el enfoque de preservar conocimiento ancestral con estándares modernos es visionary.', 0, 1732147200000, 1778544390343, 1778544390343);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1veqiw0033ojvqpuvfe2af', 'cmp1veqhz000rojvqie6t489l', 'cmp1veqhd000lojvqgz8j556g', 100, '', 1, NULL, 1778544390345, 1778709538525);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1wnmwe000aojkjbby6i3am', 'cmp1veqhz000vojvq92bh2rhe', 'cmp1veqhd000lojvqgz8j556g', 93, '', 1, NULL, 1778546485166, 1778705608818);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmp1wwq5c0011ojkj6dbx0k5z', 'cmp1wuhhe000lojkjzd3x35ub', 'cmp1veqhd000lojvqgz8j556g', 84, 'Excelente Propuest', 0, 1778547125296, 1778546909280, 1778547125298);

-- Table: EvaluationCriteria
DROP TABLE IF EXISTS "EvaluationCriteria";
CREATE TABLE "EvaluationCriteria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "evidence" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmp1veqh6000eojvqanonrs4d', 'Innovación y Creatividad', 'Evalúa el grado de originalidad de la idea, la creatividad en la solución propuesta y la diferenciación frente a alternativas existentes en el mercado.', 20, 'Descripción de la innovación, análisis comparativo con soluciones existentes, elementos diferenciadores del proyecto.', 1, 1778544390282, 1778544390282);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmp1veqh7000iojvqbk48h6c4', 'Viabilidad del Negocio', 'Analiza la factibilidad comercial y financiera del proyecto, incluyendo modelo de negocio, mercado objetivo, proyecciones financieras y plan de sostenibilidad.', 15, 'Modelo Canvas, análisis de mercado, proyecciones financieras, estrategia de precios, plan de comercialización.', 2, 1778544390283, 1778544390283);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmp1veqh6000gojvqnm253czb', 'Potencial de Escalamiento', 'Analiza la capacidad del proyecto para crecer y expandirse a nuevos mercados o regiones, considerando la escalabilidad del modelo de negocio.', 10, 'Plan de crecimiento, estrategia de expansión, análisis de escalabilidad tecnológica y operativa.', 5, 1778544390282, 1778544390282);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmp1veqh6000hojvqmzztenfi', 'Pitch (Presentación y Comunicación)', 'Evalúa la calidad de la presentación oral, claridad del mensaje, capacidad de persuasión, uso de recursos visuales y manejo del tiempo.', 20, 'Video de pitch, diapositivas de presentación, claridad en la comunicación de la propuesta de valor.', 4, 1778544390283, 1778544390283);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmp1veqh7000jojvqkjkx2d4n', 'Entregable', 'Evalúa la calidad, completitud y presentación de los documentos y materiales entregados como parte del proyecto (plan de negocio, prototipo, evidencias, etc.).', 20, 'Documentación completa del proyecto, prototipo o MVP funcional, evidencias de validación, reportes técnicos.', 6, 1778544390284, 1778544390284);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmp1veqh6000fojvqc82rdwhe', 'Impacto Social/Ambiental', 'Mide el potencial del proyecto para generar un impacto positivo en la comunidad, el medio ambiente o grupos vulnerables, alineado con los ODS.', 15, 'Descripción del impacto, indicadores de medición, alineación con ODS, beneficiarios directos e indirectos.', 3, 1778544390282, 1778544390282);

-- Table: EvaluationScore
DROP TABLE IF EXISTS "EvaluationScore";
CREATE TABLE "EvaluationScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluationId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "maxScore" REAL NOT NULL,
    "observation" TEXT,
    CONSTRAINT "EvaluationScore_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvaluationScore_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "EvaluationCriteria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqip001sojvqf6cks5ut', 'cmp1veqio001rojvqnlz6c721', 'cmp1veqh6000eojvqanonrs4d', 17, 20, 'Solución creativa con buen enfoque diferenciador.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqip001tojvq5kahttzb', 'cmp1veqio001rojvqnlz6c721', 'cmp1veqh7000iojvqbk48h6c4', 13, 15, 'Modelo de negocio claro con proyecciones realistas.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqip001uojvqxi19k8bk', 'cmp1veqio001rojvqnlz6c721', 'cmp1veqh6000fojvqc82rdwhe', 14, 15, 'Excelente impacto ambiental demostrado.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqip001vojvq2lx5mkwy', 'cmp1veqio001rojvqnlz6c721', 'cmp1veqh6000hojvqmzztenfi', 16, 20, 'Buena presentación, podría mejorar el manejo del tiempo.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqip001wojvq8vgdli8p', 'cmp1veqio001rojvqnlz6c721', 'cmp1veqh6000gojvqnm253czb', 8, 10, 'Potencial de expansión a otras regiones agrícolas.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqip001xojvqrtzntcoo', 'cmp1veqio001rojvqnlz6c721', 'cmp1veqh7000jojvqkjkx2d4n', 17, 20, 'Documentación completa y bien presentada.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiq0020ojvqidomegm5', 'cmp1veqiq001zojvq8o662sun', 'cmp1veqh6000eojvqanonrs4d', 16, 20, 'Innovación moderada, existen alternativas similares.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiq0021ojvq5q087c6t', 'cmp1veqiq001zojvq8o662sun', 'cmp1veqh7000iojvqbk48h6c4', 12, 15, 'Viabilidad comercial demostrada con cartas de intención.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiq0022ojvqsf1plomd', 'cmp1veqiq001zojvq8o662sun', 'cmp1veqh6000fojvqc82rdwhe', 15, 15, 'Impacto ambiental excepcional y medible.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiq0023ojvqgt1tttt4', 'cmp1veqiq001zojvq8o662sun', 'cmp1veqh6000hojvqmzztenfi', 14, 20, 'Presentación correcta pero falta más pasión en el pitch.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiq0024ojvqzi64lwd6', 'cmp1veqiq001zojvq8o662sun', 'cmp1veqh6000gojvqnm253czb', 7, 10, 'Escalabilidad limitada por disponibilidad de materia prima.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiq0025ojvqnxie61tc', 'cmp1veqiq001zojvq8o662sun', 'cmp1veqh7000jojvqkjkx2d4n', 16, 20, 'Entregables completos y bien organizados.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqis0028ojvq5rgf47mg', 'cmp1veqir0027ojvqv5c4hxs1', 'cmp1veqh6000eojvqanonrs4d', 19, 20, 'Innovación destacada con IA para triaje automatizado.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqis0029ojvqqaopwqs8', 'cmp1veqir0027ojvqv5c4hxs1', 'cmp1veqh7000iojvqbk48h6c4', 14, 15, 'Modelo de negocio sostenible con múltiples fuentes de ingreso.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqis002aojvqqbiza78k', 'cmp1veqir0027ojvqv5c4hxs1', 'cmp1veqh6000fojvqc82rdwhe', 15, 15, 'Impacto social transformador en comunidades vulnerables.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqis002bojvqjko3hau9', 'cmp1veqir0027ojvqv5c4hxs1', 'cmp1veqh6000hojvqmzztenfi', 17, 20, 'Pitch convincente con datos duros que respaldan.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqis002cojvqnsykgqgy', 'cmp1veqir0027ojvqv5c4hxs1', 'cmp1veqh6000gojvqnm253czb', 9, 10, 'Alto potencial de replicabilidad en toda la región.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqis002dojvq1yyghayl', 'cmp1veqir0027ojvqv5c4hxs1', 'cmp1veqh7000jojvqkjkx2d4n', 18, 20, 'Entregables de calidad profesional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqit002gojvqfq5uceqg', 'cmp1veqis002fojvqvvaf87lm', 'cmp1veqh6000eojvqanonrs4d', 18, 20, 'Buena innovación tecnológica, clara diferenciación.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqit002hojvqeojs07z0', 'cmp1veqis002fojvqvvaf87lm', 'cmp1veqh7000iojvqbk48h6c4', 13, 15, 'Viabilidad comprobada con datos de la prueba piloto.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqit002iojvqx7ysimbs', 'cmp1veqis002fojvqvvaf87lm', 'cmp1veqh6000fojvqc82rdwhe', 14, 15, 'Impacto social significativo y medible.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqit002jojvqwgxjzywe', 'cmp1veqis002fojvqvvaf87lm', 'cmp1veqh6000hojvqmzztenfi', 16, 20, 'Buena presentación, datos claros.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqit002kojvqftwqad1w', 'cmp1veqis002fojvqvvaf87lm', 'cmp1veqh6000gojvqnm253czb', 8, 10, 'Escalable a otras zonas rurales del país.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqit002lojvqyl6blcn9', 'cmp1veqis002fojvqvvaf87lm', 'cmp1veqh7000jojvqkjkx2d4n', 19, 20, 'Documentación exhaustiva y profesional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiu002oojvq7xge8ia1', 'cmp1veqit002nojvqbe4a6899', 'cmp1veqh6000eojvqanonrs4d', 20, 20, 'Innovación excepcional al combinar saberes ancestrales con ciencia moderna.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiu002pojvquuaqhqgg', 'cmp1veqit002nojvqbe4a6899', 'cmp1veqh7000iojvqbk48h6c4', 14, 15, 'Mercado farmacéutico claro con alto potencial.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiu002qojvq25ntmnvk', 'cmp1veqit002nojvqbe4a6899', 'cmp1veqh6000fojvqc82rdwhe', 15, 15, 'Impacto social y cultural extraordinario.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiu002rojvq18to2qfx', 'cmp1veqit002nojvqbe4a6899', 'cmp1veqh6000hojvqmzztenfi', 18, 20, 'Pitch inspirador con narrativa impactante.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiu002sojvq4i3871ul', 'cmp1veqit002nojvqbe4a6899', 'cmp1veqh6000gojvqnm253czb', 9, 10, 'Potencial de expansión a toda la región andina.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiu002tojvqo5bv0tkc', 'cmp1veqit002nojvqbe4a6899', 'cmp1veqh7000jojvqkjkx2d4n', 20, 20, 'Entregables impecables, nivel de publicación científica.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiv002wojvqilpn752d', 'cmp1veqiv002vojvq17z20gyv', 'cmp1veqh6000eojvqanonrs4d', 19, 20, 'Innovación destacable en el sector farmacéutico.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiv002xojvq1x6bhqr5', 'cmp1veqiv002vojvq17z20gyv', 'cmp1veqh7000iojvqbk48h6c4', 14, 15, 'Excelente proyección comercial.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiv002yojvqwu4s2vth', 'cmp1veqiv002vojvq17z20gyv', 'cmp1veqh6000fojvqc82rdwhe', 15, 15, 'Impacto cultural y sanitario excepcional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiv002zojvqkwzregx6', 'cmp1veqiv002vojvq17z20gyv', 'cmp1veqh6000hojvqmzztenfi', 17, 20, 'Presentación sólida y bien estructurada.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiv0030ojvqgbjqlxje', 'cmp1veqiv002vojvq17z20gyv', 'cmp1veqh6000gojvqnm253czb', 9, 10, 'Alto potencial de escalamiento internacional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqiv0031ojvq22z9xa7h', 'cmp1veqiv002vojvq17z20gyv', 'cmp1veqh7000jojvqkjkx2d4n', 20, 20, 'Documentación de calidad excepcional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqix0034ojvqr99yicac', 'cmp1veqiw0033ojvqpuvfe2af', 'cmp1veqh6000eojvqanonrs4d', 20, 20, 'En revisión...');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqix0035ojvq3eeq5dah', 'cmp1veqiw0033ojvqpuvfe2af', 'cmp1veqh7000iojvqbk48h6c4', 15, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqix0036ojvqibybly3f', 'cmp1veqiw0033ojvqpuvfe2af', 'cmp1veqh6000fojvqc82rdwhe', 15, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqix0037ojvqdi12ndbe', 'cmp1veqiw0033ojvqpuvfe2af', 'cmp1veqh6000hojvqmzztenfi', 20, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqix0038ojvq3z1vw1wr', 'cmp1veqiw0033ojvqpuvfe2af', 'cmp1veqh6000gojvqnm253czb', 10, 10, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1veqix0039ojvqvriku2p5', 'cmp1veqiw0033ojvqpuvfe2af', 'cmp1veqh7000jojvqkjkx2d4n', 20, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wnmwe000cojkjbdbgwop7', 'cmp1wnmwe000aojkjbby6i3am', 'cmp1veqh6000eojvqanonrs4d', 19.5, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wnmwe000dojkje6n0smw8', 'cmp1wnmwe000aojkjbby6i3am', 'cmp1veqh7000iojvqbk48h6c4', 12, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wnmwe000eojkjxzgxa0oi', 'cmp1wnmwe000aojkjbby6i3am', 'cmp1veqh6000fojvqc82rdwhe', 14.5, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wnmwe000fojkjk9b9f7nc', 'cmp1wnmwe000aojkjbby6i3am', 'cmp1veqh6000hojvqmzztenfi', 19, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wnmwe000gojkj5gsnyjnx', 'cmp1wnmwe000aojkjbby6i3am', 'cmp1veqh6000gojvqnm253czb', 8.5, 10, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wnmwe000hojkjon368ont', 'cmp1wnmwe000aojkjbby6i3am', 'cmp1veqh7000jojvqkjkx2d4n', 19.5, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wwq5c0013ojkjxmjpxlqo', 'cmp1wwq5c0011ojkj6dbx0k5z', 'cmp1veqh6000eojvqanonrs4d', 20, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wwq5c0014ojkj3fk8gcnb', 'cmp1wwq5c0011ojkj6dbx0k5z', 'cmp1veqh7000iojvqbk48h6c4', 14.5, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wwq5c0015ojkjewbdlojh', 'cmp1wwq5c0011ojkj6dbx0k5z', 'cmp1veqh6000fojvqc82rdwhe', 14.5, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wwq5c0016ojkjt73x818v', 'cmp1wwq5c0011ojkj6dbx0k5z', 'cmp1veqh6000hojvqmzztenfi', 20, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wwq5c0017ojkjqafx50hj', 'cmp1wwq5c0011ojkj6dbx0k5z', 'cmp1veqh6000gojvqnm253czb', 10, 10, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmp1wwq5c0018ojkjqenxz1ks', 'cmp1wwq5c0011ojkj6dbx0k5z', 'cmp1veqh7000jojvqkjkx2d4n', 19.5, 20, NULL);

-- Table: Institution
DROP TABLE IF EXISTS "Institution";
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Institution" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqh3000bojvqafkh7xax', 'Universidad Central', 1778544390279, 1778544390279);
INSERT INTO "Institution" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqh3000dojvqwgr3ns1o', 'Universidad de Innovación', 1778544390280, 1778544390280);
INSERT INTO "Institution" ("id", "name", "createdAt", "updatedAt") VALUES ('cmp1veqh3000cojvqz0j8x208', 'Instituto Tecnológico Nacional', 1778544390280, 1778544390280);

-- Table: Notification
DROP TABLE IF EXISTS "Notification";
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'info',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003aojvqmvnp4tc1', 'cmp1veqhf000pojvqew910kq8', 'Proyecto AgroSense recibido', 'Tu proyecto "AgroSense" ha sido recibido exitosamente y está en revisión por los evaluadores asignados.', 0, 'success', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003bojvq29bbujp4', 'cmp1veqhf000pojvqew910kq8', 'Evaluador asignado', 'Se han asignado evaluadores a tu proyecto "AgroSense". Recibirás los resultados pronto.', 0, 'info', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003cojvqkqosfhfv', 'cmp1veqhd000nojvqvc7722t1', 'Proyecto BioPack aprobado', '¡Felicitaciones! Tu proyecto "BioPack" ha sido aprobado y pasará a la siguiente fase del concurso.', 0, 'success', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003dojvqfbj5u3zx', 'cmp1veqhd000nojvqvc7722t1', 'Proyecto AgriData no aprobado', 'Tu proyecto "AgriData" no fue aprobado en esta convocatoria. Puedes revisar los comentarios de los evaluadores y volver a postular.', 0, 'warning', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003eojvqabgmwc94', 'cmp1veqhd000mojvqh3vxjztj', '¡Proyecto BioFarma Ecuador es el ganador!', '¡Felicidades! Tu proyecto "BioFarma Ecuador" ha sido seleccionado como ganador de la convocatoria. Nos comunicaremos contigo para los siguientes pasos.', 0, 'success', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003fojvqluokxami', 'cmp1veqhd000mojvqh3vxjztj', 'Proyecto SaludConecta - Finalista', 'Tu proyecto "SaludConecta" ha sido seleccionado como finalista. Prepárate para la presentación final.', 0, 'info', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003gojvqwq4u0gq0', 'cmp1veqhd000lojvqgz8j556g', 'Nuevos proyectos asignados', 'Se te han asignado 5 proyectos para evaluar. Por favor completa las evaluaciones antes de la fecha límite.', 0, 'info', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003hojvqlv79x6tl', 'cmp1veqhe000oojvqong8oiwc', 'Nuevos proyectos asignados', 'Se te han asignado 5 proyectos para evaluar. Por favor completa las evaluaciones antes de la fecha límite.', 0, 'info', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqiz003iojvq97du4zv8', 'cmp1veqhd000kojvqwb3bxzsa', 'Nueva convocatoria disponible', 'Se ha abierto una nueva convocatoria para la Fábrica de Ideas 2024. Ya se pueden registrar nuevos proyectos.', 0, 'info', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1veqj0003jojvq90mja9h8', 'cmp1veqhf000pojvqew910kq8', 'Proyecto EcoTurismo360 en borrador', 'Recuerda que tu proyecto "EcoTurismo360" está en estado borrador. Completa y envía tu propuesta antes de la fecha límite.', 1, 'warning', 1778544390348);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1wuiwh000vojkjnlhe5e2v', 'cmp1veqhd000kojvqwb3bxzsa', 'Estado del proyecto: SUBMITTED', 'Tu proyecto ha sido marcado como enviado', 0, 'info', 1778546806578);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1wvbus000xojkjh6gu1rjo', 'cmp1veqhd000lojvqgz8j556g', 'Nuevo proyecto asignado', 'Se te ha asignado el proyecto "ChrisCor" para evaluación', 0, 'info', 1778546844100);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmp1x1cu4008qojkj6hp33ulq', 'cmp1veqhd000kojvqwb3bxzsa', 'Nueva evaluación recibida', 'Tu proyecto "ChrisCor" ha recibido una nueva evaluación', 0, 'info', 1778547125308);

-- Table: Project
DROP TABLE IF EXISTS "Project";
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pitch" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "leaderName" TEXT NOT NULL,
    "leaderEmail" TEXT NOT NULL,
    "leaderPhone" TEXT,
    "leaderCourse" TEXT,
    "leaderParallel" TEXT,
    "tutorName" TEXT,
    "locationMatrix" TEXT,
    "locationSede" TEXT,
    "locationExtension" TEXT,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "averageScore" REAL NOT NULL DEFAULT 0,
    "areaId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Project_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhz000rojvqie6t489l', 'AgroSense', 'Plataforma IoT para monitoreo de cultivos en tiempo real que permite a pequeños agricultores optimizar el uso de agua y fertilizantes mediante sensores inteligentes.', 'AgroSense es una solución integral que combina sensores IoT, inteligencia artificial y una aplicación móvil para proporcionar recomendaciones precisas a agricultores sobre el riego, fertilización y manejo de plagas. Nuestro sistema reduce hasta un 40% el desperdicio de agua y aumenta el rendimiento de los cultivos en un 25%.', 'María García, Pedro López, Sofía Hernández', NULL, 'SUBMITTED', 'María García', 'participante@fabrica.com', '+593 99 111 0001', 'Ingeniería Agrónoma - 8vo Semestre', 'A', 'Dr. Roberto Fuentes', 'Matriz Quito', 'Sede Norte', NULL, 0, 0, 'cmp1veqgp0004ojvqnhpe7pax', 'cmp1veqgz0008ojvq1xtgqux6', 'cmp1veqh3000bojvqafkh7xax', 'cmp1veqhf000pojvqew910kq8', 1778544390311, 1778544390311, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhz000vojvq92bh2rhe', 'FinVerde', 'Fintech para inclusión financiera de pequeños productores agrícolas mediante microcréditos basados en datos de productividad.', 'FinVerde utiliza datos satelitales y de sensores para evaluar la productividad de pequeñas fincas y ofrecer microcréditos con tasas justas. Nuestro modelo de scoring alternativo permite acceder a crédito a productores que tradicionalmente son excluidos del sistema financiero.', 'Juan Pérez, Ricardo Mora, Diana Castillo', NULL, 'SUBMITTED', 'Juan Pérez', 'participante2@fabrica.com', '+593 99 111 0002', 'Economía - 7mo Semestre', 'A', 'PhD. Ernesto Palacios', 'Matriz Guayaquil', 'Sede Económicas', NULL, 0, 0, 'cmp1veqgs0006ojvq4ycwqdoa', 'cmp1veqgz0008ojvq1xtgqux6', 'cmp1veqh3000cojvqz0j8x208', 'cmp1veqhd000nojvqvc7722t1', 1778544390311, 1778544390311, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqi10011ojvqzjqs3df7', 'CirculaEC', 'Marketplace de economía circular que conecta empresas generadoras de residuos industriales con recicladores y transformadores locales.', 'CirculaEC facilita la transición hacia la economía circular al conectar empresas que generan residuos con quienes pueden transformarlos en nuevos productos. Nuestra plataforma gestiona la logística, trazabilidad y certificación ambiental de cada transacción.', 'Juan Pérez, Arq. Silvia Narváez, Eco. Pablo Herrera', NULL, 'APPROVED', 'Juan Pérez', 'participante2@fabrica.com', '+593 99 111 0002', 'Ingeniería Ambiental - 6to Semestre', 'B', 'Ing. Patricia Vallejo', 'Matriz Guayaquil', 'Sede Central', NULL, 75, 75, 'cmp1veqgo0001ojvquiv3ilsp', 'cmp1veqgz0007ojvqwuwvrcwn', 'cmp1veqh3000cojvqz0j8x208', 'cmp1veqhd000nojvqvc7722t1', 1778544390313, 1778544390313, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqi0000xojvqdw56x9mc', 'SaludConecta', 'Aplicación de telemedicina que conecta comunidades rurales con especialistas médicos mediante consultas virtuales y diagnóstico asistido por IA.', 'SaludConecta reduce la brecha de acceso a salud en zonas rurales del Ecuador. Nuestra plataforma permite consultas virtuales, triaje automatizado con IA, y gestión de historias clínicas digitales. Hemos atendido más de 500 pacientes en prueba piloto con 95% de satisfacción.', 'Laura Sánchez, Miguel Torres, Carmen Guzmán', NULL, 'FINALIST', 'Laura Sánchez', 'participante3@fabrica.com', '+593 99 111 0003', 'Medicina - Internado Rotativo', 'C', 'Dra. Lucía Paredes', 'Matriz Cuenca', 'Sede Sur', NULL, 90, 90, 'cmp1veqgo0002ojvqyaw4qle0', 'cmp1veqgz0008ojvq1xtgqux6', 'cmp1veqh3000dojvqwgr3ns1o', 'cmp1veqhd000mojvqh3vxjztj', 1778544390312, 1778544390312, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqi20015ojvqpgvw810b', 'EcoTurismo360', 'Plataforma digital que promueve el turismo sostenible conectando viajeros conscientes con comunidades anfitrionas y experiencias auténticas.', 'EcoTurismo360 es una plataforma que certifica y promociona experiencias turísticas sostenibles. Los viajeros pueden reservar experiencias directamente con comunidades locales, asegurando que el 70% de los ingresos se queden en la comunidad. Incluye sistema de certificación de sostenibilidad.', 'María García, Fernando Ríos, Valentina Cruz', '/uploads/50f875cb-b99d-495c-8f27-c5c5be3beaf6.jpg', 'DRAFT', 'María García', 'participante@fabrica.com', '+593 99 111 0001', 'Turismo Sostenible - 5to Semestre', 'A', 'Mg. Rosa Alvarado', 'Matriz Quito', 'Sede Turismo', NULL, 0, 0, 'cmp1veqgq0005ojvq8denzztz', 'cmp1veqgz0007ojvqwuwvrcwn', 'cmp1veqh3000bojvqafkh7xax', 'cmp1veqhf000pojvqew910kq8', 1778544390314, 1779061748055, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhz000uojvqm0j6hvuw', 'BioFarma Ecuador', 'Desarrollo de fitofármacos a partir de plantas medicinales ecuatorianas con validación científica para el tratamiento de enfermedades tropicales.', 'BioFarma Ecuador investiga y desarrolla medicamentos a base de plantas medicinales nativas con evidencia científica rigurosa. Nuestro primer producto, un antiparasitario natural basado en ajo ecuatoriano, ha mostrado 89% de eficacia en estudios preclínicos. Buscamos preservar el conocimiento ancestral con estándares modernos.', 'Laura Sánchez, Dr. Víctor Jaramillo, Bsc. Elena Andrade', NULL, 'WINNER', 'Laura Sánchez', 'participante3@fabrica.com', '+593 99 111 0003', 'Biotecnología - 9no Semestre', 'A', 'Dr. Manuel Espinoza', 'Matriz Cuenca', 'Sede Investigación', NULL, 95, 95, 'cmp1veqgo0002ojvqyaw4qle0', 'cmp1veqgz0009ojvq7xa2zo93', 'cmp1veqh3000dojvqwgr3ns1o', 'cmp1veqhd000mojvqh3vxjztj', 1778544390311, 1778544390311, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqi0000zojvq7d6mzima', 'AgriData', 'Sistema de big data agrícola que utiliza imágenes satelitales y machine learning para predecir rendimientos y optimizar la cadena de suministro.', 'AgriData procesa imágenes satelitales y datos meteorológicos para generar predicciones de rendimiento de cultivos a nivel de finca. Ayudamos a cooperativas y exportadores a planificar mejor su cadena de suministro, reduciendo pérdidas post-cosecha en un 30%.', 'María García, Ing. Sebastián Molina, Lic. Gabriela Pardo', NULL, 'REJECTED', 'María García', 'participante@fabrica.com', '+593 99 111 0001', 'Ingeniería de Sistemas - 8vo Semestre', 'B', 'Ing. Marcos Delgado', 'Matriz Quito', 'Sede Tecnológica', NULL, 0, 0, 'cmp1veqgo0003ojvq92q556bi', 'cmp1veqgz000aojvqh8hi7r9f', 'cmp1veqh3000bojvqafkh7xax', 'cmp1veqhf000pojvqew910kq8', 1778544390312, 1778544390312, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqi10013ojvqwink52j6', 'BioPack', 'Empaques biodegradables a base de cáscara de plátano que reemplazan el plástico de un solo uso en la industria alimentaria.', 'BioPack transforma residuos de cáscara de plátano en empaques 100% biodegradables y compostables. Nuestros empaques se descomponen en 45 días versus los 400 años del plástico convencional. Ya contamos con prototipos validados y primeras cartas de intención de restaurantes locales.', 'Juan Pérez, Daniela Vargas, Andrés Mejía', NULL, 'APPROVED', 'Juan Pérez', 'participante2@fabrica.com', '+593 99 111 0002', 'Ingeniería Ambiental - 6to Semestre', 'B', 'Ing. Patricia Vallejo', 'Matriz Guayaquil', 'Sede Central', 'Ext. Durán', 82.5, 82.5, 'cmp1veqgo0001ojvquiv3ilsp', 'cmp1veqgz0009ojvq7xa2zo93', 'cmp1veqh3000cojvqz0j8x208', 'cmp1veqhd000nojvqvc7722t1', 1778544390314, 1778544390314, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1wuhhe000lojkjzd3x35ub', 'ChrisCor', 'Cualquier Cosa', 'esquipo multidisciplinario', 'MiPROY', NULL, 'SUBMITTED', 'Administrador General', 'admin@fabrica.com', '0123456789', '2do A', 'A', 'Chris Coronel', 'Cuenca', NULL, NULL, 84, 84, 'cmp1veqgs0006ojvq4ycwqdoa', 'cmp1veqgz0007ojvqwuwvrcwn', 'cmp1veqh3000bojvqafkh7xax', 'cmp1veqhd000kojvqwb3bxzsa', 1778546804739, 1778547125303, NULL);

-- Table: ProjectEvaluator
DROP TABLE IF EXISTS "ProjectEvaluator";
CREATE TABLE "ProjectEvaluator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectEvaluator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectEvaluator_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi70019ojvqevm1h008', 'cmp1veqi10013ojvqwink52j6', 'cmp1veqhd000lojvqgz8j556g', 1778544390320);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi9001fojvq62dbrshy', 'cmp1veqi10013ojvqwink52j6', 'cmp1veqhe000oojvqong8oiwc', 1778544390321);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi9001hojvq4lz83deo', 'cmp1veqhz000vojvq92bh2rhe', 'cmp1veqhd000lojvqgz8j556g', 1778544390322);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi9001jojvq6d67klab', 'cmp1veqi10011ojvqzjqs3df7', 'cmp1veqhe000oojvqong8oiwc', 1778544390322);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi9001lojvqe7kyjl9i', 'cmp1veqi0000xojvqdw56x9mc', 'cmp1veqhd000lojvqgz8j556g', 1778544390322);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqia001nojvqqd0jligf', 'cmp1veqi0000xojvqdw56x9mc', 'cmp1veqhe000oojvqong8oiwc', 1778544390322);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqia001pojvqa64ym3uf', 'cmp1veqhz000rojvqie6t489l', 'cmp1veqhe000oojvqong8oiwc', 1778544390322);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi7001cojvq5alc5k2z', 'cmp1veqhz000uojvqm0j6hvuw', 'cmp1veqhd000lojvqgz8j556g', 1778544390320);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi7001dojvq2hoiqkit', 'cmp1veqhz000uojvqm0j6hvuw', 'cmp1veqhe000oojvqong8oiwc', 1778544390320);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1veqi70017ojvqwpktmxdp', 'cmp1veqhz000rojvqie6t489l', 'cmp1veqhd000lojvqgz8j556g', 1778544390320);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmp1wvbuq000wojkjnhv2o6qc', 'cmp1wuhhe000lojkjzd3x35ub', 'cmp1veqhd000lojvqgz8j556g', 1778546844098);

-- Table: User
DROP TABLE IF EXISTS "User";
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "phone" TEXT,
    "avatar" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhd000lojvqgz8j556g', 'evaluador@fabrica.com', '07a575a68b37a58f466250632d099ca4a8bcf31c24a279e975c417f4d2469e9c', 'Dr. Carlos Mendoza', 'EVALUATOR', '+593 99 222 0001', NULL, 1, 1778544390290, 1778544390290, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhe000oojvqong8oiwc', 'evaluador2@fabrica.com', '07a575a68b37a58f466250632d099ca4a8bcf31c24a279e975c417f4d2469e9c', 'Ing. Ana Rodríguez', 'EVALUATOR', '+593 99 222 0002', NULL, 1, 1778544390290, 1778544390290, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhf000pojvqew910kq8', 'participante@fabrica.com', 'e8594120cf65fae8800a917b063214b47d21fc506c3936c26b26f5e99b3f2741', 'María García', 'PARTICIPANT', '+593 99 111 0001', NULL, 1, 1778544390292, 1778544390292, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhd000nojvqvc7722t1', 'participante2@fabrica.com', 'e8594120cf65fae8800a917b063214b47d21fc506c3936c26b26f5e99b3f2741', 'Juan Pérez', 'PARTICIPANT', '+593 99 111 0002', NULL, 1, 1778544390290, 1778544390290, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhd000mojvqh3vxjztj', 'participante3@fabrica.com', 'e8594120cf65fae8800a917b063214b47d21fc506c3936c26b26f5e99b3f2741', 'Laura Sánchez', 'PARTICIPANT', '+593 99 111 0003', NULL, 1, 1778544390290, 1778544390290, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmp1veqhd000kojvqwb3bxzsa', 'admin@fabrica.com', '1e34bdb1f1017edb37f6f3f657cde973845fe971e02fceda0c82e9c4457de2e1', 'Administrador General', 'ADMIN', '+593 99 000 0001', NULL, 1, 1778544390290, 1778544390290, NULL);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Institution_name_key" ON "Institution"("name");
CREATE UNIQUE INDEX "ProjectEvaluator_projectId_evaluatorId_key" ON "ProjectEvaluator"("projectId", "evaluatorId");
CREATE UNIQUE INDEX "Evaluation_projectId_evaluatorId_key" ON "Evaluation"("projectId", "evaluatorId");
CREATE UNIQUE INDEX "EvaluationScore_evaluationId_criteriaId_key" ON "EvaluationScore"("evaluationId", "criteriaId");