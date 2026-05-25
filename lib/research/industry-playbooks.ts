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
    primaryCta: "Start Your Project Today",
    secondaryCta: "Watch Our Reel",
    headlineFormulas: [
      "Video That Actually Converts — {city}'s {category} Pros",
      "Stop Posting Content That Gets Ignored — {name} Creates What Works",
      "{city} Brands Choose {name} When Mediocre Won't Cut It",
    ],
    subheadFormulas: [
      "From concept to viral-ready cut — {rating}★ trusted by {reviews}+ {audience}.",
      "Commercial, documentary, and branded content that stops the scroll and drives the sale.",
      "We partner with {audience} who need video that earns attention and drives action.",
    ],
    defaultServices: [
      { title: "Commercials That Convert", description: "High-impact storytelling that turns viewers into buyers — not just watchers." },
      { title: "Events Captured Perfectly", description: "Multi-camera production that makes your milestone look as big as it feels." },
      { title: "Content That Stops the Scroll", description: "Platform-native reels, ads, and series built to perform — not just exist." },
      { title: "Post-Production That Polishes", description: "Editing, sound, and color that makes every frame look cinema-grade." },
    ],
    valueProps: [
      { title: "Cinema-Grade Quality", description: "Professional cameras, lighting, and sound — not phone footage with a filter." },
      { title: "Strategy, Not Just Shooting", description: "We craft narratives aligned to your business goals — not pretty videos that go nowhere." },
      { title: "Fast Without Cutting Corners", description: "Efficient workflows that deliver on time without sacrificing excellence." },
    ],
    faqTemplates: [
      { question: "What types of projects do you produce?", answer: "We handle commercials, brand films, event coverage, social content, interviews, and full post-production for clients in {city} and beyond." },
      { question: "What's your production process?", answer: "Discovery call → creative brief → pre-production → shoot → post → revisions → final delivery. You're involved at every key milestone." },
      { question: "What's a typical timeline?", answer: "Timelines depend on scope. A social campaign may deliver in 1–2 weeks; a full brand film typically runs 4–8 weeks." },
      { question: "Do you travel for shoots?", answer: "Yes — we're based in {city} and regularly travel throughout the region for client projects." },
    ],
    trustBadges: ["Cinematic Quality", "Full Production", "Fast Turnaround"],
    sectionHeadlines: {
      services: "What We Create",
      whyUs: "Why Brands Choose Us Over the Rest",
      gallery: "Work That Works",
      testimonials: "Client Wins",
      faq: "Project Questions",
      contact: "Let's Make Something Great",
    },
    heroImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598488033309-bac866849c36?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579168765467-5b35e2073a83?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The production partner brands hire when generic content is costing them money",
  },

  "home-services": {
    niche: "home-services",
    label: "Home Services",
    audience: "homeowners and property managers",
    buyerType: "b2c",
    tone: "urgent",
    primaryCta: "Claim Your Free Estimate",
    secondaryCta: "Call Now — Same-Day Available",
    headlineFormulas: [
      "Stop Waiting Days for a Callback — {city}'s Fastest {category}",
      "Same-Day {category} in {city} — Fixed Right or We Make It Right",
      "{city} Homeowners' #1 Call When {category} Can't Wait",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ {city} {audience} who stopped calling anyone else. Free estimates. Same-day emergency response.",
      "Licensed, insured, upfront pricing — no runaround. The {category} team {city} recommends first.",
      "While others ghost you, we show up on time and fix it right. That's why we're top-rated.",
    ],
    defaultServices: [
      { title: "Emergency Fixed Tonight", description: "24/7 response when you can't wait — we show up when others won't." },
      { title: "Installations Done Right", description: "Professional install with warranty-backed work — no callbacks, no regrets." },
      { title: "Prevent Costly Breakdowns", description: "Maintenance plans that save you money before small problems become disasters." },
      { title: "Honest Inspections & Quotes", description: "Transparent assessments and upfront pricing — zero surprises on the bill." },
    ],
    valueProps: [
      { title: "Licensed & Insured", description: "Full credentials — your home and your wallet are protected." },
      { title: "Upfront Pricing", description: "Clear quotes before we start. No hidden fees. No bait-and-switch." },
      { title: "Satisfaction Guaranteed", description: "We don't leave until you're happy — that's the deal." },
    ],
    faqTemplates: [
      { question: "Do you offer free estimates?", answer: "Yes — free, no-obligation estimates for all projects in {city} and surrounding areas." },
      { question: "Are you licensed and insured?", answer: "Absolutely. We carry full licensing and insurance for your protection." },
      { question: "What areas do you serve?", answer: "We proudly serve {city} and nearby communities." },
      { question: "How quickly can you respond?", answer: "Emergency calls get same-day response. Standard appointments typically within 48 hours." },
    ],
    trustBadges: ["Licensed & Insured", "Free Estimates", "Same-Day Service"],
    sectionHeadlines: {
      services: "What You Get",
      whyUs: "Why Homeowners Stop Shopping Around",
      gallery: "Proof in the Work",
      testimonials: "Real Reviews. Real Results.",
      faq: "Questions? We've Got Answers.",
      contact: "Claim Your Free Estimate",
    },
    heroImage: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1632778149955-ce79a7c2a8e0?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The home services team {city} calls first — and never needs to call twice",
  },

  restaurant: {
    niche: "restaurant",
    label: "Restaurant & Dining",
    audience: "diners and food lovers",
    buyerType: "b2c",
    tone: "warm",
    primaryCta: "Reserve Your Table Now",
    secondaryCta: "See What's Cooking",
    headlineFormulas: [
      "{city}'s Most Talked-About {category} — Tables Fill Fast",
      "The {category} Experience {city} Can't Stop Raving About",
      "Real Flavors. Real Reviews. {name} Delivers Every Time.",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ guests. Fresh ingredients, unforgettable nights — reserve before your slot's gone.",
      "The table everyone in {city} is talking about. Book now and taste why the waitlist exists.",
      "From first bite to last call — an experience worth every star.",
    ],
    defaultServices: [
      { title: "The Full Dining Experience", description: "Unforgettable evenings with service that makes you feel like a regular from night one." },
      { title: "Takeout That Doesn't Disappoint", description: "Your favorites, hot and fresh — because delivery shouldn't mean settling." },
      { title: "Events They'll Talk About", description: "Private gatherings with custom menus that steal the show." },
      { title: "Catering That Steals the Show", description: "Elevate any occasion with the dishes {city} can't stop ordering." },
    ],
    valueProps: [
      { title: "Fresh Every Day", description: "Quality ingredients you can taste — not frozen, not faked." },
      { title: "Service You'll Remember", description: "Warm hospitality that turns first-timers into regulars." },
      { title: "Consistency You Can Trust", description: "The same incredible experience — every single visit." },
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
      whyUs: "Why Everyone's Talking About Us",
      gallery: "From Our Kitchen to Your Table",
      testimonials: "Don't Take Our Word For It",
      faq: "Before You Visit",
      contact: "Reserve Before It's Gone",
    },
    heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The table {city} recommends without hesitation — and books weeks ahead for",
  },

  "professional-services": {
    niche: "professional-services",
    label: "Professional Services",
    audience: "clients and decision-makers",
    buyerType: "mixed",
    tone: "professional",
    primaryCta: "Book Free Consultation",
    secondaryCta: "Talk to an Expert",
    headlineFormulas: [
      "When It Matters Most, {city} Trusts {name}",
      "Don't Gamble on {category} — Get {city}'s Proven Expert",
      "{city}'s Go-To {category} for Results You Can Count On",
    ],
    subheadFormulas: [
      "{rating}★ rated. Free consultation. The {category} partner {city} clients trust when stakes are high.",
      "Clear advice. Real results. No runaround — just the expert guidance you needed yesterday.",
      "When {city} {audience} need answers, they call us first.",
    ],
    defaultServices: [
      { title: "Free Strategy Session", description: "Understand your options with zero pressure — just clarity and a real plan." },
      { title: "Dedicated Advocacy", description: "Someone in your corner who fights for your outcome, not the clock." },
      { title: "Bulletproof Documentation", description: "Meticulous preparation that protects you when it counts most." },
      { title: "Long-Term Partnership", description: "Not a one-and-done — a trusted advisor for whatever comes next." },
    ],
    valueProps: [
      { title: "Proven Track Record", description: "Results backed by years of wins — not promises." },
      { title: "You're Not a Number", description: "Personal attention from people who know your name and your case." },
      { title: "Zero Surprises", description: "Always know where things stand — no ghosting, no confusion." },
    ],
    faqTemplates: [
      { question: "How much does a consultation cost?", answer: "Initial consultations are complimentary. We'll discuss your situation and outline next steps." },
      { question: "How long does the process take?", answer: "Timelines vary by matter. We provide realistic estimates during your consultation." },
      { question: "Do you serve clients outside {city}?", answer: "We serve clients throughout the region. Contact us to discuss your needs." },
      { question: "How do I get started?", answer: "Schedule a consultation online or call our office." },
    ],
    trustBadges: ["Confidential", "Experienced", "Client-Focused"],
    sectionHeadlines: {
      services: "How We Win for You",
      whyUs: "Why Clients Stop Looking",
      gallery: "Our Firm",
      testimonials: "Results Speak Louder",
      faq: "Objections? Handled.",
      contact: "Book Your Free Consultation",
    },
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The advisor {city} clients call when the stakes are too high to guess",
  },

  healthcare: {
    niche: "healthcare",
    label: "Healthcare",
    audience: "patients and families",
    buyerType: "b2c",
    tone: "clinical",
    primaryCta: "Get Priority Appointment",
    secondaryCta: "Call for Same-Week Care",
    headlineFormulas: [
      "Finally — {category} Care in {city} That Actually Listens",
      "{city}'s Trusted {category} — Same-Week Appointments Available",
      "Your Family Deserves Better Care. Start at {name}.",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ patients. Same-week appointments. Providers who actually listen.",
      "Stop dreading doctor visits. Modern care, real answers — accepting new patients now.",
      "Your health can't wait. Neither do we — book today.",
    ],
    defaultServices: [
      { title: "Care That Fits Your Life", description: "Comprehensive services without the runaround — get answers, not appointments months out." },
      { title: "Stay Ahead of Problems", description: "Proactive check-ups that catch issues before they become emergencies." },
      { title: "Expert Treatment, Zero Runaround", description: "Advanced care from providers who explain everything in plain English." },
      { title: "Guidance You Can Trust", description: "Clear recommendations so you make informed decisions — not scared ones." },
    ],
    valueProps: [
      { title: "Providers Who Listen", description: "Skilled professionals who treat you like a person, not a chart number." },
      { title: "Modern & Comfortable", description: "Clean, equipped facilities where you actually feel at ease." },
      { title: "Your Health, Your Terms", description: "Patient-first care that puts your comfort and clarity first." },
    ],
    faqTemplates: [
      { question: "Are you accepting new patients?", answer: "Yes — we welcome new patients in {city}. Call or book online." },
      { question: "Do you accept insurance?", answer: "We accept most major insurance plans. Contact us to verify coverage." },
      { question: "How soon can I get an appointment?", answer: "Same-week appointments are often available." },
      { question: "What should I bring to my first visit?", answer: "Bring your ID, insurance card, and a list of current medications." },
    ],
    trustBadges: ["Accepting Patients", "Modern Facility", "Compassionate Care"],
    sectionHeadlines: {
      services: "Care That Actually Cares",
      whyUs: "Why Patients Switch to Us",
      gallery: "Our Practice",
      testimonials: "Patient Stories",
      faq: "Your Questions, Answered",
      contact: "Book Before Slots Fill",
    },
    heroImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1631217868264-e5b1bb60212a?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579684385127-1ef15d558a2a?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The healthcare partner patients trust when 'good enough' isn't good enough",
  },

  "beauty-wellness": {
    niche: "beauty-wellness",
    label: "Beauty & Wellness",
    audience: "clients",
    buyerType: "b2c",
    tone: "aspirational",
    primaryCta: "Book Your Transformation",
    secondaryCta: "View Services & Pricing",
    headlineFormulas: [
      "Walk Out Looking Like a Million Bucks — {city}'s Top {category}",
      "The {category} Appointment {city} Books Weeks Ahead For",
      "Your Best Look Starts Here — {name}, {city}",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ clients who finally found their go-to. Book before slots fill.",
      "Premium products. Expert hands. The experience {city} can't stop recommending.",
      "You deserve to look as good as you feel — your spot is waiting.",
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
      services: "Treatments That Transform",
      whyUs: "Why Clients Become Regulars",
      gallery: "Real Transformations",
      testimonials: "The Glow-Up Is Real",
      faq: "Before You Book",
      contact: "Claim Your Spot",
    },
    heroImage: "https://images.unsplash.com/photo-1560066984-138d7174c035?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1522337360788-8bbb13af577e?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb124?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521590832167-fbc72f655618?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The self-care upgrade {city} books weeks ahead for — and tells everyone about",
  },

  "retail-local": {
    niche: "retail-local",
    label: "Local Retail",
    audience: "shoppers",
    buyerType: "b2c",
    tone: "warm",
    primaryCta: "Shop the Collection",
    secondaryCta: "Visit Our Store",
    headlineFormulas: [
      "Stop Settling — {name} Is Why {city} Shops Local",
      "{city}'s Hidden Gem for {category} Big Box Can't Match",
      "Quality You Feel. Service You Remember. Shop {name}.",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ {city} shoppers. Locally owned, personally curated — everything chains can't offer.",
      "Real products. Real people. Real reasons to drive past the mall.",
      "Visit once and you'll get it — this is why {city} shops local.",
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
      services: "What You'll Find Here",
      whyUs: "Why Locals Drive Past the Chains",
      gallery: "In the Store",
      testimonials: "Shoppers Who Get It",
      faq: "Quick Answers",
      contact: "Visit Us Today",
    },
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1441984904996-e0b87ba68727?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555529665-389874b8d58d?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472851294607-062f824d29cc?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The local shop worth crossing town for — and telling your friends about",
  },

  general: {
    niche: "general",
    label: "Local Business",
    audience: "clients",
    buyerType: "b2c",
    tone: "professional",
    primaryCta: "Get Started Now",
    secondaryCta: "See Why We're #1",
    headlineFormulas: [
      "{city}'s {rating}★-Rated {category} — See Why {audience} Switch",
      "Tired of Mediocre {category}? {name} Is the Upgrade.",
      "{city}'s Most Trusted {category} — {reviews}+ Reviews Don't Lie",
    ],
    subheadFormulas: [
      "{rating}★ from {reviews}+ {audience} in {city}. The upgrade from 'good enough.'",
      "Professional, fast, locally trusted — see the difference yourself.",
      "Stop settling. {reviews}+ reviews prove why {city} chooses {name}.",
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
      services: "What You Get",
      whyUs: "Why We're the Obvious Choice",
      gallery: "Our Work",
      testimonials: "Proof It Works",
      faq: "Got Questions?",
      contact: "Let's Talk — Free Consultation",
    },
    heroImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&q=90&auto=format&fit=crop",
    ],
    positioning: "The local expert {city} chooses when they want it done right the first time",
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
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&q=90&auto=format&fit=crop",
    ],
  },
  {
    keywords: ["photograph", "photo studio", "headshot", "portrait"],
    services: [
      { title: "Portrait Sessions", description: "Professional portraits for individuals, families, and executives." },
      { title: "Commercial Photography", description: "Product, lifestyle, and brand imagery that sells." },
      { title: "Event Photography", description: "Coverage that captures the energy and detail of your event." },
    ],
    sectionHeadlines: { gallery: "Portfolio", services: "Photography Services" },
    heroImage: "https://images.unsplash.com/photo-1452587925146-ce544e77ee70?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554048612-b407a9a8f5a6?w=1920&q=90&auto=format&fit=crop",
    ],
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
    heroImage: "https://images.unsplash.com/photo-1606811841687-ef185f49edbc?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1629909613654-28e37737a126?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609840114035-3c981b782bf3?w=1920&q=90&auto=format&fit=crop",
    ],
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
    heroImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1494976388531-d105849883bf?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=90&auto=format&fit=crop",
    ],
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
    heroImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=90&auto=format&fit=crop",
    ],
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
    keywords: ["plumb", "drain", "sewer", "water heater"],
    tone: "urgent",
    services: [
      { title: "Emergency Plumbing", description: "Fast response for burst pipes, backups, and urgent repairs." },
      { title: "Drain Cleaning", description: "Clear clogs and restore flow with professional equipment." },
      { title: "Water Heater Service", description: "Repair, replacement, and maintenance for reliable hot water." },
    ],
    primaryCta: "Get Emergency Help",
    heroImage: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90&auto=format&fit=crop",
    ],
  },
  {
    keywords: ["electric", "electrical", "wiring"],
    tone: "professional",
    services: [
      { title: "Electrical Repairs", description: "Safe troubleshooting and fixes for outlets, panels, and wiring." },
      { title: "Panel Upgrades", description: "Modern electrical panels built for today's power demands." },
      { title: "Lighting Installation", description: "Interior, exterior, and smart lighting done right." },
    ],
    primaryCta: "Schedule Service",
    heroImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=90&auto=format&fit=crop",
  },
  {
    keywords: ["salon", "hair", "barber", "barbershop", "stylist"],
    tone: "aspirational",
    audience: "clients who want to look and feel their best",
    services: [
      { title: "Cuts & Styling", description: "Precision cuts and styling tailored to your look." },
      { title: "Color & Treatments", description: "Professional color, highlights, and restorative treatments." },
      { title: "Grooming Services", description: "Beard trims, shaves, and finishing details." },
    ],
    primaryCta: "Book Appointment",
    sectionHeadlines: { gallery: "The Salon", testimonials: "Client Love" },
    heroImage: "https://images.unsplash.com/photo-1560066984-138d7174c035?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1522337360788-8bbb13af577e?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb124?w=1920&q=90&auto=format&fit=crop",
    ],
  },
  {
    keywords: ["hvac", "heating", "cooling", "air condition", "furnace"],
    tone: "urgent",
    services: [
      { title: "AC Repair & Install", description: "Keep your home cool with expert diagnostics and installs." },
      { title: "Heating Service", description: "Furnace and heat pump repair, maintenance, and replacement." },
      { title: "Seasonal Maintenance", description: "Tune-ups that prevent breakdowns and lower energy bills." },
    ],
    primaryCta: "Schedule Service",
    heroImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920&q=90&auto=format&fit=crop",
  },
  {
    keywords: ["roof", "roofing", "shingle", "gutter"],
    tone: "professional",
    services: [
      { title: "Roof Replacement", description: "Durable materials and expert installation for long-term protection." },
      { title: "Roof Repair", description: "Leak detection and repairs that protect your home." },
      { title: "Inspections & Maintenance", description: "Catch issues early before they become expensive problems." },
    ],
    primaryCta: "Free Roof Inspection",
    heroImage: "https://images.unsplash.com/photo-1632778149955-ce79a7c2a8e0?w=1920&q=90&auto=format&fit=crop",
  },
  {
    keywords: ["coffee", "cafe", "café", "espresso", "bakery"],
    tone: "warm",
    audience: "coffee lovers and locals",
    services: [
      { title: "Specialty Coffee", description: "Freshly roasted espresso drinks crafted with care." },
      { title: "Fresh Pastries", description: "Baked goods made daily for the perfect pairing." },
      { title: "Catering & Events", description: "Coffee service for meetings, parties, and gatherings." },
    ],
    primaryCta: "Visit Us Today",
    sectionHeadlines: { gallery: "Inside the Café", services: "Menu Highlights" },
    heroImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=90&auto=format&fit=crop",
    ],
  },
  {
    keywords: ["pizza", "italian restaurant", "pizzeria"],
    tone: "warm",
    services: [
      { title: "Wood-Fired Pizza", description: "Hand-stretched dough and premium toppings baked to perfection." },
      { title: "Classic Italian Dishes", description: "Pastas, salads, and favorites made from quality ingredients." },
      { title: "Takeout & Delivery", description: "Hot, fresh meals ready when you are." },
    ],
    primaryCta: "Order Now",
    heroImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=90&auto=format&fit=crop",
  },
  {
    keywords: ["spa", "massage", "facial", "wellness center", "med spa"],
    tone: "premium",
    audience: "clients seeking relaxation and self-care",
    services: [
      { title: "Massage Therapy", description: "Therapeutic sessions that relieve tension and restore balance." },
      { title: "Facials & Skin Care", description: "Custom treatments for glowing, healthy skin." },
      { title: "Wellness Packages", description: "Curated experiences for deep relaxation and renewal." },
    ],
    primaryCta: "Book Your Visit",
    sectionHeadlines: { gallery: "The Experience", services: "Treatments" },
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=90&auto=format&fit=crop",
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
    heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=90&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=90&auto=format&fit=crop",
    ],
  },
];

function textIncludesKeyword(text: string, keyword: string): boolean {
  const kw = keyword.toLowerCase().trim();
  if (!kw) return false;
  if (kw.length <= 4) {
    return new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
  }
  return text.includes(kw);
}

export function findSubIndustryOverlay(combinedText: string): SubIndustryOverlay | undefined {
  const lower = combinedText.toLowerCase();
  let best: SubIndustryOverlay | undefined;
  let bestScore = 0;

  for (const overlay of SUB_INDUSTRY_OVERLAYS) {
    let score = 0;
    let matchCount = 0;
    for (const kw of overlay.keywords) {
      if (textIncludesKeyword(lower, kw)) {
        score += kw.length;
        matchCount += 1;
      }
    }
    if (matchCount === 0) continue;
    // Require a meaningful match — short keywords alone aren't enough
    if (matchCount === 1 && overlay.keywords.every((k) => k.length <= 4)) continue;

    if (score > bestScore) {
      bestScore = score;
      best = overlay;
    }
  }

  return bestScore > 0 ? best : undefined;
}
