import type { NicheType } from "@/lib/models/site-model";

export type PlaybookTone =
  | "premium"
  | "professional"
  | "warm"
  | "urgent"
  | "clinical"
  | "aspirational";

export interface IndustryPlaybook {
  niche: NicheType;
  label: string;
  audience: string;
  buyerType: "b2b" | "b2c" | "mixed";
  tone: PlaybookTone;
  primaryCta: string;
  secondaryCta: string;
  headlineFormulas: string[];
  subheadFormulas: string[];
  defaultServices: { title: string; description: string }[];
  valueProps: { title: string; description: string }[];
  faqTemplates: { question: string; answer: string }[];
  trustBadges: string[];
  sectionHeadlines: {
    services: string;
    whyUs: string;
    gallery: string;
    testimonials: string;
    faq: string;
    contact: string;
  };
  heroImage: string;
  galleryImages: string[];
  positioning: string;
}

/** Sub-industry overlays refine copy for specific business types within a niche */
export interface SubIndustryOverlay {
  keywords: string[];
  headlineFormulas?: string[];
  subheadFormulas?: string[];
  services?: { title: string; description: string }[];
  valueProps?: { title: string; description: string }[];
  primaryCta?: string;
  secondaryCta?: string;
  tone?: PlaybookTone;
  buyerType?: "b2b" | "b2c" | "mixed";
  audience?: string;
  positioning?: string;
  sectionHeadlines?: Partial<IndustryPlaybook["sectionHeadlines"]>;
  heroImage?: string;
  galleryImages?: string[];
}

