/* =====================================================================
   PANCHITOPLUS · DATOS DE LA TIENDA
   ---------------------------------------------------------------------
   Este archivo es la "base de datos" actual del sitio. Aquí se editan:
     1. STORE         → datos de tu negocio (WhatsApp, redes, etc.)
     2. SETTINGS      → opciones generales
     3. CATEGORIES    → pestañas del menú
     4. IPHONE_MODELS → modelos de iPhone (para filtrar cases)
     5. COLORS / CASE_TYPES
     6. PRODUCTS      → el catálogo (TODOS los productos de abajo son EJEMPLOS)
     7. UPCOMING      → próximos ingresos

   IMPORTANTE
   - Los productos, precios y stock de este archivo son DATOS DE EJEMPLO.
     Reemplázalos por los tuyos. Cuando lo hagas, pon
     SETTINGS.showSampleBadge = false para ocultar la etiqueta "Ejemplo".
   - Esta versión NO tiene base de datos ni panel de administración.
     Para actualizar stock o precios hay que editar este archivo y volver
     a subir el sitio. En app.js, la función Data.load() es el único lugar
     que lee estos datos: ahí se podrá conectar una API/base de datos
     real más adelante sin tocar el diseño ni los filtros.
   ===================================================================== */

/* ---------- 1. DATOS DEL NEGOCIO ---------- */
const STORE = {
  name: "PanchitoPlus",
  // Número de WhatsApp en formato internacional, SIN "+" ni espacios. Perú = 51.
  // ⚠ Este número es un marcador de posición: pon el tuyo.
  whatsapp: "51000000000",
  whatsappDisplay: "+51 000 000 000",
  email: "hola@tutienda.pe",
  address: "Ica, Perú · Dirección de tu tienda",
  hours: "Lun a Sáb · 10:00 a 20:00",
  announcement: "✿ Atención y pedidos por WhatsApp · Consulta stock y coordina tu entrega ✿",
  // Si no tienes una red, deja url vacío ("") y no se mostrará.
  social: [
    { name: "Instagram", url: "https://www.instagram.com/" },
    { name: "TikTok",    url: "https://www.tiktok.com/" },
    { name: "Facebook",  url: "https://www.facebook.com/" }
  ]
};

/* ---------- 2. OPCIONES GENERALES ---------- */
const SETTINGS = {
  currency: "S/",
  showSampleBadge: true,   // true = muestra "Ejemplo" en cada producto
  lowStockThreshold: 3,    // "¡Últimas unidades!" si stock <= este número
  newestDaysAreTags: true  // "Novedades" usa la etiqueta "nuevo"
};

/* ---------- 3. CATEGORÍAS (PESTAÑAS) ----------
   Para añadir una pestaña nueva: agrega un objeto aquí y usa su "id"
   en el campo "category" de los productos. El menú se genera solo.
   - filter.category → muestra solo productos de esa categoría
   - filter.tag      → muestra productos con esa etiqueta
   - filters         → qué filtros aparecen en esa pestaña               */
const CATEGORIES = [
  { id: "inicio", label: "Inicio", type: "home" },
  {
    id: "cases", label: "Cases para iPhone", type: "catalog",
    title: "Cases para iPhone",
    description: "Encuentra la funda perfecta para tu modelo.",
    blurb: "Silicona, transparentes y más",
    image: "assets/images/case-pink.svg",
    filter: { category: "cases" },
    filters: ["model", "caseType", "color", "price", "availability"]
  },
  {
    id: "hello-kitty", label: "Hello Kitty", type: "catalog",
    title: "Hello Kitty y amigos kawaii",
    description: "Peluches, llaveros y detalles para regalar.",
    blurb: "Peluches y regalitos",
    image: "assets/images/plush-bunny.svg",
    filter: { category: "hello-kitty" },
    filters: ["character", "subcategory", "price", "availability"]
  },
  {
    id: "anime", label: "Anime", type: "catalog",
    title: "Anime",
    description: "Productos por serie, personaje o colección.",
    blurb: "Por serie y personaje",
    image: "assets/images/anime-star.svg",
    filter: { category: "anime" },
    filters: ["character", "subcategory", "price", "availability"]
  },
  {
    id: "accesorios", label: "Accesorios", type: "catalog",
    title: "Accesorios",
    description: "Cargadores, correas, soportes y más para tu celular.",
    blurb: "Para tu celular",
    image: "assets/images/charger.svg",
    filter: { category: "accesorios" },
    filters: ["subcategory", "price", "availability"]
  },
  {
    id: "novedades", label: "Novedades", type: "catalog",
    title: "Novedades",
    description: "Lo último que entró a la tienda.",
    blurb: "Lo último en llegar",
    image: "assets/images/stickers.svg",
    filter: { tag: "nuevo" },
    filters: ["category", "price", "availability"],
    defaultSort: "newest"
  },
  {
    id: "ofertas", label: "Ofertas", type: "catalog",
    title: "Ofertas",
    description: "Precios especiales por tiempo limitado.",
    blurb: "Precios especiales",
    image: "assets/images/mug.svg",
    filter: { tag: "oferta" },
    filters: ["category", "price", "availability"]
  }
];

