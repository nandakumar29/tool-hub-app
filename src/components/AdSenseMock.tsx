import React, { useEffect } from 'react';

interface AdSenseAdProps {
  slot: 'header' | 'sidebar' | 'in-content' | 'footer';
  className?: string;
  adClientCode?: string; // Optional user client key
}

export default function AdSenseAd({ slot, className = '', adClientCode }: AdSenseAdProps) {
  const activePubId = adClientCode || localStorage.getItem('adsense_publisher_id') || 'pub-9566966001308351';
  const formattedClient = activePubId.startsWith('pub-') ? `ca-${activePubId}` : activePubId;
  const isProductionMode = localStorage.getItem('adsense_ad_mode') !== 'simulation';

  // Push individual ad block initialization to window array for real live delivery
  useEffect(() => {
    if (isProductionMode) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Safe catch for local sandbox environment missing global scripts
      }
    }
  }, [isProductionMode, activePubId, slot]);

  const getStyle = () => {
    switch (slot) {
      case 'header':
        return {
          height: '90px',
          label: 'Responsive Header Ad Leaderboard (728x90 / 970x90)',
          color: 'border-blue-200 bg-blue-50/40 text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/10',
          slotId: '2026062101'
        };
      case 'sidebar':
        return {
          height: '250px',
          label: 'Responsive Sidebar Banner (300x250 / 300x600)',
          color: 'border-emerald-200 bg-emerald-50/30 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/10',
          slotId: '2026062102'
        };
      case 'footer':
        return {
          height: '90px',
          label: 'Responsive Footer Ad Frame (728x90)',
          color: 'border-zinc-200 bg-zinc-50/50 text-zinc-650 dark:border-zinc-800 dark:bg-zinc-950/20',
          slotId: '2026062103'
        };
      case 'in-content':
      default:
        return {
          height: '140px',
          label: 'In-Content Contextual Ad Slot (Native / Dynamic Matching)',
          color: 'border-indigo-200 bg-indigo-50/30 text-indigo-800 dark:border-indigo-900/30 dark:bg-indigo-950/10',
          slotId: '2026062104'
        };
    }
  };

  const current = getStyle();
  
  // Clean, elegant AdSense delivery
  if (isProductionMode) {
    /* Pure Google AdSense compliant layout for direct monetization success on public hosting. 
       No wrapping div or forced min-heights are used so that unfilled slots naturally collapse and consume zero layout space. */
    return (
      <ins
        className={`adsbygoogle block w-full text-center overflow-hidden h-0 empty:h-0 ${className}`}
        style={{ display: 'block', height: 'auto', minHeight: '0px' }}
        data-ad-client={formattedClient}
        data-ad-slot={current.slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        id={`adsense-panel-${slot}`}
      />
    );
  }

  /* Returning null for simulation/mock mode to completely eliminate any unwanted blank sections, 
     dashed placeholder boxes, or empty layout spaces during development and evaluation. */
  return null;
}
