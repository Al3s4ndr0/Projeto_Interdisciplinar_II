-- ═══════════════════════════════════════════════════════
-- QMESA — SCRIPT COMPLETO
-- Estrutura + Políticas RLS + Dados de Teste
-- ═══════════════════════════════════════════════════════

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ═══════════════════════════════════════════════════════
-- 1. CRIAÇÃO DAS TABELAS
-- ═══════════════════════════════════════════════════════

CREATE TABLE restaurante (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  capacidade INT NOT NULL,
  horario_funcionamento VARCHAR(100)
);

CREATE TABLE gestor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurante_id UUID NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE mesa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurante_id UUID NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
  numero INT NOT NULL,
  capacidade INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Livre'
    CHECK (status IN ('Livre', 'Ocupada', 'Reservada', 'Manutencao'))
);

CREATE TABLE cliente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  email VARCHAR(255)
);

CREATE TABLE fila_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurante_id UUID NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  mesa_id UUID REFERENCES mesa(id) ON DELETE SET NULL,
  posicao INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Aguardando'
    CHECK (status IN ('Aguardando', 'Chamado', 'Desistente')),
  hora_entrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tempo_estimado INT
);

CREATE TABLE reserva (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  mesa_id UUID REFERENCES mesa(id) ON DELETE SET NULL,
  restaurante_id UUID NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  num_pessoas INT NOT NULL,
  nome_cliente VARCHAR(255),
  cpf_cliente VARCHAR(14),
  telefone_cliente VARCHAR(20),
  email_cliente VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'Pendente'
    CHECK (status IN ('Pendente', 'Confirmada', 'Cancelada'))
);

CREATE TABLE item_cardapio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurante_id UUID NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  categoria VARCHAR(100),
  disponivel BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  origem_id UUID NOT NULL,
  origem_tipo VARCHAR(20) NOT NULL
    CHECK (origem_tipo IN ('fila_item', 'cancelamento_fila', 'reserva', 'cancelamento_reserva')),
  nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════
-- 2. ÍNDICES DE PERFORMANCE
-- ═══════════════════════════════════════════════════════

CREATE INDEX idx_mesa_restaurante        ON mesa(restaurante_id);
CREATE INDEX idx_cliente_cpf             ON cliente(cpf);
CREATE INDEX idx_cliente_email           ON cliente(email);
CREATE INDEX idx_fila_item_restaurante   ON fila_item(restaurante_id);
CREATE INDEX idx_fila_item_cliente       ON fila_item(cliente_id);
CREATE INDEX idx_fila_item_status        ON fila_item(status);
CREATE INDEX idx_reserva_restaurante     ON reserva(restaurante_id);
CREATE INDEX idx_reserva_cliente         ON reserva(cliente_id);
CREATE INDEX idx_reserva_status          ON reserva(status);
CREATE INDEX idx_reserva_cpf_cliente     ON reserva(cpf_cliente);
CREATE INDEX idx_reserva_email_cliente   ON reserva(email_cliente);
CREATE INDEX idx_item_cardapio_restaurante ON item_cardapio(restaurante_id);
CREATE INDEX idx_feedback_cliente        ON feedback(cliente_id);
CREATE INDEX idx_feedback_origem         ON feedback(origem_id);


-- ═══════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════

ALTER TABLE restaurante   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestor        ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesa          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_item     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserva       ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_cardapio ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback      ENABLE ROW LEVEL SECURITY;

-- RESTAURANTE
CREATE POLICY "restaurante_leitura_publica"
ON restaurante FOR SELECT USING (true);

CREATE POLICY "restaurante_escrita_gestor"
ON restaurante FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM gestor
    WHERE gestor.restaurante_id = restaurante.id
    AND gestor.id = auth.uid()
  )
);

-- GESTOR
CREATE POLICY "gestor_acesso_proprio"
ON gestor FOR ALL
USING (id = auth.uid());

-- MESA
CREATE POLICY "mesa_leitura_publica"
ON mesa FOR SELECT USING (true);

CREATE POLICY "mesa_escrita_gestor"
ON mesa FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM gestor
    WHERE gestor.restaurante_id = mesa.restaurante_id
    AND gestor.id = auth.uid()
  )
);

