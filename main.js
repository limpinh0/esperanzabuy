const BASEAPI = "https://api.esperanzabuy.pt";
async function carregarProdutos() {
	try {
		const response = await fetch(BASEAPI + "/shop");
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Erro ao carregar produtos:", error);
		return [];
	}
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
			{
				name: "Sucata de metal",
				image: "https://thumbs.dreamstime.com/b/sucata-met%C3%A1lica-para-oficina-de-motociclos-224852930.jpg",
				price: 3,
				weight: 0.1,
				category: "Metais",
				stock: 10,
				vpn: 0,
			},
			{ name: "Cobre", image: "https://www.freshone.com.pk/content/images/thumbs/default-image_550.png", price: 3, weight: 0.1, category: "Metais", stock: 8, vpn: 0 },
			{ name: "Gazua", image: "https://www.lusochav.pt/wp-content/uploads/2022/03/5278.png", price: 10, weight: 0.1, category: "Ferramentas", stock: 0, vpn: 0 },
			{ name: "Antena VPN", image: "https://www.freshone.com.pk/content/images/thumbs/default-image_550.png", price: 99, weight: 1, category: "Ferramentas", stock: 5, vpn: 1 },
			{ name: "F4 Coins", image: "https://www.freshone.com.pk/content/images/thumbs/default-image_550.png", price: 31, weight: 0, category: "Digital", stock: 2, vpn: 1 },
		];
	}

	// Inicializa a aplicação
	carregarAnuncios();
	showPage("home");
	updateCarrinhoBadge();

	// Se já tem acesso VPN, mostra o link
	/* if (sessionStorage.getItem("vpnAccess") === "1") {
		document.getElementById("vpnLink").classList.remove("hidden");
	} */
}

// Adiciona aviso antes de recarregar a página
window.addEventListener("beforeunload", function (e) {
	if (carrinho.length > 0) {
		e.preventDefault();
		return false;
	}
});

function showPage(p) {
	document.querySelectorAll(".container").forEach((el) => el.classList.add("hidden"));
	document.getElementById(p).classList.remove("hidden");
	if (p === "home") {
		produtosHomeAleatorios = []; // Limpa para forçar nova geração
		renderHomeProdutos();
	}
	if (p === "produtos") {
		document.getElementById("sortSelect").value = "name-asc"; // força seleção
		renderCategoryFilters();
		filterProducts();
		// Scroll suave para o topo da secção produtos
	}
	if (p === "carrinho") renderCarrinho(); 

	if (p === "compramos") {renderCompramos();}
}

function renderCategoryFilters() {
	const categoriesContainer = document.getElementById("categoryFilters");
	// Só categorys de produtos com vpn: 0
	const categories = [...new Set(produtos.filter((p) => (!p.vpn || p.vpn === 0) && p.active).map((p) => p.category))].sort((a, b) => a.localeCompare(b)); // <-- Ordena alfabeticamente

	categoriesContainer.innerHTML = "";

	// Adiciona opção "Todas as categorys"
	const allCategories = document.createElement("div");
	allCategories.textContent = "Todas as categorias";
	allCategories.className = `filter-category ${!selectedCategory ? "active-category" : ""}`;
	allCategories.onclick = () => {
		selectedCategory = null;
		renderCategoryFilters();
		filterProducts();
	};
	categoriesContainer.appendChild(allCategories);

	// Adiciona cada category
	categories.forEach((category) => {
		const categoryElement = document.createElement("div");
		categoryElement.textContent = category;
		categoryElement.className = `filter-category ${selectedCategory === category ? "active-category" : ""}`;
		categoryElement.onclick = () => {
			selectedCategory = category;
			renderCategoryFilters();
			filterProducts();
		};
		categoriesContainer.appendChild(categoryElement);
	});
}

