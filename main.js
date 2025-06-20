async function carregarProdutos() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/limpinh0/esperanzabuy/main/produtos.csv');
    const csvData = await response.text();
    const prodArr = parseCSV(csvData);
    return prodArr;
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    return [];
  }
}

function parseCSV(csvData) {
  const linhas = csvData.split('\n');
  const cabecalhos = linhas[0].split(',');
  
  const produtosAr = [];
  
  for (let i = 1; i < linhas.length; i++) {
    if (linhas[i].trim() === '') continue;
    
    const valores = linhas[i].split(',');
    const produto = {};
    
    for (let j = 0; j < cabecalhos.length; j++) {
      const cabecalho = cabecalhos[j].trim();
      let valor = valores[j].trim();
      
      if (['preco', 'peso', 'stock', 'vpn'].includes(cabecalho)) {
        valor = parseFloat(valor);
      }
      
      produto[cabecalho] = valor;
    }
    
    produtosAr.push(produto);
  }
  
  return produtosAr;
}

// Variáveis globais
let produtos = [];
let carrinho = [];
let selectedCategory = null;
let selectedCategoryVPN = null;
let produtosHomeAleatorios = [];

// Função principal de inicialização
async function initApp() {
  // Carrega produtos do CSV
  produtos = await carregarProdutos();
  
  // Fallback caso o CSV não carregue
  if (produtos.length === 0) {
    produtos = [
      { nome: 'Sucata de metal', imagem: 'https://thumbs.dreamstime.com/b/sucata-met%C3%A1lica-para-oficina-de-motociclos-224852930.jpg', preco: 3, peso: 0.1, categoria: 'Metais', stock: 10, vpn: 0 },
      { nome: 'Cobre', imagem: 'https://www.freshone.com.pk/content/images/thumbs/default-image_550.png', preco: 3, peso: 0.1, categoria: 'Metais', stock: 8, vpn: 0 },
      { nome: 'Gazua', imagem: 'https://www.lusochav.pt/wp-content/uploads/2022/03/5278.png', preco: 10, peso: 0.1, categoria: 'Ferramentas', stock: 0, vpn: 0 },
      { nome: 'Antena VPN', imagem: 'https://www.freshone.com.pk/content/images/thumbs/default-image_550.png', preco: 99, peso: 1, categoria: 'Ferramentas', stock: 5, vpn: 1 },
      { nome: 'F4 Coins', imagem: 'https://www.freshone.com.pk/content/images/thumbs/default-image_550.png', preco: 31, peso: 0, categoria: 'Digital', stock: 2, vpn: 1 }
    ];
  }
  
  // Inicializa a aplicação
  showPage('home');
  updateCarrinhoBadge();
  
  // Se já tem acesso VPN, mostra o link
  if (sessionStorage.getItem('vpnAccess') === '1') {
    document.getElementById('vpnLink').classList.remove('hidden');
  }
}

    // Adiciona aviso antes de recarregar a página
    window.addEventListener('beforeunload', function(e) {
    if (carrinho.length > 0) {
        e.preventDefault();
        return false;
    }
    });

    function showPage(p) {
      document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
      document.getElementById(p).classList.remove('hidden');
      if (p === 'home') {
        produtosHomeAleatorios = []; // Limpa para forçar nova geração
        renderHomeProdutos();
      }
      if (p === 'produtos') {
        document.getElementById('sortSelect').value = 'name-asc'; // força seleção
        renderCategoryFilters();
        filterProducts();
      }
      if (p === 'carrinho') renderCarrinho();
    }

    function renderCategoryFilters() {
      const categoriesContainer = document.getElementById('categoryFilters');
      // Só categorias de produtos com vpn: 0
      const categories = [...new Set(produtos.filter(p => !p.vpn || p.vpn === 0).map(p => p.categoria))]
        .sort((a, b) => a.localeCompare(b)); // <-- Ordena alfabeticamente

      categoriesContainer.innerHTML = '';
      
      // Adiciona opção "Todas as categorias"
      const allCategories = document.createElement('div');
      allCategories.textContent = 'Todas as categorias';
      allCategories.className = `filter-category ${!selectedCategory ? 'active-category' : ''}`;
      allCategories.onclick = () => {
        selectedCategory = null;
        renderCategoryFilters();
        filterProducts();
      };
      categoriesContainer.appendChild(allCategories);
      
      // Adiciona cada categoria
      categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.textContent = category;
        categoryElement.className = `filter-category ${selectedCategory === category ? 'active-category' : ''}`;
        categoryElement.onclick = () => {
          selectedCategory = category;
          renderCategoryFilters();
          filterProducts();
        };
        categoriesContainer.appendChild(categoryElement);
      });
    }

    function filterProducts() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const sortOption = document.getElementById('sortSelect').value;
      const apenasStock = document.getElementById('apenasStock').checked;

      let filtered = produtos.filter(p => 
        (!p.vpn || p.vpn === 0) &&
        p.nome.toLowerCase().includes(searchTerm) &&
        (!selectedCategory || p.categoria === selectedCategory) &&
        (!apenasStock || p.stock > 0)
      );

      // Aplica ordenação
      switch(sortOption) {
        case 'name-asc':
          filtered.sort((a, b) => a.nome.localeCompare(b.nome));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.nome.localeCompare(a.nome));
          break;
        case 'price-asc':
          filtered.sort((a, b) => a.preco - b.preco);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.preco - a.preco);
          break;
      }
      
      renderProducts(filtered);
    }

    function renderProducts(productsToRender) {
      const lista = document.getElementById('listaProdutos');
      lista.innerHTML = '';

      if (productsToRender.length === 0) {
        lista.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
      }

      productsToRender.forEach((p, i) => {
        const originalIndex = produtos.findIndex(prod => prod.nome === p.nome);
        lista.innerHTML += `
          <div class="product">
            <img src="${p.imagem}" alt="${p.nome}">
              <p style="font-weight:bold">${p.nome}<br>
                <a href="#" class="categoria-link" style="color:#ff9900;font-weight:bold;text-decoration:underline;font-size:0.8em" onclick="filtrarPorCategoria('${p.categoria}');return false;">
                  ${p.categoria}
                </a>      
              </p>
            <p>
              <span style="font-size:1.4em;font-weight:bold;">${p.preco} $</span> <br>
              <span style="font-size:0.9em;">
                Peso: ${p.peso} kg <br>
                ${
                  p.stock === 0
                    ? '<span style="color:#d00;font-weight:bold;">Sem stock</span>'
                    : `Stock: <span style="color:#1bbf1b;font-weight:bold;">${p.stock}</span>`
                }
              </span>
            </p>
            <input type="number" id="qtd-${originalIndex}" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? 'disabled' : ''}>
            <button onclick="addCarrinho(${originalIndex})" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Adicionar ao carrinho</button>
          </div>
        `;
      });
    }

    function addCarrinho(i) {
      const qtd = parseInt(document.getElementById(`qtd-${i}`).value);
      if (isNaN(qtd) || qtd < 1 || qtd > produtos[i].stock) {
        alert('Stock insuficiente ou quantidade inválida'); 
        return;
      }
      const item = { ...produtos[i] };
      const existente = carrinho.find(p => p.nome === item.nome);
      if (existente) existente.qtd += qtd;
      else {
        item.qtd = qtd;
        carrinho.push(item);
      }
      produtos[i].stock -= qtd; 
      filterProducts();
      filterProductsVPN(); 
      updateCarrinhoBadge();
    }

    function renderCarrinho() {
      const lista = document.getElementById('listaCarrinho');
      let total = 0;
      let pesoTotal = 0;
      lista.innerHTML = '<ul>' + carrinho.map((p, i) => {
        const subTotal = p.qtd * p.preco;
        const subPeso = p.qtd * p.peso;
        total += subTotal;
        pesoTotal += subPeso;
        return `<li>${p.nome} - ${p.preco} $ × <input type="number" value="${p.qtd}" min="1" onchange="updateQtd(${i}, this.value)"> = ${subTotal.toFixed(2)} $<button class="remove" onclick="removeItem(${i})">❌</button></li>`;
      }).join('') + '</ul>';
      document.getElementById('total').textContent = `${total.toFixed(2)} $`;
      document.getElementById('pesoTotal').textContent = `${pesoTotal.toFixed(2)} kg`;
      updateCarrinhoBadge();
    }

    function updateQtd(i, novaQtd) {
      const nova = parseInt(novaQtd);
      if (!isNaN(nova) && nova >= 1) {
        const diff = nova - carrinho[i].qtd;
        const produtoOriginal = produtos.find(p => p.nome === carrinho[i].nome);
        if (produtoOriginal && produtoOriginal.stock >= diff) {
          carrinho[i].qtd = nova;
          produtoOriginal.stock -= diff;
          renderCarrinho();
          filterProducts();
        } else {
          alert('Sem stock suficiente');
          // Voltar ao valor anterior
          // Aguarde o renderCarrinho para garantir que o input existe
          setTimeout(() => {
            const input = document.querySelectorAll('#listaCarrinho input[type="number"]')[i];
            if (input) input.value = carrinho[i].qtd;
          }, 0);
        }
      }
    }

    function removeItem(i) {
      const item = carrinho.splice(i, 1)[0];
      const produtoOriginal = produtos.find(p => p.nome === item.nome);
      if (produtoOriginal) produtoOriginal.stock += item.qtd;
      filterProducts();
      updateCarrinhoBadge();
      renderCarrinho();
    }

    function addProduto() {
      const nome = document.getElementById('nome').value;
      const imagem = document.getElementById('imagem').value;
      const preco = parseFloat(document.getElementById('preco').value);
      const peso = parseFloat(document.getElementById('peso').value);
      const categoria = document.getElementById('categoria').value;
      if (nome && imagem && !isNaN(preco) && !isNaN(peso)) {
        produtos.push({ nome, imagem, preco, peso, categoria, stock: 10 });
        alert('Produto adicionado!');
        document.getElementById('nome').value = '';
        document.getElementById('imagem').value = '';
        document.getElementById('preco').value = '';
        document.getElementById('peso').value = '';
        document.getElementById('categoria').value = '';
        renderCategoryFilters();
        filterProducts();
      } else {
        alert('Preenche todos os campos corretamente.');
      }
    }

    function updateCarrinhoBadge() {
      const badge = document.getElementById('carrinhoBadge');
      if (!badge) return;
      const n = carrinho.length;
      if (n > 0) {
        badge.textContent = n;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    function filtrarPorCategoria(cat) {
        selectedCategory = cat;
        renderCategoryFilters();
        filterProducts();
    }

    function renderCategoryFiltersVPN() {
  const categoriesContainer = document.getElementById('categoryFiltersVPN');
  // Só categorias de produtos com vpn: 1
  const categories = [...new Set(produtos.filter(p => p.vpn === 1).map(p => p.categoria))]
    .sort((a, b) => a.localeCompare(b)); // <-- Ordena alfabeticamente

  categoriesContainer.innerHTML = '';
  
  // Adiciona opção "Todas as categorias"
  const allCategories = document.createElement('div');
  allCategories.textContent = 'Todas as categorias';
  allCategories.className = `filter-category ${!selectedCategoryVPN ? 'active-category' : ''}`;
  allCategories.onclick = () => {
    selectedCategoryVPN = null;
    renderCategoryFiltersVPN();
    filterProductsVPN();
  };
  categoriesContainer.appendChild(allCategories);
  
  // Adiciona cada categoria
  categories.forEach(category => {
    const categoryElement = document.createElement('div');
    categoryElement.textContent = category;
    categoryElement.className = `filter-category ${selectedCategoryVPN === category ? 'active-category' : ''}`;
    categoryElement.onclick = () => {
      selectedCategoryVPN = category;
      renderCategoryFiltersVPN();
      filterProductsVPN();
    };
    categoriesContainer.appendChild(categoryElement);
  });
}

function filterProductsVPN() {
  const searchTerm = document.getElementById('searchInputVPN').value.toLowerCase();
  const sortOption = document.getElementById('sortSelectVPN').value;
  const apenasStock = document.getElementById('apenasStockVPN').checked;

  let filtered = produtos.filter(p =>
    p.vpn === 1 &&
    p.nome.toLowerCase().includes(searchTerm) &&
    (!selectedCategoryVPN || p.categoria === selectedCategoryVPN) &&
    (!apenasStock || p.stock > 0)
  );

  // Aplica ordenação
  switch (sortOption) {
    case 'name-asc':
      filtered.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.nome.localeCompare(a.nome));
      break;
    case 'price-asc':
      filtered.sort((a, b) => a.preco - b.preco);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.preco - a.preco);
      break;
  }
  renderProductsVPN(filtered);
}

