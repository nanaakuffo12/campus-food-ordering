// ========== API CONFIGURATION ==========
const API_URL = (() => {
    if (window.location.hostname.includes('github.io')) {
        return 'https://campus-food-ordering.onrender.com/api';
    }
    return 'http://localhost:3000/api';
})();

// ========== PAGE SWITCHING ==========
function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const page = document.getElementById(`page-${pageName}`);
    if (page) {
        page.style.display = 'block';
    }
    
    // Load page-specific content
    if (pageName === 'menu') {
        loadMenuItems();
    } else if (pageName === 'cart') {
        loadCart();
    } else if (pageName === 'checkout') {
        loadCheckout();
    } else if (pageName === 'orders') {
        loadOrderHistory();
    } else if (pageName === 'profile') {
        loadUserProfile();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ========== AUTHENTICATION ==========
function getToken() {
    return localStorage.getItem('authToken');
}

function isAuthenticated() {
    return !!getToken();
}

function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function handleAuthClick() {
    if (isAuthenticated()) {
        handleLogout();
    } else {
        switchPage('login');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        const data = await response.json();
        if (data.success || response.ok) {
            localStorage.setItem('authToken', data.token || data.data?.token);
            showNotification('Login successful!', 'success');
            updateAuthUI();
            switchPage('home');
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error during login', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        const data = await response.json();
        if (data.success || response.ok) {
            localStorage.setItem('authToken', data.token || data.data?.token);
            showNotification('Signup successful!', 'success');
            updateAuthUI();
            switchPage('home');
        } else {
            showNotification(data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error during signup', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('cart');
    showNotification('Logged out successfully', 'success');
    updateAuthUI();
    switchPage('home');
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const profileNav = document.getElementById('profile-nav');
    const ordersNav = document.getElementById('orders-nav');
    const logoutNav = document.getElementById('logout-nav');
    
    if (isAuthenticated()) {
        const token = getToken();
        const user = decodeToken(token);
        
        loginBtn.textContent = `${user?.email || 'User'} (Logout)`;
        loginBtn.style.background = '#f44336';
        
        profileNav.style.display = 'block';
        ordersNav.style.display = 'block';
        logoutNav.style.display = 'block';
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.style.background = '';
        
        profileNav.style.display = 'none';
        ordersNav.style.display = 'none';
        logoutNav.style.display = 'none';
    }
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease-in-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ========== UTILITIES ==========
function formatCurrency(amount) {
    return `₵${parseFloat(amount).toFixed(2)}`;
}

function getStatusColor(status) {
    const colors = {
        'Pending': '#ff9800',
        'Preparing': '#2196f3',
        'Ready': '#4caf50',
        'Completed': '#81c784'
    };
    return colors[status] || '#999';
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatCurrency(total);
    }
}

// ========== MENU FUNCTIONALITY ==========
async function loadMenuItems() {
    const menuContainer = document.getElementById('menu-items');
    if (!menuContainer) return;

    try {
        const response = await fetch(`${API_URL}/menu`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            menuContainer.innerHTML = '';
            data.data.forEach(item => {
                menuContainer.innerHTML += `
                    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px; border-radius: 4px; text-align: center; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3>${item.name}</h3>
                        <p style="color: #666;">${item.description || 'Delicious item'}</p>
                        <p style="font-size: 12px; color: #999;">${item.category || 'Food'}</p>
                        <p style="font-size: 20px; font-weight: bold; color: #2196f3;">${formatCurrency(item.price)}</p>
                        <button class="btn" onclick="addToCart(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price})" style="background: #4CAF50; color: white; padding: 8px 16px; border: none; cursor: pointer; border-radius: 3px;">Add to Cart</button>
                    </div>
                `;
            });
        } else {
            menuContainer.innerHTML = '<p>No menu items available</p>';
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContainer.innerHTML = '<p style="color: red;">Error loading menu</p>';
    }
}

function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(i => i.id === id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart!`, 'success');
}

// ========== CART FUNCTIONALITY ==========
function loadCart() {
    const cartContainer = document.getElementById('cart-items');
    const checkoutSection = document.getElementById('checkout-section');
    if (!cartContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty</p>';
        checkoutSection.style.display = 'none';
        return;
    }

    let totalPrice = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * (item.quantity || 1);
        totalPrice += itemTotal;
        cartContainer.innerHTML += `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0;">${item.name}</h4>
                        <p style="margin: 5px 0; color: #666;">${formatCurrency(item.price)} × ${item.quantity} = ${formatCurrency(itemTotal)}</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" min="1" value="${item.quantity}" onchange="updateCartQty(${index}, this.value)" style="width: 60px; padding: 5px;">
                        <button onclick="removeFromCart(${index})" style="background: #f44336; color: white; padding: 5px 10px; border: none; cursor: pointer; border-radius: 3px;">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML += `
        <div style="margin-top: 20px; border-top: 2px solid #333; padding-top: 15px;">
            <h3>Total: ${formatCurrency(totalPrice)}</h3>
        </div>
    `;
    
    checkoutSection.style.display = 'block';
}

function updateCartQty(index, qty) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (qty <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = parseInt(qty);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
    showNotification('Item removed', 'info');
}

// ========== CHECKOUT FUNCTIONALITY ==========
function loadCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const checkoutItemsDiv = document.getElementById('checkout-items');
    const checkoutTotalSpan = document.getElementById('checkout-total');
    
    checkoutItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        checkoutItemsDiv.innerHTML += `
            <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <p style="margin: 0;"><strong>${item.name}</strong></p>
                <p style="margin: 5px 0; color: #666;">${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(itemTotal)}</p>
            </div>
        `;
    });
    
    checkoutTotalSpan.textContent = formatCurrency(total);
}

async function placeOrder() {
    if (!isAuthenticated()) {
        showNotification('Please log in to place an order', 'error');
        switchPage('login');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        showNotification('Cart is empty', 'error');
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                items: cart,
                totalPrice: totalPrice
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.removeItem('cart');
            updateCartCount();
            showNotification('Order placed successfully!', 'success');
            setTimeout(() => {
                switchPage('orders');
            }, 1500);
        } else {
            showNotification(data.message || 'Error placing order', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error placing order', 'error');
    }
}

// ========== ORDERS FUNCTIONALITY ==========
async function loadOrderHistory() {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    if (!isAuthenticated()) {
        ordersContainer.innerHTML = '<p>Please log in to view orders</p>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {'Authorization': `Bearer ${getToken()}`}
        });

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            if (data.data.length === 0) {
                ordersContainer.innerHTML = '<p>No orders yet. <a href="#" onclick="switchPage(\'menu\'); return false;">Start ordering!</a></p>';
                return;
            }

            ordersContainer.innerHTML = '';
            data.data.forEach(order => {
                const itemsList = Array.isArray(order.items) 
                    ? order.items.map(item => `${item.name} x${item.quantity || 1}`).join(', ')
                    : 'Items unavailable';

                ordersContainer.innerHTML += `
                    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; background: #f9f9f9;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0;">Order #${order.id}</h3>
                                <p style="margin: 5px 0; color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                                <p style="margin: 5px 0;"><strong>Items:</strong> ${itemsList}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 5px 0;"><strong>Total:</strong> ${formatCurrency(order.totalPrice)}</p>
                                <p style="margin: 5px 0; padding: 5px 10px; border-radius: 3px; background: ${getStatusColor(order.status)}; color: white; display: inline-block;">${order.status}</p>
                                ${order.status === 'Pending' ? `<button onclick="cancelOrder(${order.id})" style="background: #f44336; color: white; padding: 5px 10px; border: none; cursor: pointer; border-radius: 3px; margin-top: 10px;">Cancel</button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error('Error:', error);
        ordersContainer.innerHTML = '<p style="color: red;">Error loading orders</p>';
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${getToken()}`}
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showNotification('Order cancelled', 'success');
            loadOrderHistory();
        } else {
            showNotification(data.message || 'Error cancelling order', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error cancelling order', 'error');
    }
}

// ========== PROFILE FUNCTIONALITY ==========
async function loadUserProfile() {
    const profileContainer = document.getElementById('profile-container');
    if (!profileContainer) return;

    if (!isAuthenticated()) {
        switchPage('login');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {'Authorization': `Bearer ${getToken()}`}
        });

        const data = await response.json();

        if (data.success && data.data) {
            const user = data.data;
            profileContainer.innerHTML = `
                <div style="border: 1px solid #ddd; padding: 20px; border-radius: 4px; max-width: 500px;">
                    <div style="margin: 15px 0;">
                        <label><strong>Email:</strong></label>
                        <p>${user.email}</p>
                    </div>
                    <div style="margin: 15px 0;">
                        <label><strong>Name</strong></label>
                        <input type="text" id="profile-name" value="${user.name || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px; box-sizing: border-box;">
                    </div>
                    <div style="margin: 15px 0;">
                        <label><strong>Room Number</strong></label>
                        <input type="text" id="profile-room" value="${user.roomNumber || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px; box-sizing: border-box;">
                    </div>
                    <div style="margin: 15px 0;">
                        <label><strong>Phone</strong></label>
                        <input type="text" id="profile-phone" value="${user.phone || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px; box-sizing: border-box;">
                    </div>
                    <button onclick="saveProfile()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; border-radius: 3px;">Save Changes</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        profileContainer.innerHTML = '<p style="color: red;">Error loading profile</p>';
    }
}

async function saveProfile() {
    const name = document.getElementById('profile-name')?.value || '';
    const roomNumber = document.getElementById('profile-room')?.value || '';
    const phone = document.getElementById('profile-phone')?.value || '';

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({name, roomNumber, phone})
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Profile updated', 'success');
        } else {
            showNotification(data.message || 'Error updating profile', 'error');
        }
    } catch (error) {
        showNotification('Error saving profile', 'error');
    }
}

// ========== CONTACT FORM ==========
function handleContactSubmit(event) {
    event.preventDefault();
    showNotification('Thank you for contacting us! We will get back to you soon.', 'success');
    document.getElementById('contact-form').reset();
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateAuthUI();
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});

console.log('✅ Campus Food Ordering System Loaded');

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Decode JWT token (simple base64 decode)
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease-in-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Format currency
function formatCurrency(amount) {
    return `₵${parseFloat(amount).toFixed(2)}`;
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'Pending': '#ff9800',
        'Preparing': '#2196f3',
        'Ready': '#4caf50',
        'Completed': '#81c784'
    };
    return colors[status] || '#999';
}

