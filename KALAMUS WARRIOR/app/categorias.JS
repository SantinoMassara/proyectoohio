
const productosNode = document.querySelectorAll('.producto');
const listaNode = document.querySelector('#lista');
const contadorCarrito = document.querySelector('#contadorCarrito');
const carritoPanel = document.querySelector('#carritoPanel');
const totalPrecioSpan = document.querySelector('.totalPrecio');
const botonVaciar = document.querySelector('#vaciar');


if (!carritoPanel) {
    createCarritoPanel();
}

// KEY del localStorage
const LS_KEY = 'vinylstore_cart_v1';
let cart = loadCartFromStorage();

// Render inicial
renderCart();
updateCounter();

function createCarritoPanel() {
    const aside = document.createElement("aside");
    aside.id = "carritoPanel";
    aside.className = "carritoPanel";

    aside.innerHTML = `
        <h2>Carrito de Compras</h2>
        <ul id="lista"></ul>
        <p class="total">Total: <span class="totalPrecio">$0</span></p>
        <button id="vaciar">Vaciar Carrito</button>
    `;

    document.body.appendChild(aside);

    carritoPanel = aside;
    listaNode = aside.querySelector("#lista");
    totalPrecioSpan = aside.querySelector(".totalPrecio");
    botonVaciar = aside.querySelector("#vaciar");

    botonVaciar.addEventListener("click", vaciarCarrito);
}

productosNode.forEach(prod => {
    const boton = prod.querySelector('.agregar');
    if (!boton) return;

    boton.addEventListener('click', () => {
        const title = prod.querySelector('h3').textContent.trim();
        const price = parseInt(prod.dataset.price, 10);
        const img = prod.querySelector('img')?.src || "";

        addToCart({ id: title, name: title, price, img });

        showToast(`${title} agregado al carrito`);
    });
});

if (botonVaciar) {
    botonVaciar.addEventListener('click', vaciarCarrito);
}

function vaciarCarrito() {
    if (cart.length === 0) return showToast('El carrito ya está vacío');

    cart = [];
    persistCart();
    renderCart();
    updateCounter();
    showToast('Carrito vaciado');
}


function addToCart(item) {
    const found = cart.find(i => i.id === item.id);
    if (found) found.qty += 1;
    else cart.push({ ...item, qty: 1 });

    persistCart();
    renderCart();
    updateCounter();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    persistCart();
    renderCart();
    updateCounter();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty < 1) item.qty = 1;

    persistCart();
    renderCart();
    updateCounter();
}


function persistCart() {
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
}

function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}


function calculateTotal() {
    return cart.reduce((sum, it) => sum + it.price * it.qty, 0);
}

function formatCurrency(num) {
    return '$' + num.toLocaleString('es-AR');
}

function updateCounter() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    contadorCarrito.textContent = String(count);
}


function renderCart() {
    if (!listaNode) return;

    listaNode.innerHTML = '';

    if (cart.length === 0) {
        listaNode.innerHTML = `<li style="list-style:none;">El carrito está vacío.</li>`;
        if (totalPrecioSpan) totalPrecioSpan.textContent = formatCurrency(0);
        return;
    }

    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';

        li.innerHTML = `
            <div style="display:flex;gap:10px;align-items:center;">
                <img src="${item.img}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;">
                <div>
                    <div style="font-weight:600">${item.name}</div>
                    <div style="font-size:13px;color:#555">${formatCurrency(item.price)}</div>
                </div>
            </div>

            <div>
                <button class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
                <button class="remove-btn" data-id="${item.id}">Eliminar</button>
            </div>
        `;

        listaNode.appendChild(li);
    });

    listaNode.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            changeQty(btn.dataset.id, btn.dataset.action === "inc" ? 1 : -1);
        });
    });

    listaNode.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(btn.dataset.id);
            showToast('Producto eliminado');
        });
    });

    if (totalPrecioSpan) totalPrecioSpan.textContent = formatCurrency(calculateTotal());
}


function showToast(text) {
    const t = document.createElement("div");
    t.className = "toast-notice";
    t.textContent = text;

    Object.assign(t.style, {
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        background: '#111',
        color: 'white',
        padding: '10px 14px',
        borderRadius: '8px',
        zIndex: 9999,
        opacity: '0',
        transform: 'translateY(8px)',
        transition: 'opacity .2s, transform .2s'
    });

    document.body.appendChild(t);

    setTimeout(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(8px)';
        setTimeout(() => t.remove(), 300);
    }, 1800);
}

document.querySelector('.iconoCarrito')?.addEventListener('click', () => {
    if (!carritoPanel) return;
    carritoPanel.style.display = carritoPanel.style.display === 'block' ? 'none' : 'block';
});

if (carritoPanel && !carritoPanel.style.display) {
    carritoPanel.style.display = 'block';
}
