const contenedor = document.getElementById('contenedor-productos');
const carruselTrack = document.getElementById('carrusel-destacados');
const modal = document.getElementById('modal-producto');
const detalleDiv = document.getElementById('detalle-producto');
const btnCerrar = document.querySelector('.cerrar-modal');
const inputBusqueda = document.getElementById('input-busqueda');
const filtroCategoria = document.getElementById('filtro-categoria');

const NUMERO_WHATSAPP = "584145611937"; 

function cargarCarrusel() {
    if(!carruselTrack) return;
    const destacados = misProductos.filter(p => p.destacado);
    carruselTrack.innerHTML = "";
    destacados.forEach(producto => {
        const item = document.createElement('div');
        item.classList.add('item-destacado');
        item.onclick = () => abrirDetalle(producto);
        item.innerHTML = `
            <img src="${producto.imagen}">
            <p style="font-weight:600; font-size:0.85rem; margin:8px 0 2px 0;">${producto.nombre}</p>
            <p style="color:var(--rosa); font-weight:bold;">$${producto.precio}</p>
        `;
        carruselTrack.appendChild(item);
    });
}

function cargarProductos(productosAMostrar) {
    if(!contenedor) return;
    contenedor.innerHTML = "";
    productosAMostrar.forEach(producto => {
        const card = document.createElement('div');
        card.classList.add('tarjeta');
        card.onclick = () => abrirDetalle(producto);
        card.innerHTML = `
            <img src="${producto.imagen}">
            <div class="tarjeta-body">
                <h3 style="font-size:1.1rem; margin-bottom:10px;">${producto.nombre}</h3>
                <p style="color:var(--rosa); font-weight:bold; font-size:1.3rem; margin-bottom:15px;">$${producto.precio}</p>
                <button class="btn-comprar" style="font-size:0.85rem; padding:10px;">Ver Detalle</button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function abrirDetalle(producto) {
    const textoMensaje = `¡Hola Franye Multishop! 👋\nEstoy interesado en: *${producto.nombre.toUpperCase()}*\n💰 *Precio:* $${producto.precio}\n🖼️ *Link:* ${producto.imagen}`;
    const linkWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(textoMensaje)}`;
    
    detalleDiv.innerHTML = `
        <img src="${producto.imagen}" style="width:100%; border-radius:15px; max-height:280px; object-fit:cover; border: 1px solid #eee;">
        <h2 style="font-family: 'Cinzel', serif; margin:20px 0 5px 0; font-size:1.5rem;">${producto.nombre}</h2>
        <p style="color:var(--rosa); font-size:2.2rem; font-weight:bold; margin-bottom:5px;">$${producto.precio}</p>
        <p style="font-size:0.75rem; color:var(--dorado); font-weight:bold; text-transform:uppercase; letter-spacing:2px;">${producto.categoria}</p>
        <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
        <p style="color:#555; text-align:left; margin-bottom:25px; line-height:1.6;">${producto.descripcion}</p>
        <a href="${linkWhatsApp}" class="btn-comprar" target="_blank" style="text-decoration:none;">🛒 Consultar Disponibilidad</a>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function cerrarModal() { modal.style.display = "none"; document.body.style.overflow = "auto"; }
if(btnCerrar) btnCerrar.onclick = cerrarModal;
window.onclick = (e) => { if(e.target == modal) cerrarModal(); };

function filtrar() {
    const texto = inputBusqueda.value.toLowerCase();
    const cat = filtroCategoria.value;
    const filtrados = misProductos.filter(p => p.nombre.toLowerCase().includes(texto) && (cat === "todos" || p.categoria === cat));
    cargarProductos(filtrados);
}

if(document.getElementById('nextBtn')) document.getElementById('nextBtn').onclick = () => carruselTrack.scrollLeft += 250;
if(document.getElementById('prevBtn')) document.getElementById('prevBtn').onclick = () => carruselTrack.scrollLeft -= 250;
inputBusqueda.oninput = filtrar;
filtroCategoria.onchange = filtrar;

window.onload = () => { cargarCarrusel(); cargarProductos(misProductos); };