// Logout user
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('cart');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Update cart count and total display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatCurrency(total);
    }
}

// Format menu item HTML
function formatMenuItem(item) {
    return `
        <div class="menu-item" data-id="${item.id}">
            <h3>${item.name}</h3>
            <p>${item.description || 'Delicious item'}</p>
            <p class="category"><small>${item.category || 'Food'}</small></p>
            <p class="price">${formatCurrency(item.price)}</p>
            <button class="btn add-to-cart-btn" data-item='${JSON.stringify(item)}'>Add to Cart</button>
        </div>
    `;
}

// Load menu items from API
async function loadMenuItems() {
    const menuContainer = document.getElementById('menu-items');
    if (!menuContainer) return;

    try {
        const response = await fetch(`${API_URL}/menu`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            menuContainer.innerHTML = '';
            data.data.forEach(item => {
                menuContainer.innerHTML += formatMenuItem(item);
            });

            // Add event listeners to add to cart buttons
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const item = JSON.parse(this.dataset.item);
                    addToCart(item);
                });
            });
        } else {
            menuContainer.innerHTML = '<p>No menu items available</p>';
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        const menuContainer = document.getElementById('menu-items');
        if (menuContainer) {
            menuContainer.innerHTML = '<p style="color: red;">Error loading menu. Please refresh the page.</p>';
        }
    }
}