-- CLIENTE
CREATE POLICY "cliente_insercao_publica"
ON cliente FOR INSERT WITH CHECK (true);

CREATE POLICY "cliente_leitura"
ON cliente FOR SELECT
USING (
  id = auth.uid()
  OR EXISTS (SELECT 1 FROM gestor WHERE gestor.id = auth.uid())
);

-- FILA_ITEM
CREATE POLICY "fila_item_insercao_publica"
ON fila_item FOR INSERT WITH CHECK (true);

CREATE POLICY "fila_item_leitura_publica"
ON fila_item FOR SELECT USING (true);

CREATE POLICY "fila_item_escrita_gestor"
ON fila_item FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM gestor
    WHERE gestor.restaurante_id = fila_item.restaurante_id
    AND gestor.id = auth.uid()
  )
);

CREATE POLICY "fila_item_exclusao_gestor"
ON fila_item FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM gestor
    WHERE gestor.restaurante_id = fila_item.restaurante_id
    AND gestor.id = auth.uid()
  )
);

-- RESERVA
CREATE POLICY "reserva_insercao_publica"
ON reserva FOR INSERT WITH CHECK (true);

CREATE POLICY "reserva_leitura"
ON reserva FOR SELECT
USING (
  cliente_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM gestor
    WHERE gestor.restaurante_id = reserva.restaurante_id
    AND gestor.id = auth.uid()
  )
);

CREATE POLICY "reserva_atualizacao"
ON reserva FOR UPDATE
USING (
  cliente_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM gestor
    WHERE gestor.restaurante_id = reserva.restaurante_id
    AND gestor.id = auth.uid()
  )
);

-- ITEM_CARDAPIO
CREATE POLICY "cardapio_leitura_publica"
ON item_cardapio FOR SELECT USING (true);

CREATE POLICY "cardapio_escrita_gestor"
ON item_cardapio FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM gestor
    WHERE gestor.restaurante_id = item_cardapio.restaurante_id
    AND gestor.id = auth.uid()
  )
);

-- FEEDBACK
CREATE POLICY "feedback_insercao_publica"
ON feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "feedback_leitura_gestor"
ON feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gestor
    JOIN reserva ON reserva.restaurante_id = gestor.restaurante_id
    WHERE gestor.id = auth.uid()
    AND (
      feedback.origem_id = reserva.id
      OR EXISTS (
        SELECT 1 FROM fila_item
        WHERE fila_item.restaurante_id = gestor.restaurante_id
        AND feedback.origem_id = fila_item.id
      )
    )
  )
);


-- ═══════════════════════════════════════════════════════
-- 4. SEED — DADOS DE TESTE
-- ═══════════════════════════════════════════════════════

-- RESTAURANTE
INSERT INTO restaurante (id, nome, capacidade, horario_funcionamento) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mangálhos Grill',            80, 'Seg-Dom: 11h30 às 23h00'),
  ('00000000-0000-0000-0000-000000000002', 'Bella Pizza',                50, 'Ter-Dom: 18h00 às 23h30'),
  ('00000000-0000-0000-0000-000000000003', 'Dona Maria Cozinha Caseira', 40, 'Seg-Sab: 11h00 às 15h00');

-- GESTOR
INSERT INTO gestor (id, restaurante_id, usuario, senha) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'gestor_mangalhos', '$2b$12$placeholderhashsubstituirXXXXXXXXXXXXXXXXXXXXXXXXX'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'gestor_bella',     '$2b$12$placeholderhashsubstituirXXXXXXXXXXXXXXXXXXXXXXXXX'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', 'gestor_donamaria', '$2b$12$placeholderhashsubstituirXXXXXXXXXXXXXXXXXXXXXXXXX');

-- MESA — Mangálhos Grill
INSERT INTO mesa (id, restaurante_id, numero, capacidade, status) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 1, 2, 'Livre'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 2, 4, 'Ocupada'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 3, 4, 'Ocupada'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 4, 6, 'Reservada'),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000001', 5, 6, 'Livre'),
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000001', 6, 8, 'Ocupada'),
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0000-000000000001', 7, 4, 'Manutencao'),
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0000-000000000001', 8, 2, 'Livre');

