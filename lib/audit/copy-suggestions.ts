import type { BusinessData } from "@/lib/models/site-model";

export const COPY_SUGGESTIONS = {
  headline(business: BusinessData): string {
    return `${business.city}'s Trusted ${business.category} — ${business.rating ? business.rating.toFixed(1) + "★ Rated" : "Professional Service You Can Count On"}`;
  },

  cta(category: string): string {
    const lower = category.toLowerCase();
    if (/restaurant|cafe|bar|food/.test(lower)) return "Reserve a Table";
    if (/dental|doctor|medical|clinic/.test(lower)) return "Book Appointment";
    if (/law|attorney|legal/.test(lower)) return "Schedule Consultation";
    if (/salon|spa|beauty|gym/.test(lower)) return "Book Now";
    if (/plumb|hvac|electric|roof|contractor/.test(lower)) return "Get Free Estimate";
    return "Contact Us Today";
  },

  metaDescription(business: BusinessData): string {
    const rating = business.rating ? `${business.rating.toFixed(1)}★` : "Top-rated";
    return `${business.name} — ${rating} ${business.category.toLowerCase()} in ${business.city}. Call ${business.phone} or book online today.`;
  },

  subheadline(business: BusinessData): string {
    const reviews = business.reviewCount || 100;
    return `Trusted by ${reviews}+ customers in ${business.city}. Professional, reliable, and ready to help.`;
  },
};