function filterProducts() {
	const searchTerm = document.getElementById("searchInput").value.toLowerCase();
	const sortOption = document.getElementById("sortSelect").value;
	const apenasStock = document.getElementById("apenasStock").checked;
	const apenasPromo = document.getElementById("apenasPromo")?.checked; // novo

	let filtered = produtos.filter(
		(p) =>
			(!p.vpn || p.vpn === 0) &&
			p.name.toLowerCase().includes(searchTerm) &&
			(!selectedCategory || p.category === selectedCategory) &&
			(!apenasStock || p.stock > 0) &&
			(!apenasPromo || (p.promo && p.promo > p.price))
	);

	// Aplica ordenação
	switch (sortOption) {
		case "name-asc":
			filtered.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case "name-desc":
			filtered.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case "price-asc":
			filtered.sort((a, b) => a.price - b.price);
			break;
		case "price-desc":
			filtered.sort((a, b) => b.price - a.price);
			break;
	}

	renderProducts(filtered);
}

function renderProducts(productsToRender) {
	const lista = document.getElementById("listaProdutos");
	lista.innerHTML = "";

	if (productsToRender.length === 0) {
		lista.innerHTML = "<p>Nenhum produto encontrado.</p>";
		return;
	}

	productsToRender.forEach((p, i) => {
		if (!p.active) return;
		const originalIndex = produtos.findIndex((prod) => prod.name === p.name);
		// Calcula promoção se existir
		let promoBadge = "";
		if (p.promo > p.price) {
			const desconto = Math.round((100 * (p.promo - p.price)) / p.promo);
			promoBadge = `
      <div class="promo-badge">
        Promoção ${desconto}%<br>
        <span class="promo-antes">Antes ${p.promo} $</span>
      </div>
      `;
		}
		lista.innerHTML += `
      <div class="product">
      ${promoBadge}
      <div class="product-img">
        <img src="https://api.esperanzabuy.pt/img/${p.image}" alt="${p.name}">
      </div>
        <p style="font-weight:bold">${p.name}<br>
        <a href="#" class="category-link" style="color:#ff9900;font-weight:bold;text-decoration:underline;font-size:0.8em" onclick="filtrarPorcategory('${p.category}');return false;">
          ${p.category}
        </a>    
        </p>
      <p>
        <span style="font-size:1.4em;font-weight:bold;">${p.price} $</span> <br>
        <span style="font-size:0.9em;">
        Peso: ${p.weight} kg <br>
        ${p.stock === 0 ? '<span style="color:#d00;font-weight:bold;">Sem stock</span>' : `Stock: <span style="color:#1bbf1b;font-weight:bold;">${p.stock}</span>`}
        </span>
      </p>
      <input type="number" id="qtd-${originalIndex}" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? "disabled" : ""}>
      <button onclick="addCarrinho(${originalIndex})" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ""}>Adicionar ao carrinho</button>
      </div>
    `;
	});
}

function addCarrinho(i) {
	const qtd = parseInt(document.getElementById(`qtd-${i}`).value);
	if (isNaN(qtd) || qtd < 1 || qtd > produtos[i].stock) {
		alert("Stock insuficiente ou quantidade inválida");
		return;
	}
	const item = { ...produtos[i] };
	const existente = carrinho.find((p) => p.name === item.name);
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
	const lista = document.getElementById("listaCarrinho");
	let total = 0;
	let pesoTotal = 0;
	lista.innerHTML =
		"<ul>" +
		carrinho
			.map((p, i) => {
				const subTotal = p.qtd * p.price;
				const subPeso = p.qtd * p.weight;
				total += subTotal;
				pesoTotal += subPeso;
				return `<li>${p.name} - ${p.price} $ × <input type="number" value="${p.qtd}" min="1" onchange="updateQtd(${i}, this.value)"> = ${subTotal.toFixed(
					2
				)} $<button class="remove" onclick="removeItem(${i})">❌</button></li>`;
			})
			.join("") +
		"</ul>";
	document.getElementById("total").textContent = `${total.toFixed(2)} $`;
	document.getElementById("pesoTotal").textContent = `${pesoTotal.toFixed(2)} kg`;
	updateCarrinhoBadge();
}

