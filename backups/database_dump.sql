-- Fábrica de Ideas Database Dump
-- Generated at: 2026-05-18T05:24:10.897Z
-- ============================================

-- Table: AppSetting
DROP TABLE IF EXISTS "AppSetting";
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "AppSetting" ("id", "key", "value", "createdAt", "updatedAt") VALUES ('cmpag7tlh0000oiymv0qyiwtw', 'copyrightText', 'Fábrica de Ideas, Creado por Ing. Christian Coronel Balderramo', 1779063069077, 1779063577820);
INSERT INTO "AppSetting" ("id", "key", "value", "createdAt", "updatedAt") VALUES ('cmpag7tlj0001oiymkn8tnnc9', 'organizationName', 'Fábrica de Ideas FCEE', 1779063069079, 1779063577818);

-- Table: Area
DROP TABLE IF EXISTS "Area";
CREATE TABLE "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyj0000oixlrtimu916', 'Bioeconomía y Biofuturo', 1779074944796, 1779074944796);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyk0004oixldt6x6m05', 'Economía circular y sostenibilidad ambiental', 1779074944796, 1779074944796);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyk0005oixlwy5dp00j', 'Innovación Abierta y Nuevos Modelos de Negocio', 1779074944796, 1779074944796);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyk0006oixl7hvir5h6', 'Innovación y Servicios Tecnológicos Digitales', 1779074944796, 1779074944796);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyj0001oixl01w7tozr', 'Agrotecnología y soberanía alimentaria', 1779074944796, 1779074944796);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyj0003oixl7nn4sfgk', 'Salud, bienestar y biofarmacia', 1779074944796, 1779074944796);
INSERT INTO "Area" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyj0002oixlvhtpay6v', 'Turismo sostenible y Experiencias', 1779074944796, 1779074944796);

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

INSERT INTO "Attachment" ("id", "projectId", "fileName", "filePath", "fileType", "fileSize", "category", "createdAt") VALUES ('cmpaq1y0b000boiwsp7q50d0v', 'cmpanacyz000voixlg4nd33ml', '1000025531.mp4', '/api/files/da41e21f-304a-4204-86e7-7bd2c2b687c5.mp4', 'video/mp4', 1373915, 'pitch_video', 1779079591019);
INSERT INTO "Attachment" ("id", "projectId", "fileName", "filePath", "fileType", "fileSize", "category", "createdAt") VALUES ('cmpaq27g8000foiwsz6p70by3', 'cmpanacyz000voixlg4nd33ml', '1000025332.jpg', '/api/files/f7ecae81-f22e-430c-9d5f-3df71b3745fc.jpg', 'image/jpeg', 38958, 'image', 1779079603257);

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

INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003koixlmu4mz1fk', 'cmpanacyw000koixl6443hc5a', NULL, 'CREATE_USER', 'Creación de cuenta de administrador', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003loixlib4almc7', 'cmpanacyw000loixlfqi8ly7k', 'cmpanacyz000uoixlwvjw6gpg', 'CREATE_PROJECT', 'Proyecto AgroSense creado', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003moixln7tcijhs', 'cmpanacyw000moixl9gtxege4', 'cmpanacz0000xoixlqya5vyi8', 'CREATE_PROJECT', 'Proyecto BioPack creado', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003noixl67hijvav', 'cmpanacyx000ooixl6psl20f9', 'cmpanacz10015oixlam02y3sb', 'CREATE_PROJECT', 'Proyecto SaludConecta creado', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003ooixlszjcu0r8', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000uoixlwvjw6gpg', 'ASSIGN_EVALUATOR', 'Evaluadores asignados al proyecto AgroSense', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003poixlza3oye83', 'cmpanacyw000noixl67swu5pd', 'cmpanacz0000xoixlqya5vyi8', 'SUBMIT_EVALUATION', 'Evaluación enviada para BioPack', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003qoixl6ma7jywf', 'cmpanacyx000poixl54djol3h', 'cmpanacz0000xoixlqya5vyi8', 'SUBMIT_EVALUATION', 'Evaluación enviada para BioPack', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003roixlmsf9rv4t', 'cmpanacyw000koixl6443hc5a', 'cmpanacz0000xoixlqya5vyi8', 'APPROVE_PROJECT', 'Proyecto BioPack aprobado', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003soixl95fjo22y', 'cmpanacyw000koixl6443hc5a', 'cmpanacz10015oixlam02y3sb', 'MARK_FINALIST', 'Proyecto SaludConecta marcado como finalista', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpanaczj003toixl2nbut6y2', 'cmpanacyw000koixl6443hc5a', 'cmpanacz0000zoixlflgk25g3', 'MARK_WINNER', 'Proyecto BioFarma Ecuador declarado ganador', 1779074944832);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpapurk60001oiwsqg04pofs', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1779079256070);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpapwjqg0003oiwswh2zsmj9', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'FILE_DELETED', 'Archivo "IMG_20260302_120335_914.jpg" eliminado', 1779079339240);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpapwknd0005oiwslms7ncmt', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'FILE_DELETED', 'Archivo "IMG_20260302_120335_914.jpg" eliminado', 1779079340425);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpapwn7i0007oiwsy5vqx9u5', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1779079343742);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpapx6190009oiws1vmtfu8k', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1779079368142);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpaq1y0c000doiws962o7hap', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'FILE_UPLOADED', 'Archivo "1000025531.mp4" subido al proyecto (pitch_video)', 1779079591020);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpaq27gb000hoiwswvloyrj0', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'FILE_UPLOADED', 'Archivo "1000025332.jpg" subido al proyecto (image)', 1779079603260);
INSERT INTO "AuditLog" ("id", "userId", "projectId", "action", "details", "createdAt") VALUES ('cmpaq2mxe000joiwsqkg7krq7', 'cmpanacyw000koixl6443hc5a', 'cmpanacyz000voixlg4nd33ml', 'PROJECT_UPDATED', 'Proyecto "EcoTurismo360" actualizado', 1779079623315);