-- MESA — Bella Pizza
INSERT INTO mesa (id, restaurante_id, numero, capacidade, status) VALUES
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0000-000000000002', 1, 2, 'Ocupada'),
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0000-000000000002', 2, 4, 'Livre'),
  ('00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0000-000000000002', 3, 4, 'Reservada'),
  ('00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0000-000000000002', 4, 6, 'Ocupada'),
  ('00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0000-000000000002', 5, 2, 'Livre');

-- MESA — Dona Maria
INSERT INTO mesa (id, restaurante_id, numero, capacidade, status) VALUES
  ('00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0000-000000000003', 1, 4, 'Ocupada'),
  ('00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0000-000000000003', 2, 4, 'Livre'),
  ('00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0000-000000000003', 3, 6, 'Ocupada'),
  ('00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0000-000000000003', 4, 2, 'Livre');

-- CLIENTE
INSERT INTO cliente (id, nome, telefone, cpf, email) VALUES
  ('00000000-0000-0000-0003-000000000001', 'João Silva',       '41990010001', '11111111111', NULL),
  ('00000000-0000-0000-0003-000000000002', 'Maria Oliveira',   '41990010002', '22222222222', NULL),
  ('00000000-0000-0000-0003-000000000003', 'Carlos Souza',     '41990010003', '33333333333', NULL),
  ('00000000-0000-0000-0003-000000000004', 'Ana Pereira',      '41990010004', '44444444444', NULL),
  ('00000000-0000-0000-0003-000000000005', 'Pedro Costa',      '41990010005', '55555555555', NULL),
  ('00000000-0000-0000-0003-000000000006', 'Fernanda Lima',    '41990010006', '66666666666', NULL),
  ('00000000-0000-0000-0003-000000000007', 'Lucas Martins',    '41990010007', '77777777777', 'lucas.martins@email.com'),
  ('00000000-0000-0000-0003-000000000008', 'Juliana Ferreira', '41990010008', '88888888888', 'juliana.ferreira@email.com'),
  ('00000000-0000-0000-0003-000000000009', 'Rafael Almeida',   '41990010009', '99999999999', 'rafael.almeida@email.com'),
  ('00000000-0000-0000-0003-000000000010', 'Camila Santos',    '41990010010', '10101010101', 'camila.santos@email.com');

-- FILA_ITEM
INSERT INTO fila_item (id, restaurante_id, cliente_id, mesa_id, posicao, status, hora_entrada, tempo_estimado) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000001', NULL,                                   1, 'Aguardando', NOW() - INTERVAL '18 minutes', 10),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000002', NULL,                                   2, 'Aguardando', NOW() - INTERVAL '12 minutes', 20),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000003', NULL,                                   3, 'Aguardando', NOW() - INTERVAL '7 minutes',  30),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000004', NULL,                                   4, 'Aguardando', NOW() - INTERVAL '3 minutes',  40),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000001', 0, 'Chamado',    NOW() - INTERVAL '25 minutes',  0),
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000006', NULL,                                   0, 'Desistente', NOW() - INTERVAL '40 minutes',  NULL);

-- RESERVA
INSERT INTO reserva (id, cliente_id, mesa_id, restaurante_id, data_hora, num_pessoas, nome_cliente, cpf_cliente, telefone_cliente, email_cliente, status) VALUES
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '2 hours', 4, 'Lucas Martins',    '77777777777', '41990010007', 'lucas.martins@email.com',    'Confirmada'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0000-000000000002', NOW() + INTERVAL '3 hours', 3, 'Juliana Ferreira', '88888888888', '41990010008', 'juliana.ferreira@email.com', 'Confirmada'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0003-000000000009', NULL,                                   '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day',  6, 'Rafael Almeida',   '99999999999', '41990010009', 'rafael.almeida@email.com',   'Pendente'),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0003-000000000010', NULL,                                   '00000000-0000-0000-0000-000000000003', NOW() + INTERVAL '2 days', 2, 'Camila Santos',    '10101010101', '41990010010', 'camila.santos@email.com',    'Pendente'),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0003-000000000001', NULL,                                   '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day',  4, 'João Silva',       '11111111111', '41990010001', NULL,                         'Cancelada');

