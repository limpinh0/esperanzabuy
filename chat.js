class PublicChatClient {
	constructor() {
		this.socket = null;
		this.userName = '';
		this.roomId = '';
		this.isConnected = false;
		this.serverUrl = "https://api.esperanzabuy.pt"
		// this.serverUrl = this.getDefaultServerUrl();
		// this.init();
	}

	getDefaultServerUrl() {
		// Try to get from localStorage first
		const stored = localStorage.getItem('chat-server-url');
		stored = this.serverUrl;
		if (stored) return stored;

		// Default URLs to try
		const defaults = [
			"https://api.esperanzabuy.pt",
			'http://localhost:3000',
			'http://127.0.0.1:3000'
		];

		return defaults[0];
	}

	init() {
		// this.setupUI();
		this.connectToServer();
		this.setupEventListeners();
	}

	setupUI() {
		document.getElementById('serverUrl').value = this.serverUrl;
	}

	connectToServer() {
		if (this.socket) {
			this.socket.disconnect();
		}

		this.updateConnectionStatus('Connecting...', 'pending');

		try {
			this.socket = io(this.serverUrl, {
				transports: ['websocket', 'polling'],
				timeout: 10000,
				forceNew: true
			});

			this.setupSocketEvents();
		} catch (error) {
			this.showError('Failed to connect to server: ' + error.message);
			this.updateConnectionStatus('Connection failed', 'error');
		}
	}

	setupSocketEvents() {
		this.socket.on('connect', () => {
			this.isConnected = true;
			this.updateConnectionStatus('Connected', 'success');
			this.clearError();
			//document.getElementById('startChatBtn').disabled = false;
		});

		this.socket.on('disconnect', () => {
			this.isConnected = false;
			this.updateConnectionStatus('Disconnected', 'error');
			//document.getElementById('startChatBtn').disabled = true;
			document.getElementById('sendBtn').disabled = true;
		});

		this.socket.on('room-joined', (data) => {
			this.roomId = data.roomId;
			this.showChatArea();

			// Display existing messages
			data.messages.forEach(message => {
				this.displayMessage(message);
			});
		});

		this.socket.on('message', (message) => {
			this.displayMessage(message);
		});

		this.socket.on('connect_error', (error) => {
			this.showError(`Connection failed: ${error.message}. Please check the server URL and try again.`);
			this.updateConnectionStatus('Connection failed', 'error');
			document.getElementById('startChatBtn').disabled = true;
		});

		this.socket.on('error', (error) => {
			this.showError('Socket error: ' + error);
		});
	}

	setupEventListeners() {
		// Enter key to join chat
		document.getElementById('userName').addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && !document.getElementById('startChatBtn').disabled) {
				this.joinChat();
			}
		});

		// Enter key to send message
		document.getElementById('messageInput').addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && !document.getElementById('sendBtn').disabled) {
				this.sendMessage();
			}
		});

		// Server URL input
		document.getElementById('serverUrl').addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				this.connectToServer();
			}
		});
	}

	joinChat() {
		const nameInput = document.getElementById('userName');
		const name = nameInput.value.trim();

		if (!name) {
			this.showError('Please enter your name');
			return;
		}

		if (!this.isConnected) {
			this.showError('Not connected to server. Please check the server URL and connection.');
			return;
		}

		this.userName = name;
		this.socket.emit('user-join', {
			userName: this.userName
		});

		document.getElementById('startChatBtn').disabled = true;
		document.getElementById('startChatBtn').textContent = 'Joining...';
	}

	showChatArea() {
		document.getElementById('userSetup').style.display = 'none';
		document.getElementById('chatArea').style.display = 'flex';
		document.getElementById('messageInput').focus();
		document.getElementById('sendBtn').disabled = false;
	}

	sendMessage() {
		const messageInput = document.getElementById('messageInput');
		const message = messageInput.value.trim();

		if (!message || !this.isConnected) return;

		this.socket.emit('send-message', {
			message: message,
			roomId: this.roomId
		});

		messageInput.value = '';
	}

	displayMessage(messageData) {
		const messagesDiv = document.getElementById('messages');
		const messageEl = document.createElement('div');

		messageEl.className = `message ${messageData.type}`;

		let senderInfo = '';
		if (messageData.type === 'staff') {
			senderInfo = '<div class="message-sender">Staff</div>';
		} else if (messageData.type === 'user' && messageData.sender !== this.userName) {
			senderInfo = `<div class="message-sender">${messageData.sender}</div>`;
		}

		const timeStr = new Date(messageData.timestamp).toLocaleTimeString();

		messageEl.innerHTML = `
                    ${senderInfo}
                    <div class="message-bubble">
                        ${this.escapeHtml(messageData.message)}
                    </div>
                    <div class="message-time">${timeStr}</div>
                `;

		messagesDiv.appendChild(messageEl);
		messagesDiv.scrollTop = messagesDiv.scrollHeight;
	}

	updateConnectionStatus(status, type) {
		const statusEl = document.getElementById('connectionStatus');
		statusEl.textContent = status;
		statusEl.style.color = type === 'success' ? '#4ade80' :
			type === 'error' ? '#f87171' :
				type === 'pending' ? '#fbbf24' : 'inherit';
	}

	showError(message) {
		const errorContainer = document.getElementById('errorContainer');
		errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
	}

	clearError() {
		document.getElementById('errorContainer').innerHTML = '';
	}

	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	// Server configuration methods
	updateServerUrl(url) {
		this.serverUrl = url;
		//localStorage.setItem('chat-server-url', url);
		this.connectToServer();
	}

	async testConnection() {
		const url = document.getElementById('serverUrl').value.trim();
		if (!url) {
			this.showError('Please enter a server URL');
			return;
		}

		try {
			const response = await fetch(url + '/health');
			if (response.ok) {
				const data = await response.json();
				alert(`✅ Server is reachable!\n\nStatus: ${data.status}\nActive rooms: ${data.activeRooms}\nStaff online: ${data.connectedStaff}`);
			} else {
				alert('❌ Server responded but with an error: ' + response.status);
			}
		} catch (error) {
			alert('❌ Cannot reach server: ' + error.message);
		}
	}
}

// Initialize chat when page loads
let chatClient;
document.addEventListener('DOMContentLoaded', () => {
	chatClient = new PublicChatClient();
});

// Global functions for button clicks
function joinChat() {
	chatClient.joinChat();
}

function sendMessage() {
	chatClient.sendMessage();
}

function toggleConfig() {
	const config = document.getElementById('serverConfig');
	const toggle = document.getElementById('configToggle');

	if (config.style.display === 'none') {
		config.style.display = 'block';
		toggle.textContent = '⚙️ Hide Settings';
	} else {
		config.style.display = 'none';
		toggle.textContent = '⚙️ Server Settings';
	}
}

function connectToServer() {
	const url = document.getElementById('serverUrl').value.trim();
	if (!url) {
		chatClient.showError('Please enter a server URL');
		return;
	}
	chatClient.updateServerUrl(url);
	//chatClient.connectToServer();
}

function initialConnect() {
	chatClient.setupUI();
	chatClient.connectToServer();
}

function testMainConnection() {
	chatClient.testConnection();
}