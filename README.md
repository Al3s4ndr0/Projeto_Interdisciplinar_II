# Projeto-Interdisciplinar-II
Projeto acadêmico produzido a partir da articulação entre os componentes cursados em Gestão da Tecnologia da Informação, visando favorecer a construção de conhecimentos e habilidades necessárias para a prática profissional.

# QMESA (Queue Mesa)
# 1 - Identificação

## a) Identidade Visual

<img width="200" height="200" alt="logo final" src="https://github.com/user-attachments/assets/0a2395ba-3d53-4f4d-9776-becfc19a2267" />

O logotipo do Qmesa combina o conceito de fila — derivado do termo inglês queue — com a palavra "mesa", sintetizando a proposta do sistema em uma única palavra. O símbolo estiliza a letra Q no formato de um kiwi, cujo cabo remete ao ponteiro de um relógio, reforçando o atributo de gestão do tempo central à plataforma. A paleta é composta por tons de azul marinho e verde, transmitindo confiabilidade, organização e fluidez.

## b) Equipe
  - Alessandro Sondey
  - Milena Pianaro
 
## c) Data de criação: 
12/02/2026

# 2 - Concepção

## a) Conceito

O Qmesa é uma plataforma digital de gestão de filas de espera e reservas para restaurantes, desenvolvida como Progressive Web App (PWA). O sistema elimina o uso de listas em papel na recepção de estabelecimentos gastronômicos, permitindo que o cliente ingresse na fila virtual via QR Code, acompanhe sua posição em tempo real, consulte o cardápio digital durante a espera e realize reservas futuras de forma autônoma — tudo sem necessidade de instalação de aplicativo nativo.

<br>

__Funcionalidades Principais:__

📲 Fila Virtual via QR Code — O cliente acessa o sistema pelo navegador, informa nome e telefone e entra na fila sem download ou cadastro prévio.

⏱️ Acompanhamento em Tempo Real — Posição na fila e estimativa de tempo de espera atualizados instantaneamente via Supabase Realtime (WebSocket).

🍽️ Cardápio Digital Integrado — Consulta ao cardápio do estabelecimento durante a espera, otimizando a decisão de consumo antes de ser chamado à mesa.

📅 Reservas Futuras — Agendamento, reagendamento e cancelamento autônomo de mesas em datas específicas.

⭐ Coleta de Feedback — Avaliação estruturada da experiência ao final do atendimento, com visualização consolidada para o gestor.

📊 Dashboard de BI — Painel estratégico com indicadores de desempenho (KPIs) sobre horários de pico, tempo médio de ocupação, taxa de desistência e satisfação dos clientes, com exportação em CSV e JSON.

## b) Justificativa

O Qmesa responde a um descompasso tecnológico identificado no setor gastronômico brasileiro: enquanto a logística de cozinha e os sistemas de delivery se modernizaram, a recepção de restaurantes persiste operando com métodos analógicos que comprometem a experiência do cliente e impedem a coleta de dados operacionais. A solução adota arquitetura PWA para eliminar a barreira de instalação de aplicativos nativos — fenômeno conhecido como "fadiga de aplicativos" —, democratizando o acesso a tecnologias de gestão para pequenos e médios estabelecimentos. O projeto alinha-se aos ODS 8 (Trabalho Decente e Crescimento Econômico) e ODS 9 (Indústria, Inovação e Infraestrutura) da Agenda 2030 da ONU.

## c) Objetivos

O objetivo principal é desenvolver uma plataforma de gestão de filas e reservas baseada em tecnologia web que otimize a experiência de espera do cliente e forneça ferramentas de Business Intelligence para a gestão operacional de restaurantes. Entre os objetivos específicos, destacam-se: implementar fila virtual com acesso via QR Code e monitoramento em tempo real; desenvolver algoritmo de estimativa de tempo de espera com processamento assíncrono; projetar interface de baixo atrito acessível via navegador; desenvolver módulo de reservas futuras com reagendamento autônomo; integrar cardápio digital à jornada de espera; criar mecanismo de coleta de feedback estruturado; e construir dashboard estratégico com KPIs acionáveis para o gestor.

