# Checklist: Modernização B2 Study Tracker

Stack alvo: **React + Vite + Tailwind CSS** (mesma lógica, UI moderna).

---

## Fase 1 — Setup do projeto ✅

- [x] **1.1** Criar novo projeto com Vite + React (na pasta do projeto ou em subpasta `app/`)
  ```bash
  npm create vite@latest app -- --template react
  ```
- [x] **1.2** Instalar dependências base
  ```bash
  cd app && npm install
  ```
- [x] **1.3** Instalar e configurar Tailwind CSS (usado **Tailwind v4** + `@tailwindcss/vite`)
  ```bash
  npm install -D tailwindcss postcss autoprefixer @tailwindcss/vite
  ```
- [x] **1.4** ~~Configurar `tailwind.config.js`~~ (v4 detecta conteúdo automaticamente; plugin em `vite.config.js`)
- [x] **1.5** Adicionar import Tailwind em `src/index.css`: `@import "tailwindcss";`
- [x] **1.6** Instalar dependências do app
  ```bash
  npm install chart.js react-chartjs-2 lucide-react
  ```
- [x] **1.7** Rodar `npm run dev` e confirmar que a aplicação React sobe sem erros

---

## Fase 2 — Estrutura de pastas e dados ✅

- [x] **2.1** Criar estrutura de pastas em `src/`:
  ```
  src/
  ├── components/   (Header, WeekNav, Calendar, Checklist, Charts, History, Modals)
  ├── hooks/        (useLocalStorage, useWeek, useSchedule)
  ├── lib/          (utils: dates, points, storage, state)
  ├── data/         (defaultSchedule, defaultActivityTypes, constants)
  └── App.jsx
  ```
- [x] **2.2** Extrair dados padrão: criar `src/data/defaults.js` com `defaultSchedule`, `defaultActivityTypes`, `daysOfWeek`, `dayNames`
- [x] **2.3** Extrair funções de data: criar `src/lib/dates.js` com `getWeekRange`, `getWeekKey`
- [x] **2.4** Extrair funções de pontuação: criar `src/lib/points.js` com `calculatePoints`, `getPerformanceLevel`
- [x] **2.5** Criar `src/lib/state.js` (`createDefaultState`, `ensureCurrentWeek`) e `src/lib/storage.js` (`STORAGE_KEY`, `loadState`, `saveState`, `resetToDefault`)

---

## Fase 3 — Estado global e persistência ✅

- [x] **3.1** Decidir gerenciamento de estado: **Context API** (AppContext)
- [x] **3.2** Criar `src/context/AppContext.jsx`: estado `schedule`, `activityTypes`, `weeks`, `currentWeekKey`, `history`
- [x] **3.3** Implementar no Context: `ensureCurrentWeek`, carregar estado do localStorage na inicialização (`loadState`)
- [x] **3.4** Implementar no Context: ações `setCurrentWeekKey`, `goToPrevWeek`, `goToNextWeek`, `completeActivity`, `saveWeeklyProgress`, `saveSchedule`, `updateActivityTypes`, `resetToDefault`; histórico reconstruído com `buildHistoryFromWeeks`
- [x] **3.5** Persistir estado no localStorage em cada alteração (função `persist` chama `saveState` após cada update)

---

## Fase 4 — Componentes de layout e navegação ✅

- [x] **4.1** Criar `Header`: título "B2 Study Tracker", badge de pontos totais da semana, botão "Editar Cronograma"
- [x] **4.2** Usar ícones do `lucide-react` (Trophy, Pencil) no Header
- [x] **4.3** Criar `WeekNavigation`: botões "Semana Anterior" / "Próxima Semana" e exibição do intervalo da semana (ex.: "22/02 a 28/02")
- [x] **4.4** Estilizar Header e WeekNav com Tailwind (gradiente violet/indigo, bordas, focus ring, responsivo); Context expõe `openEditModal`/`closeEditModal` para o botão Editar

---

## Fase 5 — Calendário semanal ✅

- [x] **5.1** Criar componente `Calendar`: usa `state.schedule`, `state.weeks`, `state.currentWeekKey` e `daysOfWeek`/`dayNames` de `data/defaults`
- [x] **5.2** Para cada dia: cabeçalho com nome do dia e lista de atividades do `schedule[day]`
- [x] **5.3** Por atividade (exceto `rest`): horário, nome, pontos; botões Play (timer) e Check (concluir manual) com ícones Lucide
- [x] **5.4** Atividades concluídas com estilo distinto (`bg-emerald-50`); botões desabilitados quando concluído
- [x] **5.5** Botões chamam `openTimerModal(activity, day)` e `openManualCompleteModal(activity, day)` do Context (modal na Fase 9)
- [x] **5.6** Tailwind: cards por dia, lista de atividades, estados hover/disabled; grid 3 colunas no `App` (Calendar + placeholders Fase 6 e 7–8)

---

## Fase 6 — Checklists (hoje + resumo semanal) ✅

