-- Exercícios Específicos para Equipamentos Nakagym
-- Execute via Transaction Pooler

BEGIN;

INSERT INTO exercises (
    id, name, name_en, category, subcategory, equipment,
    difficulty, primary_muscles, secondary_muscles, type,
    description, steps, tips, demo_video, demo_image, is_custom, user_id
) VALUES

-- MÁQUINA BÍCEPS/TRÍCEPS NAKAGYM (NKW-3025)
(
    'nk001',
    'Rosca Scott na Máquina Nakagym',
    'Nakagym Bicep Curl Machine',
    'arms',
    'biceps',
    '["nakagym bicep machine","bicep machine"]'::jsonb,
    'beginner',
    '["biceps brachii"]'::jsonb,
    '["brachialis"]'::jsonb,
    'isolation',
    'Máquina específica Nakagym com biomecânica otimizada para rosca scott.',
    '["Ajuste o banco e apoie os braços","Segure as alças","Flexione os cotovelos contra resistência","Contraia os bíceps no topo","Retorne controladamente sem travar"]'::jsonb,
    '["Cotovelos sempre apoiados","Não use impulso","Foco na contração máxima"]'::jsonb,
    '',
    '/exercises/nakagym-bicep.gif',
    FALSE,
    NULL
),
(
    'nk002',
    'Tríceps na Máquina Nakagym',
    'Nakagym Tricep Extension Machine',
    'arms',
    'triceps',
    '["nakagym tricep machine","tricep machine"]'::jsonb,
    'beginner',
    '["triceps brachii"]'::jsonb,
    '[]'::jsonb,
    'isolation',
    'Extensão de tríceps na máquina Nakagym com trajeto biomecânico perfeito.',
    '["Ajuste o banco","Apoie os cotovelos nos suportes","Estenda os braços completamente","Contraia os tríceps","Retorne sem descansar"]'::jsonb,
    '["Mantenha cotovelos fixos","Movimento controlado","Não despegue os braços"]'::jsonb,
    '',
    '/exercises/nakagym-tricep.gif',
    FALSE,
    NULL
),

-- CADEIRA FLEXORA/EXTENSORA DUO (NKW-5058)
(
    'nk003',
    'Cadeira Extensora Nakagym Duo',
    'Nakagym Duo Leg Extension',
    'legs',
    'quadriceps',
    '["nakagym leg extension","leg extension machine"]'::jsonb,
    'beginner',
    '["quadriceps"]'::jsonb,
    '[]'::jsonb,
    'isolation',
    'Extensora Nakagym com sistema Duo para movimento bilateral ou unilateral.',
    '["Sente-se e ajuste o encosto","Posicione tornozelos sob o rolo","Estenda as pernas completamente","Contraia quadríceps no topo","Desça controladamente"]'::jsonb,
    '["Segure firme nas alças","Não eleve o quadril","Movimento fluido"]'::jsonb,
    '',
    '/exercises/nakagym-leg-ext.gif',
    FALSE,
    NULL
),
(
    'nk004',
    'Cadeira Flexora Nakagym Duo',
    'Nakagym Duo Leg Curl',
    'legs',
    'hamstrings',
    '["nakagym leg curl","leg curl machine"]'::jsonb,
    'beginner',
    '["hamstrings"]'::jsonb,
    '["gastrocnemius"]'::jsonb,
    'isolation',
    'Flexora Nakagym com biomecânica otimizada para posterior de coxa.',
    '["Sente-se e ajuste o apoio das costas","Panturrilhas sobre o rolo","Flexione puxando o rolo para baixo","Contraia posterior no final","Retorne controladamente"]'::jsonb,
    '["Mantenha costas firmes","Não use impulso","Amplitude completa"]'::jsonb,
    '',
    '/exercises/nakagym-leg-curl.gif',
    FALSE,
    NULL
),