## d) Escopo do produto

__- Descrição do produto__

O Qmesa é um Progressive Web App (PWA) composto por dois módulos: o módulo do cliente, acessível via QR Code sem instalação, e o painel administrativo do gestor, com acesso autenticado via navegador em qualquer dispositivo. O sistema foi concebido para funcionar em tempo real, com sincronização instantânea entre os dispositivos do cliente, do operacional e do gestor via WebSocket.

<br>

__- Principais entregas__

- Protótipo interativo de baixa e alta fidelidade desenvolvido no Figma.

- Sistema funcional com módulos de fila virtual, reservas, cardápio digital, feedback e dashboard de BI.

- Documentação técnica completa, incluindo diagramas UML, MER e plano de testes.

<br>

__- Critérios de aceite__

- Acesso funcional via QR Code sem instalação de aplicativo nativo.

- Atualização da posição na fila em menos de 2 segundos após ação do gestor.

- Interface totalmente responsiva em smartphones, tablets e desktops.

- Redirecionamento automático para HTTPS em todas as requisições.

- Dashboard exibindo KPIs com valores matematicamente corretos.

- Cobertura mínima dos casos de teste definidos no Apêndice C.

## e) Matriz de riscos

| Categoria              | Risco                                                                 | Probabilidade | Impacto    | Plano de Mitigação                                                                 |
|------------------------|-----------------------------------------------------------------------|---------------|------------|------------------------------------------------------------------------------------|
| Tecnologia             | Instabilidade ou latência no Supabase Realtime em horários de pico    | Média         | Alto       | Monitoramento de uptime, plano de fallback com polling HTTP                        |
| Segurança da Informação| Vazamento de dados de clientes (telefone, histórico de reservas)      | Media         | Alto       | Criptografia em trânsito (HTTPS), conformidade com LGPD (Lei nº 13.709/2018)       |
| Adoção                 | Resistência do gestor à migração do processo analógico para o digital | Alta          | Médio      | Interface simplificada, onboarding guiado, demonstração de valor via dashboard     |
| Operacional            | Divergência entre o back-end (Milena) e o front-end (Alessandro) na Sprint de integração | Média          | Alto      | Definição antecipada dos contratos de API, Sprint 5 dedicada à integração|
| Acadêmico              | Atraso no cronograma por acúmulo com outras disciplinas               | Alta         | Médio       | Sprints quinzenais com revisão semanal via Kanban no Trello                      |
| Escalabilidade         | Degradação de performance com múltiplos acessos simultâneos em datas comemorativas  | Média         | Médio       | Arquitetura assíncrona no FastAPI, testes de carga na Sprint 6      |

# 3 - Design do software

## a) Persona

<img width="341" height="512" alt="image" src="https://github.com/user-attachments/assets/fddce90b-936e-4815-9950-6957b7a7749a" />


__Maria Eduarda Santos__

__Idade:__ 34 anos 

__Sexo:__ Feminino 

__Estado civil:__ Casada 

__Filhos:__ 1 filho 

__Escolaridade:__ Ensino Médio Completo

__Local de residência:__ Região urbana

__Familiaridade com tecnologia:__ Intermediária (usa aplicativos diariamente)

<br>

__🧭 Perfil Profissional__

Maria Eduarda é uma pessoa organizada e prática, que precisa conciliar trabalho, família e tarefas do dia a dia. Ela costuma sair para restaurantes principalmente nos fins de semana ou após o expediente, geralmente acompanhada do marido e do filho. Como sua rotina é corrida, ela valoriza soluções que economizem tempo e evitem estresse, principalmente quando se trata de esperar por atendimento em locais cheios.

Ela gosta de planejar tudo com antecedência e prefere evitar filas presenciais longas, pois isso pode gerar ansiedade e atrapalhar sua programação familiar.

<br>

__📱 Necessidades e Expectativas em relação ao Qmesa__

__Entrada rápida na fila:__ Quer conseguir entrar na fila do restaurante pelo celular antes de chegar ao local, evitando aglomeração e tempo de espera desnecessário.

