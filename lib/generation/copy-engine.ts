import type { BusinessData, NicheType } from "@/lib/models/site-model";
import { getAudienceLabel } from "./niche-detector";

interface CopyContext {
  business: BusinessData;
  niche: NicheType;
  city: string;
}

const PRIMARY_CTAS: Record<NicheType, string> = {
  "home-services": "Claim Your Free Estimate",
  restaurant: "Reserve Your Table Now",
  "professional-services": "Book Your Free Strategy Call",
  healthcare: "Book Your Appointment",
  "beauty-wellness": "Book Your Session",
  "retail-local": "Visit Us Today",
  "creative-media": "Book a Discovery Call",
  general: "Book a Free Call",
};

const SECONDARY_CTAS: Record<NicheType, string> = {
  "home-services": "Call Now — Same-Day Available",
  restaurant: "View Menu & Hours",
  "professional-services": "Call to Talk Now",
  healthcare: "Call for Same-Week Care",
  "beauty-wellness": "View Services & Pricing",
  "retail-local": "Get Directions",
  "creative-media": "See Our Work",
  general: "Call Us Directly",
};

const HEADLINE_TEMPLATES: Record<NicheType, string[]> = {
  "home-services": [
    "Stop Waiting Days for a Plumber — {city}'s Fastest {category}",
    "Same-Day {category} in {city} — Fixed Right or We Make It Right",
    "{city} Homeowners' #1 Call for {category} That Actually Shows Up",
  ],
  restaurant: [
    "{city}'s Most Talked-About {category} — Tables Fill Fast",
    "The {category} Experience {city} Can't Stop Raving About",
    "Real Flavors. Real Reviews. {name} Delivers Every Time.",
  ],
  "professional-services": [
    "When It Matters Most, {city} Trusts {name}",
    "Don't Gamble on {category} — Get {city}'s Proven Expert",
    "{city}'s Go-To {category} for Results You Can Count On",
  ],
  healthcare: [
    "Finally — {category} Care in {city} That Actually Listens",
    "{city}'s Trusted {category} — Same-Week Appointments Available",
    "Your Family Deserves Better Care. Start at {name}.",
  ],
  "beauty-wellness": [
    "Walk Out Looking Like a Million Bucks — {city}'s Top {category}",
    "The {category} Appointment {city} Books Weeks Ahead For",
    "Your Best Look Starts Here — {name}, {city}",
  ],
  "retail-local": [
    "Stop Settling — {name} Is Why {city} Shops Local",
    "{city}'s Hidden Gem for {category} That Big Box Can't Match",
    "Quality You Feel. Service You Remember. Shop {name}.",
  ],
  "creative-media": [
    "Video That Actually Converts — {city}'s {category} Pros",
    "Stop Posting Content That Gets Ignored — {name} Creates What Works",
    "{city} Brands Choose {name} When Mediocre Won't Cut It",
  ],
  general: [
    "{city}'s {rating}★-Rated {category} — See Why {audience} Switch",
    "Tired of Mediocre {category}? {name} Is the Upgrade.",
    "{city}'s Most Trusted {category} — {reviews}+ Reviews Don't Lie",
  ],
};