// Add item to cart
function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(i => i.id === item.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${item.name} added to cart!`, 'success');
}

// Load cart items
function loadCart() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    let totalPrice = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * (item.quantity || 1);
        totalPrice += itemTotal;
        cartContainer.innerHTML += `
            <div class="cart-item" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <h4>${item.name}</h4>
                <p>Price: ${formatCurrency(item.price)}</p>
                <p>Quantity: <input type="number" min="1" value="${item.quantity || 1}" data-index="${index}" class="qty-input" style="width: 60px;"></p>
                <p>Subtotal: ${formatCurrency(itemTotal)}</p>
                <button class="btn btn-danger remove-item-btn" data-index="${index}" style="background: #f44336; color: white; padding: 5px 10px; border: none; cursor: pointer; border-radius: 3px;">Remove</button>
            </div>
        `;
    });

    cartContainer.innerHTML += `<h3 style="margin-top: 20px;">Total: ${formatCurrency(totalPrice)}</h3>`;

    // Add event listeners
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function() {
            updateCartItemQuantity(parseInt(this.dataset.index), parseInt(this.value));
        });
    });

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            removeFromCart(parseInt(this.dataset.index));
        });
    });
}

// Update cart item quantity
function updateCartItemQuantity(index, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (quantity <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = quantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
}

// Remove from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
    showNotification('Item removed from cart', 'info');
}

// Place order
async function placeOrder() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const token = getToken();

    if (!token) {
        showNotification('Please log in to place an order', 'error');
        return;
    }

    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: cart,
                totalPrice: totalPrice
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.removeItem('cart');
            updateCartCount();
            showNotification('Order placed successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'order-history.html';
            }, 1500);
        } else {
            showNotification(data.message || 'Error placing order', 'error');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order. Please try again.', 'error');
    }
}

// Load order history
async function loadOrderHistory() {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    const token = getToken();
    if (!token) {
        ordersContainer.innerHTML = '<p>Please log in to view your orders</p>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            if (data.data.length === 0) {
                ordersContainer.innerHTML = '<p>No orders yet. <a href="menu.html">Start ordering!</a></p>';
                return;
            }

            ordersContainer.innerHTML = '';
            data.data.forEach(order => {
                const itemsList = Array.isArray(order.items) 
                    ? order.items.map(item => `${item.name} x${item.quantity || 1}`).join(', ')
                    : 'Items details not available';

                ordersContainer.innerHTML += `
                    <div class="order-card" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; background: #f9f9f9;">
                        <h3>Order #${order.id}</h3>
                        <p><strong>Status:</strong> <span style="color: ${getStatusColor(order.status)}; font-weight: bold;">${order.status}</span></p>
                        <p><strong>Items:</strong> ${itemsList}</p>
                        <p><strong>Total:</strong> ${formatCurrency(order.totalPrice)}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                        <button class="btn view-order-btn" data-order-id="${order.id}" style="margin-top: 10px; background: #2196f3; color: white; padding: 8px 15px; border: none; cursor: pointer; border-radius: 3px;">View Details</button>
                        ${order.status === 'Pending' ? `<button class="btn cancel-order-btn" data-order-id="${order.id}" style="margin-top: 10px; margin-left: 10px; background: #f44336; color: white; padding: 8px 15px; border: none; cursor: pointer; border-radius: 3px;">Cancel Order</button>` : ''}
                    </div>
                `;
            });

            // Add event listeners
            document.querySelectorAll('.view-order-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    viewOrderDetails(this.dataset.orderId);
                });
            });

            document.querySelectorAll('.cancel-order-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    cancelOrder(this.dataset.orderId);
                });
            });
        } else {
            ordersContainer.innerHTML = '<p>Error loading orders</p>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = '<p style="color: red;">Error loading orders. Please try again.</p>';
    }
}

// View order details
function viewOrderDetails(orderId) {
    // This could open a modal or navigate to a details page
    alert(`Viewing order #${orderId}`);
}

