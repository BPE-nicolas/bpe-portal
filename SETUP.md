# Guía de configuración — BPE Portal

## Estructura de archivos

```
Jobs Website/
├── index.html          ← Home del portal
├── apply.html          ← Formulario de postulación (compartido)
├── apps-script.js      ← Código para Google Apps Script (NO va en GitHub)
├── SETUP.md            ← Esta guía
└── [posicion].html     ← Un HTML por cada búsqueda activa
```

---

## Paso 1: Google Drive — Crear carpeta de CVs

1. Abrí Google Drive
2. Creá una carpeta nueva llamada **"BPE - CVs"**
3. Abrí esa carpeta y copiá el ID de la URL:
   - URL ejemplo: `https://drive.google.com/drive/folders/1ABC123xyz`
   - El ID es: `1ABC123xyz`
4. Guardá ese ID, lo vas a necesitar en el Paso 2

---

## Paso 2: Google Apps Script — Configurar el backend

1. Abrí [script.google.com](https://script.google.com) y creá un proyecto nuevo
2. Eliminá el código de ejemplo y pegá todo el contenido de `apps-script.js`
3. Reemplazá `TU_FOLDER_ID_DE_DRIVE_AQUI` con el ID del Paso 1
4. Guardá el proyecto (Ctrl+S) con el nombre **"BPE Backend"**

### Vincular con Google Sheets
5. En el menú del editor, hacé click en **Recursos → Spreadsheet avanzado**
   (o bien: el script detecta automáticamente la Spreadsheet activa si lo abrís desde Sheets)

   **Alternativa más simple:** Creá primero una Google Sheet llamada "BPE - Postulaciones", 
   luego abrí Extensiones → Apps Script desde esa Sheet. Pegá el código ahí.

### Publicar como Web App
6. Hacé click en **Implementar → Nueva implementación**
7. Tipo: **Aplicación web**
8. Configuración:
   - Ejecutar como: **Yo (tu cuenta de Google)**
   - Quién tiene acceso: **Cualquier persona**
9. Hacé click en **Implementar**
10. Copiá la **URL de la aplicación web** que aparece

---

## Paso 3: Conectar el formulario con Apps Script

1. Abrí `apply.html` en el editor de texto
2. Buscá esta línea (está cerca del final, en el `<script>`):
   ```js
   const APPS_SCRIPT_URL = 'TU_APPS_SCRIPT_URL_AQUI';
   ```
3. Reemplazá `TU_APPS_SCRIPT_URL_AQUI` con la URL del Paso 2

---

## Paso 4: Publicar en GitHub Pages

### Crear el repositorio
1. Creá una cuenta en [github.com](https://github.com) si no tenés
2. Creá un repositorio nuevo:
   - Nombre: `bpe-portal` (o el que quieras)
   - Visibilidad: **Public** (requerido para GitHub Pages gratuito)
3. Subí todos los archivos **excepto** `apps-script.js` y `SETUP.md`:
   - `index.html`
   - `apply.html`
   - Todos los HTMLs de posiciones

### Activar GitHub Pages
4. En tu repositorio, andá a **Settings → Pages**
5. En "Source", seleccioná **Deploy from a branch**
6. Branch: **main**, carpeta: **/ (root)**
7. Guardá. En unos minutos tu sitio va a estar en:
   `https://TU-USUARIO.github.io/bpe-portal/`

---

## Flujo de trabajo: nueva búsqueda

1. Pedile a Claude que cree el HTML de la nueva posición
2. Subí ese HTML al repositorio de GitHub
3. Pedile a Claude que actualice `index.html` para agregar la card activa
4. Subí el `index.html` actualizado

### Enlace al formulario desde cada posición
El botón de postulación en cada HTML debe apuntar a:
```
apply.html?position=NOMBRE+DEL+ROL
```
Ejemplo:
```html
<a href="apply.html?position=Tech+Lead">Postularme</a>
```

---

## Flujo de trabajo: cerrar una búsqueda

1. Pedile a Claude que mueva la card de activa a finalizada en `index.html`
2. Subí el `index.html` actualizado a GitHub

---

## Cómo ver las postulaciones recibidas

- **Datos**: Abrí tu Google Sheet "BPE - Postulaciones" → hoja "Postulaciones"
- **CVs**: Abrí Google Drive → carpeta "BPE - CVs" → subcarpeta por posición