export const INDUSTRY_PLAYBOOKS: Record<NicheType, IndustryPlaybook> = {
  "creative-media": {
    niche: "creative-media",
    label: "Creative & Media Production",
    audience: "brands, agencies, and businesses",
    buyerType: "b2b",
    tone: "premium",
    primaryCta: "Start Your Project",
    secondaryCta: "View Our Reel",
    headlineFormulas: [
      "Story-Driven {category} in {city}",
      "{city} {category} That Moves Audiences — and Metrics",
      "Cinematic {category} for Brands That Demand More",
      "{name} — Where Vision Becomes Film",
    ],
    subheadFormulas: [
      "From concept to final cut — {rating}★ trusted by {reviews}+ {audience} across {city}.",
      "Commercial, documentary, and branded content crafted with cinematic precision.",
      "We partner with {audience} who need video that earns attention and drives action.",
    ],
    defaultServices: [
      { title: "Commercial & Brand Films", description: "High-impact storytelling that elevates your brand and converts viewers into customers." },
      { title: "Corporate & Event Coverage", description: "Multi-camera production for conferences, launches, and milestone events." },
      { title: "Social & Digital Content", description: "Platform-native reels, ads, and content series built for today's feeds." },
      { title: "Post-Production & Color", description: "Editing, sound design, motion graphics, and color grading that polishes every frame." },
    ],
    valueProps: [
      { title: "Cinematic Quality", description: "Professional cinema cameras, lighting, and sound on every production." },
      { title: "Strategic Storytelling", description: "We don't just shoot — we craft narratives aligned to your business goals." },
      { title: "Collaborative Process", description: "Clear communication from pre-production through delivery." },
    ],
    faqTemplates: [
      { question: "What types of projects do you produce?", answer: "We handle commercials, brand films, event coverage, social content, interviews, and full post-production for clients in {city} and beyond." },
      { question: "What's your production process?", answer: "Discovery call → creative brief → pre-production → shoot → post → revisions → final delivery. You're involved at every key milestone." },
      { question: "What's a typical timeline?", answer: "Timelines depend on scope. A social campaign may deliver in 1–2 weeks; a full brand film typically runs 4–8 weeks." },
      { question: "Do you travel for shoots?", answer: "Yes — we're based in {city} and regularly travel throughout the region for client projects." },
    ],
    trustBadges: ["Cinematic Quality", "Full Production", "Fast Turnaround"],
    sectionHeadlines: {
      services: "Production Capabilities",
      whyUs: "Why Clients Choose Us",
      gallery: "Selected Work",
      testimonials: "Client Stories",
      faq: "Project FAQ",
      contact: "Let's Create Something",
    },
    heroImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
      "https://images.unsplash.com/photo-1598488033309-bac866849c36?w=800&q=80",
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80",
    ],
    positioning: "Premium production partner for brands that refuse generic content",
  },

  "home-services": {
    niche: "home-services",
    label: "Home Services",
    audience: "homeowners and property managers",
    buyerType: "b2c",
    tone: "urgent",
    primaryCta: "Get Free Estimate",
    secondaryCta: "Call Now",
    headlineFormulas: [
      "{city}'s Trusted {category} — Done Right the First Time",
      "Same-Day {category} in {city} — Licensed & Insured",
      "Expert {category} When You Need It Most",
    ],
    subheadFormulas: [
      "Fast response, fair pricing, and {rating}★ service from {reviews}+ {city} {audience}.",
      "Licensed, insured, and locally owned — serving {city} with pride.",
      "No runaround. No surprises. Just reliable {category} you can count on.",
    ],
    defaultServices: [
      { title: "Emergency Service", description: "Same-day response when urgent problems can't wait." },
      { title: "Installations", description: "Professional installation with warranty-backed workmanship." },
      { title: "Maintenance Plans", description: "Prevent costly breakdowns with scheduled service." },
      { title: "Inspections & Estimates", description: "Honest assessments and transparent quotes before any work begins." },
    ],
    valueProps: [
      { title: "Licensed & Insured", description: "Full credentials for your peace of mind." },
      { title: "Upfront Pricing", description: "Clear quotes before we start — no hidden fees." },
      { title: "Satisfaction Guaranteed", description: "We stand behind every job we complete." },
    ],
    faqTemplates: [
      { question: "Do you offer free estimates?", answer: "Yes — free, no-obligation estimates for all projects in {city} and surrounding areas." },
      { question: "Are you licensed and insured?", answer: "Absolutely. We carry full licensing and insurance for your protection." },
      { question: "What areas do you serve?", answer: "We proudly serve {city} and nearby communities." },
      { question: "How quickly can you respond?", answer: "Emergency calls get same-day response. Standard appointments typically within 48 hours." },
    ],
    trustBadges: ["Licensed & Insured", "Free Estimates", "Same-Day Service"],
    sectionHeadlines: {
      services: "Our Services",
      whyUs: "Why Homeowners Choose Us",
      gallery: "Recent Projects",
      testimonials: "Homeowner Reviews",
      faq: "Common Questions",
      contact: "Request Service",
    },
    heroImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    ],
    positioning: "The reliable local expert homeowners call first",
  },

  restaurant: {
    niche: "restaurant",
    label: "Restaurant & Dining",
    audience: "diners and food lovers",
    buyerType: "b2c",
    tone: "warm",
    primaryCta: "Reserve a Table",
    secondaryCta: "View Menu",
    headlineFormulas: [
      "{name} — {city}'s Destination for {category}",
      "Where {city} Comes to Eat, Drink & Gather",
      "Authentic Flavors. Unforgettable Evenings.",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ guests who keep coming back.",
      "Fresh ingredients, warm hospitality, and a menu worth sharing.",
      "Reserve your table and taste why {city} loves {name}.",
    ],
    defaultServices: [
      { title: "Dine-In Experience", description: "Full-service dining in a welcoming atmosphere." },
      { title: "Takeout & Delivery", description: "Your favorites, ready when you are." },
      { title: "Private Events", description: "Memorable gatherings with custom menus." },
      { title: "Catering", description: "Elevate any occasion with our signature dishes." },
    ],
    valueProps: [
      { title: "Fresh Ingredients", description: "Quality sourcing you can taste in every dish." },
      { title: "Warm Hospitality", description: "Service that makes you feel like family." },
      { title: "Consistent Excellence", description: "The same great experience, every visit." },
    ],
    faqTemplates: [
      { question: "Do you take reservations?", answer: "Yes — we recommend reserving, especially on weekends. Walk-ins welcome when available." },
      { question: "Do you accommodate dietary needs?", answer: "Our team happily accommodates allergies and dietary preferences." },
      { question: "Do you offer catering?", answer: "We cater events of all sizes in {city}. Contact us for a custom menu." },
      { question: "Is parking available?", answer: "Convenient parking is available near our location." },
    ],
    trustBadges: ["Fresh Daily", "Locally Sourced", "Family Recipes"],
    sectionHeadlines: {
      services: "The Experience",
      whyUs: "Our Promise",
      gallery: "From Our Kitchen",
      testimonials: "Guest Reviews",
      faq: "Before You Visit",
      contact: "Reserve Your Table",
    },
    heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    ],
    positioning: "The neighborhood spot people recommend without hesitation",
  },

  "professional-services": {
    niche: "professional-services",
    label: "Professional Services",
    audience: "clients and decision-makers",
    buyerType: "mixed",
    tone: "professional",
    primaryCta: "Schedule Consultation",
    secondaryCta: "Call Our Office",
    headlineFormulas: [
      "Trusted {category} for {city} Clients",
      "Strategic {category} — Results That Matter",
      "{city}'s Advisor of Choice for Complex Decisions",
    ],
    subheadFormulas: [
      "{rating}★ rated. Confidential consultations. Clear guidance.",
      "Personalized counsel backed by years of proven results.",
      "When the stakes are high, {city} clients choose {name}.",
    ],
    defaultServices: [
      { title: "Initial Consultation", description: "Understand your options with a clear, no-pressure conversation." },
      { title: "Representation & Advisory", description: "Dedicated advocacy tailored to your goals." },
      { title: "Documentation & Strategy", description: "Meticulous preparation that protects your interests." },
      { title: "Ongoing Counsel", description: "Long-term partnership you can rely on." },
    ],
    valueProps: [
      { title: "Proven Track Record", description: "Results backed by years of experience." },
      { title: "Personal Attention", description: "You're not a case number — you're a client." },
      { title: "Transparent Communication", description: "Always know where things stand." },
    ],
    faqTemplates: [
      { question: "How much does a consultation cost?", answer: "Initial consultations are complimentary. We'll discuss your situation and outline next steps." },
      { question: "How long does the process take?", answer: "Timelines vary by matter. We provide realistic estimates during your consultation." },
      { question: "Do you serve clients outside {city}?", answer: "We serve clients throughout the region. Contact us to discuss your needs." },
      { question: "How do I get started?", answer: "Schedule a consultation online or call our office." },
    ],
    trustBadges: ["Confidential", "Experienced", "Client-Focused"],
    sectionHeadlines: {
      services: "Practice Areas",
      whyUs: "Our Approach",
      gallery: "Our Firm",
      testimonials: "Client Testimonials",
      faq: "Common Questions",
      contact: "Schedule a Consultation",
    },
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    ],
    positioning: "Trusted advisor for high-stakes decisions",
  },

  healthcare: {
    niche: "healthcare",
    label: "Healthcare",
    audience: "patients and families",
    buyerType: "b2c",
    tone: "clinical",
    primaryCta: "Book Appointment",
    secondaryCta: "Call Our Office",
    headlineFormulas: [
      "Compassionate {category} Care in {city}",
      "Your Health, Our Priority — {city} {category}",
      "Modern {category} for {city} Families",
    ],
    subheadFormulas: [
      "Patient-first care with {rating}★ reviews from {reviews}+ patients.",
      "Accepting new patients. Same-week appointments often available.",
      "Experienced providers who listen, explain, and deliver exceptional care.",
    ],
    defaultServices: [
      { title: "General Care", description: "Comprehensive services for your everyday health needs." },
      { title: "Preventive Care", description: "Stay ahead of issues with proactive check-ups." },
      { title: "Specialized Treatment", description: "Advanced care from experienced providers." },
      { title: "Patient Education", description: "Clear guidance so you can make informed decisions." },
    ],
    valueProps: [
      { title: "Experienced Providers", description: "Skilled professionals who listen first." },
      { title: "Modern Facility", description: "Clean, comfortable, and fully equipped." },
      { title: "Patient-Centered", description: "Your comfort and clarity come first." },
    ],
    faqTemplates: [
      { question: "Are you accepting new patients?", answer: "Yes — we welcome new patients in {city}. Call or book online." },
      { question: "Do you accept insurance?", answer: "We accept most major insurance plans. Contact us to verify coverage." },
      { question: "How soon can I get an appointment?", answer: "Same-week appointments are often available." },
      { question: "What should I bring to my first visit?", answer: "Bring your ID, insurance card, and a list of current medications." },
    ],
    trustBadges: ["Accepting Patients", "Modern Facility", "Compassionate Care"],
    sectionHeadlines: {
      services: "Services & Care",
      whyUs: "Why Patients Choose Us",
      gallery: "Our Practice",
      testimonials: "Patient Reviews",
      faq: "Patient FAQ",
      contact: "Book Your Visit",
    },
    heroImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1631217868264-e5b1bb60212a?w=800&q=80",
    ],
    positioning: "Healthcare partner patients trust with their family's wellbeing",
  },

  "beauty-wellness": {
    niche: "beauty-wellness",
    label: "Beauty & Wellness",
    audience: "clients",
    buyerType: "b2c",
    tone: "aspirational",
    primaryCta: "Book Appointment",
    secondaryCta: "View Services",
    headlineFormulas: [
      "Elevate Your Look at {city}'s Premier {category}",
      "Where {city} Comes to Look & Feel Their Best",
      "Luxury {category} — Tailored to You",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ clients who trust us with their transformation.",
      "Expert stylists, premium products, and an experience you'll love.",
      "Book your appointment and discover your best self.",
    ],
    defaultServices: [
      { title: "Signature Services", description: "Our most requested treatments, perfected over time." },
      { title: "Custom Packages", description: "Tailored experiences designed around your goals." },
      { title: "Consultations", description: "Expert guidance before your first visit." },
      { title: "Membership & Loyalty", description: "Exclusive perks for our regular clients." },
    ],
    valueProps: [
      { title: "Expert Team", description: "Trained specialists who stay ahead of trends." },
      { title: "Premium Products", description: "Professional-grade products for lasting results." },
      { title: "Relaxing Environment", description: "An experience that restores, not just results." },
    ],
    faqTemplates: [
      { question: "How do I book?", answer: "Book online or call us. We recommend booking 1–2 weeks ahead for popular times." },
      { question: "What's your cancellation policy?", answer: "We ask for 24-hour notice to avoid a cancellation fee." },
      { question: "Do you offer consultations?", answer: "Yes — complimentary consultations for new clients." },
      { question: "What products do you use?", answer: "Professional-grade products selected for quality and results." },
    ],
    trustBadges: ["Expert Stylists", "Premium Products", "5-Star Experience"],
    sectionHeadlines: {
      services: "Services & Treatments",
      whyUs: "The Experience",
      gallery: "Transformations",
      testimonials: "Client Love",
      faq: "Before Your Visit",
      contact: "Book Now",
    },
    heroImage: "https://images.unsplash.com/photo-1560066984-138d7174c035?w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1522337360788-8bbb13af577e?w=800&q=80",
    ],
    positioning: "The aspirational self-care destination in town",
  },

  "retail-local": {
    niche: "retail-local",
    label: "Local Retail",
    audience: "shoppers",
    buyerType: "b2c",
    tone: "warm",
    primaryCta: "Shop Now",
    secondaryCta: "Visit Store",
    headlineFormulas: [
      "Discover {name} — {city}'s Local Favorite",
      "Curated {category} for {city}",
      "Quality You Can See. Service You Can Feel.",
    ],
    subheadFormulas: [
      "Locally owned and {rating}★ rated by {reviews}+ customers.",
      "Every product chosen with intention. Every customer treated like family.",
      "Visit us and see why {city} shops local.",
    ],
    defaultServices: [
      { title: "In-Store Shopping", description: "Browse our curated selection with expert guidance." },
      { title: "Special Orders", description: "Can't find it? We'll source it for you." },
      { title: "Gift Services", description: "Thoughtful packaging for every occasion." },
      { title: "Local Delivery", description: "Convenient delivery throughout {city}." },
    ],
    valueProps: [
      { title: "Locally Owned", description: "Your neighbors, invested in this community." },
      { title: "Curated Selection", description: "Every product chosen with intention." },
      { title: "Personal Service", description: "Real people who remember your name." },
    ],
    faqTemplates: [
      { question: "What are your store hours?", answer: "See our contact section for current hours, or call ahead." },
      { question: "Do you offer delivery?", answer: "Yes — local delivery throughout {city}." },
      { question: "Can I order items not in stock?", answer: "Special orders welcome. Ask any team member." },
      { question: "Do you offer gift cards?", answer: "Gift cards available in-store." },
    ],
    trustBadges: ["Locally Owned", "Curated Selection", "Personal Service"],
    sectionHeadlines: {
      services: "What We Offer",
      whyUs: "Why Shop With Us",
      gallery: "In the Store",
      testimonials: "Customer Reviews",
      faq: "Shopping FAQ",
      contact: "Visit Us Today",
    },
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1441984904996-e0b87ba68727?w=800&q=80",
    ],
    positioning: "The local shop worth driving across town for",
  },

  general: {
    niche: "general",
    label: "Local Business",
    audience: "clients",
    buyerType: "b2c",
    tone: "professional",
    primaryCta: "Get In Touch",
    secondaryCta: "Learn More",
    headlineFormulas: [
      "{name} — Trusted {category} in {city}",
      "Professional {category} for {city}",
      "{city}'s Go-To {category} — {rating}★ Rated",
    ],
    subheadFormulas: [
      "Rated {rating}★ by {reviews}+ {audience} in {city}.",
      "Quality service, clear communication, and results you can count on.",
      "Serving {city} with expertise and care.",
    ],
    defaultServices: [
      { title: "Core Services", description: "Professional {category} tailored to your needs." },
      { title: "Consultation", description: "Start with a clear conversation about your goals." },
      { title: "Custom Solutions", description: "Flexible approaches designed around you." },
      { title: "Ongoing Support", description: "Reliable follow-through from start to finish." },
    ],
    valueProps: [
      { title: "Experienced Team", description: "Skilled professionals who deliver consistent results." },
      { title: "Local & Trusted", description: "Proudly serving {city} and surrounding communities." },
      { title: "Client-Focused", description: "Your goals drive every decision we make." },
    ],
    faqTemplates: [
      { question: "What areas do you serve?", answer: "We proudly serve {city} and nearby communities." },
      { question: "How do I get started?", answer: "Call us or fill out the contact form — we'll respond promptly." },
      { question: "Do you offer consultations?", answer: "Yes — reach out to schedule a no-obligation conversation." },
      { question: "What makes you different?", answer: "Local expertise, proven results, and a commitment to every client." },
    ],
    trustBadges: ["Locally Owned", "Trusted Quality", "Client-Focused"],
    sectionHeadlines: {
      services: "What We Offer",
      whyUs: "Why Choose Us",
      gallery: "Our Work",
      testimonials: "What Clients Say",
      faq: "FAQ",
      contact: "Get In Touch",
    },
    heroImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
    galleryImages: [],
    positioning: "Trusted local expert delivering quality service",
  },
};

