// OPTIONAL: Rename this file to `schema.ts` to declare the shape
// of the data in your database.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    users: defineTable({
      userId: v.string(),
      tokenIdentifier: v.optional(v.string()),
      role: v.string(),
    }).index("by_token", ["tokenIdentifier"]),
    agents: defineTable({
      name: v.string(),
      subdomain: v.string(),
      creditBalance: v.number(), // Changed from v.number() to v.number()
      commissionSettings: v.object({
        type: v.union(v.literal("percentage"), v.literal("targetBased")),
        percentage: v.optional(v.number()),
        depositTargets: v.optional(v.array(v.object({
          depositAmount: v.number(), // Changed from v.number() to v.number()
          commissionAmount: v.number() // Changed from v.number() to v.number()
        }))),
        commissionRestriction: v.union(
          v.literal("firstDepositOnly"),
          v.literal("maxPerPlayer"),
          v.literal("uncapped")
        ),
        maxCommissionPerPlayer: v.optional(v.number()) // Changed from v.number() to v.number()
      }),
      cmsContent: v.object({
        includeBrand: v.boolean(),
        brandLogo: v.optional(v.string()),
        companyName: v.optional(v.string()),
        announcementPopup: v.optional(v.object({
          enabled: v.boolean(),
          content: v.string(),
          multimediaUrls: v.array(v.string())
        }))
      }),
      parentAgentId: v.optional(v.id("agents"))
    }),
    players: defineTable({
      agentId: v.id("agents"),
      referralLink: v.string(),
      walletBalance: v.number(),
      commissionWalletBalance: v.number(),
      freeCreditExpiry: v.number(), // DateTime represented as a timestamp
      unlockedPerks: v.object({ // Object to track multiple one-time perks
        referredTwoFriends: v.boolean(), // Unlocked by referring two friends
        watchedWelcomeVideo: v.boolean(), // Unlocked by watching a welcome video
        // Additional one-time perks can be added here
      })
    }).index("by_agent", ["agentId"]),
    transactions: defineTable({
      fromAgentId: v.optional(v.id("agents")), // Agent who initiated the transaction (null for player withdrawals)
      toAgentId: v.optional(v.id("agents")), // Receiving agent (for sub-agent transfers)
      playerId: v.optional(v.id("players")), // Player involved in the transaction
      amount: v.number(),
      transactionType: v.union(
        v.literal("agentToSubagent"),  // Transfer from agent to sub-agent
        v.literal("agentToPlayer"),    // Transfer from agent to player (player deposit)
        v.literal("playerWithdrawal")  // Player withdrawal
      )
    }),
    referrals: defineTable({
      referrerId: v.id("players"),
      refereeId: v.id("players"),
      deposits: v.array(v.object({ // Array of deposit records
        depositAmount: v.number(),
        commissionEarned: v.number()
      })),
      totalCommissionEarned: v.number(), // Total commission earned from this referral
    }).index("by_referrer", ["referrerId"]),
    gameplayReports: defineTable({
      playerId: v.id("players"),
      gameName: v.string(),
      winLossAmount: v.number(),
      timestamp: v.number()
    })
  },
  // If you ever get an error about schema mismatch
  // between your data and your schema, and you cannot
  // change the schema to match the current data in your database,
  // you can:
  //  1. Use the dashboard to delete tables or individual documents
  //     that are causing the error.
  //  2. Change this option to `false` and make changes to the data
  //     freely, ignoring the schema. Don't forget to change back to `true`!
  { schemaValidation: true }
);
