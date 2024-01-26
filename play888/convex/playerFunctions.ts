import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Register Player : Registers a new player under an agent.

export const registerPlayer = mutation({
  args: {
    agentId: v.id("agents"),
    referralLink: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      agentId: args.agentId,
      referralLink: args.referralLink,
      walletBalance: 0, // Default wallet balance
      commissionWalletBalance: 0, // Default commission wallet balance
      freeCreditExpiry: Date.now(), // Default to current time
      unlockedPerks: {
        referredTwoFriends: false,
        watchedWelcomeVideo: false,
      }
    });
  }
});

//  Update Player Details : Updates details of a player.

export const updatePlayerDetails = mutation({
  args: {
    playerId: v.id("players"),
    updatedData: v.object({ /* structure matching the player schema */ })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, args.updatedData);
  }
});

//  Adjust Player Credit : Add or deduct credit from a player's main wallet.
export const adjustPlayerCredit = mutation({
  args: {
    playerId: v.id("players"),
    creditAdjustment: v.number()
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    const newWalletBalance = player.walletBalance + args.creditAdjustment;
    await ctx.db.patch(args.playerId, { walletBalance: newWalletBalance });
  }
});



// Update Player Commission Wallet : Transfer commission to a player's main wallet.
export const updatePlayerCommissionWallet = mutation({
  args: {
    playerId: v.id("players"),
    commissionAmount: v.number()
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    const newCommissionWalletBalance = player.commissionWalletBalance + args.commissionAmount;
    await ctx.db.patch(args.playerId, { commissionWalletBalance: newCommissionWalletBalance });
  }
});


// Unlock Player Perks : Update the status of unlocked perks for a player.

export const unlockPlayerPerks = mutation({
  args: {
    playerId: v.id("players"),
    perkKey: v.string(), // E.g., "referredTwoFriends"
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    await ctx.db.patch(args.playerId, { 
      unlockedPerks: { ...player.unlockedPerks, [args.perkKey]: true }
    });
  }
});



//  Extend Free Credit Expiry : Extend the free credit expiry date for a player.

export const extendFreeCreditExpiry = mutation({
  args: {
    playerId: v.id("players"),
    newExpiryTimestamp: v.number() // DateTime represented as a timestamp
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, { freeCreditExpiry: args.newExpiryTimestamp });
  }
});