-- CADEIRA ADUTORA/ABDUTORA (NKW-5040)
(
    'nk005',
    'Abdutora Nakagym',
    'Nakagym Hip Abduction',
    'legs',
    'glutes',
    '["nakagym abductor","hip abductor machine"]'::jsonb,
    'beginner',
    '["gluteus medius","tensor fasciae latae"]'::jsonb,
    '[]'::jsonb,
    'isolation',
    'Abdutora Nakagym com resistência progressiva e biomecânica perfeita.',
    '["Ajuste os apoios externos","Sente-se com costas apoiadas","Abra as pernas contra resistência","Contraia glúteo médio","Retorne devagar"]'::jsonb,
    '["Movimento lento e controlado","Não balance o tronco","Foco nos glúteos"]'::jsonb,
    '',
    '/exercises/nakagym-abductor.gif',
    FALSE,
    NULL
),
(
    'nk006',
    'Adutora Nakagym',
    'Nakagym Hip Adduction',
    'legs',
    'adductors',
    '["nakagym adductor","hip adductor machine"]'::jsonb,
    'beginner',
    '["adductors"]'::jsonb,
    '[]'::jsonb,
    'isolation',
    'Fortalecimento de adutores com máquina Nakagym.',
    '["Ajuste os apoios internos","Sente-se com postura correta","Feche as pernas contra resistência","Contraia adutores","Abra controladamente"]'::jsonb,
    '["Não use impulso","Mantenha tensão constante","Movimento completo"]'::jsonb,
    '',
    '/exercises/nakagym-adductor.gif',
    FALSE,
    NULL
),

-- PEITORAL/DORSAL CRUCIFIXO (NKW-2018)
(
    'nk007',
    'Crucifixo Peitoral Nakagym',
    'Nakagym Chest Fly',
    'chest',
    'mid-chest',
    '["nakagym pec deck","pec deck machine"]'::jsonb,
    'beginner',
    '["pectoralis major"]'::jsonb,
    '["anterior deltoid"]'::jsonb,
    'isolation',
    'Crucifixo na máquina Nakagym com movimento natural e seguro.',
    '["Ajuste o banco na altura correta","Costas firmes no apoio","Braços nos apoios laterais","Traga os apoios à frente","Contraia peitoral no centro"]'::jsonb,
    '["Não force ombros","Movimento suave","Foco na contração"]'::jsonb,
    '',
    '/exercises/nakagym-pec-fly.gif',
    FALSE,
    NULL
),
(
    'nk008',
    'Crucifixo Reverso Nakagym (Dorsal)',
    'Nakagym Reverse Fly',
    'back',
    'rear-delt',
    '["nakagym pec deck","pec deck machine"]'::jsonb,
    'beginner',
    '["posterior deltoid","rhomboids"]'::jsonb,
    '["middle trapezius"]'::jsonb,
    'isolation',
    'Mesma máquina em posição reversa para trabalhar costas e ombros posteriores.',
    '["Vire-se de frente para a máquina","Peito apoiado no suporte","Segure as alças","Abra os braços para trás","Contraia escápulas"]'::jsonb,
    '["Mantenha cotovelos levemente flexionados","Não arqueie as costas","Controle o retorno"]'::jsonb,
    '',
    '/exercises/nakagym-reverse-fly.gif',
    FALSE,
    NULL
),

-- LAT/DELT MACHINE (NKW-4051)
(
    'nk009',
    'Pulldown Nakagym Lat Machine',
    'Nakagym Lat Pulldown',
    'back',
    'lats',
    '["nakagym lat machine","lat pulldown machine"]'::jsonb,
    'beginner',
    '["latissimus dorsi"]'::jsonb,
    '["biceps","rhomboids","trapezius"]'::jsonb,
    'compound',
    'Máquina Nakagym específica para largura das costas.',
    '["Ajuste o apoio das coxas","Segure a barra com pegada ampla","Puxe até o peito","Contraia as escápulas","Retorne com controle"]'::jsonb,
    '["Peito erguido","Puxe com os cotovelos","Não balance"]'::jsonb,
    '',
    '/exercises/nakagym-lat-pull.gif',
    FALSE,
    NULL
),
(
    'nk010',
    'Elevação Lateral Nakagym Delt Machine',
    'Nakagym Lateral Raise Machine',
    'shoulders',
    'lateral',
    '["nakagym delt machine","lateral raise machine"]'::jsonb,
    'beginner',
    '["lateral deltoid"]'::jsonb,
    '["anterior deltoid"]'::jsonb,
    'isolation',
    'Elevação lateral na máquina Nakagym com trajeto perfeito.',
    '["Ajuste o banco","Apoie os braços nos suportes","Eleve lateralmente","Contraia deltóides laterais","Desça controladamente"]'::jsonb,
    '["Não use impulso","Movimento até altura dos ombros","Controle total"]'::jsonb,
    '',
    '/exercises/nakagym-lateral-raise.gif',
    FALSE,
    NULL
),

