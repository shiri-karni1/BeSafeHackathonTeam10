import { SEXUAL_CONSENT_SOURCE } from "./sexualConsent.source.js";
import { SEXUAL_COERCION_SOURCE } from "./sexualCoercion.source.js";
import { CONTRACEPTION_SOURCE } from "./contraception.source.js";

export const SEXUAL_HEALTH_SOURCES = {
  topic: "sexual_health",
  sources: [SEXUAL_CONSENT_SOURCE, SEXUAL_COERCION_SOURCE, CONTRACEPTION_SOURCE],
};
