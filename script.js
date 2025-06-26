let currentAction = '';

function openModal(id) {
	document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
	document.getElementById(id).style.display = 'none';
}

async function submitCreateProduct() {
	const name = document.getElementById('createName').value;
	const imagem = document.getElementById('createImagem').value;
	const category = document.getElementById('createCategory').value;
	const price = parseFloat(document.getElementById('createPrice').value);
	const promo = parseFloat(document.getElementById('createPromo').value)
	const weight = parseFloat(document.getElementById('createWeight').value)
	const stock = parseInt(document.getElementById('createStock').value);
	const vpn = parseFloat(document.getElementById('createVpn').value)
	const token = localStorage.getItem('jwt');

	const res = await fetch('https://api.yourbestbot.pt/admin/createProduct', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ name, imagem, category, price, promo, weight, stock, vpn })
	});

	const result = document.getElementById('result');
	result.textContent = res.ok ? "✅ Product created." : "❌ Failed to create product.";
	closeModal('createProductModal');
}

async function submitDeleteProduct() {
	const name = document.getElementById('deleteName').value;
	const token = localStorage.getItem('jwt');

	const res = await fetch('https://api.yourbestbot.pt/admin/deleteProduct', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ name })
	});

	const result = document.getElementById('result');
	result.textContent = res.ok ? "✅ Product deleted." : "❌ Failed to delete product.";
	closeModal('deleteProductModal');
}

async function submitEditProduct() {
	const name = document.getElementById('editName').value;
	const field = document.getElementById('editField').value;
	let value = document.getElementById('editValue').value;
	const token = localStorage.getItem('jwt');

	// attempt to parse number
	if (!isNaN(value)) value = Number(value);

	const res = await fetch('https://api.yourbestbot.pt/admin/editProduct', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ name, field, value })
	});

	const result = document.getElementById('result');
	result.textContent = res.ok ? "✅ Product updated." : "❌ Failed to update product.";
	closeModal('editProductModal');
}

async function login() {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	const res = await fetch('https://api.yourbestbot.pt/loginEBuy', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});

	const resultEl = document.getElementById('result');

	if (!res.ok) {
		resultEl.textContent = "❌ Invalid login";
		return;
	}

	const data = await res.json();
	localStorage.setItem('jwt', data.token);
	resultEl.textContent = "✅ Login successful!";
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
	const orderRes = await fetch('https://api.yourbestbot.pt/pendingOrders');
	const orders = await orderRes.json();

	renderOrders(orders);

	// refresh order timers every minute
	setInterval(() => renderOrders(orders), 60 * 1000);
}

function renderOrders(orders) {
	const ordersEl = document.getElementById('orders');

	if (!Array.isArray(orders) || orders.length === 0) {
		ordersEl.innerHTML = "<p>No pending orders.</p>";
		return;
	}

	ordersEl.innerHTML = "<h3>Pending Orders</h3>" + orders.map(order => `
		<div class="order">
			<strong>Order ID:</strong> ${order.orderId}<br>
			<strong>Expira:</strong> ${formatRelativeTime(order.expiresAt)}<br>
			<strong>Items:</strong>
			<ul>
				${order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
			</ul>
			<strong>Preço Final:</strong> $${order.finalPrice}<br>
			<strong>Peso Encomenda:</strong> ${order.totalWeight} Kg<br>
			<strong>Local de Entrega:</strong> ${order.meetingPlace}<br>
		</div>
	`).join('');
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