# 🛍️ Franye Multishop - Catálogo Digital (Refactored)

Sistema de catálogo dinámico y automatizado creado para **Franye Multishop**, ubicada en la ciudad portuaria de **Puerto Cabello, Estado Carabobo**.

Esta versión ha sido refactorizada para seguir estándares profesionales de desarrollo (**Clean Code**) y cuenta con una nueva identidad visual **Pink & Gold**.

## 🚀 Características

- **Base de Datos en la Nube:** Gestión de productos 100% remota mediante Google Sheets API.
- **Stock Inteligente:** Los productos se ocultan automáticamente si el stock es 0, optimizando la experiencia del cliente.
- **Carrito de Pedidos Pro:** Sistema de recolección de pedidos que genera mensajes estructurados para WhatsApp.
- **Refactorización Profesional:** Lógica de programación íntegramente en inglés para mayor escalabilidad y orden técnico.
- **Nueva Interfaz Visual:** Diseño elegante en tonos rosados y dorados con efectos de brillo y transiciones fluidas.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 (Variables dinámicas, Flexbox/Grid), JavaScript Moderno (ES6+).
- **Arquitectura:** Programación modular (IIFE) para proteger el alcance de las funciones.
- **Backend (Serverless):** Google Sheets API para sincronización de datos en tiempo real.
- **Hosting:** GitHub Pages.

## 📖 Instrucciones para la Administración (Franye)

1. **Actualización:** Solo debe modificar la hoja de cálculo de Google vinculada. Los cambios se reflejan al recargar la página.
2. **Columnas de Datos:**
   - **Stock:** Usar números enteros (`10`, `5`, etc.). El sistema oculta el producto automáticamente al llegar a `0`.
   - **Destacado:** Marcar como `TRUE` en la columna correspondiente para que el producto aparezca en el carrusel superior.
3. **Mantenimiento de Código:**
   - La lógica principal reside en `app.js` bajo nombres de funciones en inglés (ej. `moveCarousel`, `sendWhatsAppOrder`).
   - El estilo visual se gestiona desde `style.css` mediante variables en el `:root`.

## 📂 Estructura del Proyecto

- `index.html`: Estructura semántica de la tienda (Textos en español).
- `style.css`: Hoja de estilos con el nuevo tema **Pink & Gold**.
- `app.js`: Cerebro del sistema (Lógica refactorizada en inglés).
- `admin.html`: Panel para la carga rápida de nuevos productos a la base de datos.

---

_Desarrollado con fines comerciales por HorussCode - 2026_
