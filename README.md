# LeiaMais - Sistema de Biblioteca

Sistema completo para gerenciamento de biblioteca, desenvolvido com React, TypeScript e Node.js.

## 🚀 Tecnologias

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) (v9 ou superior)
- [Git](https://git-scm.com/)
- [MySQL](https://www.mysql.com/) (v8 ou superior)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/webermont/LeiaMais.git
cd LeiaMais
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
# API
VITE_API_URL=http://localhost:3000

# Database
DATABASE_URL="mysql://user:password@localhost:3306/leiamais"

# JWT
JWT_SECRET="seu-segredo-aqui"

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

5. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 🌙 Tema Escuro

O sistema suporta tema escuro e claro, que pode ser alternado através do botão na barra de navegação. O tema é salvo automaticamente e respeita a preferência do sistema operacional.

## 📱 Responsividade

A interface é totalmente responsiva e se adapta a diferentes tamanhos de tela, desde dispositivos móveis até desktops.

## 🔐 Autenticação

O sistema utiliza autenticação JWT. Para o primeiro acesso, use:

- Email: admin@leiamais.com
- Senha: admin123

## 🧪 Testes

Para executar os testes:

```bash
# Testes unitários
npm test

# Testes end-to-end
npm run test:e2e

# Testes end-to-end com interface
npm run test:e2e:dev
```

## 📚 Documentação

A documentação completa da API está disponível em:
```bash
http://localhost:5173/docs
```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a versão de produção
- `npm run preview` - Visualiza a versão de produção localmente
- `npm test` - Executa os testes unitários
- `npm run test:e2e` - Executa os testes end-to-end
- `npm run test:e2e:dev` - Executa os testes end-to-end com interface
- `npm run lint` - Executa o linter

## 🌟 Funcionalidades

- ✅ Gerenciamento de livros
- ✅ Controle de empréstimos
- ✅ Sistema de multas automáticas
- ✅ Notificações por email
- ✅ Relatórios avançados
- ✅ Tema escuro/claro
- ✅ Interface responsiva
- ✅ Autenticação segura
- ✅ Proteção de rotas
- ✅ Internacionalização (pt-BR)

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Wéber Monteiro**

* Website: [webermonteiro.com.br](https://webermonteiro.com.br)
* Github: [@webermont](https://github.com/webermont)
* LinkedIn: [@webermonteiro](https://linkedin.com/in/webermonteiro)

## ⭐️ Mostre seu apoio

Dê uma ⭐️ se este projeto te ajudou!
