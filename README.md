# B2 Study Tracker / Dashboard Tracker English Study

Dashboard para acompanhar estudos de inglês (nível B2).

## App atual (raiz — React + Vite)

Metas diárias (speaking, vocabulário, revisão), minutos, notas, modo baixa energia, streak e progresso semanal, com **Supabase** (`daily_logs`).

```bash
npm install
npm run dev
```

Build: `npm run build` → saída em `dist/`.

Configure `.env` a partir de `.env.example` e rode a migration em `supabase/migrations/`.

## Versões anteriores no mesmo repositório

- **Raiz (legado):** abra `index.legacy.html` no navegador (com `style.css` e `script.js`). O `index.html` na raiz é o ponto de entrada do **Vite**.
- **`app/`:** versão React + Vite + Tailwind anterior (calendário semanal, gráficos, entrevistas, `localStorage`).

Para rodar a versão em `app/`:

```bash
cd app
npm install
npm run dev
```

## Links

- Repositório: [dashboard-tracker-english-study](https://github.com/juarezjunior95/dashboard-tracker-english-study)
