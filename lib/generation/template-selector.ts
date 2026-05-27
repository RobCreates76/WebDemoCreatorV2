import type { NicheType } from "@/lib/models/site-model";
import { loadNicheDesignConfig } from "@/lib/generation/frontend-design";

export function selectTemplate(niche: NicheType): NicheType {
  loadNicheDesignConfig(niche);
  return niche;
}
