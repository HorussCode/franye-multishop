/**
 * Franye Multishop - Main Application Logic
 * Clean Code Refactor (English Logic / Spanish UI)
 */

(function() {
    // --- CONFIGURATION ---
    const SHEET_ID = '16c9gR2HYnGJrto-wxuGGL1RPIBpa8qR7cY5735RHEV8'; 
    const SHEET_TITLE = 'productos franye'; 
    const DATA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_TITLE)}`;
    const WHATSAPP_NUMBER = "584120852715";

    // --- DOM ELEMENTS ---
    const productContainer = document.getElementById('contenedor-productos');
    const carouselTrack = document.getElementById('carrusel-destacados');
    const productModal = document.getElementById('modal-producto');
    const detailContent = document.getElementById('detalle-producto');
    const searchInput = document.getElementById('input-busqueda');
    const categoryFilter = document.getElementById('filtro-categoria');
    const paginationContainer = document.getElementById('paginacion');

    // --- STATE MANAGEMENT ---
    let allProducts = [];
    let filteredProducts = [];
    let cart = JSON.parse(localStorage.getItem('franye_cart')) || [];
    let currentPage = 1;
    const itemsPerPage = 12;

    /**
     * Fetch data from Google Sheets
     */
    async function fetchProducts() {
        try {
            const response = await fetch(DATA_URL);
            const text = await response.text();
            const json = JSON.parse(text.substr(47).slice(0, -2));
            const rows = json.table.rows;

            allProducts = rows.map(row => {
                const parseNum = (val) => val ? (typeof val === 'object' ? parseFloat(val.v) : parseFloat(val)) || 0 : 0;
                return {
                    name: row.c[0]?.v || "",
                    price: parseNum(row.c[1]),
                    wholesalePrice: parseNum(row.c[2]),
                    wholesaleQty: parseNum(row.c[3]),
                    image: row.c[4]?.v || "",
                    category: row.c[5]?.v || "",
                    isFeatured: (row.c[6]?.v === true || String(row.c[6]?.v).toUpperCase() === 'TRUE'),
                    stock: row.c[7] ? parseInt(row.c[7].v) : 0, 
                    description: row.c[8]?.v || ""
                };
            }).filter(p => p.name !== "" && p.stock > 0);

            filteredProducts = [...allProducts];

            // Initialize categories in Spanish
            const uniqueCategories = [...new Set(allProducts.map(p => p.category))].filter(String);
            if(categoryFilter) {
                categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>' + 
                    uniqueCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            }

            initApp();
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    }

    function initApp() {
        renderCarousel();
        renderProducts();
        updateCartUI();
    }

    /**
     * Render product grid with pagination
     */
    function renderProducts() {
        if(!productContainer) return;
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filteredProducts.slice(start, end);

        productContainer.innerHTML = pageItems.length ? "" : "<p style='grid-column:1/-1; text-align:center;'>No se encontraron productos.</p>";
        
        pageItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'tarjeta';
            card.innerHTML = `
                <img src="${item.image}" onclick="window.openDetails('${item.name.replace(/'/g, "\\'")}')" onerror="this.src='https://via.placeholder.com/200?text=Franye+Multishop'">
                <div class="info-tarjeta">
                    <h3 onclick="window.openDetails('${item.name.replace(/'/g, "\\'")}')">${item.name}</h3>
                    <p style="color:var(--bright-gold); font-weight:bold; margin-top:5px;">$${item.price.toFixed(2)}</p>
                    <div class="btn-container-card">
                        <button class="btn-rapido" onclick="window.quickAdd('${item.name.replace(/'/g, "\\'")}')">⚡ Añadir Rápido</button>
                        <button class="btn-comprar" onclick="window.openDetails('${item.name.replace(/'/g, "\\'")}')">Ver Detalle</button>
                    </div>
                </div>`;
            productContainer.appendChild(card);
        });
        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        paginationContainer.innerHTML = "";
        if(totalPages <= 1) return;

        for(let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.className = `btn-pag ${i === currentPage ? 'active' : ''}`;
            btn.onclick = () => {
                currentPage = i;
                window.scrollTo({top: 500, behavior: 'smooth'});
                renderProducts();
            };
            paginationContainer.appendChild(btn);
        }
    }

    function renderCarousel() {
        if(!carouselTrack) return;
        const featured = allProducts.filter(p => p.isFeatured);
        carouselTrack.innerHTML = featured.map(p => `
            <div class="item-destacado" onclick="window.openDetails('${p.name.replace(/'/g, "\\'")}')">
                <img src="${p.image}">
                <p style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${p.name}</p>
            </div>`).join('');
    }

    // --- GLOBAL FUNCTIONS (Linked to HTML) ---

    window.moveCarousel = (distance) => {
        if (carouselTrack) carouselTrack.scrollLeft += distance;
    };

    window.quickAdd = (name) => {
        const product = allProducts.find(p => p.name === name);
        const cartIndex = cart.findIndex(item => item.name === name);
        
        if(cartIndex !== -1) cart[cartIndex].qty += 1;
        else cart.push({ ...product, qty: 1 });
        
        saveAndSync();
        showNotification(`✅ ${name} añadido`);
    };

    window.openDetails = (name) => {
        const p = allProducts.find(prod => prod.name === name);
        if(!p) return;
        detailContent.innerHTML = `
            <img src="${p.image}" style="width:100%; border-radius:10px; height:220px; object-fit:cover;">
            <h2 style="color:var(--pink-main); margin-top:15px;">${p.name}</h2>
            <p style="font-size:0.9rem; margin:10px 0; opacity:0.9;">${p.description}</p>
            <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:10px; margin:15px 0; text-align:center;">
                <small>Precio Detal</small><br><b style="font-size:1.4rem;">$${p.price.toFixed(2)}</b>
            </div>
            <div style="margin-bottom:15px; text-align:center;">
                <label>Cantidad: </label>
                <input type="number" id="modal-qty" value="1" min="1" style="width:60px; padding:5px; border-radius:5px; color:black; text-align:center;">
            </div>
            <button class="btn-comprar" onclick="window.addToCart('${p.name.replace(/'/g, "\\'")}')">Agregar al Carrito</button>
        `;
        productModal.style.display = "block";
    };

    window.addToCart = (name) => {
        const product = allProducts.find(p => p.name === name);
        const quantity = parseInt(document.getElementById('modal-qty').value) || 1;
        const cartIndex = cart.findIndex(item => item.name === name);
        
        if(cartIndex !== -1) cart[cartIndex].qty += quantity;
        else cart.push({ ...product, qty: quantity });
        
        saveAndSync();
        window.closeModal();
        showNotification(`✅ ${name} añadido`);
    };

    function updateCartUI() {
        const cartItemsWrapper = document.getElementById('items-carrito');
        const cartTotalDisplay = document.getElementById('total-carrito');
        const cartBadge = document.getElementById('contador-carrito');
        if(!cartItemsWrapper) return;

        let total = 0, totalItems = 0;
        cartItemsWrapper.innerHTML = cart.length ? "" : "<p style='text-align:center; opacity:0.5;'>Tu carrito está vacío</p>";

        cart.forEach((item, index) => {
            const subtotal = item.qty * item.price;
            total += subtotal;
            totalItems += item.qty;
            cartItemsWrapper.innerHTML += `
                <div style="display:flex; flex-direction:column; margin-bottom:10px; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <small style="max-width:80%">${item.name}</small>
                        <span onclick="window.removeItem(${index})" style="cursor:pointer; color:#ff4d4d">🗑️</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <div style="display:flex; align-items:center; gap:5px;">
                            <button onclick="window.updateQty(${index}, -1)" style="width:25px; height:25px; border-radius:5px; border:1px solid var(--pink-main); background:none; color:white;">-</button>
                            <span>${item.qty}</span>
                            <button onclick="window.updateQty(${index}, 1)" style="width:25px; height:25px; border-radius:5px; border:1px solid var(--pink-main); background:none; color:white;">+</button>
                        </div>
                        <b>$${subtotal.toFixed(2)}</b>
                    </div>
                </div>`;
        });
        if(cartTotalDisplay) cartTotalDisplay.innerText = total.toFixed(2);
        if(cartBadge) cartBadge.innerText = totalItems;
    }

    window.updateQty = (index, delta) => {
        cart[index].qty += delta;
        if(cart[index].qty < 1) return window.removeItem(index);
        saveAndSync();
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        saveAndSync();
    };

    function saveAndSync() {
        localStorage.setItem('franye_cart', JSON.stringify(cart));
        updateCartUI();
    }

    window.sendWhatsAppOrder = () => {
        if(!cart.length) return alert("El carrito está vacío");
        let message = "🛍️ *NUEVO PEDIDO - FRANYE MULTISHOP*\n\n";
        let total = 0;
        cart.forEach(item => {
            message += `• ${item.name} (x${item.qty}) - $${(item.qty * item.price).toFixed(2)}\n`;
            total += item.qty * item.price;
        });
        message += `\n💰 *TOTAL: $${total.toFixed(2)}*`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    function showNotification(msg) {
        const container = document.getElementById('notification-container');
        const alertDiv = document.createElement('div');
        alertDiv.className = 'notification';
        alertDiv.innerText = msg;
        container.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 2500);
    }

    window.closeModal = () => productModal.style.display = "none";
    
    window.toggleCart = () => {
        document.getElementById('carrito-lateral').classList.toggle('cart-hide');
        document.getElementById('overlay-carrito').classList.toggle('active');
    };

    // --- EVENT LISTENERS ---
    if(searchInput) {
        searchInput.oninput = () => {
            filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchInput.value.toLowerCase()));
            currentPage = 1;
            renderProducts();
        };
    }

    if(categoryFilter) {
        categoryFilter.onchange = () => {
            const cat = categoryFilter.value;
            filteredProducts = allProducts.filter(p => cat === "all" || p.category === cat);
            currentPage = 1;
            renderProducts();
        };
    }

    window.addEventListener('DOMContentLoaded', fetchProducts);
    window.onclick = (e) => { if (e.target == productModal) window.closeModal(); };
})();