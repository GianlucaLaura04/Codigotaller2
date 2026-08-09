/* Global menu functions */
function abrirMenu() {
  const m = document.getElementById('menu-mobile');
  if (m) m.style.display = 'flex';
}

function cerrarMenu() {
  const m = document.getElementById('menu-mobile');
  if (m) m.style.display = 'none';
}

/* Carousel helper */
function initInfiniteCarousel(rowId, btnLeftId, btnRightId) {
  const row = document.getElementById(rowId);
  const btnLeft = document.getElementById(btnLeftId);
  const btnRight = document.getElementById(btnRightId);
  if (!row || !btnLeft || !btnRight) return;

  const originalCards = Array.from(row.children);
  const setSize = originalCards.length;
  if (!setSize) return;

  originalCards.forEach(card => row.appendChild(card.cloneNode(true)));
  [...originalCards].reverse().forEach(card => row.insertBefore(card.cloneNode(true), row.firstChild));

  function getCardWidth() {
    return row.children[0].getBoundingClientRect().width + 16;
  }

  function initCarousel() {
    row.style.scrollBehavior = 'auto';
    row.scrollLeft = getCardWidth() * setSize;
    row.style.scrollBehavior = 'smooth';
  }

  initCarousel();
  window.addEventListener('resize', initCarousel);

  let isScrolling = false;

  function moveCarousel(direction) {
    if (isScrolling) return;
    isScrolling = true;

    const cardWidth = getCardWidth();
    row.style.scrollBehavior = 'smooth';
    row.scrollLeft += direction * cardWidth;

    setTimeout(() => {
      row.style.scrollBehavior = 'auto';
      if (row.scrollLeft >= cardWidth * setSize * 2 - 5) {
        row.scrollLeft -= cardWidth * setSize;
      } else if (row.scrollLeft <= 5) {
        row.scrollLeft += cardWidth * setSize;
      }
      row.style.scrollBehavior = 'smooth';
      isScrolling = false;
    }, 400);
  }

  btnRight.addEventListener('click', () => moveCarousel(1));
  btnLeft.addEventListener('click', () => moveCarousel(-1));
}

/* Trending cards mobile slider */
const _mobileTrendingState = new WeakMap();

function initMobileTrendingSlider(containerSelector) {
  if (!window.matchMedia('(max-width: 430px)').matches) return;
  const container = document.querySelector(containerSelector);
  if (!container) return;
  if (_mobileTrendingState.has(container)) return; // already initialized

  const links = Array.from(container.querySelectorAll(':scope > a'));
  if (!links.length) return;

  // Helper to compute proper height from content (waits images if needed)
  function computeAndSetup() {
    // temporarily reset inline styles to measure natural heights
    links.forEach(l => {
      l.style.position = '';
      l.style.top = '';
      l.style.left = '';
      l.style.width = '';
      l.style.height = '';
      l.style.opacity = '';
      l.style.pointerEvents = '';
      l.style.transition = '';
      // ensure visible for measurement (override external !important rules)
      l.style.setProperty('display', 'block', 'important');
    });

    // measure max height
    let h = 0;
    links.forEach(l => { h = Math.max(h, l.offsetHeight); });
    if (h === 0) h = 120; // sensible fallback

    container.style.cssText = `position: relative !important; height: ${h}px !important; overflow: hidden !important; display: block !important;`;

    links.forEach((link, i) => {
      link.style.cssText = `display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: ${h}px !important; opacity: ${i === 0 ? '1' : '0'} !important; transition: opacity 0.6s ease !important; pointer-events: ${i === 0 ? 'auto' : 'none'} !important;`;
    });
  }

  // Ensure images loaded before measuring
  const imgs = Array.from(container.querySelectorAll('img'));
  const unloaded = imgs.filter(img => !img.complete);
  if (unloaded.length) {
    let loaded = 0;
    unloaded.forEach(img => img.addEventListener('load', () => { loaded++; if (loaded === unloaded.length) computeAndSetup(); }));
  } else {
    computeAndSetup();
  }

  let current = 0;
  let intervalId = setInterval(() => {
    links[current].style.opacity = '0';
    links[current].style.pointerEvents = 'none';
    current = (current + 1) % links.length;
    links[current].style.opacity = '1';
    links[current].style.pointerEvents = 'auto';
  }, 3000);

  // Touch swipe support
  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, {passive: true});
  container.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      // swipe left -> next, swipe right -> prev
      links[current].style.opacity = '0';
      links[current].style.pointerEvents = 'none';
      if (dx < 0) current = (current + 1) % links.length; else current = (current - 1 + links.length) % links.length;
      links[current].style.opacity = '1';
      links[current].style.pointerEvents = 'auto';
    }
  }, {passive: true});

  // Recompute on resize (debounced)
  let resizeTimer = null;
  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!window.matchMedia('(max-width: 430px)').matches) {
        clearInterval(intervalId);
        _mobileTrendingState.delete(container);
      } else {
        computeAndSetup();
      }
    }, 150);
  }
  window.addEventListener('resize', onResize);

  _mobileTrendingState.set(container, { intervalId, onResize });
}

