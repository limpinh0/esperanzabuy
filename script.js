let currentAction = '';

function showModal(action) {
	currentAction = action;
	document.getElementById('modalTitle').textContent = action.charAt(0).toUpperCase() + action.slice(1) + " Product";
	document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
	document.getElementById('modal').style.display = 'none';
	document.getElementById('productName').value = '';
	document.getElementById('productPrice').value = '';
	document.getElementById('productId').value = '';
}

async function submitAction() {
	const name = document.getElementById('productName').value;
	const price = document.getElementById('productPrice').value;
	const id = document.getElementById('productId').value;

	const token = localStorage.getItem('jwt');

	let endpoint = 'https://api.yourbestbot.pt/';
	if (currentAction === 'add') endpoint += 'createProduct';
	if (currentAction === 'remove') endpoint += 'deleteProduct';
	if (currentAction === 'update') endpoint += 'editProduct';

	const payload = { name, price, id };

	const res = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json();
	alert(`✅ ${currentAction.toUpperCase()} response: ` + JSON.stringify(data));
	closeModal();
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
			<strong>Expires:</strong> ${formatRelativeTime(order.expiresAt)}<br>
			<strong>Items:</strong>
			<ul>
				${order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
			</ul>
			<strong>Preço Final:</strong> ${order.finalPrice}<br>
			<strong>Local de Entrega:</strong> ${order.meetingPlace}<br>
		</div>
	`).join('');
}

function formatRelativeTime(timestamp) {
	const seconds = Math.floor((timestamp - Date.now()) / 1000);
	if (seconds <= 0) return 'Expired';

	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	let relativeTime;
	if (days > 0) {
		relativeTime = rtf.format(days, 'day');
	} else if (hours > 0) {
		relativeTime = rtf.format(hours, 'hour');
	} else if (minutes > 0) {
		relativeTime = rtf.format(minutes, 'minute');
	} else {
		relativeTime = rtf.format(seconds, 'second');
	}

	const date = new Date(timestamp);
	const exactTime = date.toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	return `${relativeTime} | ${exactTime}`;
}