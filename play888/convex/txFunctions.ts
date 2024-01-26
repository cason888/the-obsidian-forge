import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record Transaction : Records a new transaction (agent to subagent, agent to player, player withdrawal).

export const recordTransaction = mutation({
  args: {
    fromAgentId: v.optional(v.id("agents")),
    toAgentId: v.optional(v.id("agents")),
    playerId: v.optional(v.id("players")),
    amount: v.number(),
    transactionType: v.union(
      v.literal("agentToSubagent"),
      v.literal("agentToPlayer"),
      v.literal("playerWithdrawal")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", {
      fromAgentId: args.fromAgentId,
      toAgentId: args.toAgentId,
      playerId: args.playerId,
      amount: args.amount,
      transactionType: args.transactionType
    });
  }
});


// Retrieve Transactions : Retrieves transaction history for an agent or player.

export const retrieveTransactions = query({
  args: {
    userId: v.union(v.id("agents"), v.id("players")), // Union of agent and player IDs
    userType: v.union(v.literal("agent"), v.literal("player"))
  },
  handler: async (ctx, args) => {
    if (args.userType === "agent") {
      return await ctx.db
        .query("transactions")
        .filter(q => q.or(
          q.eq(q.field("fromAgentId"), args.userId),
          q.eq(q.field("toAgentId"), args.userId)
        ))
        .collect();
    } else { // userType is "player"
      return await ctx.db
        .query("transactions")
        .filter(q => q.eq(q.field("playerId"), args.userId))
        .collect();
    }
  },
});