import { useState, useEffect, useMemo, useCallback } from 'react';
import { LoyaltyTransaction, LoyaltyTier } from '../types';
import { storage } from '../services/storage';
import { loyaltyService, LOYALTY_TIERS, TierBenefit } from '../services/loyaltyService';
import { useAuth } from '../context/AuthContext';

export function useLoyalty() {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState<number>(() => loyaltyService.getBalance(currentUser?.id));
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>(() =>
    loyaltyService.getTransactions(currentUser?.id)
  );

  useEffect(() => {
    const sync = () => {
      setBalance(loyaltyService.getBalance(currentUser?.id));
      setTransactions(loyaltyService.getTransactions(currentUser?.id));
    };

    // Initial sync
    sync();

    const unsubscribe = storage.subscribe(sync);
    return unsubscribe;
  }, [currentUser?.id]);

  const tier = useMemo<TierBenefit>(() => {
    return loyaltyService.getTier(balance);
  }, [balance]);

  const tierProgress = useMemo(() => {
    return loyaltyService.getNextTierProgress(balance);
  }, [balance]);

  const monetaryValue = useMemo(() => {
    return loyaltyService.getMonetaryValue(balance);
  }, [balance]);

  const userTransactions = useMemo(() => {
    if (!currentUser?.id) return transactions;
    return transactions.filter(
      (tx) => tx.userId === currentUser.id || tx.userEmail === currentUser.email
    );
  }, [transactions, currentUser]);

  const addBonusPoints = useCallback(
    (points: number, description: string) => {
      if (!currentUser?.id) return;
      return loyaltyService.addBonusPoints(currentUser.id, points, description);
    },
    [currentUser?.id]
  );

  const redeemPoints = useCallback(
    (pointsToRedeem: number, description?: string) => {
      if (!currentUser?.id) return { success: false, discountBob: 0, newBalance: 0 };
      return loyaltyService.redeemPoints(currentUser.id, pointsToRedeem, description || '');
    },
    [currentUser?.id]
  );

  return {
    balance,
    tier,
    tierProgress,
    monetaryValue,
    transactions: userTransactions,
    allTiers: LOYALTY_TIERS,
    addBonusPoints,
    redeemPoints,
    calculatePointsForOrder: loyaltyService.calculatePointsForOrder,
  };
}
