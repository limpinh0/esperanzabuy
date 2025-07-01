const BASEAPI = "https://api.esperanzabuy.pt";
let currentAction = '';
let allProdutos = [];
let ordemAtual = 'nome';
function openModal(id) {
	document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
	document.getElementById(id).style.display = 'none';
}

async function submitCreateProduct() {
	const name = document.getElementById('createName').value;
	const category = document.getElementById('createCategory').value;
	const price = parseFloat(document.getElementById('createPrice').value);
	const promo = parseFloat(document.getElementById('createPromo').value)
	const weight = parseFloat(document.getElementById('createWeight').value)
	const stock = parseInt(document.getElementById('createStock').value);
	let vpn = parseFloat(document.getElementById('createVpn').value)
	const token = localStorage.getItem('jwt');

	if (!name || !category || !price || !promo || !weight || !stock)
		return alert(`Existem campos vazios.`);
	if (vpn !== 0 && vpn !== 1)
		return alert(`VPN so pode ser '0' ou '1'`);
	if (price < 0) return alert(`Não pode ter preço negativo!`);
	if (promo < 0) return alert(`Não pode ter uma promoção negativa!`);
	if (weight < 0) return alert(`Não pode ter um peso negativo!`);
	if (stock < 0) return alert(`Não da para ter stock negativo!`);

	const image = 'img/' + name.toLowerCase() + ".png";
	if (document.getElementById('createVpn').value == '') vpn = 1;
	const res = await fetch(BASEAPI + '/admin/createProduct', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ newItem: { name, image, category, price, promo, weight, stock, vpn } })
	});

	alert(res.ok ? "✅ Produto criado com sucesso." : "❌ Falha ao criar produto.");
	closeModal('createProductModal');
	if (res.ok) {
        await fetchProdutos(); // Atualiza a grelha dos produtos após criar
    }
}

// async function submitDeleteProduct() {
// 	const names = document.getElementById('deleteName').value;
// 	const token = localStorage.getItem('jwt');

// 	const res = await fetch(BASEAPI + '/admin/deleteProduct', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${token}`
// 		},
// 		body: JSON.stringify({ itemsToRemove: names.split("|") })
// 	});

// 	const result = document.getElementById('result');
// 	result.textContent = res.ok ? "✅ Product/s deleted." : "❌ Failed to delete product/s.";
// 	closeModal('deleteProductModal');
// }

