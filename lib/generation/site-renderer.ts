const MAIN_JS = `
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  const toggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.header-actions');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

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

import fs from "fs";
import path from "path";
import type { SiteModel } from "@/lib/models/site-model";
import {
  getGoogleFontsUrl,
  tokensToCssVars,
} from "@/lib/generation/design-tokens";

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
  className = ""
): string {
  if (!editMode) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}" loading="lazy" />`;
  }
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}" data-editable-image data-section="${section}" data-field="${field}" loading="lazy" />`;
}

function getBaseCss(): string {
  const cssPath = path.join(process.cwd(), "templates", "_shared", "base.css");
  return fs.readFileSync(cssPath, "utf-8");
}

export function renderSiteHtml(
  site: SiteModel,
  options: { editMode?: boolean; inlineStyles?: boolean } = {}
): string {
  const editMode = options.editMode ?? false;
  const fontsUrl = getGoogleFontsUrl(site.tokens);
  const cssVars = tokensToCssVars(site.tokens);
  const baseCss = getBaseCss();

  const enabled = new Set(
    site.sections.filter((s) => s.enabled).map((s) => s.type)
  );

  const sections: string[] = [];

  if (enabled.has("header")) {
    sections.push(`
    <header class="site-header">
      <div class="container">
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
    sections.push(`
    <section class="hero" id="hero">
      <div class="hero-bg">
        ${editableImg(site.hero.image, site.businessName, "hero", "image", editMode)}
      </div>
      <div class="container hero-content reveal">
        <h1>${editable(site.hero.headline, "hero", "headline", editMode)}</h1>
        <p>${editable(site.hero.subheadline, "hero", "subheadline", editMode)}</p>
        <div class="hero-ctas">
          <a class="btn btn-accent" href="${escapeHtml(site.hero.primaryCta.href)}">${editable(site.hero.primaryCta.label, "hero", "primaryCtaLabel", editMode)}</a>
          <a class="btn btn-secondary" href="${escapeHtml(site.hero.secondaryCta.href)}" style="color:#fff;border-color:#fff">${editable(site.hero.secondaryCta.label, "hero", "secondaryCtaLabel", editMode)}</a>
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("social-proof")) {
    sections.push(`
    <section class="social-proof">
      <div class="container">
        <div class="proof-stat">
          <span class="proof-stars">${stars(site.socialProof.rating)}</span>
          <span>${site.socialProof.rating.toFixed(1)} (${site.socialProof.reviewCount}+ reviews)</span>
        </div>
        ${site.socialProof.badges.map((b) => `<span class="proof-badge">${escapeHtml(b)}</span>`).join("")}
      </div>
    </section>`);
  }

  if (enabled.has("services")) {
    sections.push(`
    <section class="section" id="services">
      <div class="container reveal">
        <p class="section-label">Services</p>
        <h2 class="section-title">${editable(site.services.headline, "services", "headline", editMode)}</h2>
        <div class="services-grid">
          ${site.services.items
            .map(
              (s, i) => `
            <div class="service-card">
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
    sections.push(`
    <section class="section" id="why-us" style="background:var(--color-surface)">
      <div class="container reveal">
        <p class="section-label">Why Us</p>
        <h2 class="section-title">${editable(site.whyUs.headline, "whyUs", "headline", editMode)}</h2>
        <div class="why-grid">
          ${site.whyUs.items
            .map(
              (w, i) => `
            <div class="why-item">
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
    sections.push(`
    <section class="section" id="gallery">
      <div class="container reveal">
        <p class="section-label">Gallery</p>
        <h2 class="section-title">${editable(site.gallery.headline, "gallery", "headline", editMode)}</h2>
        <div class="gallery-grid">
          ${site.gallery.images
            .map(
              (img, i) =>
                editableImg(img, `${site.businessName} photo ${i + 1}`, "gallery", `image-${i}`, editMode)
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("testimonials")) {
    sections.push(`
    <section class="section" id="testimonials" style="background:var(--color-surface)">
      <div class="container reveal">
        <p class="section-label">Testimonials</p>
        <h2 class="section-title">${editable(site.testimonials.headline, "testimonials", "headline", editMode)}</h2>
        <div class="testimonials-grid">
          ${site.testimonials.items
            .map(
              (t, i) => `
            <div class="testimonial-card">
              <div class="testimonial-stars">${stars(t.rating)}</div>
              <p class="testimonial-quote">"${editable(t.quote, "testimonials", "item-" + i + "-quote", editMode)}"</p>
              <p class="testimonial-author">— ${editable(t.author, "testimonials", "item-" + i + "-author", editMode)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("faq")) {
    sections.push(`
    <section class="section" id="faq">
      <div class="container reveal">
        <p class="section-label">FAQ</p>
        <h2 class="section-title">${editable(site.faq.headline, "faq", "headline", editMode)}</h2>
        <div class="faq-list">
          ${site.faq.items
            .map(
              (f, i) => `
            <div class="faq-item">
              <h3>${editable(f.question, "faq", "item-" + i + "-question", editMode)}</h3>
              <p>${editable(f.answer, "faq", "item-" + i + "-answer", editMode)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);
  }

  if (enabled.has("contact")) {
    const hoursHtml =
      site.contact.hours.length > 0
        ? site.contact.hours
            .map((h) => `<div>${escapeHtml(h.day)}: ${escapeHtml(h.hours)}</div>`)
            .join("")
        : "<div>Call for hours</div>";

    sections.push(`
    <section class="section contact-section" id="contact">
      <div class="container contact-grid reveal">
        <div class="contact-info">
          <h3>${editable(site.contact.headline, "contact", "headline", editMode)}</h3>
          <div class="contact-detail">${editable(site.contact.address, "contact", "address", editMode)}</div>
          <div class="contact-detail"><a href="tel:${site.contact.phone.replace(/\D/g, "")}">${editable(site.contact.phone, "contact", "phone", editMode)}</a></div>
          <div class="contact-detail">${hoursHtml}</div>
        </div>
        <form class="contact-form" onsubmit="event.preventDefault(); alert('Demo form — connect to your backend');">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Email Address" required />
          <input type="tel" placeholder="Phone Number" />
          <textarea placeholder="How can we help?" rows="4"></textarea>
          <button type="submit" class="btn btn-accent">${editable(site.contact.cta.label, "contact", "ctaLabel", editMode)}</button>
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
    :root { ${cssVars} }
    ${baseCss}
  </style>
</head>
<body>
  ${sections.join("\n")}
  <script>${MAIN_JS}</script>
</body>
</html>`;
}

export function renderSiteCss(site: SiteModel): string {
  const cssVars = tokensToCssVars(site.tokens);
  return `:root { ${cssVars} }\n${getBaseCss()}`;
}

export function renderSiteJs(): string {
  return MAIN_JS;
}
