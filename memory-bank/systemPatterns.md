# Padrões e Decisões Técnicas

## Arquitetura
- Padrão MVC (Model-View-Controller)
- Frontend em React com TypeScript
- Backend em Node.js com Express
- Banco de Dados MySQL

## Padrões de Design
1. Componentes React
   - Funcionais com Hooks
   - Props tipadas com TypeScript
   - Separação de responsabilidades

2. Gerenciamento de Estado
   - Zustand para estado global
   - Context API para estado local
   - Redux não utilizado para manter simplicidade

3. Estilização
   - Tailwind CSS para estilos
   - shadcn/ui para componentes
   - Sistema de temas claro/escuro

4. Banco de Dados
   - Relacionamentos normalizados
   - Índices para performance
   - Migrations para versionamento

## Decisões Técnicas
1. TypeScript
   - Tipagem estática
   - Melhor manutenibilidade
   - Detecção de erros em tempo de desenvolvimento

2. Tailwind CSS
   - Estilização rápida
   - Consistência visual
   - Responsividade nativa

3. Zustand
   - Simplicidade
   - Performance
   - Menos boilerplate que Redux

4. shadcn/ui
   - Componentes acessíveis
   - Customização fácil
   - Consistência visual

## Convenções de Código
1. Nomenclatura
   - PascalCase para componentes
   - camelCase para funções
   - UPPER_CASE para constantes

2. Estrutura de Arquivos
   - Organização por feature
   - Separação clara de responsabilidades
   - Reutilização de componentes

3. Documentação
   - JSDoc para funções
   - README por componente
   - Comentários em código complexo 