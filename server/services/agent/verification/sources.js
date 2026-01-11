import { SEXUAL_HEALTH_SOURCES } from "../../../utils/trustedSources/sexualHealth.sources.js";
import { NUTRITION_AND_BODY_IMAGE_SOURCES } from "../../../utils/trustedSources/nutritionAndBodyImage.sources.js";
import { PEER_PRESSURE_AND_SOCIAL_LIFE_SOURCES } from "../../../utils/trustedSources/peerPressureAndSocialLife.sources.js";
import { EDUCATION_AND_HOBBIES_SOURCES } from "../../../utils/trustedSources/educationAndHobbies.sources.js";
import { RELATIONSHIPS_SOURCES } from "../../../utils/trustedSources/relationships.sources.js";

/**
 * Loads all trusted sources from various categories.
 */
export function getAllSources() {
  return [
    ...SEXUAL_HEALTH_SOURCES.sources,
    ...NUTRITION_AND_BODY_IMAGE_SOURCES.sources,
    ...PEER_PRESSURE_AND_SOCIAL_LIFE_SOURCES.sources,
    ...EDUCATION_AND_HOBBIES_SOURCES.sources,
    ...RELATIONSHIPS_SOURCES.sources,
  ];
}

/**
 * Converts a structured trusted source object into text format for AI evaluation.
 */
export function sourceToText(source) {
  const summary = source.summary ? `Summary:\n${source.summary}` : "";

  const keyPoints =
    Array.isArray(source.keyPoints) && source.keyPoints.length
      ? `Key Points:\n${source.keyPoints.map((kp) => `- ${kp}`).join("\n")}`
      : "";

  const notes =
    Array.isArray(source.notes) && source.notes.length
      ? `Notes:\n${source.notes
          .map((n) => {
            const name = n?.name ? `- ${n.name}` : "- (note)";
            const why = n?.why ? `  Why: ${n.why}` : "";
            const url = n?.url ? `  URL: ${n.url}` : "";
            return [name, why, url].filter(Boolean).join("\n");
          })
          .join("\n")}`
      : "";

  return [
    `Source Name: ${source.name ?? source.sourceName ?? "Unknown"}`,
    source.url ? `Source URL: ${source.url}` : "",
    source.topic ? `Topic: ${source.topic}` : "",
    summary,
    keyPoints,
    notes,
  ]
    .filter(Boolean)
    .join("\n\n");
}