async function submitEditProduct() {
	const name = document.getElementById('editName').value.trim();
	const result = document.getElementById('result');
	const token = localStorage.getItem('jwt');

	if (!name) {
		result.textContent = "❌ Please enter the product name.";
		return;
	}

	// Collect all editable fields
	const fields = ['Price', 'Stock', 'Promo', 'Weight', 'VPN', 'Imagem', 'Category'];
	const updates = {};

	for (const field of fields) {
		const input = document.getElementById(`edit${field}`);
		if (input && input.value.trim() !== "") {
			let value = input.value.trim();
			if (!isNaN(value)) value = Number(value);
			updates[field.toLowerCase()] = value; // keys like "price", "stock"
		}
	}

	if (Object.keys(updates).length === 0) {
		result.textContent = "❌ No fields filled in.";
		return;
	}

	const res = await fetch(BASEAPI + `/admin/editProduct/${encodeURIComponent(name)}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(updates)
	});

	result.textContent = res.ok ? "✅ Product updated." : "❌ Failed to update product.";
	closeModal('editProductModal');
}

async function login() {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	const error = document.getElementById('login-error');

	const res = await fetch(BASEAPI + '/loginEBuy', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});

	// const resultEl = document.getElementById('result');
	if (!res.ok) {
		error.textContent = 'Credenciais inválidas!';
		return false;
	}

	const data = await res.json();
	localStorage.setItem('jwt', data.token);
	document.getElementById('vpn-ip-result').textContent = data.ip || '';
	document.getElementById('login-container').style.display = 'none';
	document.getElementById('main-container').style.display = 'flex';

	error.textContent = '';
	fetchProdutos();
}

function handleLogin(e) {
	e.preventDefault();
	login();
	return false;
}

async function renderOrders() {
	const token = localStorage.getItem('jwt');
	const orderRes = await fetch(BASEAPI + '/admin/pendingOrders', {
		headers: {
			'Authorization': `Bearer ${token}`
		}
	});
	const orders = await orderRes.json();
	const ordersEl = document.getElementById('orders');

	if (!Array.isArray(orders) || orders.length === 0) {
		ordersEl.innerHTML = "<p>Sem encomendas pendentes.</p>";
		return;
	}

	let html = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Expira</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Peso</th>
                    <th>Local</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${formatRelativeTime(order.expiresAt)}</td>
                        <td>
                            <ul style="padding-left:16px;text-align:left;">
                                ${order.items.map(item => `<li>${item.name} | ${item.quantity} x ${item.price} $ = ${item.quantity * item.price}$</li>`).join('')}
                            </ul>
                        </td>
                        <td>${order.finalPrice} $</td>
                        <td>${order.totalWeight} Kg</td>
                        <td>${order.meetingPlace}</td>
                        <td>
                            <button style="background:#27ae60;" onclick="completeOrder('${order.orderId}')">Finalizar</button>
                            <button style="background:#e74c3c;" onclick="cancelOrder('${order.orderId}')">Cancelar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
	ordersEl.innerHTML = html;
}

// Adicione estas funções ao seu script:
async function completeOrder(orderId) {
	const token = localStorage.getItem('jwt');
	const res = await fetch(BASEAPI + '/admin/complete-order', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ orderId })
	});
	alert(res.ok ? "✅ Encomenda finalizada!" : "❌ Erro ao finalizar encomenda.");
	renderOrders();
}

async function cancelOrder(orderId) {
	const token = localStorage.getItem('jwt');
	const res = await fetch(BASEAPI + '/admin/cancel-order', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ orderId })
	});
	alert(res.ok ? "✅ Encomenda cancelada!" : "❌ Erro ao cancelar encomenda.");
	renderOrders();
}

function formatRelativeTime(timestamp) {
	const diffMs = timestamp - Date.now();
	if (diffMs <= 0) return 'Expirou';

	const totalMinutes = Math.floor(diffMs / 1000 / 60);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	let timeParts = [];
	if (hours > 0) timeParts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
	if (minutes > 0) timeParts.push(`${minutes} ${minutes === 1 ? 'minutos' : 'minutos'}`);
	if (timeParts.length === 0) timeParts.push(`menos de 1 minuto.`);

	const relativeTime = `em ${timeParts.join(' e ')}`;

	const exactTime = new Date(timestamp).toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	return `${relativeTime} | ${exactTime}`;
}

// Dark/Light mode
function toggleMode() {
	document.body.classList.toggle('dark');
	localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}
(function () {
	if (localStorage.getItem('theme') === 'dark') {
		document.body.classList.add('dark');
	}
})();

// Sidebar navigation
function showSection(section) {
	document.getElementById('section-produtos').style.display = section === 'produtos' ? '' : 'none';
	document.getElementById('section-encomendas').style.display = section === 'encomendas' ? '' : 'none';
	document.getElementById('btn-produtos').classList.toggle('active', section === 'produtos');
	document.getElementById('btn-encomendas').classList.toggle('active', section === 'encomendas');
	if (section === 'encomendas') renderOrders();
}

function logoutToIndex() {
	localStorage.removeItem('jwt');
	window.location.href = "index.html";
}

async function fetchProdutos() {
	const res = await fetch(BASEAPI + '/unlock-items', {
		method: "POST",
		headers: {
			Authorization: `Bearer ${localStorage.getItem("jwt")}`
		}
	});
	if (!res.ok) return;
	allProdutos = await res.json();
	ordemAtual = 'nome'; // Garante ordem nome ao carregar
	document.getElementById('ordemProdutos').value = 'nome'; // Atualiza o select visualmente
	filtrarEOrdenarProdutos();
}

document.getElementById('searchProdutos').addEventListener('input', filtrarEOrdenarProdutos);
document.getElementById('ordemProdutos').addEventListener('change', function () {
	ordemAtual = this.value;
	filtrarEOrdenarProdutos();
});

function filtrarEOrdenarProdutos() {
	const termo = document.getElementById('searchProdutos').value.trim().toLowerCase();
	let filtrados = allProdutos.filter(p => p.name.toLowerCase().includes(termo));
	switch (ordemAtual) {
		case 'nome':
			filtrados.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
			break;
		  case 'categoria':
            filtrados.sort((a, b) => {
                const cat = a.category.localeCompare(b.category, undefined, { sensitivity: 'base' });
                if (cat !== 0) return cat;
                return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            });
            break;
		case 'stock':
			filtrados.sort((a, b) => (b.stock || 0) - (a.stock || 0));
			break;
		case 'vpn':
			filtrados.sort((a, b) => (b.vpn || 0) - (a.vpn || 0));
			break;
		case 'nenhum':
		default:
			// Não ordenar
			break;
	}
	renderProdutosTable(filtrados);
}

function renderProdutosTable(produtos) {
    const tbody = document.querySelector('#produtos-table tbody');
    tbody.innerHTML = '';
    produtos.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <a href="#" onclick="showImageModal('${prod.imagem || prod.image || ''}', '${prod.name}');return false;" style="color:var(--primary);text-decoration:underline;cursor:pointer;">
                    ${prod.name}
                </a>
            </td>
            <td><input value="${prod.category}" style="width:90px" /></td>
            <td><input type="number" value="${prod.price}" style="width:60px" /></td>
            <td><input type="number" value="${prod.promo}" style="width:60px" /></td>
            <td><input type="number" value="${prod.weight}" style="width:60px" /></td>
            <td><input type="number" value="${prod.stock}" style="width:60px" /></td>
            <td><input type="number" value="${prod.vpn}" style="width:60px" /></td>
              <td style="text-align:center;cursor:pointer;" onclick="toggleActive(this, '${prod.name}')">
                <span title="Clique para alternar">${prod.active === true ? '✅' : '❌'}</span>
            </td>
			<td>
                <button onclick="submitEditProductFromRow(this, '${prod.name}')">💾</button>
                
            </td>
        `;
		// <button onclick="submitDeleteProductFromRow(this, '${prod.name}')">🗑️</button>
        tbody.appendChild(tr);
    });
}

