import { useState, useEffect, useCallback, useMemo } from 'react';
import { PriceDropAlert } from '../types';
import { storage } from '../services/storage';
import { priceAlertService, PriceAlertSubscriptionInput } from '../services/priceAlertService';
import { useAuth } from '../context/AuthContext';

export function usePriceAlerts() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<PriceDropAlert[]>(() => storage.getPriceAlerts());

  useEffect(() => {
    const syncAlerts = () => {
      setAlerts(storage.getPriceAlerts());
    };
    const unsubscribe = storage.subscribe(syncAlerts);
    return unsubscribe;
  }, []);

  const userEmail = currentUser?.email?.toLowerCase().trim() || '';

  const userAlerts = useMemo(() => {
    if (!userEmail) return alerts;
    return alerts.filter((a) => a.email.toLowerCase() === userEmail);
  }, [alerts, userEmail]);

  const activeUserAlerts = useMemo(() => {
    return userAlerts.filter((a) => a.status === 'ACTIVE');
  }, [userAlerts]);

  const hasAlertForProduct = useCallback(
    (productId: string, email?: string): boolean => {
      const targetEmail = (email || userEmail).toLowerCase().trim();
      if (!targetEmail) {
        return alerts.some((a) => a.productId === productId && a.status === 'ACTIVE');
      }
      return alerts.some(
        (a) => a.productId === productId && a.email.toLowerCase() === targetEmail && a.status === 'ACTIVE'
      );
    },
    [alerts, userEmail]
  );

  const getAlertForProduct = useCallback(
    (productId: string, email?: string): PriceDropAlert | undefined => {
      const targetEmail = (email || userEmail).toLowerCase().trim();
      if (!targetEmail) {
        return alerts.find((a) => a.productId === productId && a.status === 'ACTIVE');
      }
      return alerts.find(
        (a) => a.productId === productId && a.email.toLowerCase() === targetEmail && a.status === 'ACTIVE'
      );
    },
    [alerts, userEmail]
  );

  const subscribe = useCallback((input: PriceAlertSubscriptionInput) => {
    return priceAlertService.subscribe(input);
  }, []);

  const unsubscribe = useCallback((alertId: string) => {
    priceAlertService.unsubscribe(alertId);
  }, []);

  const unsubscribeProduct = useCallback(
    (productId: string, email?: string) => {
      const targetEmail = email || userEmail;
      if (targetEmail) {
        priceAlertService.unsubscribeByProductAndEmail(productId, targetEmail);
      }
    },
    [userEmail]
  );

  const simulatePriceDrop = useCallback((productId: string, targetNewPrice?: number) => {
    return priceAlertService.simulatePriceDrop(productId, targetNewPrice);
  }, []);

  const restorePrice = useCallback((productId: string, originalPrice: number) => {
    priceAlertService.restorePrice(productId, originalPrice);
  }, []);

  return {
    alerts,
    userAlerts,
    activeUserAlerts,
    activeAlertsCount: activeUserAlerts.length,
    hasAlertForProduct,
    getAlertForProduct,
    subscribe,
    unsubscribe,
    unsubscribeProduct,
    simulatePriceDrop,
    restorePrice,
  };
}