-- HACK SQUAT 45° DUO (NKW-5010)
(
    'nk011',
    'Hack Squat Nakagym 45° Duo',
    'Nakagym 45° Hack Squat',
    'legs',
    'quadriceps',
    '["nakagym hack squat","hack squat machine"]'::jsonb,
    'intermediate',
    '["quadriceps"]'::jsonb,
    '["glutes","hamstrings"]'::jsonb,
    'compound',
    'Hack Squat Nakagym com ângulo de 45° e sistema Duo.',
    '["Posicione-se na máquina","Ombros sob os apoios","Pés na largura dos ombros","Solte a trava","Desça até 90 graus","Empurre com força"]'::jsonb,
    '["Costas firmes no apoio","Não trave os joelhos","Joelhos alinhados"]'::jsonb,
    '',
    '/exercises/nakagym-hack.gif',
    FALSE,
    NULL
),

-- LEG PRESS/HACK CONJUGADO (NKW-5065)
(
    'nk012',
    'Leg Press Nakagym Conjugado',
    'Nakagym Conjugated Leg Press',
    'legs',
    'quadriceps',
    '["nakagym leg press","leg press machine"]'::jsonb,
    'beginner',
    '["quadriceps"]'::jsonb,
    '["glutes","hamstrings","calves"]'::jsonb,
    'compound',
    'Leg Press Nakagym com sistema conjugado e guia de trilho.',
    '["Sente-se e ajuste o encosto","Pés na plataforma","Solte a trava","Desça controladamente","Empurre sem travar joelhos"]'::jsonb,
    '["Quadril sempre apoiado","Não levante lombar","Amplitude completa"]'::jsonb,
    '',
    '/exercises/nakagym-leg-press.gif',
    FALSE,
    NULL
),

-- CROSSOVER ANGULADO COM SMITH (NKW-6013)
(
    'nk013',
    'Crossover Alto Nakagym',
    'Nakagym High Cable Crossover',
    'chest',
    'lower-chest',
    '["nakagym crossover","cable crossover"]'::jsonb,
    'intermediate',
    '["pectoralis major (lower)"]'::jsonb,
    '["anterior deltoid"]'::jsonb,
    'isolation',
    'Crossover angulado Nakagym para parte inferior do peitoral.',
    '["Posicione-se entre as polias","Segure as alças altas","Incline levemente à frente","Traga as mãos para baixo e centro","Cruze levemente"]'::jsonb,
    '["Mantenha leve flexão de cotovelo","Controle o movimento","Foco na contração"]'::jsonb,
    '',
    '/exercises/nakagym-crossover.gif',
    FALSE,
    NULL
),
(
    'nk014',
    'Agachamento Smith Nakagym',
    'Nakagym Smith Machine Squat',
    'legs',
    'quadriceps',
    '["nakagym smith machine","smith machine"]'::jsonb,
    'beginner',
    '["quadriceps"]'::jsonb,
    '["glutes","hamstrings","core"]'::jsonb,
    'compound',
    'Agachamento guiado na Smith Machine integrada ao Crossover Nakagym.',
    '["Posicione-se sob a barra","Barra no trapézio","Pés ligeiramente à frente","Desça até paralela","Empurre para cima","Use travas de segurança"]'::jsonb,
    '["Movimento vertical","Core contraído","Joelhos não passam dos pés"]'::jsonb,
    '',
    '/exercises/nakagym-smith-squat.gif',
    FALSE,
    NULL
),

-- POLIA CONJUGADA (NKW-4001/4007)
(
    'nk015',
    'Remada Baixa Nakagym Polia',
    'Nakagym Cable Row',
    'back',
    'mid-back',
    '["nakagym cable","cable machine"]'::jsonb,
    'beginner',
    '["latissimus dorsi","rhomboids"]'::jsonb,
    '["biceps","rear deltoid"]'::jsonb,
    'compound',
    'Remada na polia conjugada Nakagym para espessura das costas.',
    '["Sente-se de frente para a polia baixa","Pegue a alça ou triângulo","Puxe em direção ao abdômen","Contraia as escápulas","Estenda os braços"]'::jsonb,
    '["Mantenha costas retas","Não balance","Foco em puxar com as costas"]'::jsonb,
    '',
    '/exercises/nakagym-cable-row.gif',
    FALSE,
    NULL
);

COMMIT;

-- Verificar inserção
SELECT COUNT(*) as total FROM exercises WHERE id LIKE 'nk%';
SELECT 'Exercícios Nakagym adicionados com sucesso!' as status;
