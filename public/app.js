// Configuration
const API_URL = 'http://localhost:5000/api';

// State Management
const app = {
    currentPage: 'home',
    user: null,
    token: localStorage.getItem('token'),
    tips: [],
    purchases: [],
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    renderApp();
    setupEventListeners();
});

// Initialize app state
function initializeApp() {
    if (app.token) {
        // Check if token is still valid
        fetchUserProfile();
    }
    fetchTips();
}

// Render main app
function renderApp() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = '';

    // Navbar
    appDiv.appendChild(createNavbar());

    // Main content
    const mainContent = document.createElement('div');
    mainContent.className = 'container';

    switch (app.currentPage) {
        case 'home':
            mainContent.appendChild(createHomePage());
            break;
        case 'register':
            mainContent.appendChild(createRegisterPage());
            break;
        case 'login':
            mainContent.appendChild(createLoginPage());
            break;
        case 'tips':
            mainContent.appendChild(createTipsPage());
            break;
        case 'purchases':
            mainContent.appendChild(createPurchasesPage());
            break;
        case 'profile':
            mainContent.appendChild(createProfilePage());
            break;
        case 'create-tip':
            mainContent.appendChild(createTipPage());
            break;
        default:
            mainContent.appendChild(createHomePage());
    }

    appDiv.appendChild(mainContent);
}

// Create Navbar
function createNavbar() {
    const nav = document.createElement('nav');
    nav.innerHTML = `
        <div class="navbar">
            <a href="#" class="logo" onclick="navigateTo('home'); return false;">💹 TradingTips</a>
            <ul class="nav-links">
                <li><a onclick="navigateTo('home'); return false;">Home</a></li>
                <li><a onclick="navigateTo('tips'); return false;">Tips</a></li>
                ${app.user ? `<li><a onclick="navigateTo('purchases'); return false;">My Purchases</a></li>` : ''}
            </ul>
            <div class="auth-section">
                ${app.user ? `
                    <div style="color: white; margin-right: 1rem;">
                        Welcome, <strong>${app.user.username}</strong>
                    </div>
                    <button class="btn btn-secondary btn-small" onclick="navigateTo('profile'); return false;">Profile</button>
                    <button class="btn btn-danger btn-small" onclick="logout();">Logout</button>
                ` : `
                    <button class="btn btn-primary btn-small" onclick="navigateTo('login'); return false;">Login</button>
                    <button class="btn btn-secondary btn-small" onclick="navigateTo('register'); return false;">Register</button>
                `}
            </div>
        </div>
    `;
    return nav;
}

// Create Home Page
function createHomePage() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="hero">
            <h1>🚀 Trading Tips & Betting Platform</h1>
            <p>Get expert trading strategies and sure betting tips. Pay once, access forever!</p>
            ${!app.user ? `
                <button class="btn btn-primary" onclick="navigateTo('register'); return false;">Get Started</button>
            ` : `
                <button class="btn btn-primary" onclick="navigateTo('tips'); return false;">Browse Tips</button>
            `}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin: 3rem 0;">
            <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3>📊 Proven Strategies</h3>
                <p>Access time-tested trading strategies with high win rates from expert traders.</p>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3>💳 Easy Payment</h3>
                <p>Pay securely using M-Pesa. Get instant access to premium content after payment.</p>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3>🔐 Lifetime Access</h3>
                <p>Once purchased, access your tips forever. No subscriptions or recurring fees.</p>
            </div>
        </div>
    `;
    return div;
}

// Create Register Page
function createRegisterPage() {
    const div = document.createElement('div');
    div.classList.add('form-container');
    div.innerHTML = `
        <h2>Create Account</h2>
        <form id="registerForm">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="regUsername" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="regEmail" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="regPassword" required>
            </div>
            <div class="form-group">
                <label>Phone Number (254XXXXXXXXX)</label>
                <input type="text" id="regPhone" placeholder="254712345678" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
            <p style="text-align: center; margin-top: 1rem;">
                Already have an account? <a href="#" onclick="navigateTo('login'); return false;">Login here</a>
            </p>
        </form>
        <div id="registerMessage"></div>
    `;

    div.querySelector('#registerForm').addEventListener('submit', handleRegister);
    return div;
}

// Create Login Page
function createLoginPage() {
    const div = document.createElement('div');
    div.classList.add('form-container');
    div.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="loginPassword" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
            <p style="text-align: center; margin-top: 1rem;">
                Don't have an account? <a href="#" onclick="navigateTo('register'); return false;">Register here</a>
            </p>
        </form>
        <div id="loginMessage"></div>
    `;

    div.querySelector('#loginForm').addEventListener('submit', handleLogin);
    return div;
}

