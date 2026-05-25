import type { BusinessData, NicheType } from "@/lib/models/site-model";
import { getAudienceLabel } from "./niche-detector";

interface CopyContext {
  business: BusinessData;
  niche: NicheType;
  city: string;
}

const PRIMARY_CTAS: Record<NicheType, string> = {
  "home-services": "Get Free Estimate",
  restaurant: "Reserve a Table",
  "professional-services": "Schedule Consultation",
  healthcare: "Book Appointment",
  "beauty-wellness": "Book Now",
  "retail-local": "Shop Collection",
  "creative-media": "Start Your Project",
  general: "Get In Touch",
};

const SECONDARY_CTAS: Record<NicheType, string> = {
  "home-services": "Call Now",
  restaurant: "View Menu",
  "professional-services": "Call Office",
  healthcare: "Call Clinic",
  "beauty-wellness": "View Services",
  "retail-local": "Visit Store",
  "creative-media": "View Our Work",
  general: "Learn More",
};

const HEADLINE_TEMPLATES: Record<NicheType, string[]> = {
  "home-services": [
    "{city}'s Trusted {category} — Done Right the First Time",
    "Same-Day {category} in {city} — Licensed & Insured",
    "Professional {category} Services for {city} Homeowners",
  ],
  restaurant: [
    "{name} — {city}'s Favorite {category}",
    "Authentic Flavors, Unforgettable Evenings in {city}",
    "Where {city} Comes Together Over Great Food",
  ],
  "professional-services": [
    "Trusted {category} Counsel for {city} Clients",
    "Strategic {category} Expertise You Can Count On",
    "{city}'s Premier {category} — Results That Matter",
  ],
  healthcare: [
    "Compassionate {category} Care in {city}",
    "Your Health, Our Priority — {city} {category}",
    "Modern {category} Services for {city} Families",
  ],
  "beauty-wellness": [
    "Look & Feel Your Best in {city}",
    "{city}'s Premier {category} Experience",
    "Elevate Your Routine at {name}",
  ],
  "retail-local": [
    "Discover {name} — {city}'s Local Favorite",
    "Curated {category} for {city}",
    "Quality You Can See at {name}",
  ],
  "creative-media": [
    "{city}'s Story-Driven {category} — Built to Captivate",
    "Cinematic {category} for Brands & Businesses in {city}",
    "{name} — Where Vision Meets Production Excellence",
  ],
  general: [
    "{name} — Trusted {category} in {city}",
    "Professional {category} Services for {city}",
    "{city}'s Go-To {category} — {rating}★ Rated",
  ],
};

const SUBHEAD_TEMPLATES: Record<NicheType, string[]> = {
  "home-services": [
    "Stop waiting days for a callback. {rating}★ from {reviews}+ {city} homeowners.",
    "Licensed, insured, and locally owned. Serving {city} with pride since day one.",
    "Fast response, fair pricing, and workmanship you can trust.",
  ],
  restaurant: [
    "Rated {rating}★ by {reviews}+ guests. Fresh ingredients, warm hospitality.",
    "From our kitchen to your table — an experience worth sharing.",
    "Reserve your table and taste why {city} keeps coming back.",
  ],
  "professional-services": [
    "Trusted by {city} clients. Clear advice, proven results.",
    "Personalized service with the expertise your situation demands.",
    "{rating}★ rated. Confidential consultations available.",
  ],
  healthcare: [
    "Patient-first care with modern facilities and experienced providers.",
    "Accepting new patients in {city}. Same-week appointments available.",
    "Rated {rating}★ by {reviews}+ patients who trust us with their health.",
  ],
  "beauty-wellness": [
    "Where self-care meets expertise. Book your transformation today.",
    "Rated {rating}★ by {reviews}+ clients in {city}.",
    "Premium services tailored to you — because you deserve the best.",
  ],
  "retail-local": [
    "Locally owned and loved by {city}. Quality products, personal service.",
    "Rated {rating}★ by {reviews}+ customers.",
    "Visit us and discover why {city} shops local.",
  ],
  "creative-media": [
    "From concept to final cut — {rating}★ trusted by {reviews}+ {audience} in {city}.",
    "Story-driven visuals that elevate brands, events, and campaigns.",
    "Award-worthy production with a collaborative process you'll love.",
  ],
  general: [
    "Rated {rating}★ by {reviews}+ {audience} in {city}. Quality service you can trust.",
    "Professional, reliable, and locally rooted in {city}.",
    "Serving {city} with expertise and care — see why {audience} choose us.",
  ],
};

