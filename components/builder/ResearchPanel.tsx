"use client";

import { useBuilderStore } from "@/lib/store/builder-store";
import { getNicheLabel } from "@/lib/generation/niche-detector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Clock,
  Target,
  Sparkles,
  MessageSquare,
} from "lucide-react";

const TONE_LABELS: Record<string, string> = {
  premium: "Premium",
  professional: "Professional",
  warm: "Warm & Inviting",
  urgent: "Urgent & Action-Oriented",
  clinical: "Clinical & Trustworthy",
  aspirational: "Aspirational",
};

export function ResearchPanel() {
  const research = useBuilderStore((s) => s.research);
  const nicheDetection = useBuilderStore((s) => s.nicheDetection);

  if (!research) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Research Dossier</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paste a Google Maps link and run research to see business intelligence here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { business, niche, website, socials, profile, buildMode } = research;

  const modeLabel =
    buildMode === "agent"
      ? profile?.agentModel
        ? `AI Agent (${profile.agentModel})`
        : "AI Agent"
      : "Template Engine";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Research Dossier</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px] pr-4">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-base">{business.name}</h3>
              <p className="text-muted-foreground">
                {profile?.industryLabel || getNicheLabel(niche)} · {business.category}
              </p>
              <Badge variant="outline" className="mt-1.5 text-xs font-normal">
                Built with {modeLabel}
              </Badge>
              {nicheDetection && (
                <p className="text-xs text-muted-foreground mt-1">
                  {nicheDetection.reason}
                </p>
              )}
            </div>

            {profile && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                      Positioning
                    </p>
                    <p className="text-sm">{profile.positioning}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                      Intelligence Summary
                    </p>
                    <p className="text-sm text-muted-foreground">{profile.researchSummary}</p>
                  </div>
                </div>

                {buildMode === "agent" && profile.nicheReasoning && (
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                        Niche Analysis (AI)
                      </p>
                      <p className="text-sm text-muted-foreground">{profile.nicheReasoning}</p>
                    </div>
                  </div>
                )}

                {buildMode === "agent" && profile.websiteStrategy && (
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                        Website Strategy (AI)
                      </p>
                      <p className="text-sm text-muted-foreground">{profile.websiteStrategy}</p>
                    </div>
                  </div>
                )}

                {buildMode === "agent" && profile.competitiveAngle && (
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Competitive Angle
                    </p>
                    <p className="text-sm text-muted-foreground">{profile.competitiveAngle}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{TONE_LABELS[profile.tone] || profile.tone}</Badge>
                  <Badge variant="outline">{profile.buyerType.toUpperCase()}</Badge>
                  <Badge variant="outline">Audience: {profile.audience}</Badge>
                </div>

                {profile.services.length > 0 && (
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                      Detected Services
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.services.slice(0, 6).map((s) => (
                        <Badge key={s.title} variant="secondary" className="text-xs font-normal">
                          {s.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.keywords.length > 0 && (
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.keywords.slice(0, 8).map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs font-normal">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.reviewThemes.length > 0 && (
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                      Review Themes
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.reviewThemes.map((theme) => (
                        <Badge key={theme} variant="outline" className="text-xs font-normal">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1 border-t">
                  <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Generated Headline
                  </p>
                  <p className="text-sm font-medium">{profile.headlines.headline}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profile.headlines.subheadline}
                  </p>
                </div>
              </div>
            )}

            {business.rating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{business.rating.toFixed(1)} ({business.reviewCount} reviews)</span>
              </div>
            )}

            {business.address && (
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <span>{business.address}</span>
              </div>
            )}

            {business.phone && (
              <div className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{business.phone}</span>
              </div>
            )}

            {(business.website || website) && (
              <div className="flex gap-2">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{website?.url || business.website}</span>
              </div>
            )}

            {business.hours.length > 0 && (
              <div>
                <div className="flex gap-2 mb-1">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">Hours</span>
                </div>
                {business.hours.slice(0, 7).map((h) => (
                  <div key={h.day} className="ml-6 text-muted-foreground">
                    {h.day}: {h.hours}
                  </div>
                ))}
              </div>
            )}

            {business.reviews.length > 0 && (
              <div>
                <div className="flex gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="font-medium">Top Reviews</p>
                </div>
                {business.reviews.slice(0, 3).map((r, i) => (
                  <blockquote key={i} className="border-l-2 pl-3 mb-2 text-muted-foreground italic ml-6">
                    &ldquo;{r.text.slice(0, 120)}{r.text.length > 120 ? "..." : ""}&rdquo;
                    <footer className="not-italic text-xs mt-1">— {r.author}</footer>
                  </blockquote>
                ))}
              </div>
            )}

            {business.photos.length > 0 && (
              <p className="text-muted-foreground">{business.photos.length} photos scraped from Maps</p>
            )}

            {socials.length > 0 && (
              <div>
                <p className="font-medium mb-1">Social Profiles</p>
                {socials.map((s) => (
                  <div key={s.url} className="text-muted-foreground">{s.platform}: {s.title || s.url}</div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