// Cancel order
async function cancelOrder(orderId) {
    const token = getToken();
    if (!token) {
        showNotification('Please log in to cancel an order', 'error');
        return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showNotification('Order cancelled successfully', 'success');
            loadOrderHistory();
        } else {
            showNotification(data.message || 'Error cancelling order', 'error');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Error cancelling order. Please try again.', 'error');
    }
}

// Load user profile
async function loadUserProfile() {
    const profileContainer = document.getElementById('profile-container');
    if (!profileContainer) return;

    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success && data.data) {
            const user = data.data;
            profileContainer.innerHTML = `
                <div class="profile-card" style="border: 1px solid #ddd; padding: 20px; border-radius: 4px; max-width: 500px;">
                    <h2>User Profile</h2>
                    <div class="profile-field" style="margin: 15px 0;">
                        <label><strong>Email:</strong></label>
                        <p>${user.email}</p>
                    </div>
                    <div class="profile-field" style="margin: 15px 0;">
                        <label><strong>Name:</strong></label>
                        <input type="text" id="name-field" value="${user.name || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
                    </div>
                    <div class="profile-field" style="margin: 15px 0;">
                        <label><strong>Room Number:</strong></label>
                        <input type="text" id="room-field" value="${user.roomNumber || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
                    </div>
                    <div class="profile-field" style="margin: 15px 0;">
                        <label><strong>Phone:</strong></label>
                        <input type="text" id="phone-field" value="${user.phone || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
                    </div>
                    <button class="btn save-profile-btn" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; border-radius: 3px; margin-top: 15px;">Save Changes</button>
                </div>
            `;

            document.querySelector('.save-profile-btn').addEventListener('click', saveProfile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        profileContainer.innerHTML = '<p style="color: red;">Error loading profile</p>';
    }
}