const SERVICE_TEMPLATES: Record<NicheType, { title: string; description: string }[]> = {
  "home-services": [
    { title: "Emergency Repairs", description: "24/7 response for urgent issues. We show up when you need us most." },
    { title: "Installations", description: "Professional installation with warranty-backed workmanship." },
    { title: "Maintenance Plans", description: "Prevent costly breakdowns with scheduled maintenance." },
    { title: "Inspections", description: "Thorough assessments with honest recommendations." },
  ],
  restaurant: [
    { title: "Dine-In", description: "Full-service dining in a welcoming atmosphere." },
    { title: "Takeout", description: "Order ahead and pick up your favorites fresh." },
    { title: "Catering", description: "Elevate your event with our signature dishes." },
    { title: "Private Events", description: "Host memorable gatherings in our dedicated space." },
  ],
  "professional-services": [
    { title: "Consultation", description: "Understand your options with a clear, no-pressure conversation." },
    { title: "Representation", description: "Dedicated advocacy tailored to your goals." },
    { title: "Documentation", description: "Meticulous preparation that protects your interests." },
    { title: "Ongoing Support", description: "Long-term partnership you can rely on." },
  ],
  healthcare: [
    { title: "General Care", description: "Comprehensive services for your everyday health needs." },
    { title: "Preventive Care", description: "Stay ahead of issues with proactive check-ups." },
    { title: "Specialized Treatment", description: "Advanced care from experienced providers." },
    { title: "Patient Education", description: "Clear guidance so you can make informed decisions." },
  ],
  "beauty-wellness": [
    { title: "Signature Services", description: "Our most requested treatments, perfected over time." },
    { title: "Custom Packages", description: "Tailored experiences designed around your goals." },
    { title: "Consultations", description: "Expert guidance before your first appointment." },
    { title: "Membership", description: "Exclusive perks for our regular clients." },
  ],
  "retail-local": [
    { title: "In-Store Shopping", description: "Browse our curated selection with expert guidance." },
    { title: "Special Orders", description: "Can't find it? We'll source it for you." },
    { title: "Gift Services", description: "Thoughtful packaging for every occasion." },
    { title: "Local Delivery", description: "Convenient delivery throughout {city}." },
  ],
  "creative-media": [
    { title: "Commercial & Brand Films", description: "High-impact video that tells your brand story and drives results." },
    { title: "Event & Live Coverage", description: "Professional multi-camera coverage for conferences, weddings, and live events." },
    { title: "Social & Digital Content", description: "Scroll-stopping reels, ads, and content built for today's platforms." },
    { title: "Post-Production & Editing", description: "Color grading, sound design, and polish that makes every frame shine." },
  ],
  general: [
    { title: "Core Services", description: "Professional {category} tailored to your needs in {city}." },
    { title: "Consultation", description: "Start with a clear conversation about your goals and options." },
    { title: "Custom Solutions", description: "Flexible approaches designed around your specific situation." },
    { title: "Ongoing Support", description: "Reliable follow-through from first contact to completion." },
  ],
};

