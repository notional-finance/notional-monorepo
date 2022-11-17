import Plausible from 'plausible-tracker';
import axios from 'axios';
import { ethers } from 'ethers';
import { logError } from './error-helpers';

export const GOOGLE_ANALYTICS_ID = 'G-TN4TT2L24X';

// These are hardcoded identifiers for impact.com, an affiliate marketing
// service
const IMPACT_CAMPAIGN_ID = '15620';
const IMPACT_EMAIL_SIGNUP_ID = '30034';
const IMPACT_WALLET_REGISTRATION_ID = '29429';
const IMPACT_TXN_ID = '29430';

export function initPlausible() {
  const plausible = Plausible({
    domain: window.location.hostname,
    apiHost: 'https://plausible.io',
  });
}


export function trackEvent(category: string, props?: Record<string, any>) {
  const { trackEvent } = Plausible();
  trackEvent(category, props);
}

async function postToImpact(payload: Record<string, string>) {
  const formData = new URLSearchParams(payload).toString();
  axios.post('/.netlify/functions/impact-proxy', formData).catch((e) => {
    logError(e, 'tracking-helpers', 'postToImpact');
  });
}

export async function trackImpactEmailSubscribe(
  clickId: string | undefined,
  hasConsent: boolean,
  address?: string
) {
  if (clickId && hasConsent) {
    const id = address || Math.ceil(Math.random() * 1e8).toString();
    const addressHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(id));
    const payload = {
      CampaignId: IMPACT_CAMPAIGN_ID,
      ActionTrackerId: IMPACT_EMAIL_SIGNUP_ID,
      ClickId: clickId,
      EventDate: new Date().toISOString(),
      OrderId: addressHash,
      CustomerId: id,
      CustomerEmail: addressHash,
    };
    postToImpact(payload);
  }
}

export async function trackImpactWalletConnect(
  clickId: string | undefined,
  address: string,
  hasConsent: boolean
) {
  if (clickId && hasConsent) {
    const addressHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(address));
    const payload = {
      CampaignId: IMPACT_CAMPAIGN_ID,
      ActionTrackerId: IMPACT_WALLET_REGISTRATION_ID,
      ClickId: clickId,
      EventDate: new Date().toISOString(),
      OrderId: addressHash,
      CustomerId: address,
      CustomerEmail: addressHash,
    };
    postToImpact(payload);
  }
}

export async function trackImpactTxnSubmit(
  clickId: string | undefined,
  address: string,
  txnHash: string,
  transactionType: string,
  hasConsent: boolean
) {
  if (clickId && hasConsent) {
    const addressHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(address));
    const payload = {
      CampaignId: IMPACT_CAMPAIGN_ID,
      ActionTrackerId: IMPACT_TXN_ID,
      ClickId: clickId,
      EventDate: new Date().toISOString(),
      OrderId: txnHash,
      CustomerId: address,
      CustomerEmail: addressHash,
      Text1: transactionType,
    };
    postToImpact(payload);
  }
}