function updateQtd(i, novaQtd) {
	const nova = parseInt(novaQtd);
	if (!isNaN(nova) && nova >= 1) {
		const diff = nova - carrinho[i].qtd;
		const produtoOriginal = produtos.find((p) => p.name === carrinho[i].name);
		if (produtoOriginal && produtoOriginal.stock >= diff) {
			carrinho[i].qtd = nova;
			produtoOriginal.stock -= diff;
			renderCarrinho();
			filterProducts();
		} else {
			alert("Sem stock suficiente");
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
	const produtoOriginal = produtos.find((p) => p.name === item.name);
	if (produtoOriginal) produtoOriginal.stock += item.qtd;
	filterProducts();
	updateCarrinhoBadge();
	renderCarrinho();
}

function addProduto() {
	const name = document.getElementById("name").value;
	const image = document.getElementById("imagem").value;
	const price = parseFloat(document.getElementById("price").value);
	const peso = parseFloat(document.getElementById("peso").value);
	const category = document.getElementById("category").value;
	if (name && image && !isNaN(price) && !isNaN(peso)) {
		produtos.push({ name, image, price, weight, category, stock: 10 });
		alert("Produto adicionado!");
		document.getElementById("name").value = "";
		document.getElementById("imagem").value = "";
		document.getElementById("price").value = "";
		document.getElementById("weight").value = "";
		document.getElementById("category").value = "";
		renderCategoryFilters();
		filterProducts();
	} else {
		alert("Preenche todos os campos corretamente.");
	}
}

function updateCarrinhoBadge() {
	const badge = document.getElementById("carrinhoBadge");
	if (!badge) return;
	const n = carrinho.length;
	if (n > 0) {
		badge.textContent = n;
		badge.style.display = "inline-block";
	} else {
		badge.style.display = "none";
	}
}

function filtrarPorcategory(cat) {
	selectedCategory = cat;
	renderCategoryFilters();
	filterProducts();
}

function renderCategoryFiltersVPN() {
	const categoriesContainer = document.getElementById("categoryFiltersVPN");
	// Só categorys de produtos com vpn: 1
	const categories = [...new Set(produtos.filter((p) => p.vpn === 1).map((p) => p.category))].sort((a, b) => a.localeCompare(b)); // <-- Ordena alfabeticamente

	categoriesContainer.innerHTML = "";

	// Adiciona opção "Todas as categorys"
	const allCategories = document.createElement("div");
	allCategories.textContent = "Todas as categorias";
	allCategories.className = `filter-category ${!selectedCategoryVPN ? "active-category" : ""}`;
	allCategories.onclick = () => {
		selectedCategoryVPN = null;
		renderCategoryFiltersVPN();
		filterProductsVPN();
	};
	categoriesContainer.appendChild(allCategories);

	// Adiciona cada category
	categories.forEach((category) => {
		const categoryElement = document.createElement("div");
		categoryElement.textContent = category;
		categoryElement.className = `filter-category ${selectedCategoryVPN === category ? "active-category" : ""}`;
		categoryElement.onclick = () => {
			selectedCategoryVPN = category;
			renderCategoryFiltersVPN();
			filterProductsVPN();
		};
		categoriesContainer.appendChild(categoryElement);
	});
}

function filterProductsVPN() {
	const searchTerm = document.getElementById("searchInputVPN").value.toLowerCase();
	const sortOption = document.getElementById("sortSelectVPN").value;
	const apenasStock = document.getElementById("apenasStockVPN").checked;
	const apenasPromo = document.getElementById("apenasPromoVPN")?.checked; // novo

	let filtered = produtos.filter(
		(p) =>
			p.vpn === 1 &&
			p.name.toLowerCase().includes(searchTerm) &&
			(!selectedCategoryVPN || p.category === selectedCategoryVPN) &&
			(!apenasStock || p.stock > 0) &&
			(!apenasPromo || (p.promo && p.promo > p.price))
	);

	// Aplica ordenação
	switch (sortOption) {
		case "name-asc":
			filtered.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case "name-desc":
			filtered.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case "price-asc":
			filtered.sort((a, b) => a.price - b.price);
			break;
		case "price-desc":
			filtered.sort((a, b) => b.price - a.price);
			break;
	}
	renderProductsVPN(filtered);
}

function renderProductsVPN(productsToRender) {
	const lista = document.getElementById("listaProdutosVPN");
	lista.innerHTML = "";

	if (productsToRender.length === 0) {
		lista.innerHTML = "<p>Nenhum produto encontrado.</p>";
		return;
	}

	productsToRender.forEach((p, i) => {
		if (!p.active) return;
		const originalIndex = produtos.findIndex((prod) => prod.name === p.name);
		// Calcula promoção se existir
		let promoBadge = "";
		if (p.promo > p.price) {
			const desconto = Math.round((100 * (p.promo - p.price)) / p.promo);
			promoBadge = `
      <div class="promo-badge">
        Promoção ${desconto}%<br>
        <span class="promo-antes">Antes ${p.promo} $</span>
      </div>
      `;
		}
		lista.innerHTML += `
     <div class="product">
      ${promoBadge}
      <div class="product-img">
        <img src="https://api.esperanzabuy.pt/img/${p.image}" alt="${p.name}">
      </div>
        <p style="font-weight:bold">${p.name}<br>
        <a href="#" class="category-link" style="color:#ff9900;font-weight:bold;text-decoration:underline;font-size:0.8em" onclick="filtrarPorcategory('${p.category}');return false;">
          ${p.category}
        </a>    
        </p>
      <p>
        <span style="font-size:1.4em;font-weight:bold;">${p.price} $</span> <br>
        <span style="font-size:0.9em;">
        Peso: ${p.weight} kg <br>
        ${p.stock === 0 ? '<span style="color:#d00;font-weight:bold;">Sem stock</span>' : `Stock: <span style="color:#1bbf1b;font-weight:bold;">${p.stock}</span>`}
        </span>
      </p>
      <input type="number" id="qtd-${originalIndex}" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? "disabled" : ""}>
      <button onclick="addCarrinho(${originalIndex})" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ""}>Adicionar ao carrinho</button>
      </div>
  `;
	});
}

async function checkVPNAccess() {
	// Se já tem acesso, não pede IP novamente
	//! security problem, they will need to type the pass everytime they want to check the VPN protected area.
	/* if (sessionStorage.getItem("vpnAccess") === "1") {
		document.getElementById("vpnLink").classList.remove("hidden");
		showPage("vpn");
		renderCategoryFiltersVPN();
		filterProductsVPN();
		return;
	} */
	const ipUser = prompt("Introduza o IP para aceder à área VPN:");
	const response = await fetch(BASEAPI + "/unlock-items", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ code: ipUser })
	});
	const res = await response.json();
	if (response.ok) {
		produtos = res;
		document.getElementById("vpnLink").classList.remove("hidden");
		showPage("vpn");
		renderCategoryFiltersVPN();
		filterProductsVPN();
	} else {
		alert("IP incorreto!");
	}
}
document.getElementById("vpnLink").onclick = async function (e) {
	e.preventDefault();
	await checkVPNAccess();
};

