-- Atualizacao incremental para bancos ja existentes.
-- Mantem email opcional em cliente para nao tornar a fila obrigatoria.
-- Na reserva, email_cliente guarda o snapshot usado em confirmacoes por email.

ALTER TABLE cliente
  ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE reserva
  ADD COLUMN IF NOT EXISTS nome_cliente VARCHAR(255),
  ADD COLUMN IF NOT EXISTS cpf_cliente VARCHAR(14),
  ADD COLUMN IF NOT EXISTS telefone_cliente VARCHAR(20),
  ADD COLUMN IF NOT EXISTS email_cliente VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_cliente_cpf ON cliente(cpf);
CREATE INDEX IF NOT EXISTS idx_cliente_email ON cliente(email);
CREATE INDEX IF NOT EXISTS idx_reserva_cpf_cliente ON reserva(cpf_cliente);
CREATE INDEX IF NOT EXISTS idx_reserva_email_cliente ON reserva(email_cliente);

UPDATE reserva
SET
  nome_cliente = COALESCE(reserva.nome_cliente, cliente.nome),
  cpf_cliente = COALESCE(reserva.cpf_cliente, cliente.cpf),
  telefone_cliente = COALESCE(reserva.telefone_cliente, cliente.telefone),
  email_cliente = COALESCE(reserva.email_cliente, cliente.email)
FROM cliente
WHERE reserva.cliente_id = cliente.id;