export const SUB_INDUSTRY_OVERLAYS: SubIndustryOverlay[] = [
  {
    keywords: ["wedding", "bridal", "elopement"],
    headlineFormulas: ["Capturing Your {city} Love Story — Beautifully"],
    services: [
      { title: "Wedding Films", description: "Cinematic coverage of your ceremony, reception, and every moment in between." },
      { title: "Engagement Sessions", description: "Relaxed, romantic shoots that tell your story before the big day." },
      { title: "Highlight Reels", description: "Shareable films your guests will watch again and again." },
    ],
    tone: "aspirational",
    audience: "couples planning their wedding",
    primaryCta: "Book Your Date",
    sectionHeadlines: { gallery: "Love Stories", testimonials: "Happy Couples" },
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  },
  {
    keywords: ["photograph", "photo studio", "headshot", "portrait"],
    services: [
      { title: "Portrait Sessions", description: "Professional portraits for individuals, families, and executives." },
      { title: "Commercial Photography", description: "Product, lifestyle, and brand imagery that sells." },
      { title: "Event Photography", description: "Coverage that captures the energy and detail of your event." },
    ],
    sectionHeadlines: { gallery: "Portfolio", services: "Photography Services" },
    heroImage: "https://images.unsplash.com/photo-1452587925146-ce544e77ee70?w=1200&q=80",
  },
  {
    keywords: ["dental", "dentist", "orthodont"],
    tone: "clinical",
    audience: "patients and families",
    services: [
      { title: "General Dentistry", description: "Cleanings, exams, and preventive care for the whole family." },
      { title: "Cosmetic Dentistry", description: "Smile makeovers including whitening, veneers, and bonding." },
      { title: "Restorative Care", description: "Crowns, implants, and solutions that restore function and confidence." },
    ],
    sectionHeadlines: { services: "Dental Services", contact: "Book Your Appointment" },
  },
  {
    keywords: ["law", "attorney", "legal", "lawyer"],
    tone: "professional",
    buyerType: "b2c",
    services: [
      { title: "Case Evaluation", description: "Understand your legal options with a thorough initial review." },
      { title: "Representation", description: "Aggressive, strategic advocacy in and out of the courtroom." },
      { title: "Legal Counsel", description: "Ongoing guidance to protect your interests long-term." },
    ],
    primaryCta: "Free Case Review",
    sectionHeadlines: { services: "Practice Areas", whyUs: "Our Commitment" },
  },
  {
    keywords: ["auto", "car dealer", "automotive", "mechanic", "auto repair"],
    services: [
      { title: "Sales & Inventory", description: "Quality vehicles with transparent pricing and history." },
      { title: "Service & Repair", description: "Certified technicians and OEM-quality parts." },
      { title: "Financing Options", description: "Flexible plans to get you on the road." },
    ],
    sectionHeadlines: { gallery: "Our Inventory", services: "Sales & Service" },
    heroImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
  },
  {
    keywords: ["real estate", "realtor", "property"],
    audience: "buyers and sellers",
    services: [
      { title: "Buyer Representation", description: "Find the right home with expert market guidance." },
      { title: "Seller Services", description: "Maximize your sale with strategic pricing and marketing." },
      { title: "Market Analysis", description: "Data-driven insights for confident decisions." },
    ],
    primaryCta: "Schedule a Showing",
    sectionHeadlines: { gallery: "Featured Listings", services: "How We Help" },
    heroImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
  },
  {
    keywords: ["gym", "fitness", "crossfit", "personal train"],
    tone: "aspirational",
    audience: "fitness enthusiasts",
    services: [
      { title: "Membership", description: "Access to equipment, classes, and a motivating community." },
      { title: "Personal Training", description: "One-on-one coaching tailored to your goals." },
      { title: "Group Classes", description: "High-energy sessions led by certified instructors." },
    ],
    primaryCta: "Start Free Trial",
    sectionHeadlines: { gallery: "The Gym", services: "Programs" },
    heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
  },
  {
    keywords: ["marketing", "digital agency", "seo", "web design", "advertising"],
    buyerType: "b2b",
    tone: "premium",
    services: [
      { title: "Brand Strategy", description: "Positioning and messaging that differentiates you in the market." },
      { title: "Digital Marketing", description: "SEO, paid media, and content that drives measurable growth." },
      { title: "Web & Creative", description: "Websites and creative assets that convert visitors into customers." },
    ],
    primaryCta: "Get a Strategy Call",
    sectionHeadlines: { services: "Capabilities", gallery: "Client Work" },
    heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  },
];

export function findSubIndustryOverlay(combinedText: string): SubIndustryOverlay | undefined {
  const lower = combinedText.toLowerCase();
  let best: SubIndustryOverlay | undefined;
  let bestScore = 0;

  for (const overlay of SUB_INDUSTRY_OVERLAYS) {
    let score = 0;
    for (const kw of overlay.keywords) {
      if (lower.includes(kw.toLowerCase())) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = overlay;
    }
  }

  return bestScore > 0 ? best : undefined;
}
