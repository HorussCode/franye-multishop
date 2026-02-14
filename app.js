(function() {
    // --- CONFIGURACIÓN ---
    const SHEET_ID = '16c9gR2HYnGJrto-wxuGGL1RPIBpa8qR7cY5735RHEV8'; 
    const SHEET_TITLE = 'productos franye'; 
    const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_TITLE)}`;
    const NUMERO_WA = "584145611937";

    // --- SELECTORES ---
    const contenedor = document.getElementById('contenedor-productos');
    const carruselTrack = document.getElementById('carrusel-destacados');
    const modal = document.getElementById('modal-producto');
    const detalleDiv = document.getElementById('detalle-producto');
    const inputBusqueda = document.getElementById('input-busqueda');
    const filtroCategoria = document.getElementById('filtro-categoria');

    let misProductos = [];
    let carrito = JSON.parse(localStorage.getItem('carrito_franye')) || [];
    let autoPlayInterval;

    // --- CARGA DE DATOS ---
    async function cargarDatosDesdeGoogle() {
        try {
            const res = await fetch(URL);
            const texto = await res.text();
            const data = JSON.parse(texto.substr(47).slice(0, -2));
            const filas = data.table.rows;

            misProductos = filas.map(f => {
                // Función interna para limpiar números de Google
                const limpiarNum = (valor) => {
                    if (!valor) return 0;
                    if (typeof valor === 'object') return parseFloat(valor.v) || 0;
                    return parseFloat(valor) || 0;
                };

                return {
                    nombre: f.c[0]?.v || "",
                    precio: limpiarNum(f.c[1]),
                    precioMayor: limpiarNum(f.c[2]),
                    cantidadMayor: limpiarNum(f.c[3]),
                    imagen: f.c[4]?.v || "",
                    categoria: f.c[5]?.v || "",
                    destacado: (f.c[6]?.v === true || String(f.c[6]?.v).toUpperCase() === 'TRUE'),
                    stock: f.c[7] ? parseInt(f.c[7].v) : 0, 
                    descripcion: f.c[8]?.v || ""
                };
            }).filter(p => p.nombre !== "" && p.stock > 0);

            inicializarTienda();
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    }

    function inicializarTienda() {
        cargarCarrusel();
        renderizarProductos(misProductos);
        actualizarCarritoUI();
        iniciarAutoPlay();
    }

    // --- RENDERIZADO ---
    function renderizarProductos(lista) {
        if(!contenedor) return;
        contenedor.innerHTML = lista.length ? "" : "<p>No hay productos disponibles.</p>";
        
        lista.forEach(p => {
            const div = document.createElement('div');
            div.className = 'tarjeta';
            div.onclick = () => window.abrirDetalle(p.nombre);
            div.innerHTML = `
                <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/200?text=No+Imagen'">
                <div class="tarjeta-body">
                    <h3>${p.nombre}</h3>
                    <p style="color:var(--dorado-brillante); font-weight:bold;">$${p.precio}</p>
                    <button class="btn-comprar">Ver Detalle</button>
                </div>`;
            contenedor.appendChild(div);
        });
    }

    function cargarCarrusel() {
        if(!carruselTrack) return;
        const destacados = misProductos.filter(p => p.destacado);
        carruselTrack.innerHTML = destacados.map(p => `
            <div class="item-destacado" onclick="window.abrirDetalle('${p.nombre.replace(/'/g, "\\'")}')">
                <img src="${p.imagen}">
                <p style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${p.nombre}</p>
            </div>`).join('');
    }

    // --- MODAL Y DETALLE ---
    window.abrirDetalle = (nombre) => {
        const p = misProductos.find(prod => prod.nombre === nombre);
        if(!p) return;

        // Corregimos la visualización del precio mayor
        const mostrarPrecioMayor = p.precioMayor > 0 
            ? `<div><small>Mayor (x${p.cantidadMayor})</small><br><b>$${p.precioMayor.toFixed(2)}</b></div>` 
            : '';

        detalleDiv.innerHTML = `
            <img src="${p.imagen}" style="width:100%; border-radius:10px; height:220px; object-fit:cover;">
            <h2 style="color:var(--dorado-brillante); margin-top:15px;">${p.nombre}</h2>
            <p style="font-size:0.9rem; margin:10px 0; opacity:0.9;">${p.descripcion}</p>
            <div style="display:flex; justify-content:space-around; background:rgba(0,0,0,0.2); padding:10px; border-radius:10px; margin:15px 0;">
                <div><small>Detal</small><br><b>$${p.precio.toFixed(2)}</b></div>
                ${mostrarPrecioMayor}
            </div>
            <div style="margin-bottom:15px;">
                <label>Cantidad: </label>
                <input type="number" id="cant-modal" value="1" min="1" style="width:50px; padding:5px; border-radius:5px; color:black; text-align:center;">
            </div>
            <button class="btn-comprar" onclick="window.agregarCarrito('${p.nombre.replace(/'/g, "\\'")}')">Agregar al Carrito</button>
        `;
        modal.style.display = "block";
    };

    // --- CARRITO ---
    window.agregarCarrito = (nombre) => {
        const p = misProductos.find(prod => prod.nombre === nombre);
        const cant = parseInt(document.getElementById('cant-modal').value) || 1;
        
        const idx = carrito.findIndex(item => item.nombre === nombre);
        if(idx !== -1) carrito[idx].cantidad += cant;
        else carrito.push({ ...p, cantidad: cant });

        localStorage.setItem('carrito_franye', JSON.stringify(carrito));
        actualizarCarritoUI();
        window.cerrarModal();
        mostrarNotificacion("✅ Producto añadido");
    };

    function actualizarCarritoUI() {
        const itemsCont = document.getElementById('items-carrito');
        const totalCont = document.getElementById('total-carrito');
        const contador = document.getElementById('contador-carrito');
        if(!itemsCont) return;

        let total = 0, cantFinal = 0;
        itemsCont.innerHTML = carrito.length ? "" : "<p style='text-align:center; opacity:0.5;'>Tu carrito está vacío</p>";

        carrito.forEach((item, i) => {
            const precioU = (item.precioMayor > 0 && item.cantidad >= item.cantidadMayor) ? item.precioMayor : item.precio;
            const subtotal = item.cantidad * precioU;
            total += subtotal;
            cantFinal += item.cantidad;

            itemsCont.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:8px;">
                    <div><small>${item.nombre}</small><br><b>${item.cantidad} x $${precioU.toFixed(2)}</b></div>
                    <div style="display:flex; align-items:center;">$${subtotal.toFixed(2)} 
                        <span onclick="window.eliminarItem(${i})" style="margin-left:10px; cursor:pointer;">🗑️</span>
                    </div>
                </div>`;
        });

        if(totalCont) totalCont.innerText = total.toFixed(2);
        if(contador) contador.innerText = cantFinal;
    }

    window.eliminarItem = (i) => {
        carrito.splice(i, 1);
        localStorage.setItem('carrito_franye', JSON.stringify(carrito));
        actualizarCarritoUI();
    };

    window.enviarPedidoWA = () => {
        if(!carrito.length) return alert("El carrito está vacío");
        let msg = "🛍️ *NUEVO PEDIDO - FRANYE MULTISHOP*\n\n";
        let tot = 0;
        carrito.forEach(item => {
            const pU = (item.precioMayor > 0 && item.cantidad >= item.cantidadMayor) ? item.precioMayor : item.precio;
            msg += `• ${item.nombre} (x${item.cantidad}) - $${(item.cantidad * pU).toFixed(2)}\n`;
            tot += item.cantidad * pU;
        });
        msg += `\n💰 *TOTAL A PAGAR: $${tot.toFixed(2)}*`;
        window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // --- INTERFAZ ---
    window.cerrarModal = () => modal.style.display = "none";
    window.toggleCarrito = () => document.getElementById('carrito-lateral').classList.toggle('carrito-hide');

    function iniciarAutoPlay() {
        if (!carruselTrack) return;
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            const max = carruselTrack.scrollWidth - carruselTrack.clientWidth;
            carruselTrack.scrollLeft = (carruselTrack.scrollLeft >= max - 5) ? 0 : carruselTrack.scrollLeft + 250;
        }, 4000);
    }

    function mostrarNotificacion(msj) {
        const container = document.getElementById('notification-container');
        if(!container) return;
        const n = document.createElement('div');
        n.className = 'notification';
        n.innerText = msj;
        container.appendChild(n);
        setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 500); }, 2500);
    }

    if(inputBusqueda) {
        inputBusqueda.oninput = () => {
            const f = misProductos.filter(p => p.nombre.toLowerCase().includes(inputBusqueda.value.toLowerCase()));
            renderizarProductos(f);
        };
    }

    if(filtroCategoria) {
        filtroCategoria.onchange = () => {
            const cat = filtroCategoria.value;
            const f = misProductos.filter(p => cat === "todos" || p.categoria === cat);
            renderizarProductos(f);
        };
    }

    window.addEventListener('DOMContentLoaded', cargarDatosDesdeGoogle);
})();