// GLightbox
if (typeof GLightbox !== "undefined") GLightbox({ selector: ".glightbox" });

// AOS
if (typeof AOS !== "undefined") AOS.init({ once: true, duration: 700 });

// Loader + body fade
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => loader && loader.classList.add("hidden"), 150);
  document.body.classList.add("ready");

  // Active link na navbar
  const links = Array.from(document.querySelectorAll(".navbar .nav-link"));
  const currentPath = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  links.forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    const url = new URL(href, location.href);
    const page = (url.pathname.split("/").pop() || "index.html").toLowerCase();
    if ((currentPath === "" || currentPath === "index.html") && (page === "" || page === "index.html")) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    } else if (page === currentPath) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  // ScrollTop
  const st = document.getElementById("scrollTop");
  if (st) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) st.classList.add("show");
      else st.classList.remove("show");
    });
    st.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Remove skeleton ao carregar imagem
  document.querySelectorAll(".uiv-img img").forEach((img) => {
    if (img.complete) img.parentElement.classList.remove("loading");
    img.addEventListener("load", () => img.parentElement.classList.remove("loading"));
  });

  // Swiper (depoimentos)
  if (typeof Swiper !== "undefined" && document.querySelector(".swiper")) {
    const swiper = new Swiper(".swiper", {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      autoplay: { delay: 4200, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      breakpoints: { 768: { slidesPerView: 2, spaceBetween: 20 }, 1200: { slidesPerView: 3, spaceBetween: 24 } },
    });
  }

  // Galeria: mostrar só 8 e "ver mais"
  const gallery = document.getElementById("gallery");
  const btnMore = document.getElementById("btnMore");
  if (gallery && btnMore) {
    const items = Array.from(gallery.querySelectorAll(".col-6, .col-md-4, .col-lg-3"));
    if (items.length > 8) items.slice(8).forEach((el) => el.classList.add("d-none"));
    btnMore.addEventListener("click", () => {
      const hidden = items.slice(8).filter((el) => el.classList.contains("d-none"));
      const show = hidden.length > 0;
      items.slice(8).forEach((el) => el.classList.toggle("d-none", !show));
      btnMore.textContent = show ? "Ver menos" : "Ver mais imagens";
    });
  }

  // Toggle tema (padrão escuro, salva preferência)
  (function () {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const applyTheme = (t) => {
      if (t === "light") document.documentElement.setAttribute("data-theme", "light");
      else document.documentElement.removeAttribute("data-theme");
      try {
        localStorage.setItem("ve-theme", t);
      } catch (e) {}
      const icon = btn.querySelector("i");
      const label = btn.querySelector(".tlabel");
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (icon) icon.className = isLight ? "bi bi-brightness-high" : "bi bi-moon-stars";
      if (label) label.textContent = isLight ? "Claro" : "Escuro";
    };
    let saved = null;
    try {
      saved = localStorage.getItem("ve-theme");
    } catch (e) {}
    applyTheme(saved || "dark");
    btn.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      applyTheme(isLight ? "dark" : "light");
    });
  })();

  // FAQ animado
  document.querySelectorAll(".faq .faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const ans = btn.nextElementSibling;
      if (!ans) return;
      ans.style.display = ans.style.display === "block" ? "none" : "block";
    });
  });

  // Formulário: data mínima + validação visual Bootstrap
  const dateInput = document.getElementById("dateInput");
  const form = document.getElementById("contactForm");
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const min = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute("min", min);
    dateInput.addEventListener("change", () => {
      if (dateInput.value && dateInput.value < min) dateInput.value = min;
    });
  }
  if (form) {
    form.addEventListener(
      "submit",
      function (e) {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
          const alertBox = document.getElementById("formAlert");
          if (alertBox) {
            alertBox.className = "alert alert-danger";
            alertBox.textContent = "Por favor, verifique os campos destacados.";
          }
        } else {
          const alertBox = document.getElementById("formAlert");
          if (alertBox) {
            alertBox.className = "alert alert-success";
            alertBox.textContent = "Enviado! (Conecte a um serviço de formulário para envio real)";
          }
          e.preventDefault(); // demo: impede submit real
        }
        form.classList.add("was-validated");
      },
      false
    );
  }
});

// Inter-page fade-out + loader on navigate
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  const url = new URL(a.getAttribute("href"), window.location.href);
  const isInternal = url.origin === window.location.origin && (/.html($|\?|#)/.test(url.pathname) || url.hash);
  const isHash = a.getAttribute("href").startsWith("#");
  if (isInternal && !isHash && a.getAttribute("target") !== "_blank") {
    e.preventDefault();
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("hidden");
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = url.href;
    }, 220);
  }
});

// Calendário de disponibilidade simples (contato)
(function () {
  const mount = document.getElementById("ve-calendar");
  if (!mount) return;

  // Simulação: você pode preencher datas bloqueadas assim:
  const booked = new Set([
    // "2025-12-25", "2025-11-01"
  ]);

  const state = { d: new Date() };
  state.d.setDate(1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fmt = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const render = () => {
    mount.innerHTML = "";
    const head = document.createElement("div");
    head.className = "cal-head";
    const title = document.createElement("div");
    title.textContent = state.d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const controls = document.createElement("div");
    const prev = document.createElement("button");
    prev.innerHTML = "&laquo;";
    const next = document.createElement("button");
    next.innerHTML = "&raquo;";
    controls.append(prev, next);
    head.append(title, controls);

    const grid = document.createElement("div");
    grid.className = "cal-grid";

    const y = state.d.getFullYear();
    const m = state.d.getMonth();
    const firstDay = new Date(y, m, 1);
    const start = (firstDay.getDay() + 6) % 7; // semana iniciando na segunda
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    // Cabeçalho dos dias (S T Q Q S S D)
    ["S", "T", "Q", "Q", "S", "S", "D"].forEach((w) => {
      const h = document.createElement("div");
      h.className = "cal-cell muted";
      h.textContent = w;
      h.style.fontWeight = "600";
      h.style.cursor = "default";
      grid.append(h);
    });

    for (let i = 0; i < start; i++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell muted";
      grid.append(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      cell.textContent = day;
      const dateStr = fmt(y, m, day);
      const dateObj = new Date(y, m, day);
      dateObj.setHours(0, 0, 0, 0);
      const isPast = dateObj < today;
      const isBooked = booked.has(dateStr);

      if (isPast) {
        cell.classList.add("disabled");
        cell.title = "Data passada";
      } else if (isBooked) {
        cell.classList.add("disabled");
        cell.title = "Indisponível";
      }

      cell.addEventListener("click", () => {
        if (cell.classList.contains("disabled")) return;
        grid.querySelectorAll(".cal-cell.selected").forEach((el) => el.classList.remove("selected"));
        cell.classList.add("selected");
        const di = document.getElementById("dateInput");
        if (di) di.value = dateStr;
      });

      grid.append(cell);
    }

    const legend = document.createElement("div");
    legend.className = "cal-legend";
    legend.innerHTML =
      '<span><span class="badge-dot badge-free"></span>Disponível</span> <span><span class="badge-dot badge-booked"></span>Indisponível</span> <span><span class="badge-dot badge-past"></span>Passado</span>';

    mount.append(head, grid, legend);

    prev.addEventListener("click", () => {
      state.d.setMonth(state.d.getMonth() - 1);
      render();
    });
    next.addEventListener("click", () => {
      state.d.setMonth(state.d.getMonth() + 1);
      render();
    });
  };

  render();
})();


/* ===== Contato: melhorias ===== */
(function contatoEnhance(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  // --- 1) Data mínima = hoje
  const dateInput = document.getElementById('dateInput');
  if (dateInput){
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    const min = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute('min', min);
    dateInput.addEventListener('change', () => {
      if (dateInput.value && dateInput.value < min) dateInput.value = min;
    });
  }

  // --- 2) Máscara simples de telefone (BR)
  const phone = document.getElementById('phoneInput');
  if (phone){
    const mask = v => {
      // remove tudo que não for dígito
      v = v.replace(/\D/g,'');
      // (XX) XXXXX-XXXX  ou  (XX) XXXX-XXXX
      if (v.length > 11) v = v.slice(0,11);
      if (v.length > 6) v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      else if (v.length > 0) v = v.replace(/^(\d{0,2}).*/, '($1');
      return v.trim();
    };
    const onMask = () => { phone.value = mask(phone.value); };
    phone.addEventListener('input', onMask);
    phone.addEventListener('blur', onMask);
  }

  // --- 3) Contador de caracteres da mensagem
  const msg = document.getElementById('msgInput');
  const counter = document.getElementById('msgCounter');
  if (msg && counter){
    const update = () => counter.textContent = `${msg.value.length}/${msg.maxLength}`;
    msg.addEventListener('input', update);
    update();
  }

  // --- 4) Range convidados -> output
  const guestsRange = document.getElementById('guestsRange');
  const guestsOut = document.getElementById('guestsOut');
  if (guestsRange && guestsOut){
    const up = () => guestsOut.textContent = guestsRange.value;
    guestsRange.addEventListener('input', up); up();
  }

  // --- 5) Enviar via WhatsApp (pré-preencher mensagem)
  const btnWpp = document.getElementById('btnWhatsapp');
  if (btnWpp){
    btnWpp.addEventListener('click', () => {
      const getVals = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';
      const getRadio = (name) => form.querySelector(`[name="${name}"]:checked`)?.value || '';
      const extras = Array.from(form.querySelectorAll('input[name="extras"]:checked')).map(e=>e.value).join(', ') || '—';

      const payload = {
        nome: getVals('name'),
        fone: getVals('phone'),
        email: getVals('email'),
        data: getVals('date'),
        hora: getVals('time'),
        tipo: getVals('type'),
        pacote: getVals('package'),
        convidados: guestsRange ? guestsRange.value : '',
        contato: getRadio('contactPref'),
        melhorHorario: document.getElementById('bestTime')?.value || '',
        extras,
        msg: msg ? msg.value.trim() : ''
      };

      const lines = [
        '*Novo orçamento - Valença Eventos*',
        `*Nome:* ${payload.nome}`,
        `*Telefone:* ${payload.fone}`,
        `*E-mail:* ${payload.email}`,
        `*Data:* ${payload.data} ${payload.hora ? `às ${payload.hora}` : ''}`,
        `*Tipo:* ${payload.tipo}`,
        `*Pacote:* ${payload.pacote}`,
        `*Convidados:* ${payload.convidados}`,
        `*Preferência de contato:* ${payload.contato} (${payload.melhorHorario})`,
        `*Extras:* ${payload.extras}`,
        `*Mensagem:* ${payload.msg || '—'}`
      ].join('\n');

      const phoneNumber = '5519XXXXXXXXX'; // <- altere para o número oficial
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(lines)}`;
      window.open(url, '_blank');
    });
  }

  // --- 6) Validação visual (Bootstrap)
  form.addEventListener('submit', function(e){
    if (!form.checkValidity()){
      e.preventDefault(); e.stopPropagation();
      showAlert('Por favor, verifique os campos destacados.', 'danger');
    } else {
      e.preventDefault(); // remova se tiver backend
      showAlert('Enviado! (Conecte o formulário ao seu backend ou serviço de e-mail)', 'success');
    }
    form.classList.add('was-validated');
  }, false);

  function showAlert(text, type){
    const box = document.getElementById('formAlert');
    if (!box) return;
    box.className = `alert alert-${type}`;
    box.textContent = text;
  }

  // --- 7) Calendário simples com datas bloqueadas
  const mount = document.getElementById('ve-calendar');
  if (mount){
    // Configure aqui as datas indisponíveis (AAAA-MM-DD):
    const blocked = new Set([
      // '2025-10-12', '2025-12-31'
    ]);

    const state = { d: new Date() };
    state.d.setDate(1);
    const today = new Date(); today.setHours(0,0,0,0);
    const fmt = (y,m,d)=> `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const render = () => {
      mount.innerHTML = '';
      const head = document.createElement('div'); head.className = 'cal-head';
      const title = document.createElement('div');
      title.textContent = state.d.toLocaleString('pt-BR',{month:'long', year:'numeric'});
      const controls = document.createElement('div');
      const prev = document.createElement('button'); prev.innerHTML = '&laquo;';
      const next = document.createElement('button'); next.innerHTML = '&raquo;';
      controls.append(prev, next);
      head.append(title, controls);

      const grid = document.createElement('div'); grid.className = 'cal-grid';

      const y = state.d.getFullYear(); const m = state.d.getMonth();
      const firstDay = new Date(y,m,1);
      const start = (firstDay.getDay() + 6) % 7; // inicia na segunda
      const daysInMonth = new Date(y, m+1, 0).getDate();

      // Cabeçalho de semana
      ['S','T','Q','Q','S','S','D'].forEach(w => {
        const h = document.createElement('div');
        h.className = 'cal-cell muted';
        h.textContent = w;
        h.style.fontWeight='600';
        h.style.cursor='default';
        grid.append(h);
      });

      for (let i=0; i<start; i++){
        const cell = document.createElement('div'); cell.className='cal-cell muted'; grid.append(cell);
      }
      for (let day=1; day<=daysInMonth; day++){
        const cell = document.createElement('div'); cell.className='cal-cell'; cell.textContent = day;
        const dateStr = fmt(y,m,day);
        const dateObj = new Date(y,m,day); dateObj.setHours(0,0,0,0);
        const isPast = dateObj < today;
        const isBlocked = blocked.has(dateStr);
        if (isPast || isBlocked){ cell.classList.add('disabled'); cell.title = isPast ? 'Data passada' : 'Indisponível'; }
        cell.addEventListener('click', () => {
          if (cell.classList.contains('disabled')) return;
          grid.querySelectorAll('.cal-cell.selected').forEach(el=>el.classList.remove('selected'));
          cell.classList.add('selected');
          if (dateInput) dateInput.value = dateStr;
        });
        grid.append(cell);
      }

      const legend = document.createElement('div'); legend.className='cal-legend';
      legend.innerHTML = '<span><span class="badge-dot badge-free"></span>Disponível</span> <span><span class="badge-dot badge-booked"></span>Indisponível</span> <span><span class="badge-dot badge-past"></span>Passado</span>';

      mount.append(head, grid, legend);
      prev.addEventListener('click', ()=>{ state.d.setMonth(state.d.getMonth()-1); render(); });
      next.addEventListener('click', ()=>{ state.d.setMonth(state.d.getMonth()+1); render(); });
    };
    render();
  }
})();



  document.addEventListener('DOMContentLoaded', function(){
    try{
      GLightbox({
        selector: '.glightbox',
        loop: true,
        touchNavigation: true,
        draggable: true,
        zoomable: false,   // <- importante para não habilitar pan/zoom com rolagem
        openEffect: 'zoom',
        closeEffect: 'fade'
      });
    }catch(e){}
  });


