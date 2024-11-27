# Sistema de Doações - Escola Felipe dos Santos

Sistema web para gerenciamento de doações escolares, desenvolvido para facilitar e organizar o processo de recebimento de doações na Escola Felipe dos Santos.

## 📋 Funcionalidades

### Área Pública
- Cadastro de doações (materiais escolares, alimentos, livros, etc.)
- Interface intuitiva e responsiva
- Acompanhamento do status da doação

### Área Administrativa
- Dashboard com estatísticas em tempo real
- Gestão completa das doações
- Filtros e ordenação avançados
- Geração de relatórios em Excel
- Sistema de autenticação seguro

## 🛠️ Tecnologias

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
  - Bootstrap 5
  - Bootstrap Icons

- **Backend:**
  - Node.js
  - Express.js
  - SQLite3
  - JWT (JSON Web Tokens)
  - ExcelJS (para relatórios)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/riqueandrade/sistema_doacao_escolar.git
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
npm run init-db
```

4. Inicie o servidor:
```bash
npm start
```

O sistema estará disponível em `http://localhost:3000`

## 🔑 Credenciais Padrão

Email: admin@escola.com
Senha: admin123

## 🗄️ Estrutura do Projeto

```
├── config/             # Configurações do sistema
├── controllers/        # Controladores da aplicação
├── middlewares/       # Middlewares (auth, etc)
├── public/            # Arquivos estáticos
│   ├── css/          # Estilos
│   ├── js/           # Scripts
│   └── images/       # Imagens
├── routes/            # Rotas da API
├── services/          # Camada de serviços
└── utils/             # Utilitários
```

## 🔒 Segurança

- Autenticação via JWT
- Proteção contra CSRF
- Validação de dados
- Senhas criptografadas
- Middleware de autorização

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktops
- Tablets
- Smartphones

## 🚀 Scripts Disponíveis

```bash
npm start      # Inicia o servidor
npm run dev    # Inicia o servidor em modo desenvolvimento
npm run init-db # Inicializa o banco de dados
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push da Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐛 Bugs Conhecidos

- Nenhum bug reportado até o momento

## 📞 Suporte

Em caso de dúvidas ou problemas, abra uma issue ou entre em contato através do email: suporte@escolafelipesantos.edu.br

## ✨ Próximas Atualizações

- [ ] Integração com sistema de notificações
- [ ] Área do doador
- [ ] Dashboard com gráficos