-- Table: Category
DROP TABLE IF EXISTS "Category";
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyp0007oixlila29goh', 'Emprendimiento Escolar', 1779074944801, 1779074944801);
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyp0008oixley2hluss', 'Poster de Emprendimiento', 1779074944801, 1779074944801);
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyp0009oixljn7tgvyk', 'Producto Mínimo Viable', 1779074944802, 1779074944802);
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyp000aoixl905r4gyp', 'Emprendimiento en Ejecución', 1779074944802, 1779074944802);

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

INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmpanacza001roixl5bj0mlal', 'cmpanacz0000xoixlqya5vyi8', 'cmpanacyw000noixl67swu5pd', 85, 'Proyecto con excelente potencial. La validación con clientes reales demuestra tracción. Recomendar fortalecer el modelo de escalabilidad.', 0, 1731628800000, 1779074944823, 1779074944823);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmpanaczb001zoixld2baasok', 'cmpanacz0000xoixlqya5vyi8', 'cmpanacyx000poixl54djol3h', 80, 'Proyecto prometedor con impacto ambiental significativo. Sugerir explorar alianzas con supermercados para distribución.', 0, 1731715200000, 1779074944824, 1779074944824);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmpanaczd0027oixlsy1p5vhy', 'cmpanacz10015oixlam02y3sb', 'cmpanacyw000noixl67swu5pd', 92, 'Proyecto excepcional con impacto social demostrado. Los 500 pacientes atendidos en prueba piloto son una prueba contundente. Recomendado como finalista.', 0, 1731888000000, 1779074944825, 1779074944825);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmpanacze002foixlvhxskrki', 'cmpanacz10015oixlam02y3sb', 'cmpanacyx000poixl54djol3h', 88, 'Excelente proyecto. La validación con usuarios reales es un gran diferenciador. Sugerir integrar más especialidades médicas.', 0, 1731974400000, 1779074944826, 1779074944826);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmpanaczf002noixli6oqyohr', 'cmpanacz0000zoixlflgk25g3', 'cmpanacyw000noixl67swu5pd', 96, 'Proyecto sobresaliente. La combinación de conocimiento ancestral con validación científica rigurosa es un modelo a seguir. Recomiendo como ganador.', 0, 1732060800000, 1779074944828, 1779074944828);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmpanaczg002voixl0e6ga9kf', 'cmpanacz0000zoixlflgk25g3', 'cmpanacyx000poixl54djol3h', 94, 'Proyecto de excelencia. Los estudios preclínicos son prometedores y el enfoque de preservar conocimiento ancestral con estándares modernos es visionary.', 0, 1732147200000, 1779074944829, 1779074944829);
INSERT INTO "Evaluation" ("id", "projectId", "evaluatorId", "totalScore", "comments", "isDraft", "submittedAt", "createdAt", "updatedAt") VALUES ('cmpanaczh0033oixle76lcy03', 'cmpanacyz000uoixlwvjw6gpg', 'cmpanacyw000noixl67swu5pd', 12, '', 1, NULL, 1779074944830, 1779074944830);

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

INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmpanacyr000eoixl5uyzfvst', 'Innovación y Creatividad', 'Evalúa el grado de originalidad de la idea, la creatividad en la solución propuesta y la diferenciación frente a alternativas existentes en el mercado.', 20, 'Descripción de la innovación, análisis comparativo con soluciones existentes, elementos diferenciadores del proyecto.', 1, 1779074944803, 1779074944803);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmpanacyr000goixlk2bc324z', 'Pitch (Presentación y Comunicación)', 'Evalúa la calidad de la presentación oral, claridad del mensaje, capacidad de persuasión, uso de recursos visuales y manejo del tiempo.', 20, 'Video de pitch, diapositivas de presentación, claridad en la comunicación de la propuesta de valor.', 4, 1779074944803, 1779074944803);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmpanacyr000joixl94zm1pfs', 'Impacto Social/Ambiental', 'Mide el potencial del proyecto para generar un impacto positivo en la comunidad, el medio ambiente o grupos vulnerables, alineado con los ODS.', 15, 'Descripción del impacto, indicadores de medición, alineación con ODS, beneficiarios directos e indirectos.', 3, 1779074944804, 1779074944804);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmpanacyr000foixl8c9m4kqh', 'Viabilidad del Negocio', 'Analiza la factibilidad comercial y financiera del proyecto, incluyendo modelo de negocio, mercado objetivo, proyecciones financieras y plan de sostenibilidad.', 15, 'Modelo Canvas, análisis de mercado, proyecciones financieras, estrategia de precios, plan de comercialización.', 2, 1779074944803, 1779074944803);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmpanacyr000hoixl5b38s0v6', 'Potencial de Escalamiento', 'Analiza la capacidad del proyecto para crecer y expandirse a nuevos mercados o regiones, considerando la escalabilidad del modelo de negocio.', 10, 'Plan de crecimiento, estrategia de expansión, análisis de escalabilidad tecnológica y operativa.', 5, 1779074944803, 1779074944803);
INSERT INTO "EvaluationCriteria" ("id", "name", "description", "weight", "evidence", "order", "createdAt", "updatedAt") VALUES ('cmpanacyr000ioixl1uwm0655', 'Entregable', 'Evalúa la calidad, completitud y presentación de los documentos y materiales entregados como parte del proyecto (plan de negocio, prototipo, evidencias, etc.).', 20, 'Documentación completa del proyecto, prototipo o MVP funcional, evidencias de validación, reportes técnicos.', 6, 1779074944804, 1779074944804);

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

INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczb001soixl40cgagdn', 'cmpanacza001roixl5bj0mlal', 'cmpanacyr000eoixl5uyzfvst', 17, 20, 'Solución creativa con buen enfoque diferenciador.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczb001toixltzmj86r3', 'cmpanacza001roixl5bj0mlal', 'cmpanacyr000foixl8c9m4kqh', 13, 15, 'Modelo de negocio claro con proyecciones realistas.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczb001uoixl7n556r1z', 'cmpanacza001roixl5bj0mlal', 'cmpanacyr000joixl94zm1pfs', 14, 15, 'Excelente impacto ambiental demostrado.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczb001voixle34qwkuf', 'cmpanacza001roixl5bj0mlal', 'cmpanacyr000goixlk2bc324z', 16, 20, 'Buena presentación, podría mejorar el manejo del tiempo.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczb001woixlnz0sa3cu', 'cmpanacza001roixl5bj0mlal', 'cmpanacyr000hoixl5b38s0v6', 8, 10, 'Potencial de expansión a otras regiones agrícolas.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczb001xoixlsagyyq4b', 'cmpanacza001roixl5bj0mlal', 'cmpanacyr000ioixl1uwm0655', 17, 20, 'Documentación completa y bien presentada.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczc0020oixlyvrayacv', 'cmpanaczb001zoixld2baasok', 'cmpanacyr000eoixl5uyzfvst', 16, 20, 'Innovación moderada, existen alternativas similares.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczc0021oixl1u119xyz', 'cmpanaczb001zoixld2baasok', 'cmpanacyr000foixl8c9m4kqh', 12, 15, 'Viabilidad comercial demostrada con cartas de intención.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczc0022oixl8wc8lsui', 'cmpanaczb001zoixld2baasok', 'cmpanacyr000joixl94zm1pfs', 15, 15, 'Impacto ambiental excepcional y medible.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczc0023oixl06p6kwph', 'cmpanaczb001zoixld2baasok', 'cmpanacyr000goixlk2bc324z', 14, 20, 'Presentación correcta pero falta más pasión en el pitch.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczc0024oixl0xje9h9k', 'cmpanaczb001zoixld2baasok', 'cmpanacyr000hoixl5b38s0v6', 7, 10, 'Escalabilidad limitada por disponibilidad de materia prima.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczc0025oixle8qk2pbq', 'cmpanaczb001zoixld2baasok', 'cmpanacyr000ioixl1uwm0655', 16, 20, 'Entregables completos y bien organizados.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczd0028oixl1akqds4d', 'cmpanaczd0027oixlsy1p5vhy', 'cmpanacyr000eoixl5uyzfvst', 19, 20, 'Innovación destacada con IA para triaje automatizado.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczd0029oixll5w2m0nd', 'cmpanaczd0027oixlsy1p5vhy', 'cmpanacyr000foixl8c9m4kqh', 14, 15, 'Modelo de negocio sostenible con múltiples fuentes de ingreso.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczd002aoixlu6yxumdb', 'cmpanaczd0027oixlsy1p5vhy', 'cmpanacyr000joixl94zm1pfs', 15, 15, 'Impacto social transformador en comunidades vulnerables.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczd002boixlzx2ko0zy', 'cmpanaczd0027oixlsy1p5vhy', 'cmpanacyr000goixlk2bc324z', 17, 20, 'Pitch convincente con datos duros que respaldan.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczd002coixlk208brat', 'cmpanaczd0027oixlsy1p5vhy', 'cmpanacyr000hoixl5b38s0v6', 9, 10, 'Alto potencial de replicabilidad en toda la región.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczd002doixl9i7of1j5', 'cmpanaczd0027oixlsy1p5vhy', 'cmpanacyr000ioixl1uwm0655', 18, 20, 'Entregables de calidad profesional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanacze002goixlh1ium8jb', 'cmpanacze002foixlvhxskrki', 'cmpanacyr000eoixl5uyzfvst', 18, 20, 'Buena innovación tecnológica, clara diferenciación.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanacze002hoixlxct97y9v', 'cmpanacze002foixlvhxskrki', 'cmpanacyr000foixl8c9m4kqh', 13, 15, 'Viabilidad comprobada con datos de la prueba piloto.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanacze002ioixlm0az46dc', 'cmpanacze002foixlvhxskrki', 'cmpanacyr000joixl94zm1pfs', 14, 15, 'Impacto social significativo y medible.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanacze002joixld7v0tot8', 'cmpanacze002foixlvhxskrki', 'cmpanacyr000goixlk2bc324z', 16, 20, 'Buena presentación, datos claros.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczf002koixl9rw4e138', 'cmpanacze002foixlvhxskrki', 'cmpanacyr000hoixl5b38s0v6', 8, 10, 'Escalable a otras zonas rurales del país.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczf002loixlak8zkqy0', 'cmpanacze002foixlvhxskrki', 'cmpanacyr000ioixl1uwm0655', 19, 20, 'Documentación exhaustiva y profesional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczg002ooixl7cguepks', 'cmpanaczf002noixli6oqyohr', 'cmpanacyr000eoixl5uyzfvst', 20, 20, 'Innovación excepcional al combinar saberes ancestrales con ciencia moderna.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczg002poixldc6uqf0y', 'cmpanaczf002noixli6oqyohr', 'cmpanacyr000foixl8c9m4kqh', 14, 15, 'Mercado farmacéutico claro con alto potencial.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczg002qoixlzg6l47yj', 'cmpanaczf002noixli6oqyohr', 'cmpanacyr000joixl94zm1pfs', 15, 15, 'Impacto social y cultural extraordinario.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczg002roixl0fh79h8u', 'cmpanaczf002noixli6oqyohr', 'cmpanacyr000goixlk2bc324z', 18, 20, 'Pitch inspirador con narrativa impactante.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczg002soixls5sn8o2l', 'cmpanaczf002noixli6oqyohr', 'cmpanacyr000hoixl5b38s0v6', 9, 10, 'Potencial de expansión a toda la región andina.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczg002toixlof279hag', 'cmpanaczf002noixli6oqyohr', 'cmpanacyr000ioixl1uwm0655', 20, 20, 'Entregables impecables, nivel de publicación científica.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczh002woixlfwuags1m', 'cmpanaczg002voixl0e6ga9kf', 'cmpanacyr000eoixl5uyzfvst', 19, 20, 'Innovación destacable en el sector farmacéutico.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczh002xoixlr82o2z1q', 'cmpanaczg002voixl0e6ga9kf', 'cmpanacyr000foixl8c9m4kqh', 14, 15, 'Excelente proyección comercial.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczh002yoixlpv5wqtv3', 'cmpanaczg002voixl0e6ga9kf', 'cmpanacyr000joixl94zm1pfs', 15, 15, 'Impacto cultural y sanitario excepcional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczh002zoixlpqw08oi4', 'cmpanaczg002voixl0e6ga9kf', 'cmpanacyr000goixlk2bc324z', 17, 20, 'Presentación sólida y bien estructurada.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczh0030oixl9d9h4uul', 'cmpanaczg002voixl0e6ga9kf', 'cmpanacyr000hoixl5b38s0v6', 9, 10, 'Alto potencial de escalamiento internacional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczh0031oixlmlcl1c89', 'cmpanaczg002voixl0e6ga9kf', 'cmpanacyr000ioixl1uwm0655', 20, 20, 'Documentación de calidad excepcional.');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczi0034oixlpedkxkxu', 'cmpanaczh0033oixle76lcy03', 'cmpanacyr000eoixl5uyzfvst', 12, 20, 'En revisión...');
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczi0035oixlg7d6altu', 'cmpanaczh0033oixle76lcy03', 'cmpanacyr000foixl8c9m4kqh', 0, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczi0036oixlyj9gj772', 'cmpanaczh0033oixle76lcy03', 'cmpanacyr000joixl94zm1pfs', 0, 15, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczi0037oixlaegyyyu2', 'cmpanaczh0033oixle76lcy03', 'cmpanacyr000goixlk2bc324z', 0, 20, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczi0038oixl0is69gpm', 'cmpanaczh0033oixle76lcy03', 'cmpanacyr000hoixl5b38s0v6', 0, 10, NULL);
INSERT INTO "EvaluationScore" ("id", "evaluationId", "criteriaId", "score", "maxScore", "observation") VALUES ('cmpanaczi0039oixlfz83kjf5', 'cmpanaczh0033oixle76lcy03', 'cmpanacyr000ioixl1uwm0655', 0, 20, NULL);