/* Rankings / tabs on comunidad.html */
function switchTab(tab) {
  const active = tab === 'general';
  const rankingGeneral = document.getElementById('ranking-general');
  const rankingMes = document.getElementById('ranking-mes');
  const tabGeneral = document.getElementById('tab-general');
  const tabMes = document.getElementById('tab-mes');

  if (rankingGeneral) rankingGeneral.style.display = active ? 'block' : 'none';
  if (rankingMes) rankingMes.style.display = active ? 'none' : 'block';
  if (tabGeneral) tabGeneral.className = active ? 'ranking-tab-active' : 'ranking-tab';
  if (tabMes) tabMes.className = active ? 'ranking-tab' : 'ranking-tab-active';
}

function showSection(section) {
  const contentRankings = document.getElementById('content-rankings');
  const contentResenas = document.getElementById('content-resenas');
  const contentPerfil = document.getElementById('content-perfil');
  if (contentRankings) contentRankings.style.display = 'none';
  if (contentResenas) contentResenas.style.display = 'none';
  if (contentPerfil) contentPerfil.style.display = 'none';
  const activeContent = document.getElementById('content-' + section);
  if (activeContent) activeContent.style.display = 'block';

  const buttons = document.querySelectorAll('.section-btn');
  buttons.forEach(btn => {
    btn.className = 'btn text-dark rounded-pill px-4 py-2 fw-bold section-btn';
    btn.style.background = 'none';
    btn.style.backgroundColor = 'transparent';
    btn.style.border = 'none';
  });

  const activeBtn = document.getElementById('btn-' + section);
  if (activeBtn) {
    activeBtn.className = 'btn btn-danger rounded-4 px-4 py-2 fw-bold section-btn';
    activeBtn.style.backgroundColor = '#E8001C';
    activeBtn.style.border = 'none';
  }
}

function switchProfileTab(tab) {
  const secActividad = document.getElementById('perfil-actividad');
  const secRanking = document.getElementById('perfil-ranking');
  const tabAct = document.getElementById('tab-perfil-actividad');
  const tabRank = document.getElementById('tab-perfil-ranking');
  if (!secActividad || !secRanking || !tabAct || !tabRank) return;

  if (tab === 'actividad') {
    secActividad.style.display = 'block';
    secRanking.style.display = 'none';
    tabAct.className = 'fw-bold text-uppercase pb-2 border-bottom border-danger border-3 text-dark';
    tabAct.style.marginBottom = '-10px';
    tabRank.className = 'text-uppercase text-muted';
    tabRank.style.borderBottom = 'none';
    tabRank.style.marginBottom = '0';
  } else {
    secActividad.style.display = 'none';
    secRanking.style.display = 'block';
    tabRank.className = 'fw-bold text-uppercase pb-2 border-bottom border-danger border-3 text-dark';
    tabRank.style.marginBottom = '-10px';
    tabAct.className = 'text-uppercase text-muted';
    tabAct.style.borderBottom = 'none';
    tabAct.style.marginBottom = '0';
  }
}

