// Conecta os quatro cartoes JA EXISTENTES no HTML aos dados do MySQL.
// Nao cria elementos, nao modifica classes e nao toca no CSS.
(function () {
  "use strict";

  const rotas = {
    "bolos": "bolos.html",
    "kits": "kit-festa.html",
    "doces": "doces.html",
    "topos": "topos.html"
  };

  async function consultarProdutos() {
    try {
      const resposta = await fetch("/doce-conexao-api/produtos.php", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

      const produtos = await resposta.json();
      if (!Array.isArray(produtos)) throw new Error("A API nao retornou uma lista de produtos");
      window.produtosDaJoy = produtos;
      window.apiDaJoyConectada = true;

      // Protecao: so ativa a vitrine dinamica quando as quatro categorias
      // estiverem no banco. Ate la, mantem TODOS os cartoes originais.
      const porCategoria = new Map();
      for (const produto of produtos) {
        const categoria = String(produto.categoria ?? "").trim().toLocaleLowerCase("pt-BR");
        if (!Object.hasOwn(rotas, categoria)) continue;
        if (typeof produto.nome !== "string" || !produto.nome.trim()) continue;
        if (typeof produto.descricao !== "string" || !produto.descricao.trim()) continue;
        if (typeof produto.imagem !== "string" || !/^img\/[\wÀ-ÿ .()_-]+\.(?:jpe?g|png|webp)$/i.test(produto.imagem)) continue;
        if (!porCategoria.has(categoria)) porCategoria.set(categoria, produto);
      }

      if (porCategoria.size !== 4) {
        console.info("API conectada. Aguardando os quatro itens do catalogo no MySQL; visual original preservado.");
        return;
      }

      const atualizacoes = [];
      for (const [categoria, pagina] of Object.entries(rotas)) {
        const card = document.querySelector(`.lista-produtos a[href="${pagina}"]`);
        const titulo = card?.querySelector(".produto-legenda h3");
        const descricao = card?.querySelector(".produto-legenda p");
        const imagem = card?.querySelector("img");
        if (!card || !titulo || !descricao || !imagem) {
          console.warn("Cartao ausente no HTML; nenhuma alteracao feita.", pagina);
          return;
        }
        atualizacoes.push({ card, titulo, descricao, imagem, produto: porCategoria.get(categoria) });
      }

      // Reutiliza exatamente o HTML e as classes existentes. A primeira carga
      // fica visualmente IDENTICA, pois o SQL usa os textos e imagens originais.
      for (const { card, titulo, descricao, imagem, produto } of atualizacoes) {
        if (titulo.textContent.trim() !== produto.nome.trim()) {
          titulo.textContent = produto.nome.trim();
        }
        if (descricao.textContent.trim() !== produto.descricao.trim()) {
          descricao.textContent = produto.descricao.trim();
        }
        if (imagem.getAttribute("src") !== produto.imagem) {
          imagem.setAttribute("src", produto.imagem);
        }
        card.dataset.produtoId = String(produto.id);
      }
      console.info("Catalogo da Joy atualizado com os dados do MySQL (4 cartoes existentes).");
    } catch (erro) {
      window.apiDaJoyConectada = false;
      console.warn("API indisponivel: site permanece com o conteudo original.", erro);
    }
  }

  consultarProdutos();
})();
