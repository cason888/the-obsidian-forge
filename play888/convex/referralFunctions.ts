import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create Referral Link : Generates a new referral link for a player.

export const createReferralLink = mutation({
    args: {
        playerId: v.id("players"),
        referralLink: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.playerId, { referralLink: args.referralLink });
    }
});

// Record Referral : Records a new referral when a player registers using a referral link.

export const recordReferral = mutation({
    args: {
        referrerId: v.id("players"),
        refereeId: v.id("players")
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("referrals", {
            referrerId: args.referrerId,
            refereeId: args.refereeId,
            deposits: [],
            totalCommissionEarned: 0
        });
    }
});

// Update Referral Commission : Calculates and updates commission for a referral based on deposits.

export const updateReferralCommission = mutation({
    args: {
        referralId: v.id("referrals"),
        depositRecord: v.object({
            depositAmount: v.number(),
            commissionEarned: v.number()
        })
    },
    handler: async (ctx, args) => {
        const referral = await ctx.db.get(args.referralId);
        if (!referral) throw new Error("Referral not found");

        const updatedDeposits = [...referral.deposits, args.depositRecord];
        const updatedTotalCommission = referral.totalCommissionEarned + args.depositRecord.commissionEarned;

        await ctx.db.patch(args.referralId, {
            deposits: updatedDeposits,
            totalCommissionEarned: updatedTotalCommission
        });
    }
});

// Retrieve Referral Data : Retrieves referral data for a specific player.

export const retrieveReferralData = query({
    args: {
        playerId: v.id("players")
    },
    handler: async (ctx, args) => {
        const referrals = await ctx.db
            .query("referrals")
            .filter(q => q.eq(q.field("referrerId"), args.playerId))
            .collect();
        return referrals;
    },
});