# Contexto Técnico

## Ambiente de Desenvolvimento
- Sistema Operacional: Windows 10
- Editor: Cursor IDE
- Terminal: PowerShell
- Servidor Local: XAMPP

## Versões das Tecnologias
- Node.js: v18.x
- React: v18.x
- TypeScript: v5.x
- MySQL: v8.x
- Tailwind CSS: v3.x
- Zustand: v4.x
- shadcn/ui: Última versão

## Configuração do Ambiente
1. Requisitos
   - Node.js instalado
   - XAMPP instalado
   - Git instalado
   - NPM ou Yarn

2. Instalação
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Banco de Dados
   - Criar banco MySQL
   - Executar migrations
   - Configurar variáveis de ambiente

4. Desenvolvimento
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

## Estrutura de Diretórios
```
LeiaMais/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── database/
│   ├── migrations/
│   └── seeds/
├── public/
├── memory-bank/
└── docs/
```

## Scripts Disponíveis
- `dev`: Inicia servidor de desenvolvimento
- `build`: Compila para produção
- `test`: Executa testes
- `lint`: Verifica código
- `format`: Formata código

## Variáveis de Ambiente
- `VITE_API_URL`: URL da API
- `VITE_DB_HOST`: Host do banco
- `VITE_DB_USER`: Usuário do banco
- `VITE_DB_PASS`: Senha do banco
- `VITE_DB_NAME`: Nome do banco 