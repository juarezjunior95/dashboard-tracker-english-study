# B2 Study Tracker / Dashboard Tracker English Study

Dashboard para acompanhar estudos de inglês (nível B2): cronograma semanal, checklists, pontos, evolução e entrevistas.

## Conteúdo do repositório

- **Raiz:** versão original em HTML + CSS + JavaScript (arquivos `index.html`, `style.css`, `script.js`).
- **`app/`:** versão moderna em **React + Vite + Tailwind CSS**, com as mesmas funcionalidades e melhorias:
  - Calendário semanal, checklist do dia, resumo semanal
  - Gráficos (Chart.js) e histórico de semanas
  - Editar pontos por tarefa e meta semanal
  - Interview Tracker (entrevistas em inglês: HR, técnica, gerente; avaliação, proposta salarial)
  - Modo escuro (toggle no header)
  - Persistência em `localStorage`

## Como rodar a aplicação moderna (React)

```bash
cd app
npm install
npm run dev
```

Acesse no navegador a URL indicada (ex.: http://localhost:5173).

## Build para produção

```bash
cd app
npm run build
```

Os arquivos de produção ficam em `app/dist/`.

## Tecnologias (app)

- React 19, Vite 7, Tailwind CSS 4
- Chart.js + react-chartjs-2, Lucide React (ícones)
