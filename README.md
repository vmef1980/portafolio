# CV — Víctor Manuel Estrada Funes

```
index.html          Estructura del CV (sin estilos ni scripts en línea)
admin.html          Panel para editar todo el contenido
css/main.css        Estilos del sitio
css/admin.css       Estilos del panel
js/data.js          CONTENIDO del CV en español e inglés (fuente única)
js/store.js         Lectura/guardado de datos (compartido por index y admin)
js/i18n.js          Textos fijos de la interfaz ES/EN
js/render.js        Dibuja las secciones a partir de data.js
js/pdf.js           Exportación a PDF con texto real (jsPDF)
js/cursor.js        Efecto del ratón
js/main.js          Arranque: idioma, menú, copiar ID, verificar, PDF
js/admin.js         Lógica del panel
img/                perfil.jpg y perfil.ico (copia aquí los tuyos)
```

## Editar contenido
1. Abre `admin.html`, edita, pulsa **Guardar cambios** (o Ctrl+S).
2. Eso guarda **solo en tu navegador**. Para publicarlo para todos:
   **Descargar data.js** → reemplaza `js/data.js` en el servidor.

## Notas
- Pruébalo desde un servidor (hosting o `python -m http.server`). Abierto con
  doble clic (file://) funciona todo, pero el navegador impide incluir la foto en el PDF.
- `admin.html` no tiene contraseña: no lo enlaces públicamente o protégelo en el hosting.
- El idioma puede forzarse con `index.html?lang=en`.