function mountComunidadReviews() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'resenas') {
    showSection('resenas');
  }

  const customContainer = document.getElementById('custom-reviews-container');
  if (!customContainer) return;

  const storedReviews = JSON.parse(localStorage.getItem('comunidad_reviews')) || [];
  storedReviews.forEach((rev, index) => {
    const card = document.createElement('div');
    card.className = 'border rounded-4 p-4 bg-white shadow-sm position-relative';
    card.style.borderColor = '#ddd';
    card.innerHTML = `
      <button class="btn btn-eliminar-resena border-0 text-muted p-0 position-absolute" style="top: 20px; right: 25px; font-size: 18px; z-index: 5;" title="Borrar reseña">✕</button>
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="rounded-circle bg-light border" style="width: 48px; height: 48px; background-image: url('${rev.userImg || 'Comunidad/reseñas/1.1.png'}'); background-size: cover; background-position: center;"></div>
        <div>
          <div class="font-serif fw-bold" style="font-size: 16px; color: #111;">${rev.userName || 'Usuario Invitado'}</div>
          <div style="font-family: Georgia, serif; font-size: 12px; color: #777;">1 review</div>
        </div>
      </div>
      <div class="d-flex gap-4 align-items-start flex-column flex-sm-row">
        <div class="text-center flex-shrink-0 mx-auto" style="width: 350px;">
          <img src="${rev.img}" class="img-fluid w-50" alt="${rev.title}">
          <div class="font-serif fw-bold" style="font-size: 13px; line-height: 1.2;">${rev.title} (${rev.meta.split(' - ')[0]})</div>
          <div style="font-family: Georgia, serif; font-size: 12px; color: #777;">${rev.artist}</div>
        </div>
        <div class="flex-grow-1">
          <p style="font-family: Georgia, serif; font-size: 14px; color: #444; line-height: 1.6; text-align: justify; margin: 0;">${rev.text}</p>
        </div>
      </div>
      <div class="text-end mt-2">
        <button class="btn btn-danger btn-sm rounded-3 px-3 py-1 fw-bold border-0 d-inline-flex align-items-center gap-2" style="background-color: var(--red); font-size: 14px;">
          0
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
    `;

    card.querySelector('.btn-eliminar-resena').addEventListener('click', () => {
      if (confirm('¿Estás seguro de que querés borrar esta reseña?')) {
        let currentReviews = JSON.parse(localStorage.getItem('comunidad_reviews')) || [];
        currentReviews.splice(index, 1);
        localStorage.setItem('comunidad_reviews', JSON.stringify(currentReviews));
        window.location.reload();
      }
    });

    customContainer.appendChild(card);
  });
}

function mountCreatureSena() {
  const searchInput = document.getElementById('album-search-input');
  const searchResults = document.getElementById('search-results');
  const albumCard = document.getElementById('selected-album-card');
  const removeBtn = document.getElementById('btn-remove-album');
  const cardImg = document.getElementById('album-card-img');
  const cardTitle = document.getElementById('album-card-title');
  const cardArtist = document.getElementById('album-card-artist');
  const cardMeta = document.getElementById('album-card-meta');
  const btnPublish = document.getElementById('btn-publish');
  const reviewText = document.getElementById('review-text');

  if (!searchInput || !searchResults || !albumCard || !cardImg || !cardTitle || !cardArtist || !cardMeta) return;

  searchInput.addEventListener('focus', () => searchResults.classList.remove('d-none'));
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('d-none');
    }
  });

  document.querySelectorAll('.result-item').forEach(item => {
    item.addEventListener('click', () => {
      const title = item.getAttribute('data-title');
      const artist = item.getAttribute('data-artist');
      const meta = item.getAttribute('data-meta');
      const img = item.getAttribute('data-img');
      if (!title || !artist || !meta || !img) return;

      cardTitle.textContent = title;
      cardArtist.textContent = artist;
      cardMeta.textContent = meta;
      cardImg.src = img;
      albumCard.style.setProperty('display', 'flex', 'important');
      searchInput.value = title;
      searchResults.classList.add('d-none');
    });
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      albumCard.style.setProperty('display', 'none', 'important');
      if (searchInput) searchInput.value = '';
    });
  }

  if (btnPublish && reviewText) {
    btnPublish.addEventListener('click', () => {
      const textValue = reviewText.value.trim();
      if (albumCard.style.display === 'none' || !textValue) {
        alert('Por favor, selecciona un álbum y escribe una reseña antes de publicar.');
        return;
      }
      const currentReviews = [];
      currentReviews.push({
        title: cardTitle.textContent,
        artist: cardArtist.textContent,
        meta: cardMeta.textContent,
        img: cardImg.src,
        text: textValue,
        userName: 'Rockero89',
        userImg: 'Comunidad/perfil/perfil.png'
      });
      localStorage.setItem('comunidad_reviews', JSON.stringify(currentReviews));
      window.location.href = 'comunidad.html?tab=resenas';
    });
  }

  function ajustarMobile() {
    const btn = document.getElementById('btn-publish');
    const textarea = document.getElementById('review-text');
    const divTitulo = document.querySelector('.mb-5 .d-flex.justify-content-between');
    if (!btn || !textarea || !divTitulo) return;
    if (window.innerWidth <= 430) {
      textarea.after(btn);
    } else {
      divTitulo.appendChild(btn);
    }
  }

  ajustarMobile();
  window.addEventListener('resize', ajustarMobile);
}