-- Table: Institution
DROP TABLE IF EXISTS "Institution";
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Institution" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyq000boixlxg0iofhv', 'Universidad Central', 1779074944802, 1779074944802);
INSERT INTO "Institution" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyq000coixlaadezlby', 'Instituto Tecnológico Nacional', 1779074944802, 1779074944802);
INSERT INTO "Institution" ("id", "name", "createdAt", "updatedAt") VALUES ('cmpanacyq000doixlyi9oknvj', 'Universidad de Innovación', 1779074944802, 1779074944802);

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

INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003aoixlh8hfo2py', 'cmpanacyw000loixlfqi8ly7k', 'Proyecto AgroSense recibido', 'Tu proyecto "AgroSense" ha sido recibido exitosamente y está en revisión por los evaluadores asignados.', 0, 'success', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003boixlexlb5v5n', 'cmpanacyw000loixlfqi8ly7k', 'Evaluador asignado', 'Se han asignado evaluadores a tu proyecto "AgroSense". Recibirás los resultados pronto.', 0, 'info', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003coixlmzye5n6q', 'cmpanacyw000moixl9gtxege4', 'Proyecto BioPack aprobado', '¡Felicitaciones! Tu proyecto "BioPack" ha sido aprobado y pasará a la siguiente fase del concurso.', 0, 'success', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003doixlcryys4c6', 'cmpanacyw000moixl9gtxege4', 'Proyecto AgriData no aprobado', 'Tu proyecto "AgriData" no fue aprobado en esta convocatoria. Puedes revisar los comentarios de los evaluadores y volver a postular.', 0, 'warning', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003eoixlq4jw6nza', 'cmpanacyx000ooixl6psl20f9', '¡Proyecto BioFarma Ecuador es el ganador!', '¡Felicidades! Tu proyecto "BioFarma Ecuador" ha sido seleccionado como ganador de la convocatoria. Nos comunicaremos contigo para los siguientes pasos.', 0, 'success', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003foixldjl23ctr', 'cmpanacyx000ooixl6psl20f9', 'Proyecto SaludConecta - Finalista', 'Tu proyecto "SaludConecta" ha sido seleccionado como finalista. Prepárate para la presentación final.', 0, 'info', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003goixlax0ji2pv', 'cmpanacyw000noixl67swu5pd', 'Nuevos proyectos asignados', 'Se te han asignado 5 proyectos para evaluar. Por favor completa las evaluaciones antes de la fecha límite.', 0, 'info', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003hoixlacezkuwk', 'cmpanacyx000poixl54djol3h', 'Nuevos proyectos asignados', 'Se te han asignado 5 proyectos para evaluar. Por favor completa las evaluaciones antes de la fecha límite.', 0, 'info', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003ioixlvgyhv6es', 'cmpanacyw000koixl6443hc5a', 'Nueva convocatoria disponible', 'Se ha abierto una nueva convocatoria para la Fábrica de Ideas 2024. Ya se pueden registrar nuevos proyectos.', 0, 'info', 1779074944831);
INSERT INTO "Notification" ("id", "userId", "title", "message", "read", "type", "createdAt") VALUES ('cmpanaczi003joixlm4vocqxi', 'cmpanacyw000loixlfqi8ly7k', 'Proyecto EcoTurismo360 en borrador', 'Recuerda que tu proyecto "EcoTurismo360" está en estado borrador. Completa y envía tu propuesta antes de la fecha límite.', 1, 'warning', 1779074944831);

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

INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyz000uoixlwvjw6gpg', 'AgroSense', 'Plataforma IoT para monitoreo de cultivos en tiempo real que permite a pequeños agricultores optimizar el uso de agua y fertilizantes mediante sensores inteligentes.', 'AgroSense es una solución integral que combina sensores IoT, inteligencia artificial y una aplicación móvil para proporcionar recomendaciones precisas a agricultores sobre el riego, fertilización y manejo de plagas. Nuestro sistema reduce hasta un 40% el desperdicio de agua y aumenta el rendimiento de los cultivos en un 25%.', 'María García, Pedro López, Sofía Hernández', NULL, 'SUBMITTED', 'María García', 'participante@fabrica.com', '+593 99 111 0001', 'Ingeniería Agrónoma - 8vo Semestre', 'A', 'Dr. Roberto Fuentes', 'Matriz Quito', 'Sede Norte', NULL, 0, 0, 'cmpanacyj0001oixl01w7tozr', 'cmpanacyp0009oixljn7tgvyk', 'cmpanacyq000boixlxg0iofhv', 'cmpanacyw000loixlfqi8ly7k', 1779074944812, 1779074944812, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyz000voixlg4nd33ml', 'EcoTurismo360', 'Plataforma digital que promueve el turismo sostenible conectando viajeros conscientes con comunidades anfitrionas y experiencias auténticas.', 'EcoTurismo360 es una plataforma que certifica y promociona experiencias turísticas sostenibles. Los viajeros pueden reservar experiencias directamente con comunidades locales, asegurando que el 70% de los ingresos se queden en la comunidad. Incluye sistema de certificación de sostenibilidad.', 'María García, Fernando Ríos, Valentina Cruz', '/api/files/f7ecae81-f22e-430c-9d5f-3df71b3745fc.jpg', 'DRAFT', 'María García', 'participante@fabrica.com', '+593 99 111 0001', 'Turismo Sostenible - 5to Semestre', 'A', 'Mg. Rosa Alvarado', 'Matriz Quito', 'Sede Turismo', NULL, 0, 0, 'cmpanacyj0002oixlvhtpay6v', 'cmpanacyp0008oixley2hluss', 'cmpanacyq000boixlxg0iofhv', 'cmpanacyw000loixlfqi8ly7k', 1779074944812, 1779079623312, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacz0000zoixlflgk25g3', 'BioFarma Ecuador', 'Desarrollo de fitofármacos a partir de plantas medicinales ecuatorianas con validación científica para el tratamiento de enfermedades tropicales.', 'BioFarma Ecuador investiga y desarrolla medicamentos a base de plantas medicinales nativas con evidencia científica rigurosa. Nuestro primer producto, un antiparasitario natural basado en ajo ecuatoriano, ha mostrado 89% de eficacia en estudios preclínicos. Buscamos preservar el conocimiento ancestral con estándares modernos.', 'Laura Sánchez, Dr. Víctor Jaramillo, Bsc. Elena Andrade', NULL, 'WINNER', 'Laura Sánchez', 'participante3@fabrica.com', '+593 99 111 0003', 'Biotecnología - 9no Semestre', 'A', 'Dr. Manuel Espinoza', 'Matriz Cuenca', 'Sede Investigación', NULL, 95, 95, 'cmpanacyj0003oixl7nn4sfgk', 'cmpanacyp000aoixl905r4gyp', 'cmpanacyq000doixlyi9oknvj', 'cmpanacyx000ooixl6psl20f9', 1779074944813, 1779074944813, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacz10011oixlee81unht', 'AgriData', 'Sistema de big data agrícola que utiliza imágenes satelitales y machine learning para predecir rendimientos y optimizar la cadena de suministro.', 'AgriData procesa imágenes satelitales y datos meteorológicos para generar predicciones de rendimiento de cultivos a nivel de finca. Ayudamos a cooperativas y exportadores a planificar mejor su cadena de suministro, reduciendo pérdidas post-cosecha en un 30%.', 'María García, Ing. Sebastián Molina, Lic. Gabriela Pardo', NULL, 'REJECTED', 'María García', 'participante@fabrica.com', '+593 99 111 0001', 'Ingeniería de Sistemas - 8vo Semestre', 'B', 'Ing. Marcos Delgado', 'Matriz Quito', 'Sede Tecnológica', NULL, 0, 0, 'cmpanacyk0006oixl7hvir5h6', 'cmpanacyp0007oixlila29goh', 'cmpanacyq000boixlxg0iofhv', 'cmpanacyw000loixlfqi8ly7k', 1779074944813, 1779074944813, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacz10013oixl8ok34md2', 'CirculaEC', 'Marketplace de economía circular que conecta empresas generadoras de residuos industriales con recicladores y transformadores locales.', 'CirculaEC facilita la transición hacia la economía circular al conectar empresas que generan residuos con quienes pueden transformarlos en nuevos productos. Nuestra plataforma gestiona la logística, trazabilidad y certificación ambiental de cada transacción.', 'Juan Pérez, Arq. Silvia Narváez, Eco. Pablo Herrera', NULL, 'APPROVED', 'Juan Pérez', 'participante2@fabrica.com', '+593 99 111 0002', 'Ingeniería Ambiental - 6to Semestre', 'B', 'Ing. Patricia Vallejo', 'Matriz Guayaquil', 'Sede Central', NULL, 75, 75, 'cmpanacyk0004oixldt6x6m05', 'cmpanacyp0008oixley2hluss', 'cmpanacyq000coixlaadezlby', 'cmpanacyw000moixl9gtxege4', 1779074944813, 1779074944813, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacz0000xoixlqya5vyi8', 'BioPack', 'Empaques biodegradables a base de cáscara de plátano que reemplazan el plástico de un solo uso en la industria alimentaria.', 'BioPack transforma residuos de cáscara de plátano en empaques 100% biodegradables y compostables. Nuestros empaques se descomponen en 45 días versus los 400 años del plástico convencional. Ya contamos con prototipos validados y primeras cartas de intención de restaurantes locales.', 'Juan Pérez, Daniela Vargas, Andrés Mejía', NULL, 'APPROVED', 'Juan Pérez', 'participante2@fabrica.com', '+593 99 111 0002', 'Ingeniería Ambiental - 6to Semestre', 'B', 'Ing. Patricia Vallejo', 'Matriz Guayaquil', 'Sede Central', 'Ext. Durán', 82.5, 82.5, 'cmpanacyk0004oixldt6x6m05', 'cmpanacyp000aoixl905r4gyp', 'cmpanacyq000coixlaadezlby', 'cmpanacyw000moixl9gtxege4', 1779074944812, 1779074944812, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacz10015oixlam02y3sb', 'SaludConecta', 'Aplicación de telemedicina que conecta comunidades rurales con especialistas médicos mediante consultas virtuales y diagnóstico asistido por IA.', 'SaludConecta reduce la brecha de acceso a salud en zonas rurales del Ecuador. Nuestra plataforma permite consultas virtuales, triaje automatizado con IA, y gestión de historias clínicas digitales. Hemos atendido más de 500 pacientes en prueba piloto con 95% de satisfacción.', 'Laura Sánchez, Miguel Torres, Carmen Guzmán', NULL, 'FINALIST', 'Laura Sánchez', 'participante3@fabrica.com', '+593 99 111 0003', 'Medicina - Internado Rotativo', 'C', 'Dra. Lucía Paredes', 'Matriz Cuenca', 'Sede Sur', NULL, 90, 90, 'cmpanacyj0003oixl7nn4sfgk', 'cmpanacyp0009oixljn7tgvyk', 'cmpanacyq000doixlyi9oknvj', 'cmpanacyx000ooixl6psl20f9', 1779074944814, 1779074944814, NULL);
INSERT INTO "Project" ("id", "name", "pitch", "description", "team", "imageUrl", "status", "leaderName", "leaderEmail", "leaderPhone", "leaderCourse", "leaderParallel", "tutorName", "locationMatrix", "locationSede", "locationExtension", "totalScore", "averageScore", "areaId", "categoryId", "institutionId", "ownerId", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyz000toixljrrv94nj', 'FinVerde', 'Fintech para inclusión financiera de pequeños productores agrícolas mediante microcréditos basados en datos de productividad.', 'FinVerde utiliza datos satelitales y de sensores para evaluar la productividad de pequeñas fincas y ofrecer microcréditos con tasas justas. Nuestro modelo de scoring alternativo permite acceder a crédito a productores que tradicionalmente son excluidos del sistema financiero.', 'Juan Pérez, Ricardo Mora, Diana Castillo', NULL, 'SUBMITTED', 'Juan Pérez', 'participante2@fabrica.com', '+593 99 111 0002', 'Economía - 7mo Semestre', 'A', 'PhD. Ernesto Palacios', 'Matriz Guayaquil', 'Sede Económicas', NULL, 0, 0, 'cmpanacyk0005oixlwy5dp00j', 'cmpanacyp0009oixljn7tgvyk', 'cmpanacyq000coixlaadezlby', 'cmpanacyw000moixl9gtxege4', 1779074944812, 1779074944812, NULL);

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

INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz40019oixl5kvn33sy', 'cmpanacyz000uoixlwvjw6gpg', 'cmpanacyx000poixl54djol3h', 1779074944817);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz5001doixla0phwexy', 'cmpanacz0000xoixlqya5vyi8', 'cmpanacyx000poixl54djol3h', 1779074944817);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz5001foixlz78acxgr', 'cmpanacz0000zoixlflgk25g3', 'cmpanacyw000noixl67swu5pd', 1779074944817);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz5001hoixlj4ixkaxb', 'cmpanacz0000zoixlflgk25g3', 'cmpanacyx000poixl54djol3h', 1779074944817);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz40018oixlt1v407w4', 'cmpanacyz000uoixlwvjw6gpg', 'cmpanacyw000noixl67swu5pd', 1779074944817);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz5001loixlw5pjzb1z', 'cmpanacz10015oixlam02y3sb', 'cmpanacyw000noixl67swu5pd', 1779074944817);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz6001poixlrho4wv5z', 'cmpanacz10013oixl8ok34md2', 'cmpanacyx000poixl54djol3h', 1779074944819);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz6001noixlkukqfz89', 'cmpanacyz000toixljrrv94nj', 'cmpanacyw000noixl67swu5pd', 1779074944818);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz4001boixlfoi8u5k2', 'cmpanacz10015oixlam02y3sb', 'cmpanacyx000poixl54djol3h', 1779074944817);
INSERT INTO "ProjectEvaluator" ("id", "projectId", "evaluatorId", "assignedAt") VALUES ('cmpanacz5001joixl8a82xsgt', 'cmpanacz0000xoixlqya5vyi8', 'cmpanacyw000noixl67swu5pd', 1779074944817);

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

INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyw000koixl6443hc5a', 'admin@fabrica.com', '1e34bdb1f1017edb37f6f3f657cde973845fe971e02fceda0c82e9c4457de2e1', 'Administrador General', 'ADMIN', '+593 99 000 0001', NULL, 1, 1779074944808, 1779074944808, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyw000noixl67swu5pd', 'evaluador@fabrica.com', '07a575a68b37a58f466250632d099ca4a8bcf31c24a279e975c417f4d2469e9c', 'Dr. Carlos Mendoza', 'EVALUATOR', '+593 99 222 0001', NULL, 1, 1779074944809, 1779074944809, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyw000loixlfqi8ly7k', 'participante@fabrica.com', 'e8594120cf65fae8800a917b063214b47d21fc506c3936c26b26f5e99b3f2741', 'María García', 'PARTICIPANT', '+593 99 111 0001', NULL, 1, 1779074944808, 1779074944808, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyw000moixl9gtxege4', 'participante2@fabrica.com', 'e8594120cf65fae8800a917b063214b47d21fc506c3936c26b26f5e99b3f2741', 'Juan Pérez', 'PARTICIPANT', '+593 99 111 0002', NULL, 1, 1779074944808, 1779074944808, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyx000ooixl6psl20f9', 'participante3@fabrica.com', 'e8594120cf65fae8800a917b063214b47d21fc506c3936c26b26f5e99b3f2741', 'Laura Sánchez', 'PARTICIPANT', '+593 99 111 0003', NULL, 1, 1779074944809, 1779074944809, NULL);
INSERT INTO "User" ("id", "email", "password", "name", "role", "phone", "avatar", "active", "createdAt", "updatedAt", "deletedAt") VALUES ('cmpanacyx000poixl54djol3h', 'evaluador2@fabrica.com', '07a575a68b37a58f466250632d099ca4a8bcf31c24a279e975c417f4d2469e9c', 'Ing. Ana Rodríguez', 'EVALUATOR', '+593 99 222 0002', NULL, 1, 1779074944809, 1779074944809, NULL);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Institution_name_key" ON "Institution"("name");
CREATE UNIQUE INDEX "ProjectEvaluator_projectId_evaluatorId_key" ON "ProjectEvaluator"("projectId", "evaluatorId");
CREATE UNIQUE INDEX "Evaluation_projectId_evaluatorId_key" ON "Evaluation"("projectId", "evaluatorId");
CREATE UNIQUE INDEX "EvaluationScore_evaluationId_criteriaId_key" ON "EvaluationScore"("evaluationId", "criteriaId");
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");