const WHY_US_TEMPLATES: Record<NicheType, { title: string; description: string }[]> = {
  "home-services": [
    { title: "Licensed & Insured", description: "Full credentials for your peace of mind." },
    { title: "Upfront Pricing", description: "No surprises. Clear quotes before we start." },
    { title: "Satisfaction Guaranteed", description: "We stand behind every job we complete." },
  ],
  restaurant: [
    { title: "Fresh Ingredients", description: "Quality sourcing you can taste in every bite." },
    { title: "Warm Hospitality", description: "Service that makes you feel like family." },
    { title: "Consistent Excellence", description: "The same great experience, every visit." },
  ],
  "professional-services": [
    { title: "Proven Track Record", description: "Results backed by years of experience." },
    { title: "Personal Attention", description: "You're not a case number — you're a client." },
    { title: "Transparent Communication", description: "Always know where things stand." },
  ],
  healthcare: [
    { title: "Experienced Providers", description: "Skilled professionals who listen first." },
    { title: "Modern Facility", description: "Clean, comfortable, and equipped for your care." },
    { title: "Patient-Centered", description: "Your comfort and clarity come first." },
  ],
  "beauty-wellness": [
    { title: "Expert Team", description: "Trained specialists who stay ahead of trends." },
    { title: "Premium Products", description: "Professional-grade products for lasting results." },
    { title: "Relaxing Environment", description: "An experience that restores, not just results." },
  ],
  "retail-local": [
    { title: "Locally Owned", description: "Your neighbors, invested in this community." },
    { title: "Curated Selection", description: "Every product chosen with intention." },
    { title: "Personal Service", description: "Real people who remember your name." },
  ],
  "creative-media": [
    { title: "Cinematic Quality", description: "Professional-grade equipment and craft on every project." },
    { title: "Collaborative Process", description: "We listen first, then create visuals that match your vision." },
    { title: "Fast Turnaround", description: "Efficient workflows without sacrificing creative excellence." },
  ],
  general: [
    { title: "Experienced Team", description: "Skilled professionals who deliver consistent results." },
    { title: "Local & Trusted", description: "Proudly serving {city} and surrounding communities." },
    { title: "Client-Focused", description: "Your goals drive every decision we make." },
  ],
};

const FAQ_TEMPLATES: Record<NicheType, { question: string; answer: string }[]> = {
  "home-services": [
    { question: "Do you offer free estimates?", answer: "Yes — we provide free, no-obligation estimates for all projects in {city} and surrounding areas." },
    { question: "Are you licensed and insured?", answer: "Absolutely. We carry full licensing and insurance for your protection." },
    { question: "What areas do you serve?", answer: "We proudly serve {city} and nearby communities. Call us to confirm service in your area." },
    { question: "How quickly can you respond?", answer: "For emergencies, we offer same-day response. Standard appointments are typically available within 48 hours." },
  ],
  restaurant: [
    { question: "Do you take reservations?", answer: "Yes — we recommend reserving, especially on weekends. Walk-ins welcome when available." },
    { question: "Do you accommodate dietary restrictions?", answer: "Our team is happy to accommodate allergies and dietary preferences. Just let us know." },
    { question: "Do you offer catering?", answer: "We cater events of all sizes in {city}. Contact us for a custom menu." },
    { question: "Is parking available?", answer: "Yes — convenient parking is available near our location." },
  ],
  "professional-services": [
    { question: "How much does a consultation cost?", answer: "Initial consultations are complimentary. We'll discuss your situation and outline next steps." },
    { question: "How long does the process take?", answer: "Timelines vary by case. We'll give you a realistic estimate during your consultation." },
    { question: "Do you serve clients outside {city}?", answer: "We serve clients throughout the region. Contact us to discuss your specific needs." },
    { question: "How do I get started?", answer: "Schedule a consultation online or call our office. We'll guide you from there." },
  ],
  healthcare: [
    { question: "Are you accepting new patients?", answer: "Yes — we welcome new patients in {city}. Call or book online to schedule." },
    { question: "Do you accept insurance?", answer: "We accept most major insurance plans. Contact us to verify your coverage." },
    { question: "How soon can I get an appointment?", answer: "Same-week appointments are often available for new and existing patients." },
    { question: "What should I bring to my first visit?", answer: "Bring your ID, insurance card, and a list of current medications." },
  ],
  "beauty-wellness": [
    { question: "How do I book an appointment?", answer: "Book online or call us directly. We recommend booking 1–2 weeks ahead for popular time slots." },
    { question: "What is your cancellation policy?", answer: "We ask for 24-hour notice for cancellations to avoid a fee." },
    { question: "Do you offer consultations?", answer: "Yes — complimentary consultations are available for new clients." },
    { question: "What products do you use?", answer: "We use professional-grade products selected for quality and results." },
  ],
  "retail-local": [
    { question: "What are your store hours?", answer: "Visit our contact section for current hours, or call ahead." },
    { question: "Do you offer delivery?", answer: "Yes — local delivery is available throughout {city}." },
    { question: "Can I order items not in stock?", answer: "Special orders are welcome. Ask any team member for assistance." },
    { question: "Do you offer gift cards?", answer: "Gift cards are available in-store and make perfect gifts." },
  ],
  "creative-media": [
    { question: "What types of projects do you take on?", answer: "We produce commercials, brand films, event coverage, social content, and more for clients in {city} and beyond." },
    { question: "How does the production process work?", answer: "We start with a discovery call, develop a creative brief, then handle pre-production, shoot, and post — keeping you involved at every stage." },
    { question: "What's your typical turnaround time?", answer: "Timelines vary by project scope. We'll provide a clear schedule during your consultation." },
    { question: "Do you travel for shoots?", answer: "Yes — we serve {city} and travel for projects throughout the region." },
  ],
  general: [
    { question: "What areas do you serve?", answer: "We proudly serve {city} and nearby communities." },
    { question: "How do I get started?", answer: "Call us or fill out the contact form — we'll respond promptly to discuss your needs." },
    { question: "Do you offer free consultations?", answer: "Yes — reach out to schedule a no-obligation conversation about your project." },
    { question: "What makes you different?", answer: "Local expertise, proven results, and a commitment to every client we serve." },
  ],
};

