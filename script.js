const BASEAPI = "https://api.esperanzabuy.pt";
let currentAction = '';
let allProdutos = [];
let ordemAtual = 'nome';

const craftsData = [
    
	{
        name: "Skateboard",
        materiais: {
            "Tábuas de madeira": 1,
            "Plástico": 3,
            "Borracha": 8
        },
        imagem: "skateboard.png",
        preco: 0
    },
    {
        name: "Head bag",
        materiais: {
            "Couro": 3
        },
        imagem: "HeadBag.png",
        preco: 0
    },
    {
        name: "Checkers Board",
        materiais: {
            "Borracha": 8,
            "Tábuas de madeira": 2,
            "Plástico": 6
        },
        imagem: "checkers.png",
        preco: 0
    },
    {
        name: "Chess Board",
        materiais: {
            "Borracha": 8,
            "Tábuas de madeira": 2,
            "Plástico": 6
        },
        imagem: "chess.png",
        preco: 0
    },
	{
        name: "Gazua",
        materiais: {
            "Plástico": 4,
            "Sucata de metal": 4,
            "Aluminio": 2
        },
        imagem: "lockpick.png",
        preco: 0
    }, 
    {
        name: "Gazua Avançada",
        materiais: {
            "Sucata de metal": 9,
            "Plástico": 5,
            "Aluminio": 2,
            "Borracha": 14
        },
        imagem: "lockpick2.png",
        preco: 0
    },
    {
        name: "Pá",
        materiais: {
            "Tábuas de madeira": 1,
            "Aço": 3,
			"Sucata de metal": 3,
			"Plástico": 2
        },
        imagem: "Pa.png",
        preco: 0
    },
    {
        name: "Quadro branco",
        materiais: {
            "Sucata de metal": 5,
            "Plástico": 15,
            "Borracha": 30
        },
        imagem: "QuadroBranco.png",
        preco: 0
    },
    {
        name: "Basketball",
        materiais: {
            "Borracha": 45,
            "Couro": 5
        },
        imagem: "BasketBall.png",
        preco: 0
    },
    {
        name: "Basketball Hoop",
        materiais: {
            "Vidro": 45,
            "Aço": 20,
            "Plástico": 20,
            "Sucata de metal": 10
        },
        imagem: "BasketBallHoop.png",
        preco: 0
    },
    {
        name: "Maçarico",
        materiais: {
            "Sucata de metal": 1,
            "Aço": 5,
            "Sulfur": 1,
            "Ferro": 1,
            "Carvão": 2
        },
        imagem: "torch.png",
        preco: 0
    },
    {
        name: "Faca Utilitária",
        materiais: {
            "Aço": 2,
            "Tábuas de madeira": 1
        },
        imagem: "FacaUtilitaria.png",
        preco: 0
    },
    {
        name: "Pólvora",
        materiais: {
            "Sulfur": 1,
            "Carvão": 1
        },
        imagem: "Polvora.png",
        preco: 0
    },
    {
        name: "Ácido de Bateria",
        materiais: {
            "Cobre": 1,
            "Sulfur": 1,
            "Ferro": 2
        },
        imagem: "battery_acid.png",
        preco: 0
    },
    {
        name: "Caixa de ferramentas",
        materiais: {
            "Sucata de metal": 5,
            "Plástico": 1,
            "Borracha": 14
        },
        imagem: "CaixaFerramentas.png",
        preco: 0
    },
    {
        name: "Kit Eletrónico",
        materiais: {
            "Aluminio": 8,
            "Vidro": 12,
            "Cobre": 8,
            "Plástico": 5,
            "Sulfur": 2
        },
        imagem: "electronic-kit.png",
        preco: 0
    },
    {
        name: "Sledge Hammer",
        materiais: {
            "Sucata de metal": 3,
            "Plástico": 3,
            "Aço": 5,
            "Tábuas de madeira": 5,
            "Borracha": 5
        },
        imagem: "SledgeHammer.png",
        preco: 0
    },
    {
        name: "Algemas",
        materiais: {
            "Aluminio": 15,
            "Ferro": 8,
            "Sucata de metal": 10
        },
        imagem: "handcuffs.png",
        preco: 0
    },
    {
        name: "Lata de Tinta",
        materiais: {
            "Sucata de metal": 3,
            "Coca Cola": 1,
            "Plástico": 1,
            "Borracha": 15
        },
        imagem: "LataTinta.png",
        preco: 0
    },
    {
        name: "Colete Blindado",
        materiais: {
            "Chumbo": 2,
            "Couro": 2,
            "Aluminio": 5,
            "Aço": 25
        },
        imagem: "Colete.png",
        preco: 0
    },
    {
        name: "Mascara de Gás",
        materiais: {
            "Plástico": 20,
            "Vidro": 15,
            "Aço": 5,
            "Couro": 3,
            "Borracha": 30
        },
        imagem: "mascaragas.png",
        preco: 0
    },
    {
        name: "Jaula",
        materiais: {
            "Borracha": 20,
            "Aluminio": 30,
            "Aço": 60,
            "Ferro": 20,
            "Tábuas de madeira": 5
        },
        imagem: "Jaula.png",
        preco: 0
    },
    {
        name: "Ligaduras",
        materiais: {
            "Trapos": 1,
            "Borracha": 3
        },
        imagem: "bandage.png",
        preco: 0
    },
    {
        name: "Glitcher Tensao",
        materiais: {
            "Cobre": 28,
            "Kit Eletrónico": 1,
            "Aluminio": 4,
            "Pólvora": 1,
            "Ácido de bateria": 1
        },
        imagem: "GlitcherTensao.png",
        preco: 0
    },
	{
        name: "Óxido de ferro",
        materiais: {
            "Vidro": 10,
            "Ferro": 14,
            "Sulfur": 5
        },
        imagem: "aluminioPo.png",
        preco: 0
    },
	{
        name: "Aluminio em pó",
        materiais: {
            "Vidro": 10,
            "Aluminio": 14,
            "Sulfur": 5
        },
        imagem: "oxidoFerro.png",
        preco: 0
    },
	{
        name: "Thermite",
        materiais: {
            "Aluminio em pó": 1,
            "Óxido de ferro": 1
        },
        imagem: "thermite.png",
        preco: 0
    },
    {
        name: "Bloqueador de Circuito",
        materiais: {
            "Nefrit": 6,
            "Quartz": 5,
            "Chumbo": 2,
            "Kit Eletrónico": 1,
            "Estanho": 8
        },
        imagem: "BloqueadorCircuito.png",
        preco: 0
    },
    {
        name: "Pen Testes",
        materiais: {
            "Kit Eletrónico": 1,
            "Chumbo": 1,
            "Plástico": 3,
            "Aluminio": 5,
            "Ácido de bateria": 1,
            "Cobre": 8,
            "Sucata de metal": 3
        },
        imagem: "penTestes.png",
        preco: 0
    },
    {
        name: "Decibelímetro",
        materiais: {
            "Chumbo": 2,
            "Sulfur": 1,
            "Aluminio": 20,
            "Borracha": 10,
            "Plástico": 35,
            "Sucata de metal": 10
        },
        imagem: "Decibelimetro.png",
        preco: 0
    },
    {
        name: "Regador",
        materiais: {
            "BP de regador": 1,
            "Aço": 4,
            "Ferro": 1,
            "Garrafas água": 5
        },
        imagem: "SuperRegador.png",
        preco: 0
    },
    {
        name: "Super Fertelizante",
        materiais: {
            "Composto": 1,
            "Fertelizante": 1
        },
        imagem: "superfert.png",
        preco: 0
    },
    {
        name: "Explosivo Caseiro",
        materiais: {
            "Pólvora": 5,
            "Cobre": 5,
            "Borracha": 5,
            "Chumbo": 2,
            "Ácido de bateria": 1,
            "Kit Eletrónico": 1,
            "Telemóvel": 1,
            "Thermite": 1
        },
        imagem: "BombaCaseira.png",
        preco: 0
    },
    {
        name: "ATM Cracker",
        materiais: {
            "Borracha": 8,
            "Kit Eletrónico": 1,
            "Aluminio": 20,
            "Pólvora": 5,
            "Sucata de metal": 8,
            "Cobre": 4,
            "Plástico": 8,
            "Ácido de bateria": 1,
            "Chumbo": 2
        },
        imagem: "ATMCracker.png",
        preco: 0
    },
    {
        name: "Pen Boosting",
        materiais: {
            "Sucata de metal": 20,
            "Plástico": 35,
            "Chumbo": 2,
            "Aluminio": 45,
            "Kit Eletrónico": 3,
            "Ácido de bateria": 1
        },
        imagem: "penBoosting.png",
        preco: 0
    },
    {
        name: "VPN",
        materiais: {
            "Sucata de metal": 2,
            "Plástico": 5,
            "Aluminio": 2,
            "Chumbo": 1,
            "Kit Eletrónico": 1,
            "Ácido de bateria": 1
        },
        imagem: "antenavpn.png",
        preco: 0
    },
    {
        name: "Anti-Localizador",
        materiais: {
            "Sucata de metal": 40,
            "Aluminio": 20,
            "Cobre": 35,
            "Pólvora": 7,
            "Borracha": 20,
            "Kit eletrónico": 3,
            "Ácido de bateria": 2,
            "Chumbo": 4,
            "Plástico": 40
        },
        imagem: "antiTracker.png",
        preco: 0
    },
    {
        name: "Exercício Básico",
        materiais: {
            "Sucata de metal": 10,
            "Chumbo": 1,
            "Ácido de bateria": 1,
            "Kit Eletrónico": 1,
            "Aluminio": 5,
            "Plástico": 5,
            "Aço": 5,
            "Bateria Pequena": 1
        },
        imagem: "ExercicioBasico.png",
        preco: 0
    },
    {
        name: "Desencriptador Básico",
        materiais: {
            "Sucata de metal": 5,
            "Vidro": 15,
            "Plástico": 5,
            "Chumbo": 2,
            "Aluminio": 5,
            "Aço": 2,
            "Kit Eletrónico": 1,
            "Ácido de bateria": 2
        },
        imagem: "penBasica.png",
        preco: 0
    },
    {
        name: "DeAuth Básico",
        materiais: {
            "Sucata de metal": 5,
            "Chumbo": 1,
            "Plástico": 5,
            "Ácido de bateria": 1,
            "Aluminio": 5,
            "Aço": 5,
            "Kit Eletrónico": 1,
            "Vidro": 15
        },
        imagem: "tablet.png",
        preco: 0
    },
    {
        name: "Perfuradora Avançada",
        materiais: {
            "Sucata de metal": 15,
            "Chumbo": 5,
            "Plástico": 5,
            "Ácido de bateria": 1,
            "Aluminio": 5,
            "Aço": 10,
            "Kit Eletrónico": 1,
            "Bateria Pequena": 1
        },
        imagem: "PerfuradoraAvancada.png",
        preco: 0
    },
    {
        name: "Desencriptador Avançado",
        materiais: {
            "Sucata de metal": 10,
            "Vidro": 20,
            "Plástico": 7,
            "Chumbo": 2,
            "Aluminio": 7,
            "Aço": 5,
            "Kit Eletrónico": 1,
            "Ácido de bateria": 2
        },
        imagem: "penAvancada.png",
        preco: 0
    },
    {
        name: "DeAuth Avançado",
        materiais: {
            "Chumbo": 2,
            "Aço": 10,
            "Kit Eletrónico": 1,
            "Plástico": 10,
            "Ácido de bateria": 1,
            "Vidro": 30,
            "Sucata de metal": 10,
            "Aluminio": 10
        },
        imagem: "DeAuthAvancado.png",
        preco: 0
    },
    {
        name: "Glitcher de Tensao Avançado",
        materiais: {
            "Plástico": 10,
            "Aço": 5,
            "Sucata de metal": 15,
            "Vidro": 15,
            "Aluminio": 5,
            "Chumbo": 2,
            "Kit Eletrónico": 2,
            "Ácido de bateria": 2,
            "Bateria Pequena": 2
        },
        imagem: "GlitcherTensaoAvancado.png",
        preco: 0
    },
    {
        name: "Desencriptador Harden",
        materiais: {
            "Plástico": 10,
            "Aço": 10,
            "Sucata de metal": 15,
            "Vidro": 25,
            "Aluminio": 10,
            "Chumbo": 2,
            "Kit Eletrónico": 1,
            "Ácido de bateria": 2,
            "Bateria Pequena": 1
        },
        imagem: "penHarden.png",
        preco: 0
    },
    {
        name: "Dados do Dumper",
        materiais: {
            "Bateria Pequena": 1,
            "Plástico": 7,
            "Aço": 12,
            "Sucata de metal": 10,
            "Chumbo": 2,
            "Aluminio": 5,
            "Ácido de bateria": 2,
            "Kit Eletrónico": 2,
            "Vidro": 15
        },
        imagem: "DadosDumper.png",
        preco: 0
    },
    {
        name: "Ground Drill",
        materiais: {
            "Sucata de metal": 10,
            "Vidro": 5,
            "Chumbo": 2,
            "Kit Eletrónico": 1,
            "Aluminio": 15,
            "Plástico": 5,
            "Ácido de bateria": 1,
            "Bateria Pequena": 1
        },
        imagem: "GroundDrill.png",
        preco: 0
    },
    {
        name: "Bolt Cutter",
        materiais: {
            "Sucata de metal": 15,
            "Vidro": 5,
            "Aço": 15,
            "Ferro": 25,
            "Chumbo": 2
        },
        imagem: "boltcutter.png",
        preco: 0
    }
];


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

    let html = "";

