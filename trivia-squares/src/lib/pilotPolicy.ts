/**
 * Safe launch and business-model policy.
 * 5 days are for acceptance testing only, NOT a metered/paid user trial.
 * These flags must remain false until a deliberate commercial/legal rollout.
 */
export const PILOT_POLICY={
  mode:'five-day-evaluation',
  evaluationDays:5,
  startAfterApprovedRelease:true,
  expiresForPlayers:false,
  restrictLevels:false,
  guestLocalPlayEnabled:true,
  billingEnabled:false,
  subscriptionsEnabled:false,
  lifetimePurchaseEnabled:false,
  advertisingEnabled:false,
  personalizedAdsEnabled:false,
  paywallEnabled:false,
  commercialOffersVisible:false,
  storeCheckoutEnabled:false
} as const;
export type BusinessModel='unselected'|'lite_ads_plus_lifetime'|'lite_ads_plus_subscription'|'lite_ads_plus_both';
export const BUSINESS_MODEL:BusinessModel='unselected';