function renderProductsVPN(productsToRender) {
  const lista = document.getElementById('listaProdutosVPN');
  lista.innerHTML = '';

  if (productsToRender.length === 0) {
    lista.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  productsToRender.forEach((p, i) => {
    const originalIndex = produtos.findIndex(prod => prod.nome === p.nome);
    lista.innerHTML += `
      <div class="product">
            <img src="${p.imagem}" alt="${p.nome}">
              <p style="font-weight:bold">${p.nome}<br>
                <a href="#" class="categoria-link" style="color:#ff9900;font-weight:bold;text-decoration:underline;font-size:0.8em" onclick="filtrarPorCategoria('${p.categoria}');return false;">
                  ${p.categoria}
                </a>      
              </p>
            <p>
              <span style="font-size:1.4em;font-weight:bold;">${p.preco} $</span> <br>
              <span style="font-size:0.9em;">
                Peso: ${p.peso} kg <br>
                ${
                  p.stock === 0
                    ? '<span style="color:#d00;font-weight:bold;">Sem stock</span>'
                    : `Stock: <span style="color:#1bbf1b;font-weight:bold;">${p.stock}</span>`
                }
              </span>
            </p>
            <input type="number" id="qtd-${originalIndex}" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? 'disabled' : ''}>
            <button onclick="addCarrinho(${originalIndex})" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Adicionar ao carrinho</button>
          </div>
    `;
  });
}

function filtrarPorCategoriaVPN(cat) {
  selectedCategoryVPN = cat;
  renderCategoryFiltersVPN();
  filterProductsVPN();
}

function checkVPNAccess() {
  // Se já tem acesso, não pede IP novamente
  if (sessionStorage.getItem('vpnAccess') === '1') {
    document.getElementById('vpnLink').classList.remove('hidden');
    showPage('vpn');
    renderCategoryFiltersVPN();
    filterProductsVPN();
    return;
  }
  const today = new Date().getDate();
  const ipEsperado = atob('MTY5LjEuMS4=') + today;
  const ipUser = prompt("Introduza o IP para aceder à área VPN:");
  if (ipUser === ipEsperado) {
    sessionStorage.setItem('vpnAccess', '1');
    document.getElementById('vpnLink').classList.remove('hidden');
    showPage('vpn');
    renderCategoryFiltersVPN();
    filterProductsVPN();
  } else {
    alert('IP incorreto!');
  }
}
document.getElementById('vpnLink').onclick = function(e) {
  e.preventDefault();
  checkVPNAccess();
};

    document.getElementById('toggleTheme').onclick = function() {
  document.body.classList.toggle('dark-mode');
  // Troca o ícone do botão
  this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  // Guarda preferência
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};
// Aplica o tema salvo ou o do sistema ao carregar
window.addEventListener('DOMContentLoaded', function() {
  let theme = localStorage.getItem('theme');
  if (!theme) {
    // Detecta preferência do sistema
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('toggleTheme').textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('toggleTheme').textContent = '🌙';
  }
  // Inicia a aplicação
  initApp();
});

function renderHomeProdutos() {
  const homeProdutosDiv = document.getElementById('homeProdutos');
  // Só gera novos produtos aleatórios se ainda não existirem
  if (produtosHomeAleatorios.length === 0) {
    const produtosNormais = produtos.filter(p => !p.vpn || p.vpn === 0);
    produtosHomeAleatorios = produtosNormais
      .sort(() => Math.random() - 0.5)
      .slice(0, 9);
  }

  homeProdutosDiv.innerHTML = '';
  produtosHomeAleatorios.forEach((p, i) => {
    const originalIndex = produtos.findIndex(prod => prod.nome === p.nome);
    homeProdutosDiv.innerHTML += `
      <div class="product">
            <img src="${p.imagem}" alt="${p.nome}">
              <p style="font-weight:bold">${p.nome}<br>
                <a href="#" class="categoria-link" style="color:#ff9900;font-weight:bold;text-decoration:underline;font-size:0.8em" onclick="filtrarPorCategoria('${p.categoria}');return false;">
                  ${p.categoria}
                </a>      
              </p>
            <p>
              <span style="font-size:1.4em;font-weight:bold;">${p.preco} $</span> <br>
              <span style="font-size:0.9em;">
                Peso: ${p.peso} kg <br>
                ${
                  p.stock === 0
                    ? '<span style="color:#d00;font-weight:bold;">Sem stock</span>'
                    : `Stock: <span style="color:#1bbf1b;font-weight:bold;">${p.stock}</span>`
                }
              </span>
            </p>
            <input type="number" id="qtd-${originalIndex}" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? 'disabled' : ''}>
            <button onclick="addCarrinho(${originalIndex})" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Adicionar ao carrinho</button>
          </div>
    `;
  });
}

// Sempre que entrar na home, gera nova lista aleatória
function showPage(p) {
  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById(p).classList.remove('hidden');
  if (p === 'home') {
    produtosHomeAleatorios = []; // Limpa para forçar nova geração
    renderHomeProdutos();
  }
  if (p === 'produtos') {
    document.getElementById('sortSelect').value = 'name-asc'; // força seleção
    renderCategoryFilters();
    filterProducts();
  }
  if (p === 'carrinho') renderCarrinho();
}

function addCarrinhoHome(i) {
  const qtd = parseInt(document.getElementById(`qtd-home-${i}`).value);
  if (isNaN(qtd) || qtd < 1 || qtd > produtos[i].stock) {
    alert('Stock insuficiente ou quantidade inválida'); 
    return;
  }
  const item = { ...produtos[i] };
  const existente = carrinho.find(p => p.nome === item.nome);
  if (existente) existente.qtd += qtd;
  else {
    item.qtd = qtd;
    carrinho.push(item);
  }
  produtos[i].stock -= qtd; 
  renderHomeProdutos();
  filterProducts();
  filterProductsVPN();
  updateCarrinhoBadge();
}

function copiarResumoCarrinho() {
  let texto = '';
  let total = 0;
  let pesoTotal = 0;
  carrinho.forEach(item => {
    const subTotal = item.qtd * item.preco;
    const subPeso = item.qtd * item.peso;
    texto += `${item.nome} - ${item.qtd} x $${item.preco}  = $${subTotal.toFixed(2)}\n`;
    total += subTotal;
    pesoTotal += subPeso;
  });
  const fatura = document.getElementById('fatura').checked ? 'Sim' : 'Não';
  const cpEntrega = document.getElementById('cpEntrega').value || '---';
  texto += `CP de entrega: ${cpEntrega}\n`;
  texto += `Deseja fatura? ${fatura}\n`;
  texto += `Total: ${total.toFixed(2)} $\n`;
  texto += `Peso Total: ${pesoTotal.toFixed(2)} kg`;

  // Copia para o clipboard
  navigator.clipboard.writeText(texto).then(() => {
    alert('Carrinho copiado, pode agora colar o carrinho por mensagem para um dos contactos disponíveis! \n\nVerifique se o mesmo está de serviço.');
  });
}


showPage('home');