// Edição de produto diretamente na grelha:
async function submitEditProductFromRow(btn, encodedName) {
	const tr = btn.closest('tr');
	const inputs = tr.querySelectorAll('input');
	const [categoryInput, priceInput, promoInput, weightInput, stockInput, vpnInput] = inputs;
	if (vpnInput.value.trim() !== '0' && vpnInput.value.trim() !== '1')
		return alert(`VPN so pode ser '0' ou '1'`);
	if (priceInput.value.trim() < 0) return alert(`Não pode ter preço negativo!`);
	if (promoInput.value.trim() < 0) return alert(`Não pode ter uma promoção negativa!`);
	if (weightInput.value.trim() < 0) return alert(`Não pode ter um peso negativo!`);
	if (stockInput.value.trim() < 0) return alert(`Não da para ter stock negativo!`);

	const updates = {
		name: encodedName,
		category: categoryInput.value,
		price: parseFloat(priceInput.value),
		promo: parseFloat(promoInput.value),
		weight: parseFloat(weightInput.value),
		stock: parseInt(stockInput.value),
		vpn: parseInt(vpnInput.value)
	};
	const token = localStorage.getItem('jwt');
	const res = await fetch(BASEAPI + `/admin/editProduct/${encodedName}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(updates)
	});
	alert(res.ok ? "✅ Produto atualizado." : "❌ Falha ao atualizar produto.");
	fetchProdutos();
}

async function toggleActive(td, prodName) {
    // Encontra o produto no array global
    const prod = allProdutos.find(p => p.name === prodName);
    if (!prod) return;
    prod.active = !prod.active;

    // Prepara o objeto updates corretamente
    const updates = { active: prod.active };

    const token = localStorage.getItem('jwt');
    const res = await fetch(BASEAPI + `/admin/updateVisibility/${prodName}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    }); 
    
    alert(res.ok ? "✅ Produto atualizado." : "❌ Falha ao atualizar produto.");
    td.innerHTML = `<span title="Clique para alternar">${prod.active ? '✅' : '❌'}</span>`;
}

