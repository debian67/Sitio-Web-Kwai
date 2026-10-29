/* =====================================================================
   PANCHITOPLUS · LÓGICA DE LA TIENDA
   ---------------------------------------------------------------------
   Todo se dibuja a partir de js/products.js (STORE, CATEGORIES,
   IPHONE_MODELS, COLORS, CASE_TYPES, PRODUCTS, UPCOMING).
   Aquí NO hay productos escritos a mano.

   Índice
     1. Utilidades
     2. Capa de datos (Data)           ← punto de conexión a una API futura
     3. Helpers de producto y WhatsApp
     4. Tarjetas y plantillas
     5. Carrito (localStorage)
     6. Enrutador por pestañas (#/cases, #/anime…)
     7. Inicio
     8. Catálogo: filtros, búsqueda, orden
     9. Modal de detalle
    10. Carrito (panel), menú móvil, eventos globales
    11. Arranque
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- 1. UTILIDADES ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) => `${SETTINGS.currency} ${Number(n).toFixed(2)}`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  const MODEL_LABEL = {};
  IPHONE_MODELS.forEach((g) => g.models.forEach((m) => { MODEL_LABEL[m.id] = m.label; }));

  const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ffeef3"/>' +
    '<text x="200" y="210" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#b9a3ab">Sin imagen</text></svg>'
  );

  /* ---------- 2. CAPA DE DATOS ----------
     Hoy los productos vienen de js/products.js. Para conectar una base de
     datos real en el futuro, solo hay que cambiar el interior de load():
        const res = await fetch('/api/products');
        const rows = await res.json();
     y devolver productos con los mismos campos.                          */
  const Data = {
    products: [],
    async load() {
      this.products = PRODUCTS.map(normalizeProduct);
      return this.products;
    },
    byId(id) { return this.products.find((p) => p.id === id); }
  };

  function normalizeProduct(raw) {
    const p = {
      models: [], colors: [], tags: [], character: '', subcategory: '', caseType: '',
      stock: 0, status: 'disponible', oldPrice: null, imageByColor: {}, ...raw
    };
    p.price = Number(p.price) || 0;
    p.oldPrice = p.oldPrice ? Number(p.oldPrice) : null;
    p.stock = Math.max(0, Number(p.stock) || 0);
    if (p.status === 'disponible' && p.stock <= 0) p.status = 'agotado'; // coherencia stock/estado
    p._hay = norm([
      p.name, p.description, p.character, p.subcategory,
      CATEGORY_LABELS[p.category] || p.category,
      p.models.map((m) => MODEL_LABEL[m] || m).join(' '),
      p.colors.map((c) => (COLORS[c] ? COLORS[c].label : c)).join(' '),
      CASE_TYPES[p.caseType] || ''
    ].join(' '));
    p._name = norm(p.name);
    return p;
  }

  /* ---------- 3. HELPERS DE PRODUCTO Y WHATSAPP ---------- */
  const isAvailable = (p) => p.status === 'disponible' && p.stock > 0;
  const discount = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const modelsText = (p) => p.models.map((m) => MODEL_LABEL[m] || m).join(' · ');
  const colorLabel = (c) => (COLORS[c] ? COLORS[c].label : c);
  const imageFor = (p, color) => (color && p.imageByColor[color]) || p.image;
  const byDateDesc = (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '');

  function stockInfo(p) {
    if (p.status === 'proximamente') return { cls: 'stock--soon', text: 'Próximamente' };
    if (!isAvailable(p)) return { cls: 'stock--out', text: 'Agotado' };
    if (p.stock <= SETTINGS.lowStockThreshold) return { cls: 'stock--low', text: `¡Últimas ${p.stock} unidades!` };
    return { cls: '', text: 'Disponible' };
  }

  function waUrl(text) {
    return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  /* Mensaje de WhatsApp preparado según el producto */
  function productMessage(p, { model = '', color = '', qty = 1, intent = 'consult' } = {}) {
    const lines = [`Hola ${STORE.name} 👋`];
    if (intent === 'buy') lines.push(`Quiero comprar: ${qty > 1 ? qty + ' × ' : ''}${p.name}`);
    else if (intent === 'ask') lines.push(`Quisiera saber cuándo estará disponible: ${p.name}`);
    else lines.push(`Quiero consultar por: ${p.name}`);
    if (model) lines.push(`Modelo: ${MODEL_LABEL[model] || model}`);
    else if (p.models.length) lines.push(`Modelo: ${modelsText(p)}`);
    if (color) lines.push(`Color: ${colorLabel(color)}`);
    lines.push(`Precio: ${money(p.price)}${intent === 'buy' && qty > 1 ? ' c/u' : ''}`);
    lines.push(intent === 'buy' ? '¿Me confirman disponibilidad y forma de entrega?' : '¿Está disponible?');
    return lines.join('\n');
  }

  /* ---------- 4. TARJETAS Y PLANTILLAS ---------- */
  function badgesHTML(p) {
    const out = [];
    if (p.status === 'proximamente') out.push('<span class="badge badge--soon">Próximamente</span>');
    else if (!isAvailable(p)) out.push('<span class="badge badge--out">Agotado</span>');
    else {
      if (discount(p)) out.push(`<span class="badge badge--sale">Oferta -${discount(p)}%</span>`);
      if (p.tags.includes('nuevo')) out.push('<span class="badge badge--new">Nuevo</span>');
      if (p.tags.includes('mas-vendido')) out.push('<span class="badge badge--hot">Más vendido</span>');
    }
    return out.slice(0, 2).join('');
  }

  function priceHTML(p) {
    return `<span class="price">${money(p.price)}</span>` +
      (p.oldPrice && p.oldPrice > p.price
        ? `<span class="old-price" aria-label="Precio anterior">${money(p.oldPrice)}</span><span class="save">-${discount(p)}%</span>` : '');
  }

  function cardHTML(p, i = 0) {
    const avail = isAvailable(p);
    const st = stockInfo(p);
    const eyebrow = p.character || p.subcategory || CATEGORY_LABELS[p.category] || '';
    const compat = p.models.length ? `<p class="card-compat">Compatible: ${esc(modelsText(p))}</p>` : '';
    const desc = p.models.length ? '' : `<p class="card-desc">${esc(p.description)}</p>`;
    const swatches = p.colors.length
      ? `<div class="swatches" role="img" aria-label="Colores: ${esc(p.colors.map(colorLabel).join(', '))}">${p.colors.map((c) =>
          `<span class="swatch" style="--c:${COLORS[c] ? COLORS[c].hex : '#ddd'}"></span>`).join('')}</div>` : '';
    const sample = SETTINGS.showSampleBadge ? '<span class="sample-tag">Ejemplo</span>' : '';
    const actions = avail
      ? `<button class="btn btn-ghost btn-sm" type="button" data-action="details">Ver detalles</button>
         <a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="${waUrl(productMessage(p))}">Consultar</a>`
      : `<button class="btn btn-ghost btn-sm" type="button" data-action="details">Ver detalles</button>
         <button class="btn btn-sm" type="button" disabled>${p.status === 'proximamente' ? 'Próximamente' : 'Agotado'}</button>`;

    return `
    <article class="product-card ${avail ? '' : 'is-unavailable'}" data-id="${esc(p.id)}" style="animation-delay:${Math.min(i, 8) * 45}ms">
      <button class="card-media" type="button" data-action="details" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.image)}" alt="" width="400" height="400" loading="lazy" decoding="async" />
        <span class="badges">${badgesHTML(p)}</span>
        ${sample}
      </button>
      <div class="card-body">
        ${eyebrow ? `<p class="card-eyebrow">${esc(eyebrow)}</p>` : ''}
        <h3 class="card-title">${esc(p.name)}</h3>
        ${compat}${desc}${swatches}
        <p class="stock ${st.cls}">${st.text}</p>
        <div class="price-row">
          ${priceHTML(p)}
          <button class="icon-btn add-btn" type="button" data-action="add" aria-label="Agregar ${esc(p.name)} al carrito" ${avail ? '' : 'disabled'}>+</button>
        </div>
        <div class="card-actions">${actions}</div>
      </div>
    </article>`;
  }

  const skeletonHTML = (n = 4) => Array.from({ length: n }, () =>
    '<div class="skeleton" aria-hidden="true"><div class="sk-img"></div><div class="sk-line"></div><div class="sk-line"></div></div>').join('');

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    $('#toastZone').appendChild(el);
    setTimeout(() => el.remove(), 2900);
  }

  /* ---------- 5. CARRITO (guardado en localStorage del navegador) ---------- */
  const Cart = {
    KEY: 'mochi-mimi-cart-v1',
    items: [],
    load() {
      try { this.items = JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (e) { this.items = []; }
      if (!Array.isArray(this.items)) this.items = [];
      // Descarta productos que ya no existen o se agotaron y ajusta cantidades al stock
      this.items = this.items.map((i) => {
        const p = Data.byId(i.id);
        if (!p || !isAvailable(p)) return null;
        return { ...i, qty: Math.max(1, Math.min(parseInt(i.qty, 10) || 1, p.stock)) };
      }).filter(Boolean);
      this.save();
    },
    save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.items)); } catch (e) { /* sin almacenamiento */ } },
    keyOf: (id, color, model) => [id, color, model].join('|'),
    add(id, { color = '', model = '', qty = 1 } = {}) {
      const p = Data.byId(id);
      if (!p || !isAvailable(p)) return false;
      const key = this.keyOf(id, color, model);
      const found = this.items.find((i) => i.key === key);
      const total = (found ? found.qty : 0) + qty;
      if (total > p.stock) { toast(`Solo hay ${plural(p.stock, 'unidad disponible', 'unidades disponibles')}`); return false; }
      if (found) found.qty = total; else this.items.push({ key, id, color, model, qty });
      this.save(); this.render(true);
      return true;
    },
    setQty(key, qty) {
      const item = this.items.find((i) => i.key === key);
      if (!item) return;
      const p = Data.byId(item.id);
      if (qty < 1) return this.remove(key);
      if (p && qty > p.stock) { toast(`Solo hay ${plural(p.stock, 'unidad disponible', 'unidades disponibles')}`); return; }
      item.qty = qty; this.save(); this.render();
    },
    remove(key) { this.items = this.items.filter((i) => i.key !== key); this.save(); this.render(); },
    clear() { this.items = []; this.save(); this.render(); },
    count() { return this.items.reduce((n, i) => n + i.qty, 0); },
    total() { return this.items.reduce((s, i) => s + (Data.byId(i.id)?.price || 0) * i.qty, 0); },
    optsText(i) { return [i.model && (MODEL_LABEL[i.model] || i.model), i.color && colorLabel(i.color)].filter(Boolean).join(' · '); },
    message() {
      const lines = [`Hola ${STORE.name} 👋 Quiero hacer este pedido:`];
      this.items.forEach((i) => {
        const p = Data.byId(i.id); if (!p) return;
        const o = this.optsText(i);
        lines.push(`• ${i.qty} × ${p.name}${o ? ` (${o})` : ''} — ${money(p.price * i.qty)}`);
      });
      lines.push(`Total: ${money(this.total())}`);
      lines.push('¿Me confirman disponibilidad y forma de entrega?');
      return lines.join('\n');
    },
    render(bump = false) {
      const count = this.count();
      const badge = $('#cartCount');
      badge.textContent = count;
      if (bump) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
      $('#cartTotal').textContent = money(this.total());

      const body = $('#cartItems');
      if (!this.items.length) {
        body.innerHTML = `<div class="cart-empty">
          <svg viewBox="0 0 64 64" width="84" height="84" aria-hidden="true"><ellipse cx="32" cy="36" rx="22" ry="18" fill="#ffe3ea" stroke="#e8707f" stroke-width="2"/><circle cx="24" cy="34" r="2.4" fill="#4a3f46"/><circle cx="40" cy="34" r="2.4" fill="#4a3f46"/><path d="M27 44c3-3 7-3 10 0" fill="none" stroke="#4a3f46" stroke-width="2" stroke-linecap="round"/></svg>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos y envía tu pedido por WhatsApp.</p>
          <button class="btn btn-primary" type="button" data-action="close-cart">Seguir comprando</button></div>`;
      } else {
        body.innerHTML = this.items.map((i) => {
          const p = Data.byId(i.id); if (!p) return '';
          const o = this.optsText(i);
          return `<div class="cart-item">
            <img src="${esc(imageFor(p, i.color))}" alt="${esc(p.name)}" width="74" height="74" loading="lazy" />
            <div>
              <p class="cart-item-name">${esc(p.name)}</p>
              ${o ? `<p class="cart-item-opts">${esc(o)}</p>` : ''}
              <p class="cart-item-price">${money(p.price * i.qty)}</p>
              <div class="qty">
                <button type="button" data-cart="dec" data-key="${esc(i.key)}" aria-label="Quitar una unidad">−</button>
                <span aria-live="polite">${i.qty}</span>
                <button type="button" data-cart="inc" data-key="${esc(i.key)}" aria-label="Agregar una unidad" ${i.qty >= p.stock ? 'disabled' : ''}>+</button>
              </div>
            </div>
            <button class="icon-btn cart-remove" type="button" data-cart="remove" data-key="${esc(i.key)}" aria-label="Eliminar ${esc(p.name)}">×</button>
          </div>`;
        }).join('');
      }

      const checkout = $('#cartCheckout');
      if (this.items.length) { checkout.href = waUrl(this.message()); checkout.setAttribute('aria-disabled', 'false'); }
      else { checkout.removeAttribute('href'); checkout.setAttribute('aria-disabled', 'true'); }
      $('#cartClear').disabled = !this.items.length;
    }
  };

  /* ---------- 6. ENRUTADOR POR PESTAÑAS ----------
     Rutas: #/inicio  #/cases  #/hello-kitty  #/anime  #/accesorios
            #/novedades  #/ofertas  #/buscar?q=texto                    */
  const HOME_TITLE = document.title;
  const emptyFilters = () => ({ model: '', caseType: '', color: '', character: '', subcategory: '', category: '', minPrice: '', maxPrice: '', onlyAvailable: false });
  const state = { route: null, query: '', filters: emptyFilters(), sort: 'relevance', cat: null, prevHash: '#/inicio' };

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs = ''] = raw.split('?');
    return { route: path || 'inicio', q: (new URLSearchParams(qs).get('q') || '').trim() };
  }

  function renderRoute() {
    const { route, q } = parseHash();
    const isSearch = route === 'buscar';
    const cat = CATEGORIES.find((c) => c.id === route);
    if (!isSearch && !cat) { location.replace('#/inicio'); return; }

    const changed = route !== state.route;
    state.route = route; state.query = q; state.cat = isSearch ? null : cat;

    // Pestaña activa
    $$('.nav-link').forEach((a) => {
      const on = a.dataset.route === route;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    closeNav();

    // Buscador sincronizado
    const input = $('#searchInput');
    if (isSearch) { if (input.value.trim() !== q) input.value = q; } else input.value = '';
    $('#searchClear').hidden = !input.value;

    if (route === 'inicio') {
      $('#viewCatalog').hidden = true; $('#viewHome').hidden = false;
      document.title = HOME_TITLE;
      renderHome();
    } else {
      $('#viewHome').hidden = true; $('#viewCatalog').hidden = false;
      if (changed) {
        state.filters = emptyFilters();
        state.sort = (cat && cat.defaultSort) || 'relevance';
        $('#sortSelect').value = state.sort;
        $('#filters').classList.remove('is-open');
        $('#filtersToggle').setAttribute('aria-expanded', 'false');
        buildFilters();
      }
      renderCatalogHead();
      renderResults();
    }

    if (changed) {
      // Reinicia la animación de entrada de la vista
      const view = route === 'inicio' ? $('#viewHome') : $('#viewCatalog');
      view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
      if (state.hasRendered) { window.scrollTo({ top: 0 }); $('#main').focus({ preventScroll: true }); }
    }
    state.hasRendered = true;
  }

  /* ---------- 7. INICIO ---------- */
  function scopeFor(cat) {
    if (!cat) return Data.products;
    const f = cat.filter || {};
    return Data.products.filter((p) => (!f.category || p.category === f.category) && (!f.tag || p.tags.includes(f.tag)));
  }

  function fillGrid(id, list) {
    const grid = $(id);
    grid.innerHTML = list.map((p, i) => cardHTML(p, i)).join('');
    const section = grid.closest('section');
    if (section) section.hidden = list.length === 0;
  }

  function renderHome() {
    const withTag = (tag) => Data.products.filter((p) => p.tags.includes(tag));
    fillGrid('#gridNew', withTag('nuevo').sort(byDateDesc).slice(0, 4));
    fillGrid('#gridFeatured', withTag('destacado').filter(isAvailable).sort(byDateDesc).slice(0, 4));
    fillGrid('#gridOffers', withTag('oferta').filter(isAvailable).sort(byDateDesc).slice(0, 4));
    fillGrid('#gridBest', withTag('mas-vendido').filter(isAvailable).sort(byDateDesc).slice(0, 4));

    $('#categoryGrid').innerHTML = CATEGORIES.filter((c) => c.type === 'catalog').map((c) => {
      const n = scopeFor(c).length;
      return `<a class="category-card" href="#/${c.id}" data-route="${c.id}">
        <span class="category-img"><img src="${esc(c.image)}" alt="" width="92" height="92" loading="lazy" /></span>
        <span class="category-name">${esc(c.label)}</span>
        <span class="category-blurb">${esc(c.blurb || '')}</span>
        <span class="category-count">${plural(n, 'producto', 'productos')}</span></a>`;
    }).join('');

    const up = $('#upcomingList');
    up.innerHTML = UPCOMING.map((u) => `
      <article class="upcoming-card">
        <img src="${esc(u.image)}" alt="" width="96" height="96" loading="lazy" />
        <div><span class="upcoming-date">${esc(u.date)}</span><h3>${esc(u.title)}</h3><p>${esc(u.text)}</p></div>
      </article>`).join('');
    up.closest('section').hidden = UPCOMING.length === 0;
  }

  /* ---------- 8. CATÁLOGO: FILTROS, BÚSQUEDA, ORDEN ---------- */
  function renderCatalogHead() {
    const cat = state.cat;
    if (cat) {
      $('#catalogTitle').textContent = cat.title;
      $('#catalogSubtitle').textContent = cat.description;
      $('#breadcrumbCurrent').textContent = cat.label;
      document.title = `${cat.title} · ${STORE.name}`;
    } else {
      $('#catalogTitle').textContent = `Resultados para “${state.query}”`;
      $('#catalogSubtitle').textContent = 'Buscamos en todo el catálogo.';
      $('#breadcrumbCurrent').textContent = 'Búsqueda';
      document.title = `Búsqueda: ${state.query} · ${STORE.name}`;
    }
  }

  const uniqueSorted = (list, key) => [...new Set(list.map((p) => p[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

  function buildFilters() {
    const cat = state.cat;
    const keys = cat ? cat.filters : ['category', 'price', 'availability'];
    const scope = scopeFor(cat);
    const parts = [];
    const group = (label, inner, forId) =>
      `<div class="filter-group">${forId ? `<label class="filter-label" for="${forId}">${label}</label>` : `<span class="filter-label">${label}</span>`}${inner}</div>`;
    const chips = (key, values, labelOf = (v) => v) =>
      `<div class="chips" role="group">${values.map((v) =>
        `<button class="chip" type="button" data-filter="${key}" data-value="${esc(v)}" aria-pressed="false">${esc(labelOf(v))}</button>`).join('')}</div>`;

    keys.forEach((key) => {
      if (key === 'model') {
        const counts = {};
        scope.forEach((p) => p.models.forEach((m) => { counts[m] = (counts[m] || 0) + 1; }));
        parts.push(group('Modelo de iPhone', `<select class="select" id="f-model" data-filter="model">
          <option value="">Todos los modelos</option>
          ${IPHONE_MODELS.map((g) => `<optgroup label="${esc(g.group)}">${g.models.map((m) =>
            `<option value="${m.id}">${esc(m.label)}${counts[m.id] ? ` (${counts[m.id]})` : ''}</option>`).join('')}</optgroup>`).join('')}
        </select>`, 'f-model'));
      }
      if (key === 'caseType') {
        const types = Object.keys(CASE_TYPES).filter((t) => scope.some((p) => p.caseType === t));
        if (types.length) parts.push(group('Tipo de case', chips('caseType', types, (t) => CASE_TYPES[t])));
      }
      if (key === 'color') {
        const colors = Object.keys(COLORS).filter((c) => scope.some((p) => p.colors.includes(c)));
        if (colors.length) parts.push(group('Color', `<div class="swatch-row" role="group">${colors.map((c) =>
          `<button class="swatch-btn" type="button" data-filter="color" data-value="${c}" style="--c:${COLORS[c].hex}" aria-label="${esc(COLORS[c].label)}" title="${esc(COLORS[c].label)}" aria-pressed="false"></button>`).join('')}</div>`));
      }
      if (key === 'character') {
        const values = uniqueSorted(scope, 'character');
        if (values.length) parts.push(group(cat && cat.id === 'anime' ? 'Serie o personaje' : 'Personaje', chips('character', values)));
      }
      if (key === 'subcategory') {
        const values = uniqueSorted(scope, 'subcategory');
        if (values.length) parts.push(group('Tipo de artículo', chips('subcategory', values)));
      }
      if (key === 'category') {
        const values = Object.keys(CATEGORY_LABELS).filter((c) => scope.some((p) => p.category === c));
        if (values.length > 1) parts.push(group('Categoría', chips('category', values, (c) => CATEGORY_LABELS[c])));
      }
      if (key === 'price') {
        const prices = scope.map((p) => p.price);
        const lo = prices.length ? Math.floor(Math.min(...prices)) : 0;
        const hi = prices.length ? Math.ceil(Math.max(...prices)) : 0;
        parts.push(group(`Precio (${SETTINGS.currency})`, `<div class="price-inputs">
          <label>Desde<input class="input" type="number" inputmode="decimal" min="0" step="1" placeholder="${lo}" data-filter="minPrice" /></label>
          <label>Hasta<input class="input" type="number" inputmode="decimal" min="0" step="1" placeholder="${hi}" data-filter="maxPrice" /></label></div>`));
      }
      if (key === 'availability') {
        parts.push(group('Disponibilidad', '<label class="check"><input type="checkbox" data-filter="onlyAvailable" /> Solo disponibles</label>'));
      }
    });

    $('#filters').innerHTML =
      `<div class="filters-head"><h2>Filtros</h2><button class="link-btn" type="button" data-action="clear-filters">Limpiar</button></div>${parts.join('')}`;
    syncFilterUI();
  }

  function syncFilterUI() {
    $$('#filters [data-filter]').forEach((el) => {
      const key = el.dataset.filter;
      if (el.tagName === 'BUTTON') {
        const on = state.filters[key] === el.dataset.value;
        el.setAttribute('aria-pressed', String(on));
        el.classList.toggle('is-active', on && el.classList.contains('chip'));
      } else if (el.type === 'checkbox') el.checked = !!state.filters[key];
      else el.value = state.filters[key];
    });
  }

  function filterLabel(key, val) {
    switch (key) {
      case 'model': return MODEL_LABEL[val] || val;
      case 'caseType': return CASE_TYPES[val] || val;
      case 'color': return colorLabel(val);
      case 'category': return CATEGORY_LABELS[val] || val;
      case 'minPrice': return `Desde ${money(val)}`;
      case 'maxPrice': return `Hasta ${money(val)}`;
      case 'onlyAvailable': return 'Solo disponibles';
      default: return val;
    }
  }

  const activeFilterEntries = () => Object.entries(state.filters).filter(([, v]) => v !== '' && v !== false);

  function applyFilters(list) {
    const f = state.filters;
    return list.filter((p) => {
      if (f.model && !p.models.includes(f.model)) return false;
      if (f.caseType && p.caseType !== f.caseType) return false;
      if (f.color && !p.colors.includes(f.color)) return false;
      if (f.character && p.character !== f.character) return false;
      if (f.subcategory && p.subcategory !== f.subcategory) return false;
      if (f.category && p.category !== f.category) return false;
      if (f.minPrice !== '' && p.price < Number(f.minPrice)) return false;
      if (f.maxPrice !== '' && p.price > Number(f.maxPrice)) return false;
      if (f.onlyAvailable && !isAvailable(p)) return false;
      return true;
    });
  }

  function searchTokens() { return norm(state.query).split(/\s+/).filter(Boolean); }

  function sortList(list) {
    const tokens = state.route === 'buscar' ? searchTokens() : [];
    const base = (p) => (isAvailable(p) ? 100 : 0) + (p.tags.includes('destacado') ? 20 : 0) + (p.tags.includes('mas-vendido') ? 15 : 0) + (p.tags.includes('nuevo') ? 10 : 0);
    const text = (p) => tokens.reduce((s, t) => s + (p._name.includes(t) ? 3 : 0) + (p._hay.includes(t) ? 1 : 0), 0);
    const arr = [...list];
    switch (state.sort) {
      case 'newest': return arr.sort(byDateDesc);
      case 'price-asc': return arr.sort((a, b) => a.price - b.price);
      case 'price-desc': return arr.sort((a, b) => b.price - a.price);
      case 'name': return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      default: return arr.sort((a, b) => (text(b) * 1000 + base(b)) - (text(a) * 1000 + base(a)) || byDateDesc(a, b));
    }
  }

  function renderResults() {
    let scope = scopeFor(state.cat);
    if (!state.cat) {
      const tokens = searchTokens();
      scope = scope.filter((p) => tokens.every((t) => p._hay.includes(t)));
    }
    const list = sortList(applyFilters(scope));
    const grid = $('#catalogGrid');
    grid.innerHTML = list.map((p, i) => cardHTML(p, i)).join('');
    grid.hidden = list.length === 0;
    $('#emptyState').hidden = list.length > 0;
    $('#resultCount').textContent = plural(list.length, 'producto', 'productos');

    // Filtros activos
    const active = activeFilterEntries();
    $('#activeFilters').innerHTML = active.map(([k, v]) =>
      `<button class="chip chip--remove is-active" type="button" data-remove="${k}" aria-label="Quitar filtro ${esc(filterLabel(k, v))}">${esc(filterLabel(k, v))}</button>`).join('');
    $('#filtersToggle').textContent = active.length ? `Filtros (${active.length})` : 'Filtros';

    // Consulta por WhatsApp cuando no hay resultados
    const what = state.cat ? `en ${state.cat.label}` : `: “${state.query}”`;
    const detail = active.map(([k, v]) => filterLabel(k, v)).join(', ');
    $('#emptyWhatsapp').href = waUrl(`Hola ${STORE.name} 👋 Estoy buscando ${state.cat ? what : what.replace(/^: /, '')}${detail ? ` (${detail})` : ''}. ¿Lo tienen o pueden conseguirlo?`);
  }

  function clearFilters() {
    state.filters = emptyFilters();
    syncFilterUI();
    renderResults();
  }

  /* ---------- 9. MODAL DE DETALLE ---------- */
  const modal = $('#productModal');
  let detail = null;
  let lastFocus = null;

  function openDetail(id) {
    const p = Data.byId(id);
    if (!p) return;
    detail = { p, color: p.colors[0] || '', model: p.models[0] || '', qty: 1 };
    lastFocus = document.activeElement;
    $('#modalContent').innerHTML = detailHTML(p);
    updateDetail();
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    $('.modal-close', modal).focus();
  }

  function closeDetail() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    detail = null;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function detailHTML(p) {
    const avail = isAvailable(p);
    const st = stockInfo(p);
    const modelOpt = p.models.length > 1
      ? `<div class="option"><label class="filter-label" for="optModel">Modelo compatible</label>
         <select id="optModel" class="select">${p.models.map((m) => `<option value="${m}">${esc(MODEL_LABEL[m] || m)}</option>`).join('')}</select></div>` : '';
    const colorOpt = p.colors.length > 1
      ? `<div class="option"><span class="filter-label">Color: <b id="colorName"></b></span>
         <div class="swatch-row" role="radiogroup" aria-label="Color">${p.colors.map((c) =>
           `<button type="button" class="swatch-btn" role="radio" aria-checked="false" data-color="${c}" style="--c:${COLORS[c] ? COLORS[c].hex : '#ddd'}" aria-label="${esc(colorLabel(c))}" title="${esc(colorLabel(c))}"></button>`).join('')}</div></div>` : '';
    const rows = [
      ['Categoría', CATEGORY_LABELS[p.category] || p.category],
      p.subcategory && ['Tipo', p.subcategory],
      p.models.length === 1 && ['Compatible con', MODEL_LABEL[p.models[0]] || p.models[0]],
      p.character && [p.category === 'anime' ? 'Serie / personaje' : 'Personaje', p.character],
      p.colors.length === 1 && ['Color', colorLabel(p.colors[0])],
      ['Disponibilidad', st.text]
    ].filter(Boolean);
    const buy = avail
      ? `<div class="qty" role="group" aria-label="Cantidad">
           <button type="button" data-qty="-1" aria-label="Menos">−</button><span id="detailQty" aria-live="polite">1</span><button type="button" data-qty="1" aria-label="Más">+</button></div>
         <button class="btn btn-primary" type="button" id="detailAdd">Agregar al carrito</button>
         <a class="btn btn-whatsapp" id="detailWa" target="_blank" rel="noopener">Comprar por WhatsApp</a>`
      : `<button class="btn" type="button" disabled>${p.status === 'proximamente' ? 'Próximamente' : 'Agotado'}</button>
         <a class="btn btn-ghost" id="detailWa" target="_blank" rel="noopener">Preguntar cuándo llega</a>`;

    return `<div class="detail">
      <div class="detail-media"><img id="detailImg" src="${esc(p.image)}" alt="${esc(p.name)}" width="600" height="600" /><span class="badges">${badgesHTML(p)}</span></div>
      <div class="detail-info">
        <p class="card-eyebrow">${esc(p.character || p.subcategory || '')}</p>
        <h2 id="modalTitle">${esc(p.name)}</h2>
        <div class="price-row">${priceHTML(p)}</div>
        <p class="stock ${st.cls}">${st.text}</p>
        <p class="detail-desc">${esc(p.description)}</p>
        ${modelOpt}${colorOpt}
        <dl class="specs">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <div class="detail-buy">${buy}</div>
        ${SETTINGS.showSampleBadge ? '<p class="muted small">Producto de ejemplo: nombre, precio y foto se reemplazan en js/products.js.</p>' : ''}
      </div></div>`;
  }

  function updateDetail() {
    if (!detail) return;
    const { p, color, model, qty } = detail;
    $('#detailImg').src = imageFor(p, color);
    const cn = $('#colorName'); if (cn) cn.textContent = color ? colorLabel(color) : '';
    $$('[data-color]', modal).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.color === color)));
    const q = $('#detailQty'); if (q) q.textContent = qty;
    const dec = $('[data-qty="-1"]', modal), inc = $('[data-qty="1"]', modal);
    if (dec) dec.disabled = qty <= 1;
    if (inc) inc.disabled = qty >= p.stock;
    const wa = $('#detailWa');
    if (wa) wa.href = waUrl(productMessage(p, { model, color, qty, intent: isAvailable(p) ? 'buy' : 'ask' }));
  }

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeDetail();
    if (!detail) return;
    const sw = e.target.closest('[data-color]');
    if (sw) { detail.color = sw.dataset.color; return updateDetail(); }
    const qb = e.target.closest('[data-qty]');
    if (qb) { detail.qty = Math.max(1, Math.min(detail.p.stock, detail.qty + Number(qb.dataset.qty))); return updateDetail(); }
    if (e.target.closest('#detailAdd')) {
      if (Cart.add(detail.p.id, { color: detail.color, model: detail.model, qty: detail.qty })) toast('Agregado al carrito ✿');
    }
  });
  modal.addEventListener('change', (e) => {
    if (e.target.id === 'optModel' && detail) { detail.model = e.target.value; updateDetail(); }
  });

  /* ---------- 10. CARRITO (PANEL), MENÚ MÓVIL Y EVENTOS GLOBALES ---------- */
  const drawer = $('#cartDrawer');
  const drawerBackdrop = $('#drawerBackdrop');
  let drawerFocus = null;

  function openCart() {
    drawerFocus = document.activeElement;
    Cart.render();
    drawer.inert = false;
    drawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    $('#cartClose').focus();
  }
  function closeCart() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    drawerBackdrop.hidden = true;
    if (modal.hidden) document.body.classList.remove('no-scroll');
    if (drawerFocus && document.contains(drawerFocus)) drawerFocus.focus();
  }

  function openNav() {
    document.body.classList.add('nav-open');
    $('#navBackdrop').hidden = false;
    $('#menuToggle').setAttribute('aria-expanded', 'true');
    $('#menuToggle').setAttribute('aria-label', 'Cerrar menú');
  }
  function closeNav() {
    document.body.classList.remove('nav-open');
    $('#navBackdrop').hidden = true;
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    $('#menuToggle').setAttribute('aria-label', 'Abrir menú');
  }

  function trapFocus(e, container) {
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])', container)
      .filter((el) => el.getClientRects().length);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Agregar rápido desde la tarjeta: si el producto exige elegir color o modelo, abre el detalle */
  function quickAdd(id) {
    const p = Data.byId(id);
    if (!p || !isAvailable(p)) return;
    if (p.colors.length > 1 || p.models.length > 1) { toast('Elige color o modelo'); openDetail(id); return; }
    if (Cart.add(id, { color: p.colors[0] || '', model: p.models[0] || '', qty: 1 })) toast('Agregado al carrito ✿');
  }

  function runSearch() {
    const raw = $('#searchInput').value;
    const q = raw.trim();
    $('#searchClear').hidden = !raw;
    if (!q) {
      if (state.route === 'buscar') { history.replaceState(null, '', state.prevHash || '#/inicio'); renderRoute(); }
      return;
    }
    const target = `#/buscar?q=${encodeURIComponent(q)}`;
    if (state.route === 'buscar') { history.replaceState(null, '', target); renderRoute(); }
    else { state.prevHash = location.hash || '#/inicio'; location.hash = target; }
  }
  const onSearch = debounce(runSearch, 220);

  function bindEvents() {
    window.addEventListener('hashchange', renderRoute);

    // Buscador
    $('#searchInput').addEventListener('input', onSearch);
    $('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); runSearch(); $('#searchInput').blur(); });
    $('#searchClear').addEventListener('click', () => { $('#searchInput').value = ''; $('#searchClear').hidden = true; runSearch(); $('#searchInput').focus(); });

    // Menú móvil
    $('#menuToggle').addEventListener('click', () => (document.body.classList.contains('nav-open') ? closeNav() : openNav()));
    $('#navBackdrop').addEventListener('click', closeNav);

    // Enlaces a la misma pestaña: sube al inicio de la página
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-route]');
      if (link && link.getAttribute('href') === location.hash) { e.preventDefault(); closeNav(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

      // Tarjetas de producto
      const act = e.target.closest('[data-action]');
      if (!act) return;
      const card = act.closest('.product-card');
      switch (act.dataset.action) {
        case 'details': if (card) openDetail(card.dataset.id); break;
        case 'add': if (card) quickAdd(card.dataset.id); break;
        case 'clear-filters': clearFilters(); break;
        case 'close-cart': closeCart(); break;
        default: break;
      }
    });

    // Filtros
    const filtersEl = $('#filters');
    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      const key = btn.dataset.filter;
      state.filters[key] = state.filters[key] === btn.dataset.value ? '' : btn.dataset.value;
      syncFilterUI(); renderResults();
    });
    filtersEl.addEventListener('change', (e) => {
      const el = e.target.closest('[data-filter]');
      if (!el || el.tagName === 'BUTTON') return;
      state.filters[el.dataset.filter] = el.type === 'checkbox' ? el.checked : el.value;
      renderResults();
    });
    filtersEl.addEventListener('input', debounce((e) => {
      if (e.target.matches && e.target.matches('input[type="number"]')) { state.filters[e.target.dataset.filter] = e.target.value; renderResults(); }
    }, 250));
    $('#activeFilters').addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (!b) return;
      state.filters[b.dataset.remove] = b.dataset.remove === 'onlyAvailable' ? false : '';
      syncFilterUI(); renderResults();
    });
    $('#clearFilters').addEventListener('click', clearFilters);
    $('#sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; renderResults(); });
    $('#filtersToggle').addEventListener('click', () => {
      const open = $('#filters').classList.toggle('is-open');
      $('#filtersToggle').setAttribute('aria-expanded', String(open));
    });

    // Carrito
    $('#cartBtn').addEventListener('click', openCart);
    $('#cartClose').addEventListener('click', closeCart);
    drawerBackdrop.addEventListener('click', closeCart);
    $('#cartClear').addEventListener('click', () => { Cart.clear(); toast('Carrito vacío'); });
    $('#cartItems').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cart]');
      if (!b) return;
      const item = Cart.items.find((i) => i.key === b.dataset.key);
      if (!item) return;
      if (b.dataset.cart === 'inc') Cart.setQty(item.key, item.qty + 1);
      if (b.dataset.cart === 'dec') Cart.setQty(item.key, item.qty - 1);
      if (b.dataset.cart === 'remove') Cart.remove(item.key);
    });
    $('#cartCheckout').addEventListener('click', (e) => { if (!Cart.items.length) e.preventDefault(); });

    // Teclado: Escape y atrapar el foco en ventanas
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!modal.hidden) closeDetail();
        else if (drawer.classList.contains('is-open')) closeCart();
        else if (document.body.classList.contains('nav-open')) closeNav();
      }
      if (!modal.hidden) trapFocus(e, $('.modal-panel', modal));
      else if (drawer.classList.contains('is-open')) trapFocus(e, drawer);
    });

    // Imagen rota → imagen de reemplazo (evita iconos de imagen rota)
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (img && img.tagName === 'IMG' && !img.dataset.fallback) { img.dataset.fallback = '1'; img.src = PLACEHOLDER_IMG; }
    }, true);
  }

  /* ---------- 11. ARRANQUE ---------- */
  function fillStaticContent() {
    $('#navList').innerHTML = CATEGORIES.map((c) =>
      `<li><a class="nav-link" href="#/${c.id}" data-route="${c.id}">${esc(c.label)}</a></li>`).join('');
    $$('[data-store]').forEach((el) => { el.textContent = STORE[el.dataset.store] || ''; });
    $('#footerWhatsapp').href = waUrl(`Hola ${STORE.name} 👋`);
    $('#socialLinks').innerHTML = STORE.social.filter((s) => s.url).map((s) =>
      `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('');
    $('#emptyWhatsapp').href = waUrl(`Hola ${STORE.name} 👋`);
    $('#year').textContent = new Date().getFullYear();
    drawer.inert = true;
  }

  function observeReveals() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  }

  async function init() {
    fillStaticContent();
    bindEvents();
    $$('#gridNew, #gridFeatured, #gridOffers, #gridBest').forEach((g) => { g.innerHTML = skeletonHTML(4); });
    await Data.load();
    Cart.load();
    Cart.render();
    renderRoute();
    observeReveals();
    if (STORE.whatsapp === '51000000000') {
      console.warn('[PanchitoPlus] Falta configurar tu número de WhatsApp en js/products.js (STORE.whatsapp).');
    }
  }

  init();
})();