-- ITEM_CARDAPIO — Mangálhos Grill
INSERT INTO item_cardapio (id, restaurante_id, nome, descricao, preco, categoria, disponivel) VALUES
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0000-000000000001', 'Picanha na Brasa',     'Picanha grelhada com farofa, vinagrete e arroz',     89.90, 'Carnes',     true),
  ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0000-000000000001', 'Fraldinha ao Molho',   'Fraldinha fatiada com molho de alho e batata frita', 74.90, 'Carnes',     true),
  ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0000-000000000001', 'Costela Assada',       'Costela bovina assada lentamente por 12h',           92.00, 'Carnes',     true),
  ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0000-000000000001', 'Salada Caesar',        'Alface romana, croutons, parmesão e molho caesar',   28.00, 'Entradas',   true),
  ('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0000-000000000001', 'Pão de Alho Recheado', 'Pão de alho com queijo e ervas finas',               18.00, 'Entradas',   true),
  ('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0000-000000000001', 'Suco de Maracujá',     'Suco natural 500ml',                                 12.00, 'Bebidas',    true),
  ('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0000-000000000001', 'Refrigerante Lata',    'Coca-Cola, Guaraná ou Sprite',                        7.00, 'Bebidas',    true),
  ('00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0000-000000000001', 'Pudim de Leite',       'Pudim cremoso com calda de caramelo',                16.00, 'Sobremesas', true),
  ('00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0000-000000000001', 'Cupim Defumado',       'Disponível apenas às sextas e sábados',              98.00, 'Carnes',     false);

-- ITEM_CARDAPIO — Bella Pizza
INSERT INTO item_cardapio (id, restaurante_id, nome, descricao, preco, categoria, disponivel) VALUES
  ('00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0000-000000000002', 'Pizza Margherita',     'Molho de tomate, mussarela e manjericão',            52.00, 'Pizzas',     true),
  ('00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0000-000000000002', 'Pizza Calabresa',      'Calabresa fatiada com cebola e azeitona',            56.00, 'Pizzas',     true),
  ('00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0000-000000000002', 'Pizza Quatro Queijos', 'Mussarela, provolone, gorgonzola e parmesão',        62.00, 'Pizzas',     true),
  ('00000000-0000-0000-0006-000000000013', '00000000-0000-0000-0000-000000000002', 'Bruschetta',           'Pão italiano com tomate, alho e azeite',             24.00, 'Entradas',   true),
  ('00000000-0000-0000-0006-000000000014', '00000000-0000-0000-0000-000000000002', 'Tiramisu',             'Sobremesa italiana com mascarpone e café',           22.00, 'Sobremesas', true);

-- ITEM_CARDAPIO — Dona Maria
INSERT INTO item_cardapio (id, restaurante_id, nome, descricao, preco, categoria, disponivel) VALUES
  ('00000000-0000-0000-0006-000000000015', '00000000-0000-0000-0000-000000000003', 'Prato Feito',          'Arroz, feijão, bife, salada e fruta',                22.00, 'Pratos',     true),
  ('00000000-0000-0000-0006-000000000016', '00000000-0000-0000-0000-000000000003', 'Frango Assado',        'Meio frango assado com mandioca frita',              32.00, 'Pratos',     true),
  ('00000000-0000-0000-0006-000000000017', '00000000-0000-0000-0000-000000000003', 'Feijoada Completa',    'Disponível apenas às sextas-feiras',                 38.00, 'Pratos',     false),
  ('00000000-0000-0000-0006-000000000018', '00000000-0000-0000-0000-000000000003', 'Suco do Dia',          'Pergunte ao garçom',                                  8.00, 'Bebidas',    true);

-- FEEDBACK
INSERT INTO feedback (id, cliente_id, origem_id, origem_tipo, nota, comentario, data_criacao) VALUES
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0005-000000000001', 'reserva',   5, 'Atendimento excelente, fila bem organizada!',        NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0004-000000000002', 'fila_item', 4, 'Gostei de acompanhar minha posição pelo celular.',   NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0004-000000000003', 'fila_item', 3, 'Espera um pouco longa, mas o sistema ajudou.',       NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0005-000000000002', 'reserva',   5, 'Reserva confirmada rapidamente, ótima experiência.', NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0004-000000000005', 'fila_item', 2, 'Demorou mais do que o estimado.',                    NOW() - INTERVAL '5 days');