function fillTemplate(template: string, ctx: CopyContext): string {
  const { business, city, niche } = ctx;
  const audience = getAudienceLabel(niche);
  return template
    .replace(/\{name\}/g, business.name)
    .replace(/\{city\}/g, city)
    .replace(/\{category\}/g, business.category || "Business")
    .replace(/\{audience\}/g, audience)
    .replace(/\{rating\}/g, business.rating ? business.rating.toFixed(1) : "5.0")
    .replace(/\{reviews\}/g, String(business.reviewCount || "100"));
}

export function generateHeadline(ctx: CopyContext): string {
  const templates = HEADLINE_TEMPLATES[ctx.niche];
  return fillTemplate(templates[0], ctx);
}

export function generateSubheadline(ctx: CopyContext): string {
  const templates = SUBHEAD_TEMPLATES[ctx.niche];
  return fillTemplate(templates[0], ctx);
}

export function generatePrimaryCta(niche: NicheType): string {
  return PRIMARY_CTAS[niche];
}

export function generateSecondaryCta(niche: NicheType): string {
  return SECONDARY_CTAS[niche];
}

export function generateServices(ctx: CopyContext) {
  return SERVICE_TEMPLATES[ctx.niche].map((s) => ({
    title: fillTemplate(s.title, ctx),
    description: fillTemplate(s.description, ctx),
  }));
}

export function generateWhyUs(ctx: CopyContext) {
  return WHY_US_TEMPLATES[ctx.niche].map((w) => ({
    title: fillTemplate(w.title, ctx),
    description: fillTemplate(w.description, ctx),
  }));
}

export function generateFaq(ctx: CopyContext) {
  return FAQ_TEMPLATES[ctx.niche].map((f) => ({
    question: fillTemplate(f.question, ctx),
    answer: fillTemplate(f.answer, ctx),
  }));
}

export function generateBadges(business: BusinessData, niche: NicheType): string[] {
  const badges = ["Locally Owned"];
  if (business.rating >= 4.5) badges.push(`${business.rating.toFixed(1)}★ Rated`);
  if (business.reviewCount > 50) badges.push(`${business.reviewCount}+ Reviews`);
  if (niche === "home-services") badges.push("Licensed & Insured");
  if (niche === "healthcare") badges.push("Accepting New Patients");
  if (niche === "restaurant") badges.push("Fresh Daily");
  if (niche === "creative-media") badges.push("Cinematic Quality");
  return badges.slice(0, 4);
}

export function generateMetaTitle(ctx: CopyContext): string {
  return `${ctx.business.name} | ${ctx.business.category} in ${ctx.city}`;
}

export function generateMetaDescription(ctx: CopyContext): string {
  const rating = ctx.business.rating ? `${ctx.business.rating.toFixed(1)}★` : "Top-rated";
  return `${ctx.business.name} — ${rating} ${ctx.business.category.toLowerCase()} in ${ctx.city}. ${generatePrimaryCta(ctx.niche)} today.`;
}

export type { CopyContext };
