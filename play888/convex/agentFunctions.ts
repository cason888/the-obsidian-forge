import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create Agent: Creates a new agent with initial settings.
export const createAgent = mutation({
  args: {
    name: v.string(),
    subdomain: v.string(),
    parentAgentId: v.optional(v.id("agents")),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    
    return await ctx.db.insert("agents", {
      name: args.name,
      subdomain: args.subdomain,
      creditBalance: 0, // Default credit balance
      commissionSettings: {
        type: "percentage", // Default type
        percentage: 10, // Default percentage
        depositTargets: [], // Default empty array
        commissionRestriction: "uncapped", // Default restriction
        maxCommissionPerPlayer: undefined // Undefined for optional field
      },
      cmsContent: {
        includeBrand: false, // Default includeBrand
        brandLogo: "", // Undefined for optional field
        companyName: "", // Undefined for optional field
        announcementPopup: {
          enabled: false, // Default false
          content: "", // Default empty content
          multimediaUrls: [] // Default empty array
        }
      },
      parentAgentId: args.parentAgentId // Use the processed parentAgentId
    });
  }
});

// Update Agent Details: Update the basic details of an agent.

export const updateAgentDetails = mutation({
  args: {
    agentId: v.id("agents"),
    updatedData: v.object({ /* structure matching the agent schema */ })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, args.updatedData);
  }
});


// Adjust Agent Credit: Add or deduct credit from an agent's account.

export const adjustAgentCredit = mutation({
  args: {
    agentId: v.id("agents"),
    creditAdjustment: v.number()
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    const newCreditBalance = agent.creditBalance + args.creditAdjustment;
    await ctx.db.patch(args.agentId, { creditBalance: newCreditBalance });
  }
});



// Set Commission Settings: Set or update the commission settings for an agent.

export const setCommissionSettings = mutation({
  args: {
    agentId: v.id("agents"),
    commissionSettings: v.object({
      type: v.union(v.literal("percentage"), v.literal("targetBased")),
      percentage: v.optional(v.number()),
      depositTargets: v.optional(v.array(v.object({
        depositAmount: v.number(),
        commissionAmount: v.number()
      }))),
      commissionRestriction: v.union(
        v.literal("firstDepositOnly"),
        v.literal("maxPerPlayer"),
        v.literal("uncapped")
      ),
      maxCommissionPerPlayer: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, { commissionSettings: args.commissionSettings });
  }
});


// Update CMS Content: Update the CMS content for an agent's subdomain.

export const updateCMSContent = mutation({
  args: {
    agentId: v.id("agents"),
    cmsContent: v.object({
      includeBrand: v.boolean(),
      brandLogo: v.optional(v.string()),
      companyName: v.optional(v.string()),
      announcementPopup: v.optional(v.object({
        enabled: v.boolean(),
        content: v.string(),
        multimediaUrls: v.array(v.string())
      }))
    })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, { cmsContent: args.cmsContent });
  }
});


// Generate a new subdomain for a sub-agent.