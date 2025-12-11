const productosNode = document.querySelectorAll('.producto');
const listaNode = document.querySelector('#lista');
const contadorCarrito = document.querySelector('#contadorCarrito');
const carritoPanel = document.querySelector('#carritoPanel');
const totalPrecioSpan = document.querySelector('.totalPrecio');
const botonVaciar = document.querySelector('#vaciar');

const LS_KEY = 'vinylstore_cart_v1';
let cart = loadCartFromStorage();

// Inicializar render
renderCart();
updateCounter();

productosNode.forEach(prod => {
  const boton = prod.querySelector('.agregar');
  boton.addEventListener('click', () => {
    const title = prod.querySelector('h3').textContent.trim();
    const priceText = prod.querySelector('.precio').textContent.replace(/[^0-9\,\.]/g, '');
    // convertir a número (asumimos valores enteros en pesos)
    const price = parseInt(priceText.replace(/\.|\,/g, ''), 10);
    const img = prod.querySelector('img')?.getAttribute('src') || '';

    addToCart({ id: title, name: title, price, img });
    showToast(`${title} agregado al carrito`);
  });
});

botonVaciar.addEventListener('click', () => {
  if (cart.length === 0) return showToast('El carrito ya está vacío');
  cart = [];
  persistCart();
  renderCart();
  updateCounter();
  showToast('Carrito vaciado');
});

function addToCart(item) {
  const found = cart.find(i => i.id === item.id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
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
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo carrito desde localStorage', e);
    return [];
  }
}

function calculateTotal() {
  return cart.reduce((sum, it) => sum + (it.price * it.qty), 0);
}

function formatCurrency(num) {
  // formatea como $ 12.345
  return '$' + num.toLocaleString('es-AR');
}

function updateCounter() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  contadorCarrito.textContent = String(count);
}

function renderCart() {
  // limpiar lista
  listaNode.innerHTML = '';

  if (cart.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'El carrito está vacío.';
    li.style.listStyle = 'none';
    listaNode.appendChild(li);
    totalPrecioSpan.textContent = formatCurrency(0);
    return;
  }

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';

    // estructura del item
    li.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;">
        <img src="${item.img}" alt="" style="width:48px;height:48px;border-radius:6px;object-fit:cover;"/>
        <div style="min-width:0">
          <div style="font-weight:600">${item.name}</div>
          <div style="font-size:13px;color:#666">${formatCurrency(item.price)}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        <button class="remove-btn" data-id="${item.id}">Eliminar</button>
      </div>
    `;

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.padding = '8px';
    li.style.borderRadius = '6px';
    li.style.background = '#fafafa';
    li.style.marginBottom = '10px';

    listaNode.appendChild(li);
  });


  listaNode.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      removeFromCart(id);
      showToast('Producto eliminado');
    });
  });

  listaNode.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'inc') changeQty(id, 1);
      else changeQty(id, -1);
    });
  });

  totalPrecioSpan.textContent = formatCurrency(calculateTotal());
}


function showToast(text) {
  const div = document.createElement('div');
  div.className = 'toast-notice';
  div.textContent = text;
  Object.assign(div.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    background: '#111',
    color: 'white',
    padding: '10px 14px',
    borderRadius: '8px',
    zIndex: 9999,
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    opacity: '0',
    transition: 'opacity 200ms ease-in-out, transform 200ms ease-in-out',
    transform: 'translateY(8px)'
  });

  document.body.appendChild(div);
  
  void div.offsetWidth;
  div.style.opacity = '1';
  div.style.transform = 'translateY(0)';

  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transform = 'translateY(8px)';
    setTimeout(() => div.remove(), 300);
  }, 1800);
}

document.querySelector('.iconoCarrito').addEventListener('click', () => {
  if (carritoPanel.style.display === 'block') carritoPanel.style.display = 'none';
  else carritoPanel.style.display = 'block';
});

// esconder panel al iniciar para dispositivos pequeños
if (!carritoPanel.style.display) carritoPanel.style.display = 'block';



const buscador = document.getElementById("inputBusqueda");
const productos = document.querySelectorAll(".producto");

buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    productos.forEach(producto => {
        const nombre = producto.querySelector("h3").textContent.toLowerCase();

        if (nombre.includes(texto)) {
            producto.style.display = "block";
        } else {
            producto.style.display = "none";
        }
    });
});
