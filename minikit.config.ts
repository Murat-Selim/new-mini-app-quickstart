const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Web3 IdeaBoard", 
    subtitle: "Share & Vote on Web3 Ideas", 
    description: "Post and vote on ideas with on-chain verification, discoverable via Farcaster.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["web3", "ideas", "voting", "community", "innovation"],
    heroImageUrl: `${ROOT_URL}/hero.png`, 
    tagline: "Share, discover, and validate Web3 ideas with on-chain verification",
    ogTitle: "Web3 IdeaBoard - Share & Vote on Web3 Ideas",
    ogDescription: "Post and vote on ideas with on-chain verification, discoverable via Farcaster.",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;