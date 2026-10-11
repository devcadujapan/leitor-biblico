# 📖 Registro de Leitura da Bíblia Sagrada

Um app web simples para acompanhar quais capítulos da Bíblia você já leu. Ele não exibe o texto bíblico: serve apenas para **registrar a leitura** e mostrar o seu progresso.

Feito só com HTML, CSS e JavaScript puro, sem instalação, sem servidor e sem dependências. Ideal para hospedar no GitHub Pages.

## Funcionalidades

- Os 66 livros e os 1189 capítulos, divididos em **Antigo Testamento** (39 livros, 929 capítulos) e **Novo Testamento** (27 livros, 260 capítulos).
- Livros agrupados por categoria (Pentateuco, Livros históricos, Evangelhos, Cartas de Paulo e outras), cada uma com sua cor.
- Clique no livro para abrir a lista de capítulos.
- Clique no número do capítulo para marcar como lido; clique de novo para desmarcar.
- Botões **Marcar livro inteiro** e **Limpar livro** dentro de cada livro.
- **Porcentagem geral** de leitura, com contador de capítulos lidos e porcentagem de cada testamento.
- Progresso salvo automaticamente no navegador.
- Tema escuro, colorido e responsivo (funciona no computador e no celular).
- Efeitos em JavaScript: contador animado, anel de progresso, animação ao marcar capítulos, luz que acompanha o cursor e confete ao concluir um livro, um testamento ou a Bíblia inteira.
- Respeita a configuração de "reduzir movimento" do sistema, desativando as animações para quem prefere assim.

## Estrutura do projeto

```
/
├── index.html   # estrutura da página
├── style.css    # visual, tema escuro e animações
├── script.js    # dados dos livros, lógica de leitura e efeitos
└── README.md
```

## Como usar

### Localmente

Baixe os arquivos, mantenha-os na mesma pasta e abra o `index.html` no navegador. Não precisa de mais nada.

### Hospedando no GitHub Pages

1. Crie um repositório no GitHub e envie os arquivos na raiz.
2. Vá em **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`.
4. Salve e aguarde alguns minutos. O app ficará disponível em:

```
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

## Onde ficam os dados

O progresso é guardado no **`localStorage` do seu navegador**, na chave `leitura-biblia:v1`. Isso significa que:

- Nada é enviado para servidores e não há cadastro ou login.
- Cada navegador e cada aparelho tem o seu próprio registro. O progresso feito no celular não aparece no computador.
- Limpar os dados do navegador apaga o progresso. O botão **Limpar todo o progresso**, no rodapé do app, também apaga tudo (com confirmação).

## Personalização

- **Cores dos grupos:** em `script.js`, cada grupo em `TESTAMENTS` tem um valor `hue` (de 0 a 360, a matiz da cor). Altere para mudar a cor do grupo.
- **Nomes e quantidade de capítulos:** também ficam em `TESTAMENTS`, no formato `['Nome do livro', quantidade_de_capítulos]`.
- **Tema geral:** as cores base estão nas variáveis CSS no início do `style.css` (`:root`).
- **Fonte:** o app usa a fonte Sora, do Google Fonts. Sem internet, ele usa a fonte padrão do sistema.

## Tecnologias

HTML5, CSS3 (variáveis CSS, grid, animações) e JavaScript (ES6+) puro, com `localStorage` e `canvas` para o confete.
