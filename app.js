(function() {
    // --- CONFIGURACIÓN ---
    const SHEET_ID = '16c9gR2HYnGJrto-wxuGGL1RPIBpa8qR7cY5735RHEV8'; 
    const SHEET_TITLE = 'productos franye'; 
    const URL_VISUALIZACION = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_TITLE)}`;
    const NUMERO_WA = "584120852715";

    const contenedor = document.getElementById('contenedor-productos');
    const carruselTrack = document.getElementById('carrusel-destacados');
    const modal = document.getElementById('modal-producto');
    const detalleDiv = document.getElementById('detalle-producto');
    const inputBusqueda = document.getElementById('input-busqueda');
    const filtroCategoria = document.getElementById('filtro-categoria');

    let misProductos = [];
    let carrito = JSON.parse(localStorage.getItem('carrito_franye')) || [];

    async function cargarDatosDesdeGoogle() {
        try {
            const res = await fetch(URL_VISUALIZACION);
            const texto = await res.text();
            const data = JSON.parse(texto.substr(47).slice(0, -2));
            const filas = data.table.rows;

            misProductos = filas.map(f => {
                const limpiarNum = (v) => v ? (typeof v === 'object' ? parseFloat(v.v) : parseFloat(v)) || 0 : 0;
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

            // ACTUALIZACIÓN DINÁMICA DE CATEGORÍAS
            const categoriasUnicas = [...new Set(misProductos.map(p => p.categoria))].filter(String);
            if(filtroCategoria) {
                filtroCategoria.innerHTML = '<option value="todos">Todas las categorías</option>' + 
                    categoriasUnicas.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            }

            inicializarTienda();
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    }

    function inicializarTienda() {
        cargarCarrusel();
        renderizarProductos(misProductos);
        actualizarCarritoUI();
    }

    function renderizarProductos(lista) {
        if(!contenedor) return;
        contenedor.innerHTML = lista.length ? "" : "<p style='grid-column:1/-1; text-align:center;'>No se encontraron productos.</p>";
        lista.forEach(p => {
            const div = document.createElement('div');
            div.className = 'tarjeta';
            div.onclick = () => window.abrirDetalle(p.nombre);
            div.innerHTML = `
                <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/200?text=Franye+Multishop'">
                <div style="padding:15px;">
                    <h3 style="margin:0; font-size:1rem;">${p.nombre}</h3>
                    <p style="color:var(--dorado-brillante); font-weight:bold; margin:5px 0;">$${p.precio.toFixed(2)}</p>
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

    window.abrirDetalle = (nombre) => {
        const p = misProductos.find(prod => prod.nombre === nombre);
        if(!p) return;
        detalleDiv.innerHTML = `
            <img src="${p.imagen}" style="width:100%; border-radius:10px; height:220px; object-fit:cover;">
            <h2 style="color:var(--dorado-brillante); margin-top:15px;">${p.nombre}</h2>
            <p style="font-size:0.9rem; margin:10px 0; opacity:0.9;">${p.descripcion}</p>
            <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:10px; margin:15px 0; text-align:center;">
                <small>Precio Detal</small><br><b style="font-size:1.4rem;">$${p.precio.toFixed(2)}</b>
            </div>
            <div style="margin-bottom:15px; text-align:center;">
                <label>Cantidad: </label>
                <input type="number" id="cant-modal" value="1" min="1" style="width:60px; padding:5px; border-radius:5px; color:black; text-align:center;">
            </div>
            <button class="btn-comprar" onclick="window.agregarCarrito('${p.nombre.replace(/'/g, "\\'")}')">Agregar al Carrito</button>
        `;
        modal.style.display = "block";
    };

    window.agregarCarrito = (nombre) => {
        const p = misProductos.find(prod => prod.nombre === nombre);
        const cant = parseInt(document.getElementById('cant-modal').value) || 1;
        const idx = carrito.findIndex(item => item.nombre === nombre);
        if(idx !== -1) carrito[idx].cantidad += cant;
        else carrito.push({ ...p, cantidad: cant });
        localStorage.setItem('carrito_franye', JSON.stringify(carrito));
        actualizarCarritoUI();
        window.cerrarModal();
    };

    function actualizarCarritoUI() {
        const itemsCont = document.getElementById('items-carrito');
        const totalCont = document.getElementById('total-carrito');
        const contador = document.getElementById('contador-carrito');
        if(!itemsCont) return;

        let total = 0, cantTotal = 0;
        itemsCont.innerHTML = carrito.length ? "" : "<p style='text-align:center; opacity:0.5;'>Tu carrito está vacío</p>";

        carrito.forEach((item, i) => {
            const subtotal = item.cantidad * item.precio;
            total += subtotal;
            cantTotal += item.cantidad;
            itemsCont.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                    <div><small>${item.nombre}</small><br><b>${item.cantidad} x $${item.precio.toFixed(2)}</b></div>
                    <div>$${subtotal.toFixed(2)} <span onclick="window.eliminarItem(${i})" style="cursor:pointer; margin-left:8px;">🗑️</span></div>
                </div>`;
        });
        if(totalCont) totalCont.innerText = total.toFixed(2);
        if(contador) contador.innerText = cantTotal;
    }

    window.eliminarItem = (i) => {
        carrito.splice(i, 1);
        localStorage.setItem('carrito_franye', JSON.stringify(carrito));
        actualizarCarritoUI();
    };

    window.enviarPedidoWhatsApp = () => {
        if(!carrito.length) return alert("El carrito está vacío");
        let msg = "🛍️ *NUEVO PEDIDO - FRANYE MULTISHOP*\n\n";
        let tot = 0;
        carrito.forEach(item => {
            msg += `• ${item.nombre} (x${item.cantidad}) - $${(item.cantidad * item.precio).toFixed(2)}\n`;
            tot += item.cantidad * item.precio;
        });
        msg += `\n💰 *TOTAL: $${tot.toFixed(2)}*`;
        window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    window.cerrarModal = () => modal.style.display = "none";
    window.toggleCarrito = () => document.getElementById('carrito-lateral').classList.toggle('carrito-hide');

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
    window.onclick = (e) => { if (e.target == modal) window.cerrarModal(); };
})();