import { FRIENDSHIPS_SOURCE } from "./friendships.source.js";
import { SOCIAL_MEDIA_SOURCE } from "./socialMedia.source.js";
import { ALCOHOL_AND_PARTIES_SOURCE } from "./alcoholAndParties.source.js";

export const PEER_PRESSURE_AND_SOCIAL_LIFE_SOURCES = {
  topic: "peer_pressure_and_social_life",
  sources: [FRIENDSHIPS_SOURCE, SOCIAL_MEDIA_SOURCE, ALCOHOL_AND_PARTIES_SOURCE],
};