function mountCreatutop() {
  const albumCards = document.querySelectorAll('.album-card');
  const dropSlots = document.querySelectorAll('.col-lg-7 .d-flex.align-items-center.border');
  const bottomDropzone = document.querySelector('.col-lg-7 .border.rounded-3.p-4.text-center');
  if (!albumCards.length || !dropSlots.length) return;

  let draggedData = null;
  albumCards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedData = {
        title: card.getAttribute('data-title'),
        artist: card.getAttribute('data-artist'),
        img: card.getAttribute('data-img')
      };
      e.dataTransfer.setData('text/plain', '');
    });
  });

  const setupDropzone = (zone) => {
    zone.addEventListener('dragover', (e) => e.preventDefault());
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedData) return;
      if (zone === bottomDropzone) {
        const firstEmptySlot = Array.from(dropSlots).find(slot => slot.classList.contains('bg-light'));
        if (firstEmptySlot) fillSlot(firstEmptySlot, draggedData);
      } else {
        fillSlot(zone, draggedData);
      }
      draggedData = null;
    });
  };

  dropSlots.forEach(setupDropzone);
  if (bottomDropzone) setupDropzone(bottomDropzone);

  document.querySelectorAll('.btn-add-album').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.album-card');
      if (!card) return;
      const data = {
        title: card.getAttribute('data-title'),
        artist: card.getAttribute('data-artist'),
        img: card.getAttribute('data-img')
      };
      const firstEmptySlot = Array.from(dropSlots).find(slot => slot.classList.contains('bg-light'));
      if (firstEmptySlot) {
        fillSlot(firstEmptySlot, data);
      } else {
        alert('¡Tu Top 10 ya está completo!');
      }
    });
  });

  function verificarTopCompleto() {
    const cantidadLlenos = document.querySelectorAll('.btn-remove').length;
    const btnCrearLista = document.getElementById('btn-crear-lista');
    const textoInstrucciones = document.getElementById('texto-instrucciones');
    if (!btnCrearLista || !textoInstrucciones) return;
    if (cantidadLlenos === 10) {
      textoInstrucciones.style.display = 'none';
      btnCrearLista.style.display = 'block';
    } else {
      textoInstrucciones.style.display = 'block';
      btnCrearLista.style.display = 'none';
    }
  }

  function fillSlot(slot, data) {
    if (!slot || !data) return;
    const slotNumNode = slot.querySelector('.me-3');
    const index = slotNumNode ? slotNumNode.textContent.trim() : '1';
    slot.classList.remove('bg-light', 'opacity-75');
    slot.classList.add('bg-white', 'shadow-sm');
    slot.style.borderStyle = 'solid';
    slot.style.height = 'auto';
    slot.innerHTML = `
      <div class="text-muted px-2 fw-bold" style="font-size: 18px; width: 35px;">=</div>
      <div class="fw-bold font-serif me-3 text-center" style="font-size: 22px; width: 30px;">${index}</div>
      <img src="${data.img}" class="rounded border me-3" style="width: 40px; height: 40px; object-fit: cover;">
      <div class="flex-grow-1" style="font-size: 13px; line-height: 1.2;">
        <div class="fw-bold font-serif">${data.title}</div>
        <div class="text-muted" style="font-size: 11px;">${data.artist}</div>
      </div>
      <button class="btn border-0 p-2 text-muted btn-remove" style="font-size: 16px;">✕</button>
    `;
    const removeBtn = slot.querySelector('.btn-remove');
    if (removeBtn) removeBtn.addEventListener('click', () => clearSlot(slot, index));
    verificarTopCompleto();
  }

  function clearSlot(slot, index) {
    if (!slot) return;
    slot.classList.remove('bg-white', 'shadow-sm');
    slot.classList.add('bg-light', 'opacity-75');
    slot.style.borderStyle = 'dashed';
    slot.style.height = '58px';
    slot.innerHTML = `
      <div class="text-muted px-2 fw-bold" style="font-size: 18px; width: 35px;">=</div>
      <div class="fw-bold text-secondary me-3 text-center" style="font-family: sans-serif; font-size: 20px; width: 30px;">${index}</div>
      <div class="text-muted italic small" style="font-family: Georgia, serif;">Arrastrá un álbum aquí</div>
    `;
    verificarTopCompleto();
  }

  const btnCrearLista = document.getElementById('btn-crear-lista');
  if (btnCrearLista) {
    btnCrearLista.addEventListener('click', () => {
      const slots = document.querySelectorAll('.col-lg-7 .d-flex.align-items-center.border');
      const top10Usuario = [];
      slots.forEach(slot => {
        if (!slot.classList.contains('bg-light')) {
          const img = slot.querySelector('img')?.src;
          const title = slot.querySelector('.fw-bold.font-serif')?.textContent.trim();
          const artist = slot.querySelector('.text-muted')?.textContent.trim();
          const numNode = slot.querySelector('.font-serif.me-3') || slot.querySelector('.me-3');
          const num = numNode ? numNode.textContent.trim() : '';
          if (title && artist) top10Usuario.push({ num, img, title, artist });
        }
      });
      if (top10Usuario.length === 10) {
        localStorage.setItem('miTop10Albums', JSON.stringify(top10Usuario));
        window.location.href = 'comunidad.html?ver=perfil';
      } else {
        alert('Por favor, completa los 10 casilleros antes de crear tu lista.');
      }
    });
  }
}