/* Nombres para el filtro "Categoría" (usado en Novedades, Ofertas y búsqueda) */
const CATEGORY_LABELS = {
  "cases": "Cases para iPhone",
  "hello-kitty": "Hello Kitty",
  "anime": "Anime",
  "accesorios": "Accesorios"
};

/* ---------- 4. MODELOS DE iPHONE ----------
   Para añadir modelos nuevos (por ejemplo iPhone 18): agrega un grupo al
   final. No hay que tocar nada más: el filtro lo incorpora solo.
   El "id" de cada modelo es el que se escribe en product.models.        */
const IPHONE_MODELS = [
  { group: "iPhone 11", models: [
    { id: "iphone-11",         label: "iPhone 11" },
    { id: "iphone-11-pro",     label: "iPhone 11 Pro" },
    { id: "iphone-11-pro-max", label: "iPhone 11 Pro Max" } ] },
  { group: "iPhone 12", models: [
    { id: "iphone-12",         label: "iPhone 12" },
    { id: "iphone-12-mini",    label: "iPhone 12 mini" },
    { id: "iphone-12-pro",     label: "iPhone 12 Pro" },
    { id: "iphone-12-pro-max", label: "iPhone 12 Pro Max" } ] },
  { group: "iPhone 13", models: [
    { id: "iphone-13",         label: "iPhone 13" },
    { id: "iphone-13-mini",    label: "iPhone 13 mini" },
    { id: "iphone-13-pro",     label: "iPhone 13 Pro" },
    { id: "iphone-13-pro-max", label: "iPhone 13 Pro Max" } ] },
  { group: "iPhone 14", models: [
    { id: "iphone-14",         label: "iPhone 14" },
    { id: "iphone-14-plus",    label: "iPhone 14 Plus" },
    { id: "iphone-14-pro",     label: "iPhone 14 Pro" },
    { id: "iphone-14-pro-max", label: "iPhone 14 Pro Max" } ] },
  { group: "iPhone 15", models: [
    { id: "iphone-15",         label: "iPhone 15" },
    { id: "iphone-15-plus",    label: "iPhone 15 Plus" },
    { id: "iphone-15-pro",     label: "iPhone 15 Pro" },
    { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max" } ] },
  { group: "iPhone 16", models: [
    { id: "iphone-16",         label: "iPhone 16" },
    { id: "iphone-16e",        label: "iPhone 16e" },
    { id: "iphone-16-plus",    label: "iPhone 16 Plus" },
    { id: "iphone-16-pro",     label: "iPhone 16 Pro" },
    { id: "iphone-16-pro-max", label: "iPhone 16 Pro Max" } ] },
  { group: "iPhone 17", models: [
    { id: "iphone-17",         label: "iPhone 17" },
    { id: "iphone-air",        label: "iPhone Air" },
    { id: "iphone-17-pro",     label: "iPhone 17 Pro" },
    { id: "iphone-17-pro-max", label: "iPhone 17 Pro Max" } ] }
];

/* ---------- 5. COLORES Y TIPOS DE CASE ---------- */
const COLORS = {
  rosa:   { label: "Rosa",   hex: "#ffb6c8" },
  crema:  { label: "Crema",  hex: "#f6e6c4" },
  rojo:   { label: "Rojo",   hex: "#e8707f" },
  menta:  { label: "Menta",  hex: "#a9e6d1" },
  lila:   { label: "Lila",   hex: "#cdb9f2" },
  celeste:{ label: "Celeste",hex: "#a8d3fa" }
};

const CASE_TYPES = {
  silicona:     "Silicona",
  transparente: "Transparente",
  rigido:       "Rígido con diseño",
  anillo:       "Con anillo"
};

/* ---------- 6. PRODUCTOS (TODOS SON EJEMPLOS) ----------
   Campos:
     id           texto único
     name         nombre
     category     "cases" | "hello-kitty" | "anime" | "accesorios" (o una nueva)
     subcategory  tipo de artículo (Llaveros, Peluches, Silicona…)
     description  descripción breve
     price        precio actual en soles
     oldPrice     precio anterior (solo si hay oferta)
     image        ruta de la foto principal (assets/images/...)
     imageByColor (opcional) foto distinta por color: { rosa: "ruta" }
     models       (cases) ids de IPHONE_MODELS compatibles
     caseType     (cases) clave de CASE_TYPES
     colors       claves de COLORS disponibles
     character    personaje o serie
     stock        unidades disponibles
     status       "disponible" | "agotado" | "proximamente"
     tags         "nuevo", "destacado", "oferta", "mas-vendido"
     createdAt    fecha de ingreso AAAA-MM-DD (para ordenar por novedades)

   Para REEMPLAZAR UNA FOTO: guarda tu imagen en assets/images/ y cambia
   el campo "image". Recomendado: cuadrada (800×800 px), JPG o WebP.     */
const PRODUCTS = [

  /* ===== CASES PARA iPHONE ===== */
  { id: "case-001", name: "Case silicona Nube", category: "cases", subcategory: "Silicona",
    description: "Silicona suave con interior de microfibra y bordes elevados para proteger la pantalla.",
    price: 29.90, image: "assets/images/15(1).jpg", models: ["iphone-15"], caseType: "silicona",
    character: "", stock: 1, status: "disponible", tags: ["mas-vendido", "destacado"], createdAt: "2026-09-12" },

  { id: "case-002", name: "Case silicona Nube", category: "cases", subcategory: "Silicona",
    description: "Silicona suave con interior de microfibra y bordes elevados para proteger la pantalla.",
    price: 29.90, image: "assets/images/15(2).jpg", models: ["iphone-15"], caseType: "silicona",
    character: "", stock: 1, status: "disponible", tags: ["mas-vendido", "destacado"], createdAt: "2026-09-12" },
  { id: "case-003", name: "Case silicona Nube", category: "cases", subcategory: "Silicona",
    description: "Silicona suave con interior de microfibra y bordes elevados para proteger la pantalla.",
    price: 29.90, image: "assets/images/15(3).jpg", models: ["iphone-15"], caseType: "silicona",
    character: "", stock: 1, status: "disponible", tags: ["mas-vendido", "destacado"], createdAt: "2026-09-12" },
  { id: "case-004", name: "Case silicona transparente diseño gato", category: "cases", subcategory: "Silicona",
    description: "Silicona suave con patita de gato.",
    price: 29.90, image: "assets/images/15(4).jpg", models: ["iphone-15"], caseType: "silicona",
    character: "", stock: 1, status: "disponible", tags: ["mas-vendido", "destacado"], createdAt: "2026-09-12" },
  { id: "case-005", name: "Case silicona Con Mag", category: "cases", subcategory: "Silicona",
    description: "Silicona suave con interior de microfibra y bordes elevados para proteger la pantalla.",
    price: 19.90, image: "assets/images/15(5).jpg", models: ["iphone-15"], caseType: "silicona",
    character: "", stock: 1, status: "disponible", tags: ["mas-vendido", "destacado"], createdAt: "2026-09-12" },




  { id: "case-006", name: "Case Jujutsu Kaisen Sukuna", category: "cases", subcategory: "Silicona",
    description: "Silicona con diseño  de Sukuna de JJK.",
    price: 19.90, image: "assets/images/15PRO(1).jpg", models: ["iphone-15-pro"], caseType: "silicona",
    character: "", stock: 1, status: "disponible", tags: ["mas-vendido"], createdAt: "2026-09-12" },
    
  { id: "case-007", name: "Case silicona Cool", category: "cases", subcategory: "Silicona",
    description: "Silicona suave con interior de microfibra y bordes elevados para proteger la pantalla.",
    price: 19.90, image: "assets/images/15pro(2).jpg", models: ["iphone-15-pro"], caseType: "silicona",
    character: "", stock: 1, status: "disponible", tags: ["mas-vendido"], createdAt: "2026-09-12" },

  { id: "case-008", name: "Case transparente Kuromi", category: "cases", subcategory: "Transparente",
    description: "Transparente con diseño de Kuromi.",
    price: 19.90, image: "assets/images/16(1).jpg", models: ["iphone-16"], caseType: "transparente",
    character: "", stock: 1, status: "disponible", tags: ["nuevo", "destacado"], createdAt: "2026-10-22" },
  { id: "case-009", name: "Case Samurai", category: "cases", subcategory: "Diseño",
    description: "Case con diseño de samurai.",
    price: 19.90, image: "assets/images/16(2).jpg", models: ["iphone-16"], caseType: "Diseño",
    character: "", stock: 1, status: "disponible", tags: ["nuevo", "destacado"], createdAt: "2026-10-22" },

  { id: "case-010", name: "Case transparente diseño kwai", category: "cases", subcategory: "Transparente",
    description: "Transparente con diseño de kwai.",
    price: 19.90, image: "assets/images/16pro(1).jpg", models: ["iphone-16-pro"], caseType: "transparente",
    character: "", stock: 1, status: "disponible", tags: ["nuevo", "destacado"], createdAt: "2026-10-22" },






  { id: "case-011", name: "Case transparente Hello Kitty", category: "cases", subcategory: "Transparente",
    description: "Transparente con diseño de Hello Kitty.",
    price: 29.90, image: "assets/images/13(1).jpg", models: ["iphone-13"], caseType: "transparente",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },

  { id: "case-012", name: "Case transparente kwai", category: "cases", subcategory: "Transparente",
    description: "Transparente con diseño de kwai.",
    price: 19.90, image: "assets/images/13(2).jpg", models: ["iphone-13"], caseType: "transparente",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-013", name: "Case con diseño de gatos", category: "cases", subcategory: "Transparente",
    description: "Case diseño gatos",
    price: 19.90, oldPrice: 29.90, image: "assets/images/13(3).jpg", models: ["iphone-13"], caseType: "Transparente",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-014", name: "Case Hello Kitty", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de Hello Kitty.",
    price: 29.90, image: "assets/images/13(4).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-015", name: "Case diseño lazos", category: "cases", subcategory: "transparente",
    description: "Tapa rígida con diseño de corazones y acabado mate fácil de limpiar.",
    price: 19.90, image: "assets/images/13(5).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-016", name: "Case Hello Kitty", category: "cases", subcategory: "transparente",
    description: "Tapa rígida con diseño de Hello Kitty.",
    price: 19.90, image: "assets/images/13(6).jpg", models: ["iphone-13"], caseType: "transparente",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-017", name: "Case Hello Kitty", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de Hello Kitty.",
    price: 19.90, image: "assets/images/13(7).jpg", models: ["iphone-13"], caseType: "transparente",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-018", name: "Case Naruto", category: "cases", subcategory: "transparente",
    description: "Case colr entero dieño Naruto.",
    price: 19.90, oldPrice: 29.90, image: "assets/images/13(8).jpg", models: ["iphone-13"], caseType: "diseño",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-019", name: "Case transparente spider", category: "cases", subcategory: "transparente",
    description: "Tapa con diseño de Spider.",
    price: 14.90, oldPrice: 19.90, image: "assets/images/13(9).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-020", name: "Case transparente con carga inalámbrica", category: "cases", subcategory: "transparente",
    description: "case clasico transparente con carga inalámbrica.",
    price: 19.90, oldPrice: 29.90, image: "assets/images/13(10).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 4, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-021", name: "Case Corazón Anatomia", category: "cases", subcategory: "transparente",
    description: "case Anatomia de corazones.",
    price: 19.90, oldPrice: 39.90, image: "assets/images/13(11).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 2, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  
  { id: "case-022", name: "Case Planetas", category: "cases", subcategory: "Diseño",
    description: "Tapa con diseño de planetario.",
    price: 19.90, oldPrice: 24.90, image: "assets/images/13(12).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  { id: "case-023", name: "Case samurai", category: "cases", subcategory: "Diseño",
    description: "Case con diseño de samurai.",
    price: 19.90, oldPrice: 24.90, image: "assets/images/13(13).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 1, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  { id: "case-024", name: "Case rígido Corazón", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de corazones y acabado mate fácil de limpiar.",
    price: 32.90, oldPrice: 39.90, image: "assets/images/13(14).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 4, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  { id: "case-025", name: "Case rígido Corazón", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de corazones y acabado mate fácil de limpiar.",
    price: 32.90, oldPrice: 39.90, image: "assets/images/13(15).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 4, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  { id: "case-026", name: "Case rígido Corazón", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de corazones y acabado mate fácil de limpiar.",
    price: 32.90, oldPrice: 39.90, image: "assets/images/13(16).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 4, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  { id: "case-027", name: "Case rígido Corazón", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de corazones y acabado mate fácil de limpiar.",
    price: 32.90, oldPrice: 39.90, image: "assets/images/13(17).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 4, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },
  { id: "case-028", name: "Case rígido Corazón", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de corazones y acabado mate fácil de limpiar.",
    price: 32.90, oldPrice: 39.90, image: "assets/images/13(18).jpg", models: ["iphone-13"], caseType: "rigido",
    character: "", stock: 4, status: "disponible", tags: ["oferta"], createdAt: "2026-07-30" },































  { id: "case-007", name: "Case rígido Corazón", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida con diseño de corazones y acabado mate fácil de limpiar.",
    price: 32.90, oldPrice: 39.90, image: "assets/images/case-red.svg", models: ["iphone-13-pro"], caseType: "rigido",
    colors: ["rojo"], character: "", stock: 0, status: "agotado", tags: ["oferta"], createdAt: "2026-07-30" },

  { id: "case-008", name: "Case con anillo Mochi", category: "cases", subcategory: "Con anillo",
    description: "Incluye anillo giratorio que sirve de soporte y agarre firme.",
    price: 39.90, image: "assets/images/case-cream.svg", models: ["iphone-15-pro-max"], caseType: "anillo",
    colors: ["crema", "rosa"], imageByColor: { crema: "assets/images/case-cream.svg", rosa: "assets/images/case-pink.svg" },
    character: "", stock: 9, status: "disponible", tags: ["destacado"], createdAt: "2026-09-25" },

  { id: "case-009", name: "Case con anillo Mochi", category: "cases", subcategory: "Con anillo",
    description: "Incluye anillo giratorio que sirve de soporte y agarre firme.",
    price: 39.90, image: "assets/images/case-mint.svg", models: ["iphone-14-pro"], caseType: "anillo",
    colors: ["menta"], character: "", stock: 3, status: "disponible", tags: [], createdAt: "2026-09-25" },

  { id: "case-010", name: "Case silicona Menta Suave", category: "cases", subcategory: "Silicona",
    description: "Silicona flexible y antideslizante en un tono menta muy suave.",
    price: 24.90, image: "assets/images/case-mint.svg", models: ["iphone-12"], caseType: "silicona",
    colors: ["menta", "celeste"], imageByColor: { menta: "assets/images/case-mint.svg", celeste: "assets/images/case-blue.svg" },
    character: "", stock: 14, status: "disponible", tags: [], createdAt: "2026-06-15" },

  { id: "case-011", name: "Case silicona Lila", category: "cases", subcategory: "Silicona",
    description: "Silicona flexible y antideslizante, con acabado satinado.",
    price: 24.90, image: "assets/images/case-lilac.svg", models: ["iphone-12-pro"], caseType: "silicona",
    colors: ["lila"], character: "", stock: 10, status: "disponible", tags: [], createdAt: "2026-06-15" },

  { id: "case-012", name: "Case silicona Cielo", category: "cases", subcategory: "Silicona",
    description: "Silicona flexible con protección en las esquinas.",
    price: 22.90, oldPrice: 27.90, image: "assets/images/case-blue.svg", models: ["iphone-11"], caseType: "silicona",
    colors: ["celeste", "rosa"], imageByColor: { celeste: "assets/images/case-blue.svg", rosa: "assets/images/case-pink.svg" },
    character: "", stock: 7, status: "disponible", tags: ["oferta"], createdAt: "2026-05-10" },

  { id: "case-013", name: "Case transparente Cristal", category: "cases", subcategory: "Transparente",
    description: "Transparente y delgado, con bordes reforzados contra golpes.",
    price: 29.90, image: "assets/images/case-blue.svg", models: ["iphone-14-plus"], caseType: "transparente",
    colors: ["celeste"], character: "", stock: 11, status: "disponible", tags: [], createdAt: "2026-08-02" },

  { id: "case-014", name: "Case rígido Crema", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida en crema con detalles delicados y buen agarre.",
    price: 44.90, image: "assets/images/case-cream.svg", models: ["iphone-17"], caseType: "rigido",
    colors: ["crema", "rosa"], imageByColor: { crema: "assets/images/case-cream.svg", rosa: "assets/images/case-pink.svg" },
    character: "", stock: 10, status: "disponible", tags: ["nuevo", "destacado"], createdAt: "2026-10-26" },

  { id: "case-015", name: "Case rígido Crema", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida en crema con detalles delicados y buen agarre.",
    price: 44.90, image: "assets/images/case-cream.svg", models: ["iphone-17-pro"], caseType: "rigido",
    colors: ["crema"], character: "", stock: 6, status: "disponible", tags: ["nuevo"], createdAt: "2026-10-26" },

  { id: "case-016", name: "Case con anillo Mochi", category: "cases", subcategory: "Con anillo",
    description: "Incluye anillo giratorio que sirve de soporte y agarre firme.",
    price: 47.90, image: "assets/images/case-pink.svg", models: ["iphone-17-pro-max"], caseType: "anillo",
    colors: ["rosa"], character: "", stock: 0, status: "proximamente", tags: ["nuevo"], createdAt: "2026-10-27" },

  { id: "case-017", name: "Case silicona Cereza", category: "cases", subcategory: "Silicona",
    description: "Silicona suave en rojo cereza, con interior que cuida la cámara.",
    price: 29.90, image: "assets/images/case-red.svg", models: ["iphone-16-plus"], caseType: "silicona",
    colors: ["rojo", "rosa"], imageByColor: { rojo: "assets/images/case-red.svg", rosa: "assets/images/case-pink.svg" },
    character: "", stock: 15, status: "disponible", tags: ["mas-vendido"], createdAt: "2026-09-05" },

  { id: "case-018", name: "Case transparente Cristal", category: "cases", subcategory: "Transparente",
    description: "Transparente y delgado, con bordes reforzados contra golpes.",
    price: 29.90, image: "assets/images/case-mint.svg", models: ["iphone-15-plus"], caseType: "transparente",
    colors: ["menta", "celeste"], imageByColor: { menta: "assets/images/case-mint.svg", celeste: "assets/images/case-blue.svg" },
    character: "", stock: 9, status: "disponible", tags: [], createdAt: "2026-08-18" },

  { id: "case-019", name: "Case silicona Crema", category: "cases", subcategory: "Silicona",
    description: "Silicona suave en crema, ligera y fácil de colocar.",
    price: 22.90, image: "assets/images/case-cream.svg", models: ["iphone-11-pro-max"], caseType: "silicona",
    colors: ["crema"], character: "", stock: 6, status: "disponible", tags: [], createdAt: "2026-05-10" },

  { id: "case-020", name: "Case rígido Lila", category: "cases", subcategory: "Rígido con diseño",
    description: "Tapa rígida lila con acabado mate.",
    price: 26.90, image: "assets/images/case-lilac.svg", models: ["iphone-12-mini"], caseType: "rigido",
    colors: ["lila"], character: "", stock: 2, status: "disponible", tags: [], createdAt: "2026-06-01" },

  /* ===== HELLO KITTY Y KAWAII ===== */
  { id: "hk-001", name: "Peluche conejito pastel 25 cm", category: "hello-kitty", subcategory: "Peluches",
    description: "Peluche muy suave, ideal para regalo. (Ejemplo: reemplaza por tu peluche real.)",
    price: 59.90, image: "assets/images/plush-bunny.svg", models: [], colors: [],
    character: "My Melody", stock: 6, status: "disponible", tags: ["nuevo", "destacado"], createdAt: "2026-10-24" },

  { id: "hk-002", name: "Llavero bolita rosa", category: "hello-kitty", subcategory: "Llaveros",
    description: "Llavero acolchado con argolla metálica.",
    price: 14.90, image: "assets/images/keychain-pink.svg", models: [], colors: [],
    character: "Hello Kitty", stock: 25, status: "disponible", tags: ["mas-vendido", "nuevo"], createdAt: "2026-10-20" },

  { id: "hk-003", name: "Llavero bolita menta", category: "hello-kitty", subcategory: "Llaveros",
    description: "Llavero acolchado con argolla metálica.",
    price: 14.90, image: "assets/images/keychain-mint.svg", models: [], colors: [],
    character: "Cinnamoroll", stock: 18, status: "disponible", tags: [], createdAt: "2026-09-18" },

  { id: "hk-004", name: "Peluche osito crema 20 cm", category: "hello-kitty", subcategory: "Peluches",
    description: "Peluche suave de 20 cm con acabado afelpado.",
    price: 49.90, oldPrice: 59.90, image: "assets/images/plush-bear.svg", models: [], colors: [],
    character: "Hello Kitty", stock: 5, status: "disponible", tags: ["oferta"], createdAt: "2026-08-08" },

  { id: "hk-005", name: "Libreta tapa dura rosa", category: "hello-kitty", subcategory: "Papelería",
    description: "Libreta de tapa dura con hojas rayadas y marcador de cinta.",
    price: 18.90, image: "assets/images/notebook.svg", models: [], colors: [],
    character: "Hello Kitty", stock: 20, status: "disponible", tags: ["destacado"], createdAt: "2026-09-02" },

  { id: "hk-006", name: "Taza de cerámica corazones", category: "hello-kitty", subcategory: "Hogar",
    description: "Taza de cerámica de 320 ml con asa redondeada.",
    price: 32.90, image: "assets/images/mug.svg", models: [], colors: [],
    character: "Hello Kitty", stock: 0, status: "agotado", tags: [], createdAt: "2026-07-14" },

  { id: "hk-007", name: "Pack de stickers x30", category: "hello-kitty", subcategory: "Papelería",
    description: "30 stickers resistentes al agua para laptop, botella o celular.",
    price: 9.90, image: "assets/images/stickers.svg", models: [], colors: [],
    character: "Kuromi", stock: 40, status: "disponible", tags: ["mas-vendido"], createdAt: "2026-08-25" },

  { id: "hk-008", name: "Tote bag crema", category: "hello-kitty", subcategory: "Bolsos",
    description: "Bolsa de tela resistente con asas largas.",
    price: 36.90, image: "assets/images/tote.svg", models: [], colors: [],
    character: "Hello Kitty", stock: 0, status: "proximamente", tags: ["nuevo"], createdAt: "2026-10-27" },

  /* ===== ANIME ===== */
  { id: "an-001", name: "Llavero acrílico personaje", category: "anime", subcategory: "Llaveros",
    description: "Llavero de acrílico con impresión a doble cara.",
    price: 12.90, image: "assets/images/keychain-mint.svg", models: [], colors: [],
    character: "Demon Slayer", stock: 22, status: "disponible", tags: [], createdAt: "2026-09-09" },

  { id: "an-002", name: "Pack de stickers resistentes al agua", category: "anime", subcategory: "Stickers",
    description: "Set de stickers vinilo con acabado brillante.",
    price: 11.90, image: "assets/images/stickers.svg", models: [], colors: [],
    character: "Naruto", stock: 35, status: "disponible", tags: ["mas-vendido"], createdAt: "2026-08-30" },

  { id: "an-003", name: "Libreta tapa dura", category: "anime", subcategory: "Papelería",
    description: "Libreta A5 de tapa dura con hojas rayadas.",
    price: 21.90, image: "assets/images/notebook.svg", models: [], colors: [],
    character: "Jujutsu Kaisen", stock: 12, status: "disponible", tags: ["nuevo"], createdAt: "2026-10-23" },

  { id: "an-004", name: "Peluche mini 15 cm", category: "anime", subcategory: "Peluches",
    description: "Peluche de 15 cm con relleno suave.",
    price: 39.90, oldPrice: 49.90, image: "assets/images/plush-bear.svg", models: [], colors: [],
    character: "Naruto", stock: 7, status: "disponible", tags: ["oferta"], createdAt: "2026-07-21" },

  { id: "an-005", name: "Póster A4 mate", category: "anime", subcategory: "Decoración",
    description: "Póster en papel mate de 200 g, tamaño A4.",
    price: 15.90, image: "assets/images/anime-star.svg", models: [], colors: [],
    character: "One Piece", stock: 16, status: "disponible", tags: ["destacado", "nuevo"], createdAt: "2026-10-21" },

  { id: "an-006", name: "Correa para celular", category: "anime", subcategory: "Accesorios",
    description: "Correa ajustable con charms, para colgar al cuello o la muñeca.",
    price: 17.90, image: "assets/images/strap.svg", models: [], colors: [],
    character: "Demon Slayer", stock: 9, status: "disponible", tags: [], createdAt: "2026-09-14" },

  { id: "an-007", name: "Taza de cerámica", category: "anime", subcategory: "Hogar",
    description: "Taza de cerámica de 320 ml, apta para microondas.",
    price: 29.90, image: "assets/images/mug.svg", models: [], colors: [],
    character: "Jujutsu Kaisen", stock: 0, status: "agotado", tags: [], createdAt: "2026-06-20" },

  { id: "an-008", name: "Soporte de agarre para celular", category: "anime", subcategory: "Accesorios",
    description: "Soporte plegable adhesivo para celular.",
    price: 16.90, image: "assets/images/grip.svg", models: [], colors: [],
    character: "One Piece", stock: 14, status: "disponible", tags: ["nuevo"], createdAt: "2026-10-19" },

  /* ===== ACCESORIOS ===== */
  { id: "ac-001", name: "Cargador rápido 20 W compacto", category: "accesorios", subcategory: "Cargadores",
    description: "Cargador de pared USB-C de 20 W, compacto y de carga rápida.",
    price: 49.90, image: "assets/images/charger.svg", models: [], colors: [],
    character: "", stock: 14, status: "disponible", tags: ["mas-vendido", "destacado"], createdAt: "2026-08-12" },

  { id: "ac-002", name: "Cable USB-C a USB-C trenzado 1 m", category: "accesorios", subcategory: "Cables",
    description: "Cable trenzado resistente con carga rápida y transferencia de datos.",
    price: 24.90, oldPrice: 29.90, image: "assets/images/charger.svg", models: [], colors: [],
    character: "", stock: 30, status: "disponible", tags: ["oferta"], createdAt: "2026-07-05" },

  { id: "ac-003", name: "Estuche para audífonos de silicona", category: "accesorios", subcategory: "Audio",
    description: "Estuche protector de silicona con mosquetón.",
    price: 19.90, image: "assets/images/earbuds-case.svg", models: [], colors: [],
    character: "", stock: 17, status: "disponible", tags: ["nuevo"], createdAt: "2026-10-18" },

  { id: "ac-004", name: "Correa colgante para celular", category: "accesorios", subcategory: "Correas",
    description: "Correa ajustable con cuentas, compatible con la mayoría de cases.",
    price: 15.90, image: "assets/images/strap.svg", models: [], colors: [],
    character: "", stock: 22, status: "disponible", tags: ["destacado"], createdAt: "2026-09-01" },

  { id: "ac-005", name: "Soporte de agarre plegable", category: "accesorios", subcategory: "Soportes",
    description: "Soporte adhesivo plegable para ver videos y tomar fotos.",
    price: 12.90, image: "assets/images/grip.svg", models: [], colors: [],
    character: "", stock: 28, status: "disponible", tags: ["mas-vendido"], createdAt: "2026-08-03" },

  { id: "ac-006", name: "Cable Lightning 1 m", category: "accesorios", subcategory: "Cables",
    description: "Cable Lightning para modelos de iPhone compatibles.",
    price: 22.90, image: "assets/images/charger.svg", models: [], colors: [],
    character: "", stock: 0, status: "agotado", tags: [], createdAt: "2026-06-18" },

  { id: "ac-007", name: "Charm para celular perla y lazo", category: "accesorios", subcategory: "Correas",
    description: "Charm decorativo con cuentas y lazo.",
    price: 13.90, image: "assets/images/strap.svg", models: [], colors: [],
    character: "", stock: 19, status: "disponible", tags: ["nuevo"], createdAt: "2026-10-25" }
];

/* ---------- 7. PRÓXIMOS INGRESOS (EJEMPLOS) ---------- */
const UPCOMING = [
  { title: "Cases para iPhone 17", date: "Noviembre", image: "assets/images/coming-1.svg",
    text: "Más diseños y colores para toda la línea iPhone 17." },
  { title: "Colección Navidad kawaii", date: "Diciembre", image: "assets/images/coming-2.svg",
    text: "Peluches, llaveros y packs de regalo para sorprender." },
  { title: "Nueva línea anime", date: "Próximamente", image: "assets/images/coming-3.svg",
    text: "Más series y personajes en llaveros, stickers y papelería." }
];