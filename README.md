# TCC Platform Backend

Backend da plataforma de gestão de projetos acadêmicos e TCCs.

## Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/tcc-platform-backend.git
cd tcc-platform-backend

# Instale as dependências
npm install
```

## Configuração

1. Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no `.env`:

```env
PORT=3333
DATABASE_URL=postgresql://user:password@localhost:5432/tcc_platform
JWT_SECRET=sua-chave-secreta
```

3. Crie o banco de dados PostgreSQL:

```sql
CREATE DATABASE tcc_platform;
```

## Executando

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3333`.

## Estrutura do Projeto

```
src/
├── controllers/     # Recebe requisições HTTP
├── services/        # Lógica de negócio
├── repositories/    # Queries SQL ao banco
├── middlewares/     # Autenticação, validação, error handling
├── routes/          # Definição de rotas
├── config/          # Configurações (database, env)
├── types/           # Tipos TypeScript
├── utils/           # Funções utilitárias
├── app.ts           # Configuração do Express
└── server.ts        # Entrada da aplicação
```

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/users` - Lista usuários
- `GET /api/users/:id` - Busca usuário por ID
- `POST /api/users` - Cria usuário
- `PUT /api/users/:id` - Atualiza usuário
- `DELETE /api/users/:id` - Remove usuário

### Projetos
- `GET /api/projects` - Lista projetos
- `GET /api/projects/:id` - Busca projeto por ID
- `POST /api/projects` - Cria projeto
- `PUT /api/projects/:id` - Atualiza projeto
- `DELETE /api/projects/:id` - Remove projeto

### Entregas
- `GET /api/deliveries` - Lista entregas
- `GET /api/deliveries/:id` - Busca entrega por ID
- `GET /api/deliveries/project/:projectId` - Lista entregas de um projeto
- `POST /api/deliveries` - Cria entrega
- `PUT /api/deliveries/:id` - Atualiza entrega
- `DELETE /api/deliveries/:id` - Remove entrega

## Tipos de Usuário

- `student` - Aluno
- `advisor` - Orientador
- `admin` - Administrador

## Próximos Passos

1. [ ] Implementar queries SQL nos repositories
2. [ ] Implementar lógica de negócio nos services
3. [ ] Implementar controllers
4. [ ] Implementar autenticação JWT
5. [ ] Implementar validação de dados
6. [ ] Criar migrations do banco de dados
7. [ ] Adicionar testes automatizados
8. [ ] Documentar API com Swagger

## Regras de Negócio

- Um aluno só pode ter um projeto com status `in_progress` por vez
