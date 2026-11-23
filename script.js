(function(){
  const WA = "https://wa.me/916289996980";
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  // Header solid on scroll
  const header = $("header");
  const onScroll = () => header.classList.toggle("solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  // Mobile menu
  const burger = $("#burger"), mm = $("#mobileMenu");
  const setMenu = open => { mm.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu"); document.body.style.overflow = open ? "hidden" : ""; };
  burger.addEventListener("click", () => setMenu(!mm.classList.contains("open")));
  $$("#mobileMenu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  $("#year").textContent = new Date().getFullYear();

  // Reveal on scroll
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), {threshold:.12});
  $$(".reveal").forEach(el => io.observe(el));

  // Listings data: only verified or owner-supplied items. Historical items are flagged.
  const listings = [
    {
      id: "sodepur-house-hb-town",
      title: "Independent House with Garage, near HB Town",
      location: "Sodepur",
      type: "Independent House",
      bhk: null,
      budgetLakh: null,
      priceText: "Contact for details",
      lastPublished: "₹1.15 crore (published Feb 2025)",
      features: ["Two-storey", "Multiple bedrooms", "Kitchens", "Balconies", "Two covered garages"],
      landArea: "3 kattha 14 chhatak",
      historical: true,
      source: "https://www.youtube.com/watch?v=EbAJ_-33B9I"
    }
  ];

  const budgetRange = {"0-20":[0,20],"20-40":[20,40],"40-60":[40,60],"60-100":[60,100],"100-999":[100,99999]};

  function matches(l){
    const loc = $("#fLocation").value, type = $("#fType").value, bhk = $("#fBhk").value, bud = $("#fBudget").value;
    if (loc !== "all" && l.location !== loc) return false;
    if (type !== "all" && l.type !== type) return false;
    if (bhk !== "all" && (l.bhk === null || String(l.bhk) !== bhk && !(bhk === "4" && l.bhk >= 4))) return false;
    if (bud !== "all") {
      if (l.budgetLakh === null) return false;
      const [min,max] = budgetRange[bud];
      if (l.budgetLakh < min || l.budgetLakh > max) return false;
    }
    return true;
  }

  function waLink(text){ return WA + "?text=" + encodeURIComponent(text); }

  function card(l){
    const badge = l.historical ? `<span class="badge gold">Historical listing</span>` : `<span class="badge">Residential</span>`;
    const specs = [
      l.type,
      l.bhk ? `${l.bhk} BHK` : "Bedrooms: confirm",
      l.landArea ? `Land: ${l.landArea}` : ""
    ].filter(Boolean).map(s => `<span>${s}</span>`).join("");
    const notice = l.historical ? `<p class="note">Historical listing. Availability and price require confirmation. The price shown is from the original video and is not a current asking price.</p>` : "";
    return `
      <article class="card reveal in">
        <div class="card-media" role="img" aria-label="Illustrative image. Not an actual photograph of this property.">
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#dcd3bd"/><rect y="230" width="400" height="70" fill="#123D32" opacity=".9"/><rect x="110" y="90" width="180" height="150" fill="#f0e9d8"/><g fill="#123D32" opacity=".8"><rect x="130" y="110" width="40" height="50"/><rect x="230" y="110" width="40" height="50"/><rect x="130" y="180" width="40" height="50"/><rect x="230" y="180" width="40" height="50"/></g></svg>
          ${badge}
        </div>
        <div class="card-body">
          <span class="card-type">${l.type}</span>
          <h3>${l.title}</h3>
          <p class="loc">${l.location}, West Bengal</p>
          <div class="price">${l.priceText}<small>${l.historical ? "Last published: " + l.lastPublished : "Price on request"}</small></div>
          <div class="specs">${specs}</div>
          <p style="font-size:.9rem;color:#4a524a">${l.features.join(" · ")}.</p>
          ${notice}
          <p class="card-type" style="color:#7a7a6e;font-size:.66rem">Photo: illustrative. Original video is the source.</p>
          <div class="card-actions">
            <a class="btn btn-ghost" href="${l.source || '#enquiry'}" ${l.source ? 'target="_blank" rel="noopener"' : ''}>${l.source ? "View Source" : "View Details"}</a>
            <a class="btn btn-green" href="${waLink(`Hello, I am interested in the ${l.title} listed on your website. Please share more details and current availability.`)}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
          </div>
        </div>
      </article>`;
  }

  function render(){
    const results = listings.filter(matches);
    $("#grid").innerHTML = results.length
      ? results.map(card).join("")
      : `<div class="empty"><h3>No properties match your selected filters.</h3><p>Try adjusting your search, or <a href="#enquiry" style="color:var(--green);border-bottom:1px solid var(--gold)">tell us what you are looking for</a> and we will discuss suitable options with you.</p></div>`;
    $("#count").textContent = `${results.length} ${results.length === 1 ? "property" : "properties"} shown`;
  }

  $("#searchBtn").addEventListener("click", () => { render(); $("#properties").scrollIntoView({behavior:"smooth"}); });
  ["fLocation","fType","fBhk","fBudget"].forEach(id => $("#"+id).addEventListener("change", render));
  render();

  // Locality cards and service links set filters
  $$("[data-loc]").forEach(a => a.addEventListener("click", () => { $("#fLocation").value = a.dataset.loc; render(); }));
  $$("[data-goto]").forEach(b => b.addEventListener("click", () => document.querySelector(b.dataset.goto).scrollIntoView({behavior:"smooth"})));
  $$("[data-type]").forEach(a => a.addEventListener("click", () => { $("#msg").value = `Interested in: ${a.dataset.type}. `; }));

  // Enquiry validation
  const form = $("#enqForm"), status = $("#enqStatus");
  const fields = {
    name: v => v.trim().length >= 2 ? "" : "Please enter your name.",
    phone: v => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g,"").replace(/^\+?91/,"")) ? "" : "Enter a valid 10-digit Indian mobile number.",
    email: v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address."
  };
  function validate(name){
    const el = $("#"+name), msg = fields[name](el.value);
    $("#"+name+"Err").classList.toggle("show", !!msg);
    el.classList.toggle("invalid", !!msg);
    return !msg;
  }
  ["name","phone","email"].forEach(n => $("#"+n).addEventListener("blur", () => validate(n)));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = ["name","phone","email"].map(validate).every(Boolean);
    if (!ok) { status.className = "enq-status show"; status.textContent = "Please correct the highlighted fields."; return; }
    const v = Object.fromEntries(new FormData(form).entries());
    const text = [
      "Hello Apna Ghar Apni Property, I would like to enquire about residential property.",
      "",
      `Name: ${v.name.trim()}`,
      `Phone: ${v.phone.trim()}`,
      v.email ? `Email: ${v.email.trim()}` : null,
      `Preferred location: ${v.location}`,
      `Property type: ${v.type}`,
      `Budget: ${v.budget}`,
      `BHK requirement: ${v.bhk}`,
      v.message.trim() ? `Message: ${v.message.trim()}` : null
    ].filter(x => x !== null).join("\n");
    window.open(waLink(text), "_blank", "noopener");
    status.className = "enq-status show";
    status.textContent = "WhatsApp has opened with your enquiry pre-filled. Please tap Send in WhatsApp to deliver it.";
  });
})();
