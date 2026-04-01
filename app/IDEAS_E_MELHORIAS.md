# Ideias e melhorias para o B2 Study Tracker

Documento para organizar e priorizar melhorias no dashboard. Use como guia para implementação.

---

## 1. Melhorias gerais no dashboard (sugestões)

| Ideia | Descrição | Prioridade |
|-------|-----------|------------|
| **Resumo do dia na header** | Mostrar "X de Y atividades concluídas hoje" ao lado dos pontos | Média |
| **Filtro por tipo** | No calendário ou checklist, filtrar por tipo (ex.: só Speaking, só Mock) | Baixa |
| **Notificações / lembretes** | Lembrete no horário da atividade (ex.: Web Notifications ou apenas destaque visual) | Média |
| **Exportar dados** | Botão para exportar histórico em CSV/JSON (backup ou análise em planilha) | Média |
| **Gráfico de evolução por tipo** | Além de pontos totais, ver evolução por tipo (Speaking, Listening, etc.) | Baixa |
| **Streak (sequência)** | "X dias seguidos concluindo pelo menos 1 atividade" | Baixa |

---

## 2. Editar pontos por tarefa

**Objetivo:** Permitir ajustar manualmente os pontos de cada atividade (além do cálculo automático por tipo).

### O que fazer

- **Onde:** No **Calendário**, em cada atividade concluída (ou em um menu "detalhes" da atividade), exibir os pontos ganhos e um botão **"Editar pontos"** (ícone lápis pequeno).
- **Comportamento:**
  - Abre um pequeno modal ou inline: campo numérico "Pontos ganhos" (valor atual pré-preenchido).
  - Ao salvar: atualizar `weeks[currentWeekKey].activities[activityId].pointsEarned` e recalcular `weeklyProgress.totalPoints` (soma de todos os `pointsEarned` da semana).
  - Persistir (já cobre ao usar o Context).
- **Regra:** Manter o valor calculado automaticamente como padrão; a edição manual sobrescreve só aquele registro.

### Dados já existentes

- Em `state.weeks[weekKey].activities[activityId]` já existe `pointsEarned`.
- Basta adicionar uma ação no Context, por exemplo:  
  `updateActivityPoints(activityId, points)`  
  que atualiza esse objeto e recalcula o total da semana.

---

## 3. Meta semanal editável

**Objetivo:** Ter uma "meta de pontos" por semana (ex.: 80 pts) e mostrar o progresso em relação a ela.

### O que fazer

- **Onde:** No **Header** (perto do badge de pontos) ou no **Resumo Semanal**: exibir algo como **"65 / 80 pts"** (atual / meta) e um botão **"Editar meta"**.
- **Dados:**
  - Guardar por semana: `weeks[weekKey].weeklyProgress.weeklyGoal` (número, ex.: 80).
  - Se não houver meta, pode ocultar o " / meta" ou usar um valor padrão (ex.: 100) configurável em "Configurações" no futuro.
- **UI:**
  - Clique em "Editar meta" → input numérico (modal ou inline) para a meta da semana atual.
  - Opcional: barra de progresso (atual / meta) com cor (verde se ≥ meta, amarelo/laranja se abaixo).
- **Persistência:** `weeklyProgress` já é salvo no estado; basta adicionar o campo `weeklyGoal` e persistir junto.

---

## 4. Seção "Interview Tracker" (entrevistas em inglês)

**Objetivo:** Uma área no dashboard para registrar e acompanhar entrevistas em inglês: quantas fez no ano, agenda futura, tipo (HR / técnica / gerente), avaliação, empresa e proposta salarial.

### 4.1 Onde fica no layout

- **Opção A:** Nova **4ª coluna** no grid (em telas grandes) ou uma **aba / seção** "Entrevistas" ao lado de "Evolução".
- **Opção B:** Abaixo do grid, uma **linha inteira** "Interview Tracker" (lista + resumos).
- **Sugestão:** Começar com uma **seção/card** na 3ª coluna (abaixo de Gráficos + Histórico) ou em uma 4ª coluna quando `lg`. Se ficar muito cheio, depois separar em aba "Entrevistas".

### 4.2 Campos de cada entrevista

| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|------------|
| **Data** | data | Sim | Quando foi (ou será) a entrevista |
| **Empresa** | texto | Sim | Nome da empresa |
| **Tipo** | select | Sim | HR | Técnica | Gerente (ou "Final") |
| **Sua avaliação (1–10)** | número 1–10 | Não | Como você foi na entrevista |
| **Proposta salarial** | texto ou número | Não | Ex.: "R$ 12.000" ou "A combinar" |
| **Status** | select | Sim | Agendada | Realizada | Cancelada | Recusada |
| **Observações** | texto longo | Não | Notas livres |

### 4.3 Resumos / visões na seção

- **Cards ou lista no topo:**
  - **"X entrevistas este ano"** (contador, filtro por ano).
  - **"Próximas"**: próximas agendadas (ordenadas por data).
- **Lista principal:** Todas as entrevistas (ou filtro por ano), ordenadas por data (mais recente primeiro), com colunas: Data, Empresa, Tipo, Avaliação, Proposta, Status. Clique na linha para editar.
- **Filtros opcionais:** Por ano, por tipo (HR/Técnica/Gerente), por status.

### 4.4 Dados e persistência

- Novo pedaço de estado, por exemplo:  
  `state.interviews = []`  
  cada item:  
  `{ id, date, company, type: 'hr'|'technical'|'manager', rating, salaryOffer, status: 'scheduled'|'done'|'cancelled'|'rejected', notes }`
- Persistir junto com o resto no mesmo `localStorage` (mesma chave do app ou uma chave separada, como preferir).
- Ação no Context:  
  `saveInterviews(interviews)` ou `addInterview(interview)` / `updateInterview(id, data)` / `deleteInterview(id)`.

### 4.5 Ordem sugerida de implementação (Interview Tracker)

1. Definir estrutura de dados (`interviews` no estado + persistência).
2. Tela simples: lista de entrevistas (tabela ou cards) com botão "Nova entrevista".
3. Modal (ou página) para criar/editar com os campos acima.
4. Contador "X entrevistas este ano" e bloco "Próximas agendadas".
5. Filtros (ano, tipo, status) se fizer sentido.

---

## 5. Priorização sugerida (ordem para implementar)

1. **Editar pontos por tarefa** – rápido, usa estrutura atual.
2. **Meta semanal** – também pequeno (um campo + UI no header/resumo).
3. **Interview Tracker** – seção nova: estado, UI lista, modal criar/editar, depois resumos e filtros.

Depois disso, encaixar melhorias gerais (resumo do dia, exportar dados, etc.) conforme tempo.

---

## 6. Checklist rápido (para você marcar)

- [x] Editar pontos por tarefa (botão + modal/inline + ação no Context)
- [x] Meta semanal (campo `weeklyGoal`, input "Editar meta", exibir "atual / meta")
- [x] Interview Tracker: modelo de dados e persistência
- [x] Interview Tracker: lista + "Nova entrevista"
- [x] Interview Tracker: modal criar/editar (data, empresa, tipo, avaliação, proposta, status, observações)
- [x] Interview Tracker: "X entrevistas este ano" e "Próximas agendadas"
- [ ] (Opcional) Filtros e melhorias gerais do dashboard

Se quiser, na próxima mensagem podemos começar por **editar pontos por tarefa** ou por **meta semanal** (escolha uma e eu te guio passo a passo no código).