function mountMusicaTabs() {
  const secDestacados = document.getElementById('seccion-destacados');
  const secEntrevistas = document.getElementById('seccion-entrevistas');
  const secHistorias = document.getElementById('seccion-historias');
  if (!secDestacados || !secEntrevistas || !secHistorias) return;

  window.cambiarPestana = function(pestanaSeleccionada) {
    if (secDestacados) secDestacados.style.display = 'none';
    if (secEntrevistas) secEntrevistas.style.display = 'none';
    if (secHistorias) secHistorias.style.display = 'none';
    const secActiva = document.getElementById('seccion-' + pestanaSeleccionada);
    if (secActiva) secActiva.style.display = 'block';

    const botones = document.querySelectorAll('.tab-btn');
    botones.forEach(btn => {
      btn.style.backgroundColor = 'transparent';
      btn.classList.remove('text-white');
      btn.classList.add('text-dark');
    });

    const botonActivo = document.getElementById('btn-' + pestanaSeleccionada);
    if (botonActivo) {
      botonActivo.style.backgroundColor = '#E8001C';
      botonActivo.classList.remove('text-dark');
      botonActivo.classList.add('text-white');
    }

    const breadcrumb = document.getElementById('breadcrumb-actual');
    if (breadcrumb) {
      const textoMayuscula = pestanaSeleccionada.charAt(0).toUpperCase() + pestanaSeleccionada.slice(1);
      breadcrumb.textContent = textoMayuscula;
    }

    // Initialize mobile trending slider for this tab's trending column
    initMobileTrendingSlider(`${'#seccion-' + pestanaSeleccionada} .col-lg-3 .d-flex.flex-column`);
  };

  // Initialize mobile trending sliders for known sections
  ['#seccion-destacados', '#seccion-entrevistas', '#seccion-historias'].forEach(seccion => {
    initMobileTrendingSlider(`${seccion} .col-lg-3 .d-flex.flex-column`);
  });
}

function mountActualidadTrending() {
  initMobileTrendingSlider('.col-lg-3 .d-flex.flex-column');
}

function cambiarPestaña(pestaña) {
  const listaRs = document.getElementById('lista-rs');
  const listaComunidad = document.getElementById('lista-comunidad');
  const btnRs = document.getElementById('btn-rs');
  const btnComunidad = document.getElementById('btn-comunidad');

  if (pestaña === 'rs') {
    // Muestra RS y oculta Comunidad
    listaRs.classList.remove('d-none');
    listaRs.classList.add('d-flex');
    listaComunidad.classList.remove('d-flex');
    listaComunidad.classList.add('d-none');

    // Estilos de los botones
    btnRs.className = "btn btn-danger btn-sm rounded-3 fw-bold px-3 font-serif flex-fill";
    btnComunidad.className = "btn btn-light btn-sm rounded-3 fw-bold px-3 font-serif flex-fill bg-transparent border-0 text-dark";
  } else if (pestaña === 'comunidad') {
    // Muestra Comunidad y oculta RS
    listaRs.classList.remove('d-flex');
    listaRs.classList.add('d-none');
    listaComunidad.classList.remove('d-none');
    listaComunidad.classList.add('d-flex');

    // Estilos de los botones
    btnRs.className = "btn btn-light btn-sm rounded-3 fw-bold px-3 font-serif flex-fill bg-transparent border-0 text-dark";
    btnComunidad.className = "btn btn-danger btn-sm rounded-3 fw-bold px-3 font-serif flex-fill";
  }
}

function mainInit() {
  initMobileTrendingSlider('.col-lg-3 .d-flex.flex-column');
  mountMusicaTabs();
  mountComunidadReviews();
  mountCreatureSena();
  mountCreatutop();
  initInfiniteCarousel('rrow', 'rl', 'rr');
}

document.addEventListener('DOMContentLoaded', mainInit);

document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(max-width: 430px)').matches) {

    const ranking = document.querySelector('.ranking-container');
    const tarjetas = document.querySelector('.tarjeta-indio');

    if (ranking && tarjetas) {
      tarjetas.after(ranking);
    }

  }
});