const SUBHEAD_TEMPLATES: Record<NicheType, string[]> = {
  "home-services": [
    "{rating}★ from {reviews}+ {city} homeowners who stopped calling anyone else. Free estimates. Same-day emergency response.",
    "Licensed, insured, upfront pricing — no runaround, no surprises. The {category} team {city} recommends first.",
    "While others ghost you, we show up on time and fix it right. That's why we're {city}'s top-rated.",
  ],
  restaurant: [
    "{rating}★ from {reviews}+ guests. Fresh ingredients, unforgettable nights — reserve before your slot's gone.",
    "The table everyone in {city} is talking about. Book now and taste why the waitlist exists.",
    "From first bite to last call — an experience worth every star. See why {reviews}+ reviews agree.",
  ],
  "professional-services": [
    "{rating}★ rated. Free consultation. The {category} partner {city} clients trust when stakes are high.",
    "Clear advice. Real results. No runaround — just the expert guidance you needed yesterday.",
    "When {city} {audience} need answers, they call us first. Confidential. Proven. On your side.",
  ],
  healthcare: [
    "{rating}★ from {reviews}+ patients. Same-week appointments. Providers who actually listen.",
    "Stop dreading doctor visits. Modern care, zero judgment, real answers — accepting new patients now.",
    "Your health can't wait. Neither do we — book today and see why {city} families switch to us.",
  ],
  "beauty-wellness": [
    "{rating}★ from {reviews}+ clients who finally found their go-to. Book your transformation before slots fill.",
    "Premium products. Expert hands. The {category} experience {city} books weeks ahead for.",
    "You deserve to look as good as you feel. {city}'s most-reviewed {category} — your spot is waiting.",
  ],
  "retail-local": [
    "{rating}★ from {reviews}+ {city} shoppers. Locally owned, personally curated — everything big box stores can't offer.",
    "Real products. Real people. Real reasons {city} drives past the chains to shop here.",
    "Visit once and you'll get it — this is why {city} shops local at {name}.",
  ],
  "creative-media": [
    "{rating}★ trusted by {reviews}+ {audience}. Content that stops the scroll and drives the sale.",
    "From concept to viral-ready cut — production that makes your competitors look amateur.",
    "Your brand deserves better than stock footage. {city}'s {category} team that delivers results.",
  ],
  general: [
    "{rating}★ from {reviews}+ {audience} in {city}. The upgrade from 'good enough' — see the difference yourself.",
    "Professional, fast, and locally trusted. {city}'s {category} choice when quality actually matters.",
    "Stop settling. {reviews}+ reviews prove why {audience} in {city} choose {name} every time.",
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

const HERO_EYEBROW_TEMPLATES: Record<NicheType, string[]> = {
  "home-services": ["{city}'s Top-Rated {category}", "#{rating}★ Emergency {category}", "Licensed · Insured · Local"],
  restaurant: ["{city}'s Must-Try {category}", "{rating}★ · {reviews}+ Happy Guests", "Reservations Recommended"],
  "professional-services": ["{city}'s Trusted {category} Advisor", "Free Consultation Available", "{rating}★ Client Rated"],
  healthcare: ["Accepting New Patients", "{city}'s {rating}★ {category}", "Same-Week Appointments"],
  "beauty-wellness": ["{city}'s Premier {category}", "{rating}★ · Book Weeks Ahead", "Transformations That Last"],
  "retail-local": ["{city}'s Local Favorite", "{rating}★ · Shop Local", "Curated · Personal · Trusted"],
  "creative-media": ["{city}'s Production Powerhouse", "{rating}★ · Results-Driven", "Cinematic Quality"],
  general: ["{city}'s {rating}★ {category}", "Trusted by {reviews}+ {audience}", "The Obvious Choice"],
};

const OFFER_HOOK_TEMPLATES: Record<NicheType, string[]> = {
  "home-services": [
    "Free Estimates · Same-Day Service · Licensed & Insured · Satisfaction Guaranteed",
    "No Hidden Fees · Upfront Pricing · Emergency Response · {rating}★ Rated",
  ],
  restaurant: [
    "Fresh Daily · {rating}★ Rated · Reservations Open · Private Events Available",
    "Locally Sourced · Walk-Ins Welcome · Catering Available · {reviews}+ Reviews",
  ],
  "professional-services": [
    "Free Consultation · Confidential · Proven Results · {rating}★ Rated",
    "No Obligation · Clear Pricing · Expert Guidance · {city} Trusted",
  ],
  healthcare: [
    "Accepting Patients · Most Insurance · Same-Week Visits · {rating}★ Care",
    "New Patients Welcome · Modern Facility · Compassionate Team · Book Online",
  ],
  "beauty-wellness": [
    "Expert Stylists · Premium Products · {rating}★ Rated · Book Online",
    "Complimentary Consult · Luxury Experience · {reviews}+ Happy Clients",
  ],
  "retail-local": [
    "Locally Owned · Curated Selection · Personal Service · {rating}★ Rated",
    "Special Orders · Gift Services · Local Delivery · Shop {city} Local",
  ],
  "creative-media": [
    "Full Production · Fast Turnaround · {rating}★ Rated · Free Discovery Call",
    "Cinematic Quality · Strategic Storytelling · Results That Convert",
  ],
  general: [
    "Free Consultation · {rating}★ Rated · Locally Trusted · Fast Response",
    "No Obligation · Proven Results · {reviews}+ Reviews · {city} Proud",
  ],
};

const MARQUEE_TEMPLATES: Record<NicheType, string[]> = {
  "home-services": [
    "Free Estimates",
    "Same-Day Response",
    "Licensed & Insured",
    "{rating}★ Rated",
    "Satisfaction Guaranteed",
    "Serving {city}",
  ],
  restaurant: [
    "Fresh Daily",
    "{rating}★ Rated",
    "Reserve Your Table",
    "Private Events",
    "Catering Available",
    "{city} Favorite",
  ],
  "professional-services": [
    "Free Consultation",
    "Confidential",
    "{rating}★ Rated",
    "Proven Results",
    "Expert Guidance",
    "Trusted in {city}",
  ],
  healthcare: [
    "Accepting Patients",
    "Same-Week Appointments",
    "{rating}★ Rated",
    "Most Insurance Accepted",
    "Compassionate Care",
    "Serving {city}",
  ],
  "beauty-wellness": [
    "Book Online",
    "Expert Team",
    "{rating}★ Rated",
    "Premium Products",
    "Transformations",
    "{city}'s Best",
  ],
  "retail-local": [
    "Shop Local",
    "Curated Selection",
    "{rating}★ Rated",
    "Personal Service",
    "Special Orders",
    "Serving {city}",
  ],
  "creative-media": [
    "Cinematic Quality",
    "Full Production",
    "{rating}★ Rated",
    "Fast Turnaround",
    "Results-Driven",
    "Based in {city}",
  ],
  general: [
    "Free Consultation",
    "{rating}★ Rated",
    "Locally Trusted",
    "{reviews}+ Reviews",
    "Fast Response",
    "Serving {city}",
  ],
};

const HIGHLIGHT_KEYWORDS = [
  "Same-Day",
  "Free",
  "#1",
  "Top-Rated",
  "Stop",
  "Finally",
  "Fixed",
  "Trusted",
  "Premier",
  "Best",
  "Fastest",
  "Most",
  "Actually",
  "Zero",
  "Real",
];

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

export function generateHeroEyebrow(ctx: CopyContext): string {
  const templates = HERO_EYEBROW_TEMPLATES[ctx.niche];
  return fillTemplate(templates[0], ctx);
}

export function generateOfferHook(ctx: CopyContext): string {
  const templates = OFFER_HOOK_TEMPLATES[ctx.niche];
  return fillTemplate(templates[0], ctx);
}

export function generateMarqueeItems(ctx: CopyContext): string[] {
  return MARQUEE_TEMPLATES[ctx.niche].map((t) => fillTemplate(t, ctx));
}

export function generateStats(ctx: CopyContext): { value: string; label: string }[] {
  const { business, city } = ctx;
  return [
    { value: (business.rating || 4.9).toFixed(1), label: "Star Rating" },
    { value: `${business.reviewCount || 100}+`, label: "Happy Clients" },
    { value: city || "Local", label: "Community Served" },
  ];
}

export function generateHeroHighlight(headline: string): string | undefined {
  for (const kw of HIGHLIGHT_KEYWORDS) {
    if (headline.includes(kw)) return kw;
  }
  const words = headline.split(/\s+/);
  if (words.length >= 3) {
    return words.slice(0, 2).join(" ");
  }
  return undefined;
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
  return `${rating} ${ctx.business.category} in ${ctx.city}. ${generatePrimaryCta(ctx.niche)} — ${ctx.business.reviewCount || 100}+ reviews can't be wrong.`;
}

export type { CopyContext };