document.getElementById("toggleTheme").onclick = function () {
	document.body.classList.toggle("dark-mode");
	// Troca o ícone do botão
	this.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
	// Guarda preferência
	localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
};
// Aplica o tema salvo ou o do sistema ao carregar
window.addEventListener("DOMContentLoaded", function () {
	let theme = localStorage.getItem("theme");
	if (!theme) {
		// Detecta preferência do sistema
		theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	if (theme === "dark") {
		document.body.classList.add("dark-mode");
		document.getElementById("toggleTheme").textContent = "☀️";
	} else {
		document.body.classList.remove("dark-mode");
		document.getElementById("toggleTheme").textContent = "🌙";
	}
	// Inicia a aplicação
	initApp();
});

function renderHomeProdutos() {
	const homeProdutosDiv = document.getElementById("homeProdutos");
	// Só gera novos produtos aleatórios se ainda não existirem
	if (produtosHomeAleatorios.length === 0) {
		const produtosNormais = produtos.filter((p) => !p.vpn || p.vpn === 0);

		// Prioriza produtos em promoção (promo > price) e com stock > 0
		const emPromo = produtosNormais.filter((p) => p.promo && p.promo > p.price && p.stock > 0);
		const semPromo = produtosNormais.filter((p) => (!(p.promo && p.promo > p.price) || !p.promo) && p.stock > 0);

		// Embaralha cada grupo separadamente
		const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
		const emPromoShuffled = shuffle(emPromo);
		const semPromoShuffled = shuffle(semPromo);

		// Junta, dando prioridade aos em promoção, e pega os 9 primeiros
		produtosHomeAleatorios = [...emPromoShuffled, ...semPromoShuffled].slice(0, 12);
	}

	homeProdutosDiv.innerHTML = "";
	produtosHomeAleatorios.forEach((p, i) => {
		if (!p.active) return;
		const originalIndex = produtos.findIndex((prod) => prod.name === p.name);
		// Badge de promoção se aplicável
		let promoBadge = "";
		if (p.promo && p.promo > p.price) {
			const desconto = Math.round((100 * (p.promo - p.price)) / p.promo);
			promoBadge = `
    <div class="promo-badge">
      Promoção ${desconto}%<br>
      <span class="promo-antes">Antes ${p.promo} $</span>
    </div>
    `;
		}
		homeProdutosDiv.innerHTML += `
    <div class="product">
    ${promoBadge}
    <div class="product-img">
      <img src="https://api.esperanzabuy.pt/img/${p.image}" alt="${p.name}">
    </div>
    <p style="font-weight:bold">${p.name}<br>
      <a href="#" class="category-link" style="color:#ff9900;font-weight:bold;text-decoration:underline;font-size:0.8em" onclick="filtrarPorcategory('${p.category}');return false;">
      ${p.category}
      </a>    
    </p>
    <p>
      <span style="font-size:1.4em;font-weight:bold;">${p.price} $</span> <br>
      <span style="font-size:0.9em;">
      Peso: ${p.weight} kg <br>
      ${p.stock === 0 ? '<span style="color:#d00;font-weight:bold;">Sem stock</span>' : `Stock: <span style="color:#1bbf1b;font-weight:bold;">${p.stock}</span>`}
      </span>
    </p>
    <input type="number" id="qtd-home-${originalIndex}" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? "disabled" : ""}>
    <button onclick="addCarrinhoHome(${originalIndex})" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ""}>Adicionar ao carrinho</button>
    </div>
  `;
	});
}

 

function addCarrinhoHome(i) {
	const qtd = parseInt(document.getElementById(`qtd-home-${i}`).value);
	if (isNaN(qtd) || qtd < 1 || qtd > produtos[i].stock) {
		alert("Stock insuficiente ou quantidade inválida");
		return;
	}
	const item = { ...produtos[i] };
	const existente = carrinho.find((p) => p.name === item.name);
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

async function copiarResumoCarrinho() {
	let texto = "";
	let total = 0;
	let pesoTotal = 0;

	 (async () => {
		const fatura = document.getElementById("fatura").checked ? "Sim" : "Não";
		const cpEntrega = document.getElementById("cpEntrega").value || "---";
		carrinho.forEach((item) => {
			const subTotal = item.qtd * item.price;
			const subPeso = item.qtd * item.weight;
			texto += `${item.name} - ${item.qtd} x ${item.price} $ = ${subTotal.toFixed(2)} $\n`;
			total += subTotal;
			pesoTotal += subPeso;
		});
		texto += `CP de entrega: ${cpEntrega}\n`;
		texto += `Deseja fatura? ${fatura}\n`;
		texto += `Total: ${total.toFixed(2)} $ + Transporte\n`;
		texto += `Peso Total: ${pesoTotal.toFixed(2)} kg`;
		const response = await fetch(BASEAPI + "/order", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				items: carrinho.map(item => ({
					name: item.name,
					quantity: item.qtd,
					price: item.price,
					weight: item.weight
				})),
				finalPrice: total.toFixed(2),
				totalWeight: pesoTotal.toFixed(2),
				meetingPlace: cpEntrega
			})
		});

		if (response.ok) console.log("all good, order placed!");

		const res = await response.json();
		texto = `Encomenda: ${res.orderId}\n\n` + texto;
		texto = texto + '\n\nTaxa de Transporte 150$ + 25$ por quilómetro.'
		 // Copia imediatamente ao clicar
    try {
        await navigator.clipboard.writeText(texto);
        alert("Carrinho copiado, pode agora colar o carrinho por mensagem para o Instapic @EsperanzaBuy! \n\nIremos responder assim que possível.");
    } catch (e) {
        alert("Não foi possível copiar para a área de transferência. Informe-nos desta situação em Instapic @EsperanzaBuy!");
    }

	})();

	// cool object for webhook if we use it in the future
	/* const data = {
		content: texto + `\nA encomenda expira em <t:${Math.floor((Date.now() + 2 * 60 * 60 * 1000) / 1000)}:R>`
	} */
}