// async function submitDeleteProductFromRow(btn, encodedName) {
// 	const name = decodeURIComponent(encodedName);
// 	const token = localStorage.getItem('jwt');
// 	const res = await fetch(BASEAPI + '/admin/deleteProduct', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${token}`
// 		},
// 		body: JSON.stringify({ itemsToRemove: [name] })
// 	});
// 	alert(res.ok ? "✅ Produto apagado." : "❌ Falha ao apagar produto.");
// 	fetchProdutos();
// }

// Atualizar todos os produtos da grelha
async function atualizarTodosProdutos() {
	const rows = document.querySelectorAll('#produtos-table tbody tr');
	const dbItems = await fetch(BASEAPI + "/unlock-items", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${localStorage.getItem("jwt")}`
		}
	}).then(res => res.json());

	const dbMap = new Map(dbItems.map(item => [item.name, item]));

	for (const tr of rows) {
		const name = tr.querySelector('td').textContent.trim();
		const inputs = tr.querySelectorAll('input');
		const [categoryInput, priceInput, promoInput, weightInput, stockInput, vpnInput] = inputs;

		const updated = {
			name,
			category: categoryInput.value,
			price: parseFloat(priceInput.value),
			promo: parseFloat(promoInput.value),
			weight: parseFloat(weightInput.value),
			stock: parseInt(stockInput.value),
			vpn: parseFloat(vpnInput.value)
		};

		const original = dbMap.get(name);
		if (!original) continue;

		// Only send update if anything changed
		const changed = (
			original.category !== updated.category ||
			original.price !== updated.price ||
			original.promo !== updated.promo ||
			original.weight !== updated.weight ||
			original.stock !== updated.stock ||
			original.vpn !== updated.vpn
		);

		if (changed) {
			await fetch(BASEAPI + `/admin/editProduct/${encodeURIComponent(name)}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwt')}`
				},
				body: JSON.stringify(updated)
			});
		}
	}

	alert("✅ Produtos atualizados com sucesso (apenas os que mudaram).");
	fetchProdutos();
}

// Chame fetchProdutos ao mostrar a secção de produtos
const oldShowSection = window.showSection;
window.showSection = function (section) {
	oldShowSection(section);
	if (section === 'produtos') fetchProdutos();
};

window.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('jwt');

	if (!token) {
		// No token, show login form
		document.getElementById('login-container').style.display = 'flex';
		return;
	}

	try {
		// Validate token with the backend
		const res = await fetch(BASEAPI + '/admin/verifyToken', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		const data = res.json();
		if (res.ok) {
			// Token is valid, redirect or show logged-in content
			//window.location.href = '/dashboard'; // or load dashboard directly
			document.getElementById('vpn-ip-result').textContent = data.ip || '';
			document.getElementById('login-container').style.display = 'none';
			document.getElementById('main-container').style.display = 'flex';
			fetchProdutos();
		} else {
			// Invalid token
			localStorage.removeItem('jwt');
			document.getElementById('login-container').style.display = 'flex';
		}
	} catch (err) {
		console.error('Token validation failed:', err);
		localStorage.removeItem('jwt');
		document.getElementById('login-container').style.display = 'flex';
	}
});

// Adicione esta função ao seu script.js se ainda não existir:
function showImageModal(imagePath, prodName) {
    const modalId = 'imageModal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="align-items:center;">
                <h3>Imagem de <span id="modalProdName"></span></h3>
                <img id="modalProdImg" src="" alt="Imagem do produto" style="max-width:220px;max-height:220px;border-radius:10px;margin-bottom:1rem;">
                <button onclick="closeModal('imageModal')">Fechar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById('modalProdName').textContent = prodName;
    const imgUrl = imagePath ? `https://api.esperanzabuy.pt/img/${imagePath}` : '';
    document.getElementById('modalProdImg').src = imgUrl;
    modal.style.display = 'flex';
}