// Save user profile
async function saveProfile() {
    const token = getToken();
    if (!token) {
        showNotification('Please log in to update profile', 'error');
        return;
    }

    const name = document.getElementById('name-field')?.value || '';
    const roomNumber = document.getElementById('room-field')?.value || '';
    const phone = document.getElementById('phone-field')?.value || '';

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                roomNumber,
                phone
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Profile updated successfully', 'success');
        } else {
            showNotification(data.message || 'Error updating profile', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Error saving profile', 'error');
    }
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and protect pages
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const protectedPages = ['cart.html', 'checkout.html', 'order-history.html', 'order-tracking.html', 'profile.html'];
    
    if (protectedPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Update cart count
    updateCartCount();

    // Setup header with user info if authenticated
    const loginBtn = document.getElementById('login-btn');
    if (isAuthenticated()) {
        const token = getToken();
        const user = decodeToken(token);
        if (loginBtn) {
            loginBtn.textContent = `${user?.email || 'User'} (Logout)`;
            loginBtn.href = '#';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                handleLogout();
            };
        }
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.href = 'login.html';
        }
    }

    // Load page-specific content
    if (currentPage === 'menu.html') {
        loadMenuItems();
    } else if (currentPage === 'cart.html') {
        loadCart();
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                window.location.href = 'checkout.html';
            });
        }
    } else if (currentPage === 'checkout.html') {
        loadCart();
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', placeOrder);
        }
    } else if (currentPage === 'order-history.html') {
        loadOrderHistory();
    } else if (currentPage === 'profile.html') {
        loadUserProfile();
    }

    // Add styles for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .menu-item {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px;
            border-radius: 4px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
});

console.log('✅ Application script loaded successfully');
