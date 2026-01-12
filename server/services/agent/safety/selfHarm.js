// selfHarm.js

const HIGH_RISK_PATTERNS = [
  "אני רוצה להתאבד",
  "רוצה להתאבד",
  "בא לי להתאבד",
  "אני הולכת להתאבד",
  "אני הולך להתאבד",
  "אני רוצה למות",
  "רוצה למות",
  "בא לי למות",
  "לא רוצה לחיות",
  "אין לי כוח לחיות",
  "נמאס לי מהחיים",
  "לשים קץ לחיים",
  "לשים קץ לחיי",
  "אני אשים קץ לחיי",
  "אובדנות",
  "מחשבות אובדניות",
  "התאבדות",
  "אני פוגע בעצמי",
  "אני פוגעת בעצמי",
  "אני חותך את עצמי",
  "אני חותכת את עצמי",
];

const GENERAL_HELP_FRIEND_PATTERNS = [
  "חברה שלי רוצה להתאבד",
  "חבר שלי רוצה להתאבד",
  "החברה שלי רוצה למות",
  "החבר שלי רוצה למות",
  "חברה שלי פוגעת בעצמה",
  "חבר שלי פוגע בעצמו",
  "איך לעזור לחברה שלי",
  "איך לעזור לחבר שלי",
  "מה לעשות אם חברה שלי",
  "מה לעשות אם חבר שלי",
  "אני דואגת לחברה שלי",
  "אני דואג לחבר שלי",
];

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const HIGH_RISK_PATTERNS_N = HIGH_RISK_PATTERNS.map(normalize);
const HELP_FRIEND_PATTERNS_N = GENERAL_HELP_FRIEND_PATTERNS.map(normalize);

function includesAny(text, patternsNormalized) {
  const t = normalize(text);
  return patternsNormalized.some((p) => p && t.includes(p));
}

function buildEranGuidanceHebrew() {
  return (
    "אני מצטער/ת שאת/ה מרגיש/ה ככה. את/ה לא צריך/ה להתמודד עם זה לבד.\n\n" +
    "חשוב מאוד לפנות עכשיו למבוגר/ת אחראי/ת שאת/ה סומכ/ת עליו/ה – הורה, מורה, יועצ/ת בית ספר או בן משפחה.\n\n" +
    "אם יש סכנה מיידית – פנה/י לשירותי החירום.\n\n" +
    "בישראל ניתן לפנות גם לער״ן – תמיכה נפשית אנונימית:\n" +
    "• קו טלפון: 1201 (24/7)\n" +
    "• וואטסאפ: ‎+972-52-845-1201"
  );
}

function buildHelpFriendWarningHebrew() {
  return (
    "אני שומע/ת שאת/ה דואג/ת לחבר/ה שלך – זה חשוב שלא תישאר/י עם זה לבד.\n\n" +
    "הכי נכון עכשיו זה לערב מבוגר/ת אחראי/ת מיד (הורה, יועצ/ת, מורה, קרוב משפחה) ולספר בדיוק מה שמדאיג אותך.\n" +
    "אם יש סכנה מיידית – פנו לשירותי החירום.\n\n" +
    "אפשר גם לפנות לער״ן להתייעצות ותמיכה:\n" +
    "• 1201 (24/7)\n" +
    "• וואטסאפ: ‎+972-52-845-1201"
  );
}

export function checkSelfHarm(text, contextType = "Message") {
  if (!text || typeof text !== "string") return null;

  const helpFriend = includesAny(text, HELP_FRIEND_PATTERNS_N);
  if (helpFriend) {
    return {
      ok: true,
      category: "Self-Harm/Suicide",
      warning: buildHelpFriendWarningHebrew(),
    };
  }

  const highRisk = includesAny(text, HIGH_RISK_PATTERNS_N);
  if (highRisk) {
    return {
      approved: false,
      message: "ההודעה נחסמה מטעמי בטיחות",
      category: "Self-Harm/Suicide",
      reason: "זוהתה אינדיקציה לפגיעה עצמית או אובדנות.",
      suggestedFix: buildEranGuidanceHebrew(),
      confidence: 0.97,
      contextType,
    };
  }

  return null;
}
