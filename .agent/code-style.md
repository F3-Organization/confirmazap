# Code Style & Pragmatic Architecture Rules

## 1. Regras dos Use Cases e Validação (`src/usecase` & `src/infra/http`)
- **Validação com Zod:** Toda validação de dados de entrada (body, params, query) DEVE ser feita utilizando a biblioteca `zod` na camada do Controller. O Use Case deve receber apenas dados limpos, tipados e validados. Aproveite o `z.infer` para gerar os tipos dos DTOs.
- **O Coração do Sistema:** Como não usamos uma camada de domínio puro, as regras de negócio vivem inteiramente nos Use Cases.
- **Isolamento HTTP:** O Use Case **NÃO** deve conhecer o Fastify (nada de importar `FastifyRequest` ou `FastifyReply`). O Controller extrai os dados, valida com Zod, monta o DTO e passa para o Use Case.
- **Responsabilidade Única:** Cada classe de Use Case deve ter apenas um método público principal (ex: `execute()`).
- **Injeção de Dependências:** O Use Case recebe seus repositórios pelo construtor através de Interfaces (Ports), nunca instanciando implementações concretas internamente.

## 2. Padrões do TypeORM (`src/infra/database`)
- **Uso Direto (Sem Mappers):** Os Use Cases podem importar, instanciar e manipular as Entidades do TypeORM (`@Entity`) diretamente.
- **Localização:** As Entidades devem ficar ESTRITAMENTE dentro de `src/infra/database/entities`.
- **Nomenclatura no Banco:** Usar `snake_case` para tabelas e colunas nativas do Postgres para evitar problemas de aspas duplas em queries manuais. Configure os decorators explicitamente: `@Column({ name: 'user_id' })`.
- **Migrations:** NUNCA usar `synchronize: true` em produção. Gerar migrations para toda alteração estrutural no banco.

## 3. Padrões TypeScript e Arquivos
- **Nomenclatura de Arquivos:** Usar `kebab-case` com sufixo do tipo do arquivo. Exemplos: `user.entity.ts`, `create-appointment.usecase.ts`, `auth.controller.ts`, `appointment.repository.ts`.
- **Nomenclatura de Código:** `camelCase` para variáveis e métodos. `PascalCase` para Classes e Interfaces.
- **Tipagem:** PROIBIDO o uso de `any`. Dados externos dinâmicos (como o body do Webhook do WhatsApp) devem ser tipados como `unknown` até passarem pelo parse do `zod`.
- **Tratamento de Erros:** Usar o padrão de Early Return. Criar uma classe `AppError` customizada para padronizar exceções de negócio, contendo a mensagem e o `statusCode` HTTP. O Controller deve capturar erros do Zod (`ZodError`) e formatá-los adequadamente.

## 4. Injeção de Dependências
- Seguir o padrão pragmático documentado em `architecture.md`. 
- Usar a Factory manual em `src/infra/factory/factory.ts` para instanciar repositórios e injetá-los nos Use Cases. 
- Evitar bibliotecas mágicas de injeção de dependência para este MVP. Mantenha a injeção manual para facilitar o rastreio e o debug.