// Create Tips Page
function createTipsPage() {
    const div = document.createElement('div');
    
    if (!app.user) {
        div.innerHTML = `
            <div class="alert alert-error">
                Please <a href="#" onclick="navigateTo('login'); return false;">login</a> to view and purchase tips.
            </div>
        `;
        return div;
    }

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Available Trading Tips</h2>
            <button class="btn btn-primary" onclick="navigateTo('create-tip'); return false;">+ Create New Tip</button>
        </div>
        <div id="tipsList" class="tips-container"></div>
    `;

    if (app.tips.length === 0) {
        div.querySelector('#tipsList').innerHTML = '<p>No tips available yet.</p>';
    } else {
        app.tips.forEach(tip => {
            div.querySelector('#tipsList').appendChild(createTipCard(tip));
        });
    }

    return div;
}

// Create Tip Card
function createTipCard(tip) {
    const card = document.createElement('div');
    card.classList.add('tip-card');
    card.innerHTML = `
        <div class="tip-header">
            <div class="tip-title">${tip.title}</div>
            <span class="tip-category">${tip.category || 'General'}</span>
        </div>
        <div class="tip-body">
            <p class="tip-description">${tip.description}</p>
            <div class="tip-price">KES ${tip.price}</div>
            <div class="tip-meta">
                <div class="win-rate">
                    <span>📈 Win Rate:</span>
                    <span class="win-rate-badge">${tip.win_rate || 0}%</span>
                </div>
                <small style="color: #999;">by ${tip.created_by_name || 'Admin'}</small>
            </div>
            <div class="tip-actions">
                <button class="btn btn-primary btn-small" onclick="viewTipDetails(${tip.id});">View</button>
                <button class="btn btn-secondary btn-small" onclick="openPaymentModal(${tip.id}, ${tip.price});">Buy Now</button>
            </div>
        </div>
    `;
    return card;
}

// Create Purchases Page
function createPurchasesPage() {
    const div = document.createElement('div');
    
    if (!app.user) {
        div.innerHTML = `
            <div class="alert alert-error">
                Please <a href="#" onclick="navigateTo('login'); return false;">login</a> to view purchases.
            </div>
        `;
        return div;
    }

    div.innerHTML = `
        <h2>My Purchases</h2>
        <div id="purchasesList"></div>
    `;

    fetchUserPurchases().then(() => {
        const purchasesList = div.querySelector('#purchasesList');
        if (app.purchases.length === 0) {
            purchasesList.innerHTML = '<div class="no-purchases">You haven\'t purchased any tips yet.</div>';
        } else {
            const container = document.createElement('div');
            container.classList.add('tips-container');
            app.purchases.forEach(purchase => {
                container.appendChild(createTipCard(purchase));
            });
            purchasesList.appendChild(container);
        }
    });

    return div;
}

// Create Profile Page
function createProfilePage() {
    const div = document.createElement('div');
    
    if (!app.user) {
        div.innerHTML = `
            <div class="alert alert-error">
                Please <a href="#" onclick="navigateTo('login'); return false;">login</a> to view profile.
            </div>
        `;
        return div;
    }

    div.classList.add('profile-section');
    div.innerHTML = `
        <h2>My Profile</h2>
        <div class="profile-info">
            <label>Username:</label>
            <p>${app.user.username}</p>
        </div>
        <div class="profile-info">
            <label>Email:</label>
            <p>${app.user.email}</p>
        </div>
        <div class="profile-info">
            <label>Phone Number:</label>
            <p>${app.user.phoneNumber}</p>
        </div>
        <button class="btn btn-danger" onclick="logout();">Logout</button>
    `;

    return div;
}

// Create Tip Creation Page
function createTipPage() {
    const div = document.createElement('div');
    div.classList.add('form-container');
    div.innerHTML = `
        <h2>Create New Trading Tip</h2>
        <form id="createTipForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="tipTitle" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="tipDescription" required></textarea>
            </div>
            <div class="form-group">
                <label>Strategy Details</label>
                <textarea id="tipStrategy" required></textarea>
            </div>
            <div class="form-group">
                <label>Price (KES)</label>
                <input type="number" id="tipPrice" min="1" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="tipCategory">
                    <option value="Forex">Forex</option>
                    <option value="Crypto">Cryptocurrency</option>
                    <option value="Stocks">Stocks</option>
                    <option value="Betting">Betting</option>
                    <option value="General">General</option>
                </select>
            </div>
            <div class="form-group">
                <label>Win Rate (%)</label>
                <input type="number" id="tipWinRate" min="0" max="100" placeholder="85">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Create Tip</button>
        </form>
        <div id="createTipMessage"></div>
    `;

    div.querySelector('#createTipForm').addEventListener('submit', handleCreateTip);
    return div;
}

// Handler Functions
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phoneNumber = document.getElementById('regPhone').value;

    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            username,
            email,
            password,
            phoneNumber
        });

        showMessage('registerMessage', 'Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => navigateTo('login'), 2000);
    } catch (error) {
        const message = error.response?.data?.error || 'Registration failed';
        showMessage('registerMessage', message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        app.token = response.data.token;
        app.user = response.data.user;
        localStorage.setItem('token', app.token);

        showMessage('loginMessage', 'Login successful!', 'success');
        setTimeout(() => {
            navigateTo('tips');
        }, 1000);
    } catch (error) {
        const message = error.response?.data?.error || 'Login failed';
        showMessage('loginMessage', message, 'error');
    }
}

async function handleCreateTip(e) {
    e.preventDefault();
    
    const title = document.getElementById('tipTitle').value;
    const description = document.getElementById('tipDescription').value;
    const strategy = document.getElementById('tipStrategy').value;
    const price = parseFloat(document.getElementById('tipPrice').value);
    const category = document.getElementById('tipCategory').value;
    const winRate = parseFloat(document.getElementById('tipWinRate').value) || 0;

    try {
        await axios.post(`${API_URL}/tips`, {
            title,
            description,
            strategy,
            price,
            category,
            winRate
        }, {
            headers: { Authorization: `Bearer ${app.token}` }
        });

        showMessage('createTipMessage', 'Tip created successfully!', 'success');
        setTimeout(() => {
            fetchTips();
            navigateTo('tips');
        }, 1500);
    } catch (error) {
        const message = error.response?.data?.error || 'Failed to create tip';
        showMessage('createTipMessage', message, 'error');
    }
}

// Payment Functions
function openPaymentModal(tipId, price) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = `paymentModal_${tipId}`;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Confirm Purchase</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove();">✕</button>
            </div>
            <form id="paymentForm" onsubmit="handlePayment(event, ${tipId}, ${price})">
                <div class="form-group">
                    <label>Phone Number (254XXXXXXXXX)</label>
                    <input type="text" id="paymentPhone" value="${app.user?.phoneNumber || ''}" placeholder="254712345678" required>
                </div>
                <div class="form-group">
                    <label>Amount: <strong>KES ${price}</strong></label>
                </div>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
                    You will receive an M-Pesa prompt on your phone to complete the payment.
                </p>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Proceed to Payment</button>
            </form>
            <div id="paymentMessage"></div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handlePayment(e, tipId, price) {
    e.preventDefault();
    
    const phoneNumber = document.getElementById('paymentPhone').value;

    try {
        const response = await axios.post(`${API_URL}/mpesa/initiate-payment`, {
            phoneNumber,
            amount: price,
            tipsId: tipId
        });

        showMessage('paymentMessage', 'STK Push sent! Check your phone to complete payment.', 'success');
        
        // Store checkout request ID for status checking
        const checkoutRequestId = response.data.checkoutRequestId;
        
        // Poll for payment status
        pollPaymentStatus(checkoutRequestId, tipId);
        
        setTimeout(() => {
            document.getElementById(`paymentModal_${tipId}`).remove();
        }, 3000);
    } catch (error) {
        const message = error.response?.data?.error || 'Payment failed';
        showMessage('paymentMessage', message, 'error');
    }
}

async function pollPaymentStatus(checkoutRequestId, tipId) {
    // Poll every 5 seconds for status
    const pollInterval = setInterval(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/mpesa/transaction-status/${checkoutRequestId}`,
                { headers: { Authorization: `Bearer ${app.token}` } }
            );

            if (response.data.ResultCode === 0) {
                clearInterval(pollInterval);
                showNotification('Payment successful! Tip added to your purchases.', 'success');
                fetchUserPurchases();
            }
        } catch (error) {
            // Continue polling
        }
    }, 5000);

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(pollInterval), 120000);
}

// API Functions
async function fetchTips() {
    try {
        const response = await axios.get(`${API_URL}/tips`);
        app.tips = response.data;
    } catch (error) {
        console.error('Error fetching tips:', error);
    }
}

async function fetchUserProfile() {
    try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${app.token}` }
        });
        app.user = response.data;
    } catch (error) {
        // Token invalid, clear it
        app.token = null;
        localStorage.removeItem('token');
    }
}

async function fetchUserPurchases() {
    try {
        const response = await axios.get(`${API_URL}/tips/user/purchases`, {
            headers: { Authorization: `Bearer ${app.token}` }
        });
        app.purchases = response.data;
    } catch (error) {
        console.error('Error fetching purchases:', error);
    }
}

// Navigation
function navigateTo(page) {
    app.currentPage = page;
    renderApp();
    window.scrollTo(0, 0);
}

function logout() {
    app.user = null;
    app.token = null;
    app.purchases = [];
    localStorage.removeItem('token');
    navigateTo('home');
}

function viewTipDetails(tipId) {
    const tip = app.tips.find(t => t.id === tipId);
    if (tip) {
        alert(`${tip.title}\n\nStrategy: ${tip.strategy}\n\nPrice: KES ${tip.price}`);
    }
}

// Utilities
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10000';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

function setupEventListeners() {
    // Add any global event listeners here
}
