import type { BusinessData } from "@/lib/models/site-model";

export const COPY_SUGGESTIONS = {
  headline(business: BusinessData): string {
    const rating = business.rating ? `${business.rating.toFixed(1)}★` : "Top-Rated";
    return `Stop Settling — ${business.city}'s ${rating} ${business.category} That Actually Delivers`;
  },

  cta(category: string): string {
    const lower = category.toLowerCase();
    if (/restaurant|cafe|bar|food/.test(lower)) return "Reserve Your Table Now";
    if (/dental|doctor|medical|clinic/.test(lower)) return "Get Priority Appointment";
    if (/law|attorney|legal/.test(lower)) return "Book Free Consultation";
    if (/salon|spa|beauty|gym/.test(lower)) return "Book Your Transformation";
    if (/plumb|hvac|electric|roof|contractor/.test(lower)) return "Claim Your Free Estimate";
    return "Get Started Now";
  },

  metaDescription(business: BusinessData): string {
    const rating = business.rating ? `${business.rating.toFixed(1)}★` : "Top-rated";
    return `${rating} ${business.category.toLowerCase()} in ${business.city}. ${business.reviewCount || 100}+ reviews can't be wrong — ${business.phone ? `call ${business.phone} or` : ""} book online today.`;
  },

  subheadline(business: BusinessData): string {
    const reviews = business.reviewCount || 100;
    return `${reviews}+ customers in ${business.city} already made the switch. See why — free consultation, zero obligation.`;
  },
};