orders.forEach(order => {
    let encomendaTotal = 0;
    let orderIdVar = order.orderId;
    if (!orderIdVar) {
        // Gera um stamp aleatório de 10 caracteres (alfanumérico)
        orderIdVar = Math.random().toString(36).substring(2, 12);
    }
    let tableId = `order-table-${orderIdVar}`;
    html += `
        <table id="${tableId}" class="orders-table" style="margin-bottom:28px;width:100%;border-collapse:separate;border-spacing:0;border:1px solid #8b8b8bff;border-top:3px solid #3498db; border-radius:15px;overflow:hidden;">
            <thead>
                <tr>
                    <th style="border:1px solid #8b8b8bff;">Data</th>
                    <th style="border:1px solid #8b8b8bff;">Cliente</th>
                    <th style="border:1px solid #8b8b8bff;">Nº Encomenda</th>
                    <th style="border:1px solid #8b8b8bff;">Descrição</th>
                    <th style="border:1px solid #8b8b8bff;">Quant.</th>
                    <th style="border:1px solid #8b8b8bff;">Valor Unit. ($)</th>
                    <th style="border:1px solid #8b8b8bff;">Valor Total ($)</th>
                </tr>
            </thead>
            <tbody>
    `;
    order.items.forEach((item, idx) => {
        const valorTotal = (item.quantity * item.price);
        encomendaTotal += valorTotal;
        html += `
            <tr>
                <td style="border:1px solid #8b8b8bff;">${order.expiresAt ? new Date(order.expiresAt).toLocaleDateString('pt-PT') : ''}</td>
                <td style="border:1px solid #8b8b8bff;">Adicionar Nome</td>
                <td style="border:1px solid #8b8b8bff;">${orderIdVar}</td>
                <td style="border:1px solid #8b8b8bff;">${item.name}</td>
                <td style="border:1px solid #8b8b8bff;">${String(item.quantity).replace('.', ',')}</td>
                <td style="border:1px solid #8b8b8bff;">${Number(item.price).toFixed(2).replace('.', ',')}</td>
                <td style="border:1px solid #8b8b8bff;">${valorTotal.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    });
    html += `
        <tr>
            <td colspan="5">Peso Total: ${order.totalWeight} Kg | CP: ${order.meetingPlace} | Expira ${formatRelativeTime(order.expiresAt)}</td>
            <td style="font-weight:bold;text-align:center;border:1px solid #8b8b8bff;">Total:</td>
            <td style="font-weight:bold;border:1px solid #8b8b8bff;">${encomendaTotal.toFixed(2)} $</td>
        </tr>
        <tr>
            <td colspan="7" style="text-align:center;">
                <button style="background:#3498db;border:none;border-radius:5px;cursor:pointer;font-size:0.97em;" onclick="copyOrderToClipboard('${tableId}')">Copiar para Excel</button>
                <button style="background:#27ae60;border:none;border-radius:5px;cursor:pointer;font-size:0.97em;" onclick="completeOrder('${order.orderId}')">Finalizar</button>
                <button style="background:#e74c3c;border:none;border-radius:5px;cursor:pointer;font-size:0.97em;" onclick="cancelOrder('${order.orderId}')">Cancelar</button>
            </td>
        </tr>
    `;
    html += `
            </tbody>
        </table>
    `;
});

ordersEl.innerHTML = html;
}


// Função para copiar para clipboard (adicione ao seu script.js)
window.copyOrderToClipboard = function(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    let rows = Array.from(table.querySelectorAll('tbody tr'));
    // Só linhas de produtos (ignora as duas últimas linhas de total e botões)
    rows = rows.slice(0, -2);
    let text = '';
    // Linhas
    rows.forEach(tr => {
        const cols = Array.from(tr.querySelectorAll('td')).slice(0, -1).map(td => td.innerText.trim());
        text += cols.join('\t') + '\n';
    });
    navigator.clipboard.writeText(text).then(() => {
        alert('Linhas copiadas para o clipboard!');
    });
};

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
function showSection(sec) {
    document.getElementById('section-produtos').style.display = 'none';
    document.getElementById('section-encomendas').style.display = 'none';
    document.getElementById('section-Crafts').style.display = 'none';
    document.getElementById('btn-produtos').classList.remove('active');
    document.getElementById('btn-encomendas').classList.remove('active');
    document.getElementById('btn-Crafts').classList.remove('active');

    if (sec === 'produtos') {
        document.getElementById('section-produtos').style.display = '';
        document.getElementById('btn-produtos').classList.add('active');
    }
    if (sec === 'encomendas') {
        document.getElementById('section-encomendas').style.display = '';
        document.getElementById('btn-encomendas').classList.add('active');
        renderOrders && renderOrders();
    }
    if (sec === 'Crafts') {
        document.getElementById('section-Crafts').style.display = '';
        document.getElementById('btn-Crafts').classList.add('active');
        renderCraftsTable && renderCraftsTable();
    }
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
	// ordemAtual = 'nome'; // Garante ordem nome ao carregar
	// document.getElementById('ordemProdutos').value = 'nome'; // Atualiza o select visualmente
	filtrarEOrdenarProdutos();
}

document.getElementById('searchProdutos').addEventListener('input', filtrarEOrdenarProdutos);
document.getElementById('ordemProdutos').addEventListener('change', function () {
	ordemAtual = this.value;
	filtrarEOrdenarProdutos();
});

function filtrarEOrdenarProdutos() {
    const termo = document.getElementById('searchProdutos').value.trim().toLowerCase();
    let filtrados = allProdutos.filter(p =>
        p.name.toLowerCase().includes(termo) ||
        (p.category && p.category.toLowerCase().includes(termo))
    );
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
     await fetchProdutos();
    filtrarEOrdenarProdutos(); // Mantém a ordem e filtro atuais após atualizar

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

// Renderiza a grelha de crafts
function renderCraftsTable() {
    const gridContainerId = "crafts-grid";
    let grid = document.getElementById(gridContainerId);
    if (!grid) {
        // Cria o container se não existir
        grid = document.createElement("div");
        grid.id = gridContainerId;
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(5, 1fr)";
        grid.style.gap = "18px";
        grid.style.margin = "0 auto";
        grid.style.maxWidth = "1200px";
        grid.style.padding = "10px 0 20px 0";
        const craftsTable = document.getElementById("crafts-table");
        if (craftsTable) {
            craftsTable.parentNode.replaceChild(grid, craftsTable);
        } else {
            // fallback: insere no lugar correto
            const craftsSection = document.getElementById("section-Crafts");
            if (craftsSection) craftsSection.appendChild(grid);
        }
    } else {
        grid.innerHTML = "";
    }

    craftsData.forEach((craft, idx) => {
        const cell = document.createElement("div");
        cell.className = "craft-cell";
        cell.style.borderRadius = "12px";
        cell.style.boxShadow = "0 2px 8px #0001";
        cell.style.padding = "14px 8px 10px 8px";
        cell.style.display = "flex";
        cell.style.flexDirection = "column";
        cell.style.alignItems = "center";
        cell.style.cursor = "pointer";
        cell.style.transition = "box-shadow 0.2s, background 0.2s";
        cell.style.position = "relative";
        cell.tabIndex = 0;
        cell.onmouseenter = () => cell.style.boxShadow = "0 4px 16px #0002";
        cell.onmouseleave = () => cell.style.boxShadow = "0 2px 8px #0001";
        cell.onclick = (e) => {
            // Só abre popup se não for o input ou o botão
            if (e.target.tagName !== "INPUT" && !e.target.classList.contains("calc-price-btn")) showCraftPopup(idx);
        };

        // Nome
        const name = document.createElement("div");
        name.textContent = craft.name;
        name.style.fontWeight = "bold";
        name.style.fontSize = "1.05em";
        name.style.textAlign = "center";
        name.style.marginBottom = "8px";
        name.style.color = "var(--primary)";

        // Imagem
        const img = document.createElement("img");
        img.src = `https://api.esperanzabuy.pt/img/${encodeURIComponent(craft.imagem)}`;
        img.alt = craft.name;
        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "contain";
        img.style.marginBottom = "8px";
        img.onerror = function() { this.style.display = "none"; };

        // Input quantidade
        const input = document.createElement("input");
        input.className = "input-cell";
        input.type = "number";
        input.min = "0";
        input.id = `craft-qty-${idx}`;
        input.placeholder = "Qtd";
        input.style.width = "60px";
        input.style.marginLeft = "8px";
        input.style.textAlign = "center";
        input.onclick = (e) => e.stopPropagation();

        // Botão calcular preço
        const calcBtn = document.createElement("button");
        calcBtn.type = "button";
        calcBtn.className = "calc-price-btn";
        calcBtn.innerHTML = "💲";
        calcBtn.title = "Calcular preço";
        // calcBtn.style.marginRight = "0px";
       
        calcBtn.onmouseenter = function() {
            this.title = "Calcular preço";
        };
        // Mostra o preço ao clicar
        calcBtn.onclick = function(e) {
            e.stopPropagation();
            if (calcBtn.dataset.calculated === "1") return;
            const qty = parseInt(input.value, 10) || 1;
            let total = 0;
            let missing = [];

            // Função auxiliar igual à do showCraftPopup
            function calcularPrecoCraft(nome) {
                const craftInterno = craftsData.find(c => c.name.toLowerCase() === nome.toLowerCase());
                if (!craftInterno) return null;
                let subtotal = 0;
                for (const [mat, val] of Object.entries(craftInterno.materiais)) {
                    const prod = allProdutos.find(p => p.name.toLowerCase() === mat.toLowerCase());
                    if (prod && typeof prod.price === "number") {
                        subtotal += prod.price * val;
                    } else {
                        const subPreco = calcularPrecoCraft(mat);
                        if (subPreco !== null) {
                            subtotal += subPreco * val;
                        } else {
                            return null;
                        }
                    }
                }
                return subtotal;
            }

            for (const [mat, val] of Object.entries(craft.materiais)) {
                // 1º: tenta calcular pelo craftsData (recursivo)
                const precoCraft = calcularPrecoCraft(mat);
                if (precoCraft !== null) {
                    total += precoCraft * val * qty;
                } else {
                    // 2º: tenta pelo allProdutos
                    const prod = allProdutos.find(p => p.name.toLowerCase() === mat.toLowerCase());
                    if (prod && typeof prod.price === "number") {
                        total += prod.price * val * qty;
                    } else {
                        missing.push(mat);
                    }
                }
            }

            if (missing.length > 0) {
                calcBtn.innerHTML = `<span style="font-size:0.9em;color:#d00;" title="Sem preço para: ${missing.join(', ')}">❓</span>`;
            } else {
                calcBtn.innerHTML = `<span style="font-size:0.95em; color: #222;">${total.toFixed(2)}$</span>`;
            }
            calcBtn.dataset.calculated = "1";
            calcBtn.title = "";
            // // Volta ao símbolo após 2.5s
            // setTimeout(() => {
            //     calcBtn.innerHTML = "💲";
            //     calcBtn.dataset.calculated = "0";
            //     calcBtn.title = "Calcular preço";
            // }, 2500);
        };

        // Substitua o botão por um span para mostrar o preço
        const priceSpan = document.createElement("span");
        priceSpan.className = "craft-price-span";
        priceSpan.style.fontWeight = "bold";
        priceSpan.style.marginRight = "8px";
        priceSpan.style.fontSize = "1em";

        // Função para calcular e mostrar o preço
        function updatePrice() {
            const qty = parseInt(input.value, 10) || 1;
            let total = 0;
            let missing = [];

            function calcularPrecoCraft(nome) {
                const craftInterno = craftsData.find(c => c.name.toLowerCase() === nome.toLowerCase());
                if (!craftInterno) return null;
                let subtotal = 0;
                for (const [mat, val] of Object.entries(craftInterno.materiais)) {
                    const prod = allProdutos.find(p => p.name.toLowerCase() === mat.toLowerCase());
                    if (prod && typeof prod.price === "number") {
                        subtotal += prod.price * val;
                    } else {
                        const subPreco = calcularPrecoCraft(mat);
                        if (subPreco !== null) {
                            subtotal += subPreco * val;
                        } else {
                            return null;
                        }
                    }
                }
                return subtotal;
            }

            for (const [mat, val] of Object.entries(craft.materiais)) {
                const precoCraft = calcularPrecoCraft(mat);
                if (precoCraft !== null) {
                    total += precoCraft * val * qty;
                } else {
                    const prod = allProdutos.find(p => p.name.toLowerCase() === mat.toLowerCase());
                    if (prod && typeof prod.price === "number") {
                        total += prod.price * val * qty;
                    } else {
                        missing.push(mat);
                    }
                }
            }

            if (missing.length > 0) {
                priceSpan.innerHTML = `<span style="font-size:0.9em;color:#d00;" title="Sem preço para: ${missing.join(', ')}">❓</span>`;
            } else {
                priceSpan.innerHTML = `${total.toFixed(2)}$`;
            }
        }

        // Atualiza o preço ao mudar a quantidade
        input.addEventListener("input", updatePrice);

        // Chame uma vez ao criar
        updatePrice();

        // Linha horizontal para input e preço
        const inputRow = document.createElement("div");
        inputRow.style.display = "flex";
        inputRow.style.alignItems = "center";
        inputRow.style.justifyContent = "center";
        inputRow.appendChild(priceSpan);
        inputRow.appendChild(input);

        // Monta a célula
        cell.appendChild(name);
        cell.appendChild(img);
        cell.appendChild(inputRow);

        grid.appendChild(cell);
    });
}
window.renderCraftsTable = renderCraftsTable;

// Novo: calcula o total de materiais para todos os crafts
function calcularMateriaisTotal() {
    let totalMateriais = {};
    let algumPreenchido = false;
    craftsData.forEach((craft, idx) => {
        const qty = parseInt(document.getElementById(`craft-qty-${idx}`).value, 10) || 0;
        if (qty > 0) {
            algumPreenchido = true;
            for (const [mat, val] of Object.entries(craft.materiais)) {
                totalMateriais[mat] = (totalMateriais[mat] || 0) + val * qty;
            }
        }
    });
    if (!algumPreenchido) {
        document.getElementById("craft-result").innerHTML = `<span style="color:crimson;">Indique pelo menos uma quantidade.</span>`;
        return;
    }
    let html = `<b>Materiais necessários para todos os crafts:</b><ul style="margin-top:0.5em;">`;
    for (const [mat, val] of Object.entries(totalMateriais)) {
        html += `<li>${mat}: <b>${val}</b></li>`;
    }
    html += "</ul>";
    document.getElementById("craft-result").innerHTML = html;
}
window.calcularMateriaisTotal = calcularMateriaisTotal;

// Função para mostrar popup com materiais necessários para 1 unidade do item
function showCraftPopup(idx) {
    const craft = craftsData[idx];
    let html = `<b>Materiais para 1 ${craft.name}:</b><ul style="margin-top:0.5em;">`;
    let total = 0;
    let missing = [];
    // Função auxiliar para calcular preço de um craft pelo nome
    function calcularPrecoCraft(nome) {
        const craftInterno = craftsData.find(c => c.name.toLowerCase() === nome.toLowerCase());
        if (!craftInterno) return null;
        let subtotal = 0;
        for (const [mat, val] of Object.entries(craftInterno.materiais)) {
            // Recursivo: tenta calcular preço do material
            // Primeiro tenta pelo preço do produto, depois pelo craft
            const prod = allProdutos.find(p => p.name.toLowerCase() === mat.toLowerCase());
            if (prod && typeof prod.price === "number") {
                subtotal += prod.price * val;
            } else {
                // Tenta calcular recursivamente se for craft
                const subPreco = calcularPrecoCraft(mat);
                if (subPreco !== null) {
                    subtotal += subPreco * val;
                } else {
                    return null; // Falha se não conseguir calcular
                }
            }
        }
        return subtotal;
    }

    for (const [mat, val] of Object.entries(craft.materiais)) {
        let priceStr = '';
        let subtotal = 0;
        // 1º: tenta calcular pelo craftsData (recursivo)
        const precoCraft = calcularPrecoCraft(mat);
        if (precoCraft !== null) {
            subtotal = precoCraft * val;
            priceStr = ` x ${precoCraft.toFixed(2)}$ = <b>${subtotal.toFixed(2)} $</b> <span style="color:#888;font-size:0.9em;">(craft)</span>`;
            total += subtotal;
        } else {
            // 2º: tenta pelo allProdutos
            const prod = allProdutos.find(p => p.name.toLowerCase() === mat.toLowerCase());
            if (prod && typeof prod.price === "number") {
                subtotal = prod.price * val;
                priceStr = ` x ${prod.price}$ = <b>${subtotal.toFixed(2)} $</b>`;
                total += subtotal;
            } else {
                priceStr = ` <span style="color:#d00;">(sem preço)</span>`;
                missing.push(mat);
            }
        }
        html += `<li>${mat}: <b>${val}</b>${priceStr}</li>`;
    }
    html += "</ul>";
    if (missing.length > 0) {
        html += `<div style="color:#d00;font-size:0.95em;">Atenção: falta preço para ${missing.join(', ')}</div>`;
    }
    html += `<div style="margin-top:10px;font-weight:bold;font-size:1.1em;">Total: ${total.toFixed(2)} $</div>`;

    // Cria ou mostra o popup com o mesmo estilo do site (usa classes modal/modal-content)
    let popup = document.getElementById("craft-popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "craft-popup";
        popup.className = "modal";
        popup.innerHTML = `
            <div class="modal-content" id="craft-popup-modal-content">
                <button onclick="closeCraftPopup()" class="close-modal" title="Fechar" style="position:absolute;top:10px;right:14px;">&times;</button>
                <div id="craft-popup-content"></div>
            </div>
        `;
        document.body.appendChild(popup);
    } else {
        popup.style.display = "flex";
    }
    document.getElementById("craft-popup-content").innerHTML = html;

    // Adiciona o event listener para fechar ao clicar fora do modal-content
    popup.onclick = function(e) {
        if (e.target === popup) closeCraftPopup();
    };
}
window.showCraftPopup = showCraftPopup;

function closeCraftPopup() {
    const popup = document.getElementById("craft-popup");
    if (popup) popup.style.display = "none";
}
window.closeCraftPopup = closeCraftPopup;