- [x] **6.1** Criar `DailyChecklist`: atividades do dia atual via `daysOfWeek[today === 0 ? 6 : today - 1]`, `schedule[todayKey]` e `weeks[currentWeekKey].activities`
- [x] **6.2** Itens com ícone concluído/vazio (CheckSquare/Circle), pontos ganhos/máx, e botão "Concluir" que chama `openManualCompleteModal` para itens não concluídos; total do dia no rodapé
- [x] **6.3** Criar `WeeklySummary`: badge de performance (`getPerformanceLevel`), inputs Fluency (1–5), Confidence (1–5), principal erro gramatical, novo vocabulário, botão "Salvar Avaliação" → `saveWeeklyProgress`
- [x] **6.4** Tailwind em ambos; `ChecklistsSection` agrupa os dois na coluna do meio

---

## Fase 7 — Gráficos (Chart.js) ✅

- [x] **7.1** Gráfico de pontos: componente `ChartsSection` com `<Line>` (react-chartjs-2) para pontos semanais
- [x] **7.2** Dados: `state.history.slice(-4)`, labels `S1..S4`, eixo Y = `totalPoints` (máx 120)
- [x] **7.3** Gráfico de scores: `<Bar>` com dois datasets (Fluency verde, Confidence âmbar), eixo Y 0–5
- [x] **7.4** Registrar em `ChartsSection`: CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Title, Tooltip, Legend
- [x] **7.5** Card com título "Evolução", altura fixa (h-[200px]) para cada gráfico, responsivo

---

## Fase 8 — Histórico de semanas ✅

- [x] **8.1** Criar componente `HistoryList`: lista de `state.history` invertida (mais recente primeiro)
- [x] **8.2** Cada item: data formatada (pt-BR), badge de pontos com cor de `getPerformanceLevel`, Fluency e Confidence (F x/5 · C x/5)
- [x] **8.3** Clique no item chama `setCurrentWeekKey(entry.weekKey)` para navegar para a semana; semana atual destacada (bg-indigo-50)
- [x] **8.4** Tailwind: lista rolável (max-h-[280px]), botões com borda/hover, badge colorido por nível; integrado em `ChartsSection`

---

## Fase 9 — Modais ✅

- [x] **9.1** Modal Timer/Conclusão (`TimerModal.jsx`):
  - Título da atividade, subtítulo (horário · duração); modo timer (display MM:SS, Iniciar/Pausar/Resetar) ou manual (só input/concluir)
  - Cronômetro com useState + useEffect + setInterval; ao chegar em 0: mostrar input para listening/anki/grammar ou concluir direto para outros tipos
  - Input: labels por tipo (resumo 50+ chars, frase Anki, frase grammar); botão "Concluir e Ganhar Pontos" chama `completeActivity` e `closeTimerModal`
- [x] **9.2** Modal Editar Cronograma (`EditScheduleModal.jsx`):
  - Lista dias e atividades por dia; editar (form inline com nome, início/fim, tipo) e excluir; botão "Adicionar atividade" por dia; formulário `ActivityForm` (nome, time start/end, select tipo)
  - Cópia local do schedule; ao "Salvar Alterações" chama `saveSchedule(scheduleCopy)` e `closeEditModal`
- [x] **9.3** Overlay `bg-black/50`, conteúdo em card branco centralizado; botões e inputs com Tailwind; modais renderizados em `App.jsx`

---

## Fase 10 — Integração em App.jsx ✅

- [x] **10.1** Árvore envolvida com `AppProvider` em `main.jsx`
- [x] **10.2** Layout: Header, WeekNavigation, grid `grid-cols-1 lg:grid-cols-3` com Calendar | ChecklistsSection | ChartsSection (inclui HistoryList)
- [x] **10.3** `TimerModal` e `EditScheduleModal` renderizados em `App.jsx`; estado no Context (`timerModal`, `editModalOpen`)
- [x] **10.4** `index.html` com `<div id="root">`; `main.jsx` renderiza `<App />` em `#root`; `<main id="main" role="main">` para acessibilidade

---

## Fase 11 — Ajustes e polish ✅

- [x] **11.1** Responsividade: grid `grid-cols-1 lg:grid-cols-3`; Header e WeekNav com `flex-wrap`; conteúdo utilizável em mobile
- [x] **11.2** Tema: violet/indigo no header, `bg-gray-100` no fundo, `text-gray-900` no app; Tailwind em todos os componentes
- [x] **11.3** Acessibilidade: labels em inputs (WeeklySummary, ActivityForm, TimerModal); `focus:ring` / `focus-visible` em botões; `index.css` com fallback `:focus-visible` para teclado
- [x] **11.4** Fluxo: navegação de semanas, concluir atividades (timer/manual), editar cronograma e salvar; estado persistido em `localStorage` (chave `b2-study-tracker-v5`) — validar manualmente com `npm run dev`
- [x] **11.5** App.css reduzido ao mínimo; logos do template não importados no App
- [x] **11.6** `index.html`: título "B2 Study Tracker", `lang="pt-BR"`, meta description adicionada

---

## Fase 12 — Opcional (depois)

- [ ] **12.1** Adicionar shadcn/ui para componentes (Button, Card, Dialog, Input) se quiser UI ainda mais polida
- [ ] **12.2** Migrar para TypeScript (renomear para .tsx/.ts e tipar estado e funções)
- [ ] **12.3** Testes: React Testing Library para componentes críticos (Calendar, modais)

---

## Ordem sugerida de execução

1. Fase 1 (setup) → 2 (estrutura e dados) → 3 (estado)  
2. Depois: 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11  

Quando quiser, podemos começar pela **Fase 1** no seu projeto (criar o Vite + React + Tailwind e instalar Chart.js + Lucide).
