# Colocar o app no ar (grátis) para seu amigo acessar

O app pode rodar em serviços **gratuitos** de hospedagem estática. Qualquer pessoa com o link pode acessar de qualquer lugar (ex.: Minas Gerais).

---

## Opção 1: Vercel (recomendado – bem simples)

1. Acesse **[vercel.com](https://vercel.com)** e faça login com sua conta **GitHub**.
2. Clique em **“Add New…”** → **“Project”**.
3. Importe o repositório **dashboard-tracker-english-study** (se não aparecer, conecte o GitHub à Vercel).
4. **Importante:** em **“Root Directory”** clique em **“Edit”** e coloque: **`app`**  
   (assim a Vercel usa a pasta onde está o `package.json` do projeto.)
5. Deixe como está:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Clique em **“Deploy”**.
7. Em 1–2 minutos você recebe um link tipo:  
   **`https://dashboard-tracker-english-study-xxxx.vercel.app`**  
   Esse link você envia para seu amigo; ele acessa de qualquer lugar (inclusive Minas Gerais).

**Depois:** a cada `git push` no GitHub a Vercel faz um novo deploy automático.

---

## Opção 2: Netlify

1. Acesse **[netlify.com](https://netlify.com)** e faça login com **GitHub**.
2. **“Add new site”** → **“Import an existing project”** → **GitHub** → escolha **dashboard-tracker-english-study**.
3. Configure:
   - **Base directory:** `app`
   - **Build command:** `npm run build`
   - **Publish directory:** `app/dist`
4. **Deploy**. O site ganha um link tipo:  
   **`https://nome-aleatorio.netlify.app`**  
   (você pode editar o nome depois em “Site settings”).  

Também fica com deploy automático a cada push.

---

## Opção 3: GitHub Pages

- Grátis, mas exige configurar o build e a pasta `dist` (ou usar GitHub Actions).
- Se quiser usar, avise que eu te passo os passos (incluindo ajuste do `base` no Vite para o nome do repositório).

---

## Resumo

| Serviço   | Custo | Dificuldade | Link após deploy        |
|----------|-------|-------------|--------------------------|
| **Vercel**  | Grátis | Fácil       | `*.vercel.app`           |
| **Netlify** | Grátis | Fácil       | `*.netlify.app`          |
| GitHub Pages | Grátis | Média     | `*.github.io/repo`       |

Recomendação: usar **Vercel** (Opção 1), configurando a **Root Directory** como **`app`**.

**Observação:** o app usa `localStorage` no navegador. Os dados (estudos, entrevistas, etc.) ficam no computador/celular de quem acessa, não em servidor. Ou seja, cada pessoa tem “seu” tracker no próprio dispositivo.
