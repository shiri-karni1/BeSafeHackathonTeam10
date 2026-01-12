// - High-risk self-harm content => BLOCK with supportive guidance + ERAN contacts (Israel).
// - General "help a friend" discussion => ALLOW but return a WARNING object (to be surfaced by your pipeline).


const HIGH_RISK_PATTERNS = [
  //direct self-harm intent/ideation
  "kill myself",
  "end my life",
  "i want to die",
  "i don't want to live",
  "i cant go on",
  "i can't go on",
  "suicide",
  "commit suicide",
  "hurt myself",
  "harm myself",
  "self harm",
  "self-harm",
  "cut myself",
  "i'm going to die",
  "i am going to die",
  "i want to kill myself",
  "i wanna die",
  "i wanna kill myself"

];

const GENERAL_HELP_FRIEND_PATTERNS = [
  //helping a friend / general support
  "how to help a friend",
  "help a friend",
  "my friend is depressed",
  "my friend is suicidal",
  "my friend wants to die",
  "my friend self harms",
  "my friend self-harms",
  "friend wants to kill himself",
  "friend wants to kill herself",
  "what should i do if my friend"

];

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, patterns) {
  const t = normalize(text);
  return patterns.some((p) => t.includes(p));
}

function buildEranGuidanceEnglish() {
  // Per your request:
  // - Recommend talking to a trusted adult/parents
  // - Include ERAN 1201 (24/7, anonymous)
  // - Include WhatsApp number 052-8451201 (no claim about 24/7 on WhatsApp)
  return (
    "I’m really sorry you’re feeling this way. You don’t have to handle this alone.\n\n" +
    "Please reach out to a trusted adult right now (a parent/guardian, teacher, school counselor, or another adult you trust). If you feel in immediate danger, call your local emergency number.\n\n" +
    "In Israel, you can also contact ERAN (anonymous support):\n" +
    "• ERAN hotline: 1201 (available 24/7)\n" +
    "• ERAN WhatsApp: +972-52-845-1201"
  );
}

function buildHelpFriendWarningEnglish() {
  return (
    "This topic can be serious. If your friend might be in danger right now, involve a trusted adult immediately " +
    "(their parent/guardian, a teacher, or a school counselor). If there is immediate risk, contact local emergency services.\n\n" +
    "In Israel, ERAN can help anonymously:\n" +
    "• 1201 (24/7)\n" +
    "• WhatsApp: +972-52-845-1201"
  );
}

/**
 * Detect and handle self-harm related content.
 *
 * @param {string} text
 * @param {string} contextType
 * @returns {object|null}
 *  - BLOCK: { approved:false, message, category, reason, suggestedFix, confidence, contextType }
 *  - ALLOW+WARNING: { ok:true, warning, category }
 *  - null if not relevant
 */
export function checkSelfHarm(text, contextType = "Message") {
  if (!text || typeof text !== "string") return null;

  const highRisk = includesAny(text, HIGH_RISK_PATTERNS);
  if (highRisk) {
    return {
      approved: false,
      message: "Message blocked by Safety Agent",
      category: "Self-Harm/Suicide",
      reason:
        "The message indicates possible self-harm/suicidality. This requires immediate safe support and must not be published.",
      suggestedFix: buildEranGuidanceEnglish(),
      confidence: 0.97,
      contextType,
    };
  }

  const helpFriend = includesAny(text, GENERAL_HELP_FRIEND_PATTERNS);
  if (helpFriend) {
    // Publishable, but with a warning.
    return {
      ok: true,
      category: "Self-Harm/Suicide",
      warning: buildHelpFriendWarningEnglish(),
    };
  }

  return null;
}
