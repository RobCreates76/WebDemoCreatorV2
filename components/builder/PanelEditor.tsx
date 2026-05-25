"use client";

import { useBuilderStore } from "@/lib/store/builder-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NICHE_PRESETS } from "@/lib/generation/design-tokens";
import { ALL_NICHES, NICHE_LABELS } from "@/lib/generation/niche-detector";
import type { NicheType } from "@/lib/models/site-model";
import { Undo2, Redo2 } from "lucide-react";

export function PanelEditor() {
  const site = useBuilderStore((s) => s.site);
  const manualControl = useBuilderStore((s) => s.manualControl);
  const updateSite = useBuilderStore((s) => s.updateSite);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);

  if (!manualControl || !site) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Panel Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable manual control to edit sections, colors, and copy here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Panel Editor</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={undo} title="Undo">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} title="Redo">
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Accordion type="multiple" defaultValue={["global", "hero"]} className="w-full">
          <AccordionItem value="global">
            <AccordionTrigger>Global & Colors</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label>Niche Template</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={site.niche}
                  onChange={(e) => {
                    const niche = e.target.value as NicheType;
                    const preset = NICHE_PRESETS[niche];
                    updateSite((s) => ({
                      ...s,
                      niche,
                      tokens: { ...s.tokens, ...preset, niche },
                    }));
                  }}
                >
                  {ALL_NICHES.map((n) => (
                    <option key={n} value={n}>
                      {NICHE_LABELS[n]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Primary</Label>
                  <Input
                    type="color"
                    value={site.tokens.primary}
                    onChange={(e) =>
                      updateSite((s) => ({
                        ...s,
                        tokens: { ...s.tokens, primary: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Accent</Label>
                  <Input
                    type="color"
                    value={site.tokens.accent}
                    onChange={(e) =>
                      updateSite((s) => ({
                        ...s,
                        tokens: { ...s.tokens, accent: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input
                  value={site.meta.title}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      meta: { ...s.meta, title: e.target.value },
                    }))
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hero">
            <AccordionTrigger>Hero</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Textarea
                  value={site.hero.headline}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      hero: { ...s.hero, headline: e.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Subheadline</Label>
                <Textarea
                  value={site.hero.subheadline}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      hero: { ...s.hero, subheadline: e.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Image URL</Label>
                <Input
                  value={site.hero.image}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      hero: { ...s.hero, image: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Primary CTA</Label>
                <Input
                  value={site.hero.primaryCta.label}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      hero: {
                        ...s.hero,
                        primaryCta: { ...s.hero.primaryCta, label: e.target.value },
                      },
                    }))
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="services">
            <AccordionTrigger>Services</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label>Section Headline</Label>
                <Input
                  value={site.services.headline}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      services: { ...s.services, headline: e.target.value },
                    }))
                  }
                />
              </div>
              {site.services.items.map((item, i) => (
                <div key={i} className="space-y-2 p-2 rounded border border-border/50">
                  <Input
                    value={item.title}
                    placeholder="Service title"
                    onChange={(e) =>
                      updateSite((s) => {
                        const items = [...s.services.items];
                        items[i] = { ...items[i], title: e.target.value };
                        return { ...s, services: { ...s.services, items } };
                      })
                    }
                  />
                  <Textarea
                    value={item.description}
                    placeholder="Description"
                    rows={2}
                    onChange={(e) =>
                      updateSite((s) => {
                        const items = [...s.services.items];
                        items[i] = { ...items[i], description: e.target.value };
                        return { ...s, services: { ...s.services, items } };
                      })
                    }
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="testimonials">
            <AccordionTrigger>Testimonials</AccordionTrigger>
            <AccordionContent className="space-y-3">
              {site.testimonials.items.map((item, i) => (
                <div key={i} className="space-y-2 p-2 rounded border border-border/50">
                  <Textarea
                    value={item.quote}
                    rows={2}
                    onChange={(e) =>
                      updateSite((s) => {
                        const items = [...s.testimonials.items];
                        items[i] = { ...items[i], quote: e.target.value };
                        return { ...s, testimonials: { ...s.testimonials, items } };
                      })
                    }
                  />
                  <Input
                    value={item.author}
                    placeholder="Author"
                    onChange={(e) =>
                      updateSite((s) => {
                        const items = [...s.testimonials.items];
                        items[i] = { ...items[i], author: e.target.value };
                        return { ...s, testimonials: { ...s.testimonials, items } };
                      })
                    }
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact">
            <AccordionTrigger>Contact</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={site.contact.phone}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      contact: { ...s.contact, phone: e.target.value },
                      header: { ...s.header, phone: e.target.value },
                      footer: { ...s.footer, phone: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={site.contact.address}
                  rows={2}
                  onChange={(e) =>
                    updateSite((s) => ({
                      ...s,
                      contact: { ...s.contact, address: e.target.value },
                      footer: { ...s.footer, address: e.target.value },
                    }))
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sections">
            <AccordionTrigger>Section Visibility</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {site.sections.map((sec) => (
                <label key={sec.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sec.enabled}
                    onChange={(e) =>
                      updateSite((s) => ({
                        ...s,
                        sections: s.sections.map((section) =>
                          section.id === sec.id
                            ? { ...section, enabled: e.target.checked }
                            : section
                        ),
                      }))
                    }
                  />
                  {sec.type.replace(/-/g, " ")}
                </label>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
