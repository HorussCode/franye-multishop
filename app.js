(function() {
    const SHEET_ID = '16c9gR2HYnGJrto-wxuGGL1RPIBpa8qR7cY5735RHEV8'; 
    const SHEET_TITLE = 'productos franye'; 
    const DATA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_TITLE)}`;
    const WHATSAPP_NUMBER = "584120852715";

    let allProducts = [], filteredProducts = [], cart = JSON.parse(localStorage.getItem('franye_cart')) || [];
    let currentPage = 1; const itemsPerPage = 12;
    let autoScrollInterval;

    async function fetchProducts() {
        try {
            const r = await fetch(DATA_URL);
            const t = await r.text();
            const j = JSON.parse(t.substr(47).slice(0, -2));
            allProducts = j.table.rows.map(row => ({
                name: row.c[0]?.v || "",
                price: row.c[1]?.v || 0,
                image: row.c[4]?.v || "",
                category: row.c[5]?.v || "",
                // Guardamos subcategorías como un array limpio
                subcategories: (row.c[6]?.v || "").split(',').map(s => s.trim()).filter(String),
                isFeatured: String(row.c[7]?.v).toUpperCase() === 'TRUE',
                stock: row.c[8]?.v || 0,
                description: row.c[9]?.v || ""
            })).filter(p => p.name && p.stock > 0);
            filteredProducts = [...allProducts];
            initApp();
        } catch (e) { console.error("Error Sheet:", e); }
    }

    function initApp() {
        renderProducts();
        renderCarousel();
        updateCartUI();
        createStars();
        startAutoScroll();
        setupFilters();
    }

    function renderProducts() {
        const container = document.getElementById('contenedor-productos');
        container.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage;
        const items = filteredProducts.slice(start, start + itemsPerPage);

        items.forEach((p) => {
            const d = document.createElement('div');
            d.className = 'tarjeta';
            d.innerHTML = `
                <img src="${p.image}" onclick="window.openDetails('${p.name.replace(/'/g, "\\'")}')">
                <div class="info-tarjeta">
                    <h3 style="font-size:14px; height:40px; overflow:hidden;">${p.name}</h3>
                    <p style="color:var(--bright-gold); font-weight:bold; font-size:1.1rem;">$${p.price.toFixed(2)}</p>
                    <button class="btn-detalles" onclick="window.openDetails('${p.name.replace(/'/g, "\\'")}')">👁️ Detalles</button>
                    <button class="btn-rapido" onclick="window.quickAdd('${p.name.replace(/'/g, "\\'")}', event)">⚡ Añadir</button>
                </div>`;
            container.appendChild(d);
        });
        renderPagination();
    }

    window.openDetails = (n) => {
        const p = allProducts.find(x => x.name === n);
        if(!p) return;
        document.getElementById('detalle-producto').innerHTML = `
            <img src="${p.image}" style="width:100%; border-radius:10px; background:white; margin-bottom:15px;">
            <h2 style="color:var(--pink-main); font-size:1.3rem;">${p.name}</h2>
            <p style="font-size:13px; margin:15px 0; line-height:1.5; color:#ccc;">${p.description || 'Sin descripción disponible.'}</p>
            
            <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin:20px 0;">
                <span>Cantidad:</span>
                <input type="number" id="qty-modal" value="1" min="1" 
                    style="width:60px; background:black; color:white; border:1px solid var(--pink-main); text-align:center; padding:5px; border-radius:5px;">
            </div>

            <h3 style="text-align:center; color:var(--gold); font-size:1.5rem;">$${p.price.toFixed(2)}</h3>
            <button class="btn-rapido" style="width:100%; padding:15px;" 
                onclick="window.quickAdd('${p.name.replace(/'/g, "\\'")}', event, 'qty-modal'); closeModal();">
                Agregar al Carrito
            </button>
        `;
        document.getElementById('modal-producto').style.display = "block";
        document.body.style.overflow = "hidden";
    };

    window.closeModal = () => {
        document.getElementById('modal-producto').style.display = "none";
        document.body.style.overflow = "auto";
    };

    window.closeModalOnOutsideClick = (e) => {
        if(e.target.id === "modal-producto") closeModal();
    };

    window.quickAdd = (n, event, customQtyId = null) => {
        if(event) animateToCart(event);
        const p = allProducts.find(x => x.name === n);
        
        // Si viene del modal, lee la cantidad. Si es del botón rápido de afuera, es 1.
        const qty = customQtyId ? parseInt(document.getElementById(customQtyId).value) : 1;
        
        const i = cart.findIndex(x => x.name === n);
        if(i > -1) cart[i].qty += qty;
        else cart.push({...p, qty: qty});
        
        saveCart();
        showNotification(`Añadido: ${n} (x${qty})`);
    };

    window.updateCartQty = (idx, delta) => {
        cart[idx].qty += delta;
        if(cart[idx].qty <= 0) cart.splice(idx, 1);
        saveCart();
    };

    window.removeItem = (i) => { cart.splice(i, 1); saveCart(); };

    function saveCart() { 
        localStorage.setItem('franye_cart', JSON.stringify(cart)); 
        updateCartUI(); 
    }

    function updateCartUI() {
        const wrapper = document.getElementById('items-carrito');
        const totalDisp = document.getElementById('total-carrito');
        const countDisp = document.getElementById('contador-carrito');
        let total = 0, count = 0;
        
        wrapper.innerHTML = cart.length ? "" : "<p style='text-align:center; margin-top:20px;'>Tu carrito está vacío</p>";
        
        cart.forEach((item, i) => {
            total += item.price * item.qty;
            count += item.qty;
            wrapper.innerHTML += `
                <div class="item-carrito">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span style="font-size:12px; font-weight:600; flex:1;">${item.name}</span>
                        <button onclick="window.removeItem(${i})" style="color:#ff4d4d; background:none; border:none; cursor:pointer; font-weight:bold; font-size:16px; margin-left:10px;">✕</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                        <div class="controles-qty">
                            <button class="btn-qty" onclick="window.updateCartQty(${i}, -1)">-</button>
                            
                            <input type="number" value="${item.qty}" min="1" 
                                onchange="window.manualCartQty(${i}, this.value)"
                                style="width:40px; background:transparent; color:white; border:1px solid rgba(255,105,180,0.3); text-align:center; border-radius:4px; font-size:12px;">
                            
                            <button class="btn-qty" onclick="window.updateCartQty(${i}, 1)">+</button>
                        </div>
                        <span style="color:var(--bright-gold); font-weight:bold;">$${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                </div>`;
        });
        totalDisp.innerText = total.toFixed(2);
        countDisp.innerText = count;
    }

    // Nueva función para el cambio manual en el carrito
    window.manualCartQty = (idx, val) => {
        let newQty = parseInt(val);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        cart[idx].qty = newQty;
        saveCart();
    };

    function animateToCart(e) {
        const particle = document.createElement('div');
        particle.className = 'falling-particle';
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        document.getElementById('cart-anim-container').appendChild(particle);
        const cartBtn = document.getElementById('btn-carrito-flotante').getBoundingClientRect();
        setTimeout(() => {
            particle.style.left = (cartBtn.left + 10) + 'px';
            particle.style.top = (cartBtn.top + 10) + 'px';
            particle.style.opacity = '0';
            particle.style.transform = 'scale(0.2)';
        }, 50);
        setTimeout(() => particle.remove(), 750);
    }

    function setupFilters() {
        const catSelect = document.getElementById('filtro-categoria');
        const subSelect = document.getElementById('filtro-subcategoria');
        const cats = [...new Set(allProducts.map(p => p.category))].filter(String);

        cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.innerText = c;
            catSelect.appendChild(opt);
        });

        catSelect.onchange = () => {
            const selectedCat = catSelect.value;
            subSelect.innerHTML = '<option value="all">Subcategoría</option>';
            
            if(selectedCat !== "all") {
                // Obtenemos todas las subcategorías de los productos de esta categoría, separadas por comas
                let subSet = new Set();
                allProducts.filter(p => p.category === selectedCat).forEach(p => {
                    p.subcategories.forEach(s => subSet.add(s));
                });

                Array.from(subSet).sort().forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s; opt.innerText = s;
                    subSelect.appendChild(opt);
                });
            }
            applyFilters();
        };

        subSelect.onchange = applyFilters;
        document.getElementById('input-busqueda').oninput = applyFilters;
    }

    function applyFilters() {
        const cat = document.getElementById('filtro-categoria').value;
        const sub = document.getElementById('filtro-subcategoria').value;
        const search = document.getElementById('input-busqueda').value.toLowerCase();

        filteredProducts = allProducts.filter(p => {
            const matchesCat = cat === "all" || p.category === cat;
            // Verificamos si la subcategoría seleccionada está dentro del array de subcategorías del producto
            const matchesSub = sub === "all" || p.subcategories.includes(sub);
            const matchesSearch = p.name.toLowerCase().includes(search);
            return matchesCat && matchesSub && matchesSearch;
        });

        currentPage = 1;
        renderProducts();
    }

    function renderCarousel() {
        const feat = allProducts.filter(p => p.isFeatured);
        const track = document.getElementById('carrusel-destacados');
        track.innerHTML = feat.map(p => `
            <div class="item-destacado" onclick="window.openDetails('${p.name.replace(/'/g, "\\'")}')">
                <img src="${p.image}">
                <p style="font-size:10px; margin-top:8px; height:24px; overflow:hidden;">${p.name}</p>
            </div>`).join('');
    }

    function startAutoScroll() {
        const track = document.getElementById('carrusel-destacados');
        autoScrollInterval = setInterval(() => {
            if(track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) track.scrollTo({left: 0, behavior: 'smooth'});
            else track.scrollBy({left: 180, behavior: 'smooth'});
        }, 4000);
    }

    window.manualCarouselMove = (dir) => {
        const track = document.getElementById('carrusel-destacados');
        clearInterval(autoScrollInterval);
        track.scrollBy({left: dir * 200, behavior: 'smooth'});
        setTimeout(startAutoScroll, 3000);
    };

    function renderPagination() {
        const pag = document.getElementById('paginacion');
        const total = Math.ceil(filteredProducts.length / itemsPerPage);
        pag.innerHTML = "";
        if(total <= 1) return;
        for(let i=1; i<=total; i++) {
            const b = document.createElement('button');
            b.innerText = i; b.className = `btn-pag ${i === currentPage ? 'active' : ''}`;
            b.onclick = () => { currentPage = i; renderProducts(); window.scrollTo({top: 450, behavior: 'smooth'}); };
            pag.appendChild(b);
        }
    }

    function createStars() {
        const container = document.getElementById('stars-container');
        for (let i = 0; i < 40; i++) {
            const s = document.createElement('div'); s.className = 'star';
            s.style.left = Math.random() * 100 + '%';
            const size = Math.random() * 2 + 1;
            s.style.width = size + 'px'; s.style.height = size + 'px';
            s.style.animation = `fall ${Math.random()*3+2}s linear infinite, twinkle 1.5s infinite`;
            container.appendChild(s);
        }
    }

    window.toggleCart = () => {
        document.getElementById('carrito-lateral').classList.toggle('cart-hide');
        document.getElementById('overlay-carrito').classList.toggle('active');
    };

    window.sendWhatsAppOrder = () => {
        if(!cart.length) return;
        let msg = "🛍️ *NUEVO PEDIDO FRANYE*\n\n";
        cart.forEach(item => msg += `• ${item.name} (x${item.qty}) - $${(item.price * item.qty).toFixed(2)}\n`);
        msg += `\n*TOTAL: $${document.getElementById('total-carrito').innerText}*`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
    };

    function showNotification(m) {
        const c = document.getElementById('notification-container');
        const n = document.createElement('div');
        n.style = "background:var(--pink-main); color:black; padding:10px 15px; border-radius:8px; margin-bottom:8px; font-weight:bold; position:fixed; bottom:85px; left:15px; z-index:9999; font-size:12px; box-shadow:0 4px 10px rgba(0,0,0,0.3);";
        n.innerText = m;
        c.appendChild(n);
        setTimeout(() => n.remove(), 2500);
    }

    window.addEventListener('DOMContentLoaded', fetchProducts);
})();