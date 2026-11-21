## ✦ Sobre o Creative Vault

**Creative Vault** é uma biblioteca digital pessoal criada para reunir, organizar e conectar referências culturais e criativas em um único lugar.
Inspirado em plataformas como Pinterest,Letterboxd, o projeto nasce da ideia de construir um espaço onde imagens, livros, filmes, séries, citações e links possam coexistir, sem a fragmentação de informações entre diferentes aplicativos e sem a interferência de anúncios ou recomendações constantes.
Mais do que salvar conteúdos, a proposta é permitir que cada pessoa construa seu próprio acervo de referências, organizando descobertas em coleções personalizadas e estabelecendo conexões entre diferentes conteúdos.

Uma fotografia pode estar associada a um livro, uma citação pode representar um filme e uma obra pode fazer parte de várias coleções sem precisar ser cadastrada novamente.

O Creative Vault busca transformar conteúdos isolados em uma biblioteca pessoal de conhecimento, memória e inspiração.

### ✧ Principais funcionalidades

- **Biblioteca pessoal:** centralização de referências de diferentes formatos.
- **Coleções personalizadas:** organização de conteúdos por temas, interesses ou projetos.
- **Publicação de referências:** cadastro de imagens, livros, filmes, séries, citações e links.
- **Conexões entre conteúdos:** criação de vínculos entre referências relacionadas.
- **Catálogos externos:** integração com serviços como TMDB para descoberta e importação de informações sobre filmes e séries.
- **Busca e filtros:** localização de conteúdos dentro da biblioteca.
- **Personalização visual:** escolha de capas e organização das referências dentro das coleções.

### ✧ Arquitetura e desenvolvimento

Além de sua proposta como produto, o Creative Vault também é um projeto de estudo e experimentação em engenharia de software.

O desenvolvimento utiliza uma abordagem de **Monólito Modular com Arquitetura Hexagonal (Ports & Adapters)**, buscando separar as regras de negócio dos detalhes de infraestrutura e facilitar a evolução da aplicação.

**Tecnologias utilizadas:**

- **Frontend:** React, TypeScript e Vite.
- **Backend:** Node.js, Express e TypeScript.
- **Banco de dados:** PostgreSQL e Prisma ORM.
- **Validação:** Zod.
- **Testes:** Vitest e Supertest.
- **Infraestrutura local:** Docker e Docker Compose.

O projeto também explora conceitos de modelagem de domínio, design de APIs REST, integração com serviços externos, testes automatizados e system design.

### ✧ Status do projeto

 **Em desenvolvimento - Proof of Concept (POC)**

O Creative Vault está sendo desenvolvido de forma incremental, com foco inicial na validação das funcionalidades essenciais: publicação de referências, organização em coleções, persistência de dados e relacionamentos entre conteúdos.

A POC foi pensada para evoluir progressivamente até um MVP, preservando as decisões arquiteturais e os aprendizados adquiridos durante o desenvolvimento.

---

*Um espaço para guardar não apenas o que encontramos, mas aquilo que queremos revisitar.*