__Acompanhamento em tempo real:__ Deseja visualizar sua posição na fila e o tempo estimado de espera para se organizar melhor.

__Notificações automáticas:__ Valoriza alertas quando sua vez estiver próxima, para poder se dirigir ao restaurante sem risco de perder a chamada.

__Facilidade de uso:__ Prefere um aplicativo simples, intuitivo e com poucos passos para realizar uma reserva ou entrar na fila.

__Avaliação da experiência:__ Gosta de poder dar feedback sobre o atendimento e a experiência no restaurante, ajudando outros clientes e o próprio estabelecimento.

<br>

__🎯 Objetivo ao usar o Qmesa__

Conseguir uma mesa em restaurantes de forma prática, previsível e sem filas físicas, tornando os momentos de lazer com a família mais confortáveis e organizados.


## b) Storyboard (contexto de uso)

O material de __Storyboard__ está detalhado no documento __Documentação do Projeto__.

## c) UI Design (guia de estilo)

- Azul Marinho #1F2455 — tipografia principal, credibilidade e estabilidade
- Azul Petróleo #1D4052 — complemento institucional, modernidade
- Verde Médio #6DA520 — identidade da marca, disponibilidade e confirmação
- Verde Oliva Claro #A8C93C — dinamismo e renovação
- Verde Oliva Escuro #4E6F2E — detalhes e contrastes

## d) Prototipação do MVP

_Link (Figma):_ [https://www.figma.com/proto/n9gjPc6w9RrYTWbxgc1Q7J/GUIA?t=q8LzyVarXPUjFwIS-0](https://www.figma.com/proto/mUEQslFFt0hF5UVmgMQAX3/Prototipagem?node-id=237-117&starting-point-node-id=237%3A117&t=7GZA88mPwHKj53KC-1)

## e) Roteiro de testes

O plano de testes cobre três categorias: testes funcionais, testes de requisitos não funcionais e testes de casos de borda e resiliência (edge cases).

__Testes funcionais__

| ID | Caso de Teste | Procedimento | Critério de Aceite |
|----|---------------|--------------|-------------------|
| TF01 | Entrada na Fila (RF01/RF08) | Acessar via QR Code, preencher nome e telefone e submeter. | Registro aparece no painel do gestor em tempo real, sem refresh. |
| TF02 | Sincronização em Tempo Real (RF02) | Alterar posição de um cliente no painel do gestor. | Interface do cliente reflete nova posição e estimativa imediatamente. |
| TF03 | Ciclo de Reserva (RF04/RF10) | Realizar reserva futura e aprovar no painel administrativo. | Status muda de "Pendente" para "Confirmada" no módulo do cliente. |
| TF04 | Manutenção do Cardápio (RF11/RF03) | Editar preço ou disponibilidade de item no módulo do gestor. | Item alterado exibe novos dados na interface do cliente instantaneamente. |
| TF05 | Cálculo de BI (RF12) | Finalizar atendimento de sequência de clientes com diferentes tempos. | Dashboard atualiza Tempo Médio e Giro de Mesas com valores corretos. |

__Testes não-funcionais__

| ID | Caso de Teste | Procedimento | Critério de Aceite |
|----|---------------|--------------|-------------------|
| TNF01 | Responsividade (RNF01/RNF07) | Carregar em Chrome e Safari em Android e iOS. | Layout sem quebra; todas as funções acessíveis. |
| TNF02 | Latência (RNF02) | Cronometrar tempo entre comando do gestor e atualização no cliente. | Latência total não ultrapassa 2 segundos. |
| TNF03 | Redirecionamento Seguro (RNF06) | Acessar o sistema via http://. | Servidor redireciona automaticamente para https://. |
| TNF04 | Concorrência (RNF09) | Simular 50 entradas simultâneas via scripts automatizados. | Sistema processa tudo sem timeout ou queda de conexão. |

__Testes de borda__

| ID | Caso de Teste | Procedimento | Critério de Aceite |
|----|---------------|--------------|-------------------|
| TE01 | Idempotência de Cadastro | Cadastrar cliente com telefone já ativo na fila. | Sistema bloqueia e exibe tela do cadastro existente. |
| TE02 | Divisão por Zero | Calcular estimativa com 0 mesas configuradas. | Sistema exibe "Estimativa indisponível" sem erro de código. |
| TE03 | Conflito de Mesa | Dois gestores atribuindo a mesma mesa simultaneamente. | Banco aplica lock; apenas uma atribuição é permitida. |
| TE04 | Resiliência Offline | Interromper conexão do cliente durante visualização da fila. | PWA exibe "Conexão Perdida" e mantém dados em cache. |

__Visualização e Alertas__

| ID     | Caso de Teste               | Entrada                                      | Saída Esperada                           |
|--------|-----------------------------|----------------------------------------------|-------------------------------------------|
| CT11   | Visualização de visitas     | Menu "Visitas previstas"                     | Lista exibida corretamente                |
| CT12   | Inserção de alerta no mapa  | Coordenadas + descrição + menu "Risco"       | Alerta inserido + marcador exibido no mapa|

<br>

*Observação*: O roteiro de casos de teste completo está presente no arquivo __Projeto 2__ para visualização. 

Este roteiro pode ser expandido conforme novas funcionalidades forem incorporadas.

# 4 - Desenvolvimento

## a) Processo de Software
O desenvolvimento do Qmesa é conduzido via framework **Scrum**, com Sprints quinzenais e entregas incrementais. A equipe é composta por dois membros com responsabilidades nichadas: Milena Pianaro no back-end (FastAPI, PostgreSQL/Supabase) e Alessandro Sondey no front-end (React.js, Tailwind CSS). As cerimônias são registradas de forma assíncrona via grupo de mensagens, e o gerenciamento visual das tarefas é realizado em quadro Kanban no **Trello**.

## b) Recursos Utilizados
- **Tecnologias:** Progressive Web App (PWA), React.js + Tailwind CSS (front-end), Python + FastAPI (back-end), PostgreSQL + Supabase (banco de dados e Realtime).
- **Ferramentas de apoio:** GitHub para versionamento, Trello para gestão de tarefas, Figma para prototipação.
- **Linguagens:** JavaScript/TypeScript (front-end), Python (back-end).
- **Equipamentos:** Computadores pessoais dos desenvolvedores, infraestrutura em nuvem via Supabase.

## c) Resultados Esperados
- Substituição do processo analógico de gestão de filas por fluxo digital integrado e em tempo real.
- Redução da taxa de desistência (reneging) por meio da transparência informacional.
- Transição da gestão intuitiva para gestão orientada por dados via dashboard de BI.
- Entrega de MVP funcional validado por plano de testes ao final da Sprint 6.
- 
<br>

Os materiais de __Modelagem UML__ (casos de uso e de classes) estão detalhados no documento __Projeto 2__.

Os resultados da Entrevista com o Usuário, com informações do público-alvo entrevistado, período da coleta, gráficos e respostas, encontra-se no documento __Projeto 1__.

# 5 - Estratégia de marketing digital para divulgar o produto e criar engajamento com público alvo

A desenvolver

# 6 - Gestão do Projeto – Arquivos do Projeto

__Trello:__

_Link:_ https://trello.com/b/EsNZhN7N/qmesa-kanban

<br>

__Cronograma de Desenvolvimento:__

| Sprint | Período | Foco |
|--------|---------|------|
| Sprint 0 | 19/02 – 01/03 | Documentação e planejamento |
| Sprint 1 | 06/03 – 19/03 | Arquitetura e interface |
| Sprint 2 | 20/03 – 02/04 | Fundação do back-end |
| Sprint 3 | 03/04 – 16/04 | MVP: fila e salão |
| Sprint 4 | 17/04 – 30/04 | Reservas e feedbacks / Dashboard e BI |
| Sprint 5 | 01/05 – 14/05 | Integração e estabilização |
| Sprint 6 | 15/05 – 28/05 | Testes e refinamento |
| Sprint 7 | 29/05 – 11/06 | Consolidação e entrega técnica |
| Fechamento | 12/06 – 22/06 | Escrita final |
| Entrega | até 07/07 | Defesa |