// NOVO CÓDIGO PARA CARREGAR ANÚNCIOS
async function carregarAnuncios() {
    const response = await fetch('https://raw.githubusercontent.com/limpinh0/esperanzabuy/refs/heads/main/anuncios.csv');
    const csv = await response.text();
    const hoje = new Date();
    const hojeStr = hoje.getFullYear().toString() +
        String(hoje.getMonth() + 1).padStart(2, '0') +
        String(hoje.getDate()).padStart(2, '0');

    const linhas = csv.trim().split('\n');
    const headers = linhas[0].split(',');
    const anuncios = linhas.slice(1).map(linha => {
        const campos = linha.split(',');
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = campos[i]?.trim());
        return obj;
    }).filter(a => a.date >= hojeStr); 

    function setAd(divId, url, href, duration = 6000, progress = 1) {
        const el = document.getElementById(divId);
        if (el) {
            // Overlay HTML
            const overlay = `<div style="
				position:absolute;
				bottom:0px;w
				right:1px;
				background:rgba(0,0,0,0.3);
				color:rgba(255,255,255,0.4);
				font-size:8px;
				font-weight:bold;
				padding:2px 7px;
				border-radius:6px;
				z-index:2;
				pointer-events:none;
			">PUBLICIDADE</div>`;

            // Barrinha de tempo
            const barraId = `${divId}-progress-bar`;
const barra = `<div id="${barraId}" class="ad-progress-bar" style="
    position:absolute;
    left:0; right:0;
    bottom:1px;
    height:1px;
    background:linear-gradient(90deg,#ff9900 85%,#fff0 100%);
    width:${Math.max(0, Math.min(1, progress)) * 100}%;
    z-index:1;
    transition:width 0.2s linear;
    pointer-events:none;
"></div>`;

            el.style.position = "relative";

            if (divId === 'ads-fixed-container-left' || divId === 'ads-fixed-container-right') {
                if (!url || url.trim() === "") {
                    el.innerHTML = '<span  style="font-weight:bold;color:#ff9900;font-size:1.1rem;text-align:center;">ANUNCIE<br>AQUI!</span><br><span style="font-size:0.9rem;color:#ff9900;text-align:center;">Entre em contacto para mais informações.<br>200x250</span>'
                    el.style.width = "200px";
                    el.style.height = "250px";
                    el.style.border = "1px dashed #ff9900";
                    el.style.borderRadius = "12px";
                    el.style.display = "flex";
                    el.style.flexDirection = "column";
                    el.style.justifyContent = "center";
                    el.style.alignItems = "center";
                    el.style.position = "sticky";
					el.style.top = "40px"; // Alinha ao topo como .container 
                } else {
                    el.innerHTML = `
            <div style="position:relative;width:200px;height:250px;">
                <a href="${href}" target="_blank" rel="noopener">
                    <img src="${url}" style="width:200px;height:250px;object-fit:contain;border-radius:12px;">
                </a>
                ${barra}
                ${overlay}
            </div>
        `;
					el.style.width = "200px";
					el.style.height = "250px";
					el.style.border = "0px";
					el.style.display = "flex";
					el.style.flexDirection = "column";
					el.style.justifyContent = "center";
					el.style.alignItems = "center"; 
					el.style.boxSizing = "border-box";
                    el.style.position = "sticky";
					el.style.top = "40px"; // Alinha ao topo como .container 
                }
            }

            if (divId === 'header-ad-top-left' || divId === 'header-ad-top-right') {
                if (!url || url.trim() === "") {
                    el.innerHTML = '<span style="font-weight:bold;color:#ff9900;font-size:1.1rem;text-align:center;">ANUNCIE<br>AQUI!</span><br><span style="font-size:0.9rem;color:#ff9900;text-align:center;margin-top:8px;">Entre em contacto para mais informações.<br>250x250</span>' ;
                    el.style.width = "250px";
                    el.style.height = "250px";
                    el.style.border = "1px dashed #ff9900";
                    el.style.borderRadius = "12px";
                    el.style.display = "flex";
                    el.style.flexDirection = "column";
                    el.style.justifyContent = "center";
                    el.style.alignItems = "center";
                } else {
                    el.innerHTML = `
            <div style="position:relative;width:250px;height:250px;">
                <a href="${href}" target="_blank" rel="noopener">
                    <img src="${url}" style="width:250px;height:250px;object-fit:contain;border-radius:12px;">
                </a>
                ${barra}
                ${overlay}
            </div>
        `;
                    el.style.width = "250px";
                    el.style.height = "250px";
                    el.style.border = "0px";
                }
            }
        }
    }

    ['l_top', 'r_top', 'l_lat', 'r_lat'].forEach(pos => {
    const staticAd = anuncios.find(a => a.type === 'static' && a.pos === pos);
    if (staticAd) {
        if (pos === 'l_top') setAd('header-ad-top-left', staticAd.url, staticAd.href, 6000, 0);
        if (pos === 'r_top') setAd('header-ad-top-right', staticAd.url, staticAd.href, 6000, 0);
        if (pos === 'l_lat') setAd('ads-fixed-container-left', staticAd.url, staticAd.href, 6000, 0);
        if (pos === 'r_lat') setAd('ads-fixed-container-right', staticAd.url, staticAd.href, 6000, 0);
    } else {
        let rotAds = anuncios.filter(a => a.type === 'rotation' && a.pos === pos); 
        if (rotAds.length > 0) {
            // Adiciona um ciclo extra para o "ANUNCIE AQUI"
            rotAds = [...rotAds, { url: "", type: "rotation", pos }];

            let idx = 0;
            let startTime = Date.now();
            let intervalId = null;
            const divId =
                pos === 'l_top' ? 'header-ad-top-left' :
                pos === 'r_top' ? 'header-ad-top-right' :
                pos === 'l_lat' ? 'ads-fixed-container-left' :
                pos === 'r_lat' ? 'ads-fixed-container-right' : '';

            const barraId = `${divId}-progress-bar`;

            function rotate() {
                let progress = 1;
                if (intervalId) clearInterval(intervalId);
                startTime = Date.now();

                function updateBar() {
                    const elapsed = Date.now() - startTime;
                    const progress = 1 - Math.min(elapsed / 6000, 1);
                    const barraEl = document.getElementById(barraId);
                    if (barraEl) {
                        barraEl.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
                    }
                    if (progress > 0) {
                        requestAnimationFrame(updateBar);
                    }
                }
                updateBar();

                intervalId = setTimeout(() => {
                    idx = (idx + 1) % rotAds.length;
                    setAd(divId, rotAds[idx].url, rotAds[idx].href, 6000, 1);
                    rotate();
                }, 6000);
            }

            setAd(divId, rotAds[idx].url, rotAds[idx].href, 6000, 1);
            rotate();
        }
    }
});
}

