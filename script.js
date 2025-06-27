let currentAction = '';

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

	const image = 'img/' + name.toLowerCase() + ".png";
	if (!vpn) vpn = 1;
	const res = await fetch('https://api.yourbestbot.pt/admin/createProduct', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ newItem: { name, image, category, price, promo, weight, stock, vpn } })
	});


	alert(res.ok ? "✅ Produto criado com sucesso." : "❌ Falha ao criar produto.");
	closeModal('createProductModal');
}

async function submitDeleteProduct() {
	const names = document.getElementById('deleteName').value;
	const token = localStorage.getItem('jwt');

	const res = await fetch('https://api.yourbestbot.pt/admin/deleteProduct', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ itemsToRemove: names.split("|") })
	});

	const result = document.getElementById('result');
	result.textContent = res.ok ? "✅ Product/s deleted." : "❌ Failed to delete product/s.";
	closeModal('deleteProductModal');
}

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

	const res = await fetch(`https://api.yourbestbot.pt/admin/editProduct/${encodeURIComponent(name)}`, {
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

	const res = await fetch('https://api.yourbestbot.pt/loginEBuy', {
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
	document.getElementById('login-container').style.display = 'none';
	document.getElementById('main-container').style.display = 'flex';

	error.textContent = '';
}

function handleLogin(e) {
	e.preventDefault();
	const token = localStorage.getItem('jwt');
	if (!token)
		login();
	else {
		document.getElementById('login-container').style.display = 'none';
		document.getElementById('main-container').style.display = 'flex';
	}
	return false;
}

async function getDashboard() {
	const token = localStorage.getItem('jwt');
	const resultEl = document.getElementById('result');
	const ordersEl = document.getElementById('orders');

	if (!token) {
		resultEl.textContent = "❌ You must log in first.";
		return;
	}

	// Dashboard
	const dashRes = await fetch('https://api.yourbestbot.pt/admin/dashboard', {
		headers: {
			'Authorization': `Bearer ${token}`
		}
	});
	if (!dashRes.ok) {
		resultEl.textContent = "❌ Unauthorized or session expired";
		return;
	}
	const dashboard = await dashRes.json();
	resultEl.textContent = "✅ Dashboard:\n" + JSON.stringify(dashboard, '\t', 4);

	// Pending orders
	/* const orderRes = await fetch('https://api.yourbestbot.pt/pendingOrders', {
		headers: {
			'Authorization': `Bearer ${token}`
		}
	}); */
	renderOrders();

	// refresh order timers every five minutes
	setInterval(() => renderOrders(), 5 * 60 * 1000);
}

async function renderOrders() {
	const orderRes = await fetch('https://api.yourbestbot.pt/pendingOrders');
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
                                ${order.items.map(item => `<li>${item.name} | ${item.quantity} x ${item.unitPrice} $ = ${item.quantity * item.unitPrice}$</li>`).join('')}
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
	const res = await fetch('https://api.yourbestbot.pt/admin/complete-order', {
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
	const res = await fetch('https://api.yourbestbot.pt/admin/cancel-order', {
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
	const token = localStorage.getItem('jwt');
	const res = await fetch('https://api.yourbestbot.pt/shop', {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	if (!res.ok) return;
	const produtos = await res.json();
	renderProdutosTable(produtos);
}

function renderProdutosTable(produtos) {
	// Alphabetic order
	produtos.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

	const tbody = document.querySelector('#produtos-table tbody');
	tbody.innerHTML = '';
	produtos.forEach(prod => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
				<td>${prod.name}</td>
				<td><input value="${prod.category}" style="width:90px" /></td>
				<td><input type="number" value="${prod.price}" style="width:60px" /></td>
				<td><input type="number" value="${prod.promo}" style="width:60px" /></td>
				<td><input type="number" value="${prod.weight}" style="width:60px" /></td>
				<td><input type="number" value="${prod.stock}" style="width:60px" /></td>
				<td><input type="number" value="${prod.vpn}" style="width:60px" /></td>
				<td>
					<button onclick="submitEditProductFromRow(this, '${encodeURIComponent(prod.name)}')">💾</button>
					<button onclick="submitDeleteProductFromRow(this, '${encodeURIComponent(prod.name)}')">🗑️</button>
				</td>
			`;
		tbody.appendChild(tr);
	});
}

// Edição de produto diretamente na grelha:
async function submitEditProductFromRow(btn, encodedName) {
	const tr = btn.closest('tr');
	const inputs = tr.querySelectorAll('input');
	const [categoryInput, priceInput, promoInput, weightInput, stockInput, vpnInput] = inputs;
	const updates = {
		category: categoryInput.value,
		price: parseFloat(priceInput.value),
		promo: parseFloat(promoInput.value),
		weight: parseFloat(weightInput.value),
		stock: parseInt(stockInput.value),
		vpn: parseFloat(vpnInput.value)
	};
	const token = localStorage.getItem('jwt');
	const res = await fetch(`https://api.yourbestbot.pt/admin/editProduct/${encodedName}`, {
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

async function submitDeleteProductFromRow(btn, encodedName) {
	const name = decodeURIComponent(encodedName);
	const token = localStorage.getItem('jwt');
	const res = await fetch('https://api.yourbestbot.pt/admin/deleteProduct', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ itemsToRemove: [name] })
	});
	alert(res.ok ? "✅ Produto apagado." : "❌ Falha ao apagar produto.");
	fetchProdutos();
}

// Atualizar todos os produtos da grelha
async function atualizarTodosProdutos() {
	const rows = document.querySelectorAll('#produtos-table tbody tr');
	for (const tr of rows) {
		const name = tr.querySelector('td').textContent.trim();
		const inputs = tr.querySelectorAll('input');
		const [categoryInput, priceInput, promoInput, weightInput, stockInput, vpnInput] = inputs;
		const updates = {
			category: categoryInput.value,
			price: parseFloat(priceInput.value),
			promo: parseFloat(promoInput.value),
			weight: parseFloat(weightInput.value),
			stock: parseInt(stockInput.value),
			vpn: parseFloat(vpnInput.value)
		};
		const token = localStorage.getItem('jwt');
		await fetch(`https://api.yourbestbot.pt/admin/editProduct/${encodeURIComponent(name)}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(updates)
		});
	}
	console.log("✅ Todos os produtos foram atualizados.");
	fetchProdutos();
}

// Chame fetchProdutos ao mostrar a secção de produtos
const oldShowSection = window.showSection;
window.showSection = function (section) {
	oldShowSection(section);
	if (section === 'produtos') fetchProdutos();
};
// Se já estiver na secção produtos ao carregar, buscar produtos
if (document.getElementById('section-produtos').style.display !== 'none') fetchProdutos();