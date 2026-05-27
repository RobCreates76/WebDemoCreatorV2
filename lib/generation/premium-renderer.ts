import type { AgentVisualDesign, SiteModel } from "@/lib/models/site-model";
import {
  getGoogleFontsUrl,
  tokensToCssVars,
} from "@/lib/generation/design-tokens";
import { getVisualDesignCssVars } from "@/lib/generation/agent-visual-design";
import { getAgentCss, getPremiumCss } from "@/lib/generation/template-css";

const PREMIUM_JS = `
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item?.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item?.classList.add('open');
    });
  });

  document.querySelectorAll('.hero-stat-value[data-count]').forEach(el => {
    const target = parseFloat(el.getAttribute('data-count') || '0');
    const suffix = el.getAttribute('data-suffix') || '';
    const isFloat = String(target).includes('.') || target % 1 !== 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    const statObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(step);
        statObserver.disconnect();
      }
    }, { threshold: 0.5 });
    statObserver.observe(el);
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          document.querySelector('.header-actions')?.classList.remove('mobile-open');
        }
      }
    });
  });

  const stickyCta = document.querySelector('.sticky-cta');
  const contactSection = document.querySelector('#contact');
  if (stickyCta && contactSection) {
    const stickyObserver = new IntersectionObserver(([entry]) => {
      stickyCta.classList.toggle('visible', !entry.isIntersecting && window.scrollY > 400);
    }, { threshold: 0.1 });
    stickyObserver.observe(contactSection);
    window.addEventListener('scroll', () => {
      if (window.scrollY <= 400) stickyCta.classList.remove('visible');
    }, { passive: true });
  }

  const toggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.header-actions');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('mobile-open'));
  }

  if (window.parent !== window) {
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.parent.postMessage({
          type: 'inline-edit',
          field: el.getAttribute('data-field'),
          section: el.getAttribute('data-section'),
          value: el.textContent
        }, '*');
      });
    });
    document.querySelectorAll('[data-editable-image]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.parent.postMessage({
          type: 'inline-edit-image',
          field: el.getAttribute('data-field'),
          section: el.getAttribute('data-section'),
          value: el.getAttribute('src')
        }, '*');
      });
    });
  }
});
`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stars(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function editable(
  text: string,
  section: string,
  field: string,
  editMode: boolean
): string {
  const escaped = escapeHtml(text);
  if (!editMode) return escaped;
  return `<span data-editable data-section="${section}" data-field="${field}">${escaped}</span>`;
}

function editableImg(
  src: string,
  alt: string,
  section: string,
  field: string,
  editMode: boolean,
  className = "",
  options: { loading?: "lazy" | "eager"; fetchPriority?: "high" | "low" | "auto" } = {}
): string {
  const loading = options.loading ?? "lazy";
  const fetchAttr =
    options.fetchPriority === "high" ? ' fetchpriority="high"' : "";
  if (!editMode) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}" loading="${loading}" decoding="async"${fetchAttr} />`;
  }
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}" data-editable-image data-section="${section}" data-field="${field}" loading="${loading}" decoding="async"${fetchAttr} />`;
}

function sectionHeader(
  label: string,
  title: string,
  section: string,
  headlineField: string,
  editMode: boolean,
  lead?: string
): string {
  const leadHtml = lead
    ? `<p class="section-lead reveal" style="--delay: 2">${escapeHtml(lead)}</p>`
    : "";
  return `
        <div class="section-header">
          <p class="section-label reveal">${escapeHtml(label)}</p>
          <h2 class="section-title reveal" style="--delay: 1">${editable(title, section, headlineField, editMode)}</h2>
          ${leadHtml}
        </div>`;
}

function headlineWithHighlight(
  headline: string,
  highlight: string | undefined,
  section: string,
  field: string,
  editMode: boolean
): string {
  if (!highlight || !headline.includes(highlight)) {
    return editable(headline, section, field, editMode);
  }
  const parts = headline.split(highlight);
  const escapedParts = parts.map((p) => escapeHtml(p));
  const hl = editMode
    ? `<span data-editable data-section="${section}" data-field="${field}">${escapeHtml(highlight)}</span>`
    : `<span class="gradient-text">${escapeHtml(highlight)}</span>`;
  return escapedParts.join(hl);
}

const WHY_NUMBERS = ["01", "02", "03", "04"];

function bodyClasses(site: SiteModel): string {
  const classes = ["premium-site"];
  if (site.buildMode === "agent") classes.push("agent-build");
  const vd = site.visualDesign;
  if (vd?.theme) classes.push(`theme-${vd.theme}`);
  if (vd?.heroLayout) classes.push(`hero-layout-${vd.heroLayout}`);
  return classes.join(" ");
}

function buildStatsHtml(
  site: SiteModel,
  premium: SiteModel["premium"]
): string {
  const stats = premium?.stats?.length
    ? premium.stats
    : [
        { value: site.socialProof.rating.toFixed(1), label: "Star Rating" },
        { value: String(site.socialProof.reviewCount), label: "Reviews" },
      ];

  return stats
    .slice(0, 3)
    .map((s) => {
      const numMatch = s.value.match(/^([\d.]+)(.*)$/);
      const num = numMatch ? parseFloat(numMatch[1]) : 0;
      const suffix = numMatch?.[2] || "";
      return `
        <div class="hero-stat reveal" style="--delay: 3">
          <div class="hero-stat-value" data-count="${num}" data-suffix="${escapeHtml(suffix)}">${escapeHtml(s.value)}</div>
          <div class="hero-stat-label">${escapeHtml(s.label)}</div>
        </div>`;
    })
    .join("");
}

function renderHeroCopyBlock(
  site: SiteModel,
  premium: SiteModel["premium"],
  editMode: boolean,
  statsHtml: string,
  wrapperClass: string
): string {
  return `
      <div class="${wrapperClass}">
        ${premium?.heroEyebrow ? `<div class="hero-eyebrow reveal">${editable(premium.heroEyebrow, "hero", "eyebrow", editMode)}</div>` : ""}
        <h1 class="reveal" style="--delay: 1">${headlineWithHighlight(site.hero.headline, premium?.heroHighlight, "hero", "headline", editMode)}</h1>
        <p class="reveal" style="--delay: 2">${editable(site.hero.subheadline, "hero", "subheadline", editMode)}</p>
        ${premium?.offerHook ? `<p class="hero-offer reveal" style="--delay: 2">${editable(premium.offerHook, "hero", "offerHook", editMode)}</p>` : ""}
        <div class="hero-ctas reveal" style="--delay: 3">
          <a class="btn btn-accent" href="${escapeHtml(site.hero.primaryCta.href)}">${editable(site.hero.primaryCta.label, "hero", "primaryCtaLabel", editMode)}</a>
          <a class="btn btn-secondary" href="${escapeHtml(site.hero.secondaryCta.href)}">${editable(site.hero.secondaryCta.label, "hero", "secondaryCtaLabel", editMode)}</a>
        </div>
        <div class="hero-stats">${statsHtml}</div>
      </div>`;
}

function renderHeroSection(
  site: SiteModel,
  premium: SiteModel["premium"],
  editMode: boolean,
  layout: AgentVisualDesign["heroLayout"] = "cinematic"
): string {
  const statsHtml = buildStatsHtml(site, premium);
  const img = editableImg(site.hero.image, site.businessName, "hero", "image", editMode, "", {
    loading: "eager",
    fetchPriority: "high",
  });

  if (layout === "split") {
    return `
    <section class="hero hero-split" id="hero">
      <div class="container hero-split-grid">
        ${renderHeroCopyBlock(site, premium, editMode, statsHtml, "hero-split-copy")}
        <div class="hero-split-media reveal" style="--delay: 2">${img}</div>
      </div>
    </section>`;
  }

  if (layout === "editorial") {
    return `
    <section class="hero hero-editorial" id="hero">
      <div class="hero-editorial-bg"></div>
      <div class="container hero-editorial-content">
        ${renderHeroCopyBlock(site, premium, editMode, statsHtml, "hero-editorial-inner")}
      </div>
      <div class="hero-editorial-strip reveal">${img}</div>
    </section>`;
  }

  return `
    <section class="hero" id="hero">
      <div class="hero-bg">${img}</div>
      <div class="hero-mesh"></div>
      <div class="container hero-content">
        ${premium?.heroEyebrow ? `<div class="hero-eyebrow reveal">${editable(premium.heroEyebrow, "hero", "eyebrow", editMode)}</div>` : ""}
        <h1 class="reveal" style="--delay: 1">${headlineWithHighlight(site.hero.headline, premium?.heroHighlight, "hero", "headline", editMode)}</h1>
        <p class="reveal" style="--delay: 2">${editable(site.hero.subheadline, "hero", "subheadline", editMode)}</p>
        ${premium?.offerHook ? `<p class="hero-offer reveal" style="--delay: 2">${editable(premium.offerHook, "hero", "offerHook", editMode)}</p>` : ""}
        <div class="hero-ctas reveal" style="--delay: 3">
          <a class="btn btn-accent" href="${escapeHtml(site.hero.primaryCta.href)}">${editable(site.hero.primaryCta.label, "hero", "primaryCtaLabel", editMode)}</a>
          <a class="btn btn-secondary" href="${escapeHtml(site.hero.secondaryCta.href)}">${editable(site.hero.secondaryCta.label, "hero", "secondaryCtaLabel", editMode)}</a>
        </div>
        <div class="hero-stats">${statsHtml}</div>
      </div>
      <div class="scroll-hint" aria-hidden="true">
        <span>Scroll</span>
        <div class="scroll-hint-line"></div>
      </div>
    </section>`;
}

export function renderPremiumSiteHtml(
  site: SiteModel,
  options: { editMode?: boolean; inlineStyles?: boolean } = {}
): string {
  const editMode = options.editMode ?? false;
  const fontsUrl = getGoogleFontsUrl(site.tokens);
  const cssVars = tokensToCssVars(site.tokens);
  const visualVars = site.visualDesign ? getVisualDesignCssVars(site.visualDesign) : "";
  const premiumCss = getPremiumCss();
  const agentCss = site.buildMode === "agent" ? getAgentCss() : "";
  const premium = site.premium;
  const heroLayout = site.visualDesign?.heroLayout ?? "cinematic";

  const enabled = new Set(
    site.sections.filter((s) => s.enabled).map((s) => s.type)
  );

  const sections: string[] = [];

  if (enabled.has("header")) {
    sections.push(`
    <header class="site-header">
      <div class="header-inner">
        <div class="logo">${editable(site.header.logoText, "header", "logoText", editMode)}</div>
        <div class="header-actions">
          <a class="header-phone" href="tel:${site.header.phone.replace(/\D/g, "")}">${editable(site.header.phone, "header", "phone", editMode)}</a>
          <a class="btn btn-primary" href="${escapeHtml(site.header.cta.href)}">${editable(site.header.cta.label, "header", "ctaLabel", editMode)}</a>
          <button class="mobile-nav-toggle" aria-label="Menu">☰</button>
        </div>
      </div>
    </header>`);
  }

  if (enabled.has("hero")) {
    sections.push(renderHeroSection(site, premium, editMode, heroLayout));
  }

  const marqueeItems =
    premium?.marqueeItems?.length
      ? premium.marqueeItems
      : [...site.socialProof.badges, `${site.socialProof.rating.toFixed(1)}★ Rated`, `${site.socialProof.reviewCount}+ Reviews`];

  if (enabled.has("social-proof")) {
    const doubled = [...marqueeItems, ...marqueeItems];
    sections.push(`
    <div class="marquee-wrap">
      <div class="marquee-track">
        ${doubled.map((item) => `<span class="marquee-item">${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
    <section class="social-proof-bar">
      <div class="container">
        <div class="proof-stat reveal">
          <span class="proof-stars">${stars(site.socialProof.rating)}</span>
          <span>${site.socialProof.rating.toFixed(1)} · ${site.socialProof.reviewCount}+ reviews</span>
        </div>
        ${site.socialProof.badges.map((b, i) => `<span class="proof-badge reveal" style="--delay: ${i + 1}">${escapeHtml(b)}</span>`).join("")}
      </div>
    </section>`);
  }

  if (enabled.has("services")) {
    const lead = premium?.sectionLeads?.services;
    sections.push(`
    <section class="section" id="services">
      <div class="container">
        ${sectionHeader("What We Offer", site.services.headline, "services", "headline", editMode, lead)}
        <div class="services-grid">
          ${site.services.items
            .map(
              (s, i) => `
            <div class="service-card reveal" style="--delay: ${i + 1}">
              <div class="service-num">${String(i + 1).padStart(2, "0")}</div>
              <h3>${editable(s.title, "services", "item-" + i + "-title", editMode)}</h3>
              <p>${editable(s.description, "services", "item-" + i + "-description", editMode)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("why-us")) {
    const lead = premium?.sectionLeads?.whyUs;
    sections.push(`
    <section class="section" id="why-us" style="background:var(--color-bg)">
      <div class="container">
        ${sectionHeader("Why Choose Us", site.whyUs.headline, "whyUs", "headline", editMode, lead)}
        <div class="why-grid">
          ${site.whyUs.items
            .map(
              (w, i) => `
            <div class="why-item reveal" style="--delay: ${i + 1}">
              <div class="why-icon">${WHY_NUMBERS[i % WHY_NUMBERS.length]}</div>
              <h3>${editable(w.title, "whyUs", "item-" + i + "-title", editMode)}</h3>
              <p>${editable(w.description, "whyUs", "item-" + i + "-description", editMode)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("gallery")) {
    const lead = premium?.sectionLeads?.gallery;
    sections.push(`
    <section class="section" id="gallery">
      <div class="container">
        ${sectionHeader("Portfolio", site.gallery.headline, "gallery", "headline", editMode, lead)}
        <div class="gallery-grid">
          ${site.gallery.images
            .map(
              (img, i) =>
                `<div class="gallery-item reveal" style="--delay: ${(i % 4) + 1}">${editableImg(img, `${site.businessName} photo ${i + 1}`, "gallery", `image-${i}`, editMode)}</div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("testimonials")) {
    const lead = premium?.sectionLeads?.testimonials;
    sections.push(`
    <section class="section" id="testimonials" style="background:var(--color-surface)">
      <div class="container">
        ${sectionHeader("Client Stories", site.testimonials.headline, "testimonials", "headline", editMode, lead)}
        <div class="testimonials-grid">
          ${site.testimonials.items
            .map(
              (t, i) => `
            <div class="testimonial-card reveal" style="--delay: ${i + 1}">
              <div class="testimonial-stars">${stars(t.rating)}</div>
              <p class="testimonial-quote">${editable(t.quote, "testimonials", "item-" + i + "-quote", editMode)}</p>
              <p class="testimonial-author">— ${editable(t.author, "testimonials", "item-" + i + "-author", editMode)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (premium?.conversionBand) {
    const band = premium.conversionBand;
    sections.push(`
    <section class="conversion-band" id="book">
      <div class="container conversion-band-inner reveal">
        <div class="conversion-band-copy">
          <p class="section-label">Next Step</p>
          <h2 class="conversion-band-title">${escapeHtml(band.headline)}</h2>
          <p class="conversion-band-sub">${escapeHtml(band.subheadline)}</p>
          <p class="conversion-band-reassurance">${escapeHtml(band.reassurance)}</p>
        </div>
        <div class="conversion-band-action">
          <a class="btn btn-accent btn-lg" href="${escapeHtml(band.ctaHref)}">${escapeHtml(band.ctaLabel)}</a>
          <a class="conversion-band-phone" href="tel:${site.contact.phone.replace(/\D/g, "")}">Or call ${escapeHtml(site.contact.phone)}</a>
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("faq")) {
    const lead = premium?.sectionLeads?.faq;
    sections.push(`
    <section class="section" id="faq">
      <div class="container">
        ${sectionHeader("Questions", site.faq.headline, "faq", "headline", editMode, lead)}
        <div class="faq-list">
          ${site.faq.items
            .map(
              (f, i) => `
            <div class="faq-item reveal" style="--delay: ${i + 1}">
              <button type="button" class="faq-question" aria-expanded="false">
                <span>${editable(f.question, "faq", "item-" + i + "-question", editMode)}</span>
                <span class="faq-icon">+</span>
              </button>
              <div class="faq-answer">
                <p>${editable(f.answer, "faq", "item-" + i + "-answer", editMode)}</p>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("contact")) {
    const lead = premium?.sectionLeads?.contact;
    const hoursHtml =
      site.contact.hours.length > 0
        ? site.contact.hours
            .map((h) => `<div>${escapeHtml(h.day)}: ${escapeHtml(h.hours)}</div>`)
            .join("")
        : "<div>Call for hours</div>";

    sections.push(`
    <section class="section contact-section" id="contact">
      <div class="container contact-grid">
        <div class="contact-info reveal">
          <p class="section-label contact-label">Book a Call</p>
          <h3>${editable(site.contact.headline, "contact", "headline", editMode)}</h3>
          ${lead ? `<p class="contact-lead">${escapeHtml(lead)}</p>` : ""}
          <div class="contact-detail">${editable(site.contact.address, "contact", "address", editMode)}</div>
          <div class="contact-detail"><a href="tel:${site.contact.phone.replace(/\D/g, "")}">${editable(site.contact.phone, "contact", "phone", editMode)}</a></div>
          <div class="contact-detail">${hoursHtml}</div>
        </div>
        <form class="contact-form reveal" style="--delay: 2" onsubmit="event.preventDefault(); alert('Demo form — connect to your booking tool or CRM');">
          <p class="form-title">Request your free consultation</p>
          <input type="text" placeholder="Your Name" required autocomplete="name" />
          <input type="tel" placeholder="Phone Number" required autocomplete="tel" />
          <textarea placeholder="What can we help you with?" rows="3"></textarea>
          <button type="submit" class="btn btn-accent">${editable(site.contact.cta.label, "contact", "ctaLabel", editMode)}</button>
          <p class="form-reassurance">No spam · Fast response · No obligation</p>
        </form>
      </div>
    </section>`);
  }

  if (enabled.has("footer")) {
    sections.push(`
    <footer class="site-footer">
      <div class="container">
        <div>
          <div class="footer-brand">${editable(site.footer.tagline, "footer", "tagline", editMode)}</div>
          <div class="footer-meta">${editable(site.footer.address, "footer", "address", editMode)}</div>
        </div>
        <div class="footer-meta">
          <a href="tel:${site.footer.phone.replace(/\D/g, "")}">${editable(site.footer.phone, "footer", "phone", editMode)}</a>
        </div>
      </div>
    </footer>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(site.meta.title)}</title>
  <meta name="description" content="${escapeHtml(site.meta.description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontsUrl}" rel="stylesheet" />
  <style>
    :root { ${cssVars} ${visualVars} }
    ${premiumCss}
    ${agentCss}
  </style>
</head>
<body class="${bodyClasses(site)}">
  ${sections.join("\n")}
  <div class="sticky-cta" aria-label="Quick actions">
    <a class="sticky-cta-primary" href="${escapeHtml(site.hero.primaryCta.href)}">${escapeHtml(site.hero.primaryCta.label)}</a>
    <a class="sticky-cta-call" href="tel:${site.contact.phone.replace(/\D/g, "")}" aria-label="Call ${escapeHtml(site.contact.phone)}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </a>
  </div>
  <script>${PREMIUM_JS}</script>
</body>
</html>`;
}

export function renderPremiumSiteCss(site: SiteModel): string {
  const cssVars = tokensToCssVars(site.tokens);
  const visualVars = site.visualDesign ? getVisualDesignCssVars(site.visualDesign) : "";
  const agentCss = site.buildMode === "agent" ? getAgentCss() : "";
  return `:root { ${cssVars} ${visualVars} }\n${getPremiumCss()}\n${agentCss}`;
}

export function renderPremiumSiteJs(): string {
  return PREMIUM_JS;
}
