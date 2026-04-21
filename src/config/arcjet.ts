import arcjet, {
  shield,
  detectBot,
  tokenBucket,
  slidingWindow,
} from "@arcjet/node";
if (!process.env.ARCJET_KEY && process.env.NODE_ENV !== "test") {
  throw new Error(
    "ARCJET_KEY is not defined. Set ARCJET_KEY in the environment or run with NODE_ENV=test.",
  );
}
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
  ],
});