function renderCompramos() {
    const produtosCompramos = produtos
        .filter(p =>
            (p.name === "Ácido de bateria" ||
                p.name === "Kit eletrónico" ||
                (p.category === "Minérios" && p.stock < 200) || 
				(p.name === "Tábuas de madeira" && p.category === "Materiais" && p.stock < 200) ||
				(p.name !== "Tábuas de madeira" && p.category === "Materiais" && p.stock < 500)) &&
				p.name !== "Thermite" &&
				p.name !== "Couro" &&
            	p.active &&
            	(!p.vpn || p.vpn === 0)
        )
        .sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.name.localeCompare(b.name);
        });

    let html = `
         <table class="compramos-table">
            <thead>
                <tr>
                    <th class="compramos-th compramos-th-produto">Produto</th>
                    <th class="compramos-th">Categoria</th>
                    <th class="compramos-th">Preço compra</th>
                    <th class="compramos-th">Quantidade</th>
                    <th class="compramos-th compramos-th-total">Total linha</th>
                </tr>
            </thead>
            <tbody>
    `;

    produtosCompramos.forEach((p, idx) => {
        const precoCompra = (p.price * 0.75).toFixed(2).replace('.', ',');
		html += `
			<tr class="compramos-tr">
			<td class="compramos-td compramos-td-produto">
				<img src="https://api.esperanzabuy.pt/img/${p.image}" alt="${p.name}" style="width:32px;height:32px;object-fit:scale-down;vertical-align:middle;margin-right:6px;border-radius:4px;">
				${p.name}
			</td>
			<td class="compramos-td">${p.category}</td>
			<td class="compramos-td" align="right" id="preco-compra-${idx}">${precoCompra}</td>
			<td class="compramos-td" align="center">
				<input type="number" min="0" value="0" class="compramos-input"
				onchange="atualizaTotalLinhaCompramos(${idx})"
				id="compramos-qtd-${idx}"
				step="1"
				oninput="this.value = this.value.replace(/[^0-9]/g, '');"
				>
			</td>
			<td class="compramos-td compramos-td-total" align="right" id="compramos-total-linha-${idx}">0,00</td>
			</tr>
		`;
    });

    html += `</tbody></table>`;
    document.getElementById("compramos-lista").innerHTML = html;
    document.getElementById("compramos-total").textContent = "0,00";
    window.atualizaTotalLinhaCompramos = function(idx) {
        const qtd = parseFloat(document.getElementById(`compramos-qtd-${idx}`).value) || 0;
        const preco = parseFloat(document.getElementById(`preco-compra-${idx}`).textContent.replace(',', '.'));
        const totalLinha = qtd * preco;
        document.getElementById(`compramos-total-linha-${idx}`).textContent = totalLinha.toFixed(2).replace('.', ',');
        // Atualiza total global
        let totalGlobal = 0;
        for (let i = 0; i < produtosCompramos.length; i++) {
            const t = parseFloat(document.getElementById(`compramos-total-linha-${i}`).textContent.replace(',', '.')) || 0;
            totalGlobal += t;
        }
		document.getElementById("compramos-total").textContent = totalGlobal.toFixed(2).replace('.', ',');
    };
}
// Função para copiar a lista de compra
function copiarListaCompra() {
	const tabela = document.querySelector('.compramos-table tbody');
	let texto = "Lista de compra:\n\n";
	for (const row of tabela.rows) {
		const produto = row.cells[0].textContent.trim();
		const preco = row.cells[2].textContent.trim();
		const qtd = row.cells[3].querySelector('input').value.trim();
		const totalLinha = row.cells[4].textContent.trim();
		if (qtd !== "0" && qtd !== "") {
			texto += `🔸${produto} ${preco} x ${qtd} = ${totalLinha}\n`;
		}
	}
	const total = document.getElementById("compramos-total").textContent.trim();
	if (parseFloat(total.replace(',', '.')) > 0) {
		texto += `\n🔷Total: ${total} $`;
		navigator.clipboard.writeText(texto)
			.then(() => alert("Lista de compra copiada!"))
			.catch(() => alert("Não foi possível copiar para o clipboard."));
	} else {
		alert("Adicione pelo menos um produto para copiar a lista.");
	}
}
showPage("home");
