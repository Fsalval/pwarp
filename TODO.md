# TODO - Reparación completa (blackboxai)

- [x] Revisar y corregir Borradores (`src/ui/drafts.ts`)
  - [x] Cambiar textarea id: `editor-textarea` -> `main-editor`
  - [ ] Preview: primeros 80 chars
  - [ ] Modal con 5 slots (buttons Cargar / Copiar / Eliminar)
  - [ ] Cargar: poner texto en editor + ir a tab Editor + cerrar modal
  - [ ] Copiar: clipboard del slot.text
  - [ ] Eliminar: reset del slot


- [ ] Reparar Vista Previa (`src/ui/preview.ts`)
  - [ ] Cambiar textarea id: `editor-textarea` -> `main-editor`
  - [ ] Simulación por plataforma con tamaños correctos
  - [ ] Truncados exactos por plataforma
  - [ ] Contador rojo Twitter si >280
  - [ ] Botón `Corregir espacios para esta plataforma` => aplica `fixSpaces()` + copia clipboard

- [ ] Actualizar Banners (`src/ui/banners.ts`)
  - [ ] Reemplazar plantillas por: Separador / About me / Ficha técnica
  - [ ] Campos + preview en tiempo real con output Unicode exacto
  - [ ] Botones: Copiar resultado + Guardar en perfil (auth requerida)
  - [ ] Guardar: máx 10 por usuario + insert en `public.banners`
  - [ ] (Si falta en frontend) manejar errores de insert y límites

- [ ] Agregar VK al filtro de plataformas de símbolos (`src/ui/editor.ts`)
  - [ ] Agregar pill `vk` en `#plat-pills`

- [ ] Verificar / ajustar `src/modules/spaces/index.ts` si difiere de reglas pedidas

- [ ] Compilar y validar (tsc / build)
- [ ] Pruebas manuales: tabs, modales, guardado banners, vista previa
