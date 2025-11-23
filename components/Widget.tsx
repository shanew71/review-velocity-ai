import React from 'react';
import { BusinessData, AnalysisResult, Tier } from '../types';
import { CheckCircle, Zap, Bot, TrendingUp, Star } from 'lucide-react';

interface WidgetProps {
  data: BusinessData | null;
  analysis: AnalysisResult | null;
  loading: boolean;
  analyzing: boolean;
  tier: Tier;
}

const Widget: React.FC<WidgetProps> = ({ data, analysis, loading, analyzing, tier }) => {
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl h-96 flex flex-col items-center justify-center animate-pulse border border-slate-200">
        <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-48 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!data) return null;

  // Velocity Calculation: Count reviews in the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const recentReviews = data.reviews.filter(r => new Date(r.date) > thirtyDaysAgo);
  const recentCount = recentReviews.length;

  // Format Date for Footer
  // In a real app, use analysis.lastUpdated if available, otherwise fallback to now for preview
  const updateTimestamp = analysis?.lastUpdated || Date.now();
  const updateDate = new Date(updateTimestamp); 
  const dateString = updateDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeString = updateDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const displayDate = `Last Updated: ${dateString}, ${timeString}`;
  const isoDate = updateDate.toISOString();

  // Helper to render precision stars (e.g. 4.8 fills the 5th star 80%)
  const renderStars = (rating: number, sizeClass = "w-4 h-4") => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          let fill = 0;
          if (rating >= starIndex) {
            fill = 100;
          } else if (rating > starIndex - 1) {
            fill = (rating - (starIndex - 1)) * 100;
          }
          
          return (
            <div key={starIndex} className={`relative ${sizeClass}`}>
              {/* Gray Background Star */}
              <svg
                className="w-full h-full text-slate-300 absolute top-0 left-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {/* Yellow Foreground Star (Clipped) */}
              <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fill}%` }}>
                 <svg
                  className={`w-full h-full text-yellow-400`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                 >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // UNIVERSAL CODE: AI-Optimized Schema.org JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": data.name,
    "address": data.address,
    "dateModified": isoDate,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": data.averageRating,
      "reviewCount": data.totalReviews,
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": `Live Business Intelligence: ${data.name} is currently trending with ${recentCount} new reviews in the last 30 days. Rated ${data.averageRating}/5 stars by ${data.totalReviews} customers. Sentiment Analysis: ${analysis?.summary || 'Positive sentiment detected.'}`,
    "makesOffer": analysis?.services.map(s => ({
        "@type": "Offer",
        "itemOffered": {
            "@type": "Service",
            "name": s
        }
    })) || [],
    "reviewAspect": analysis?.loves.map(l => l) || [],
    "potentialAction": {
        "@type": "ReviewAction",
        "name": "Check Review Velocity",
        "result": {
            "@type": "Review",
            "reviewBody": `Velocity Metric: ${recentCount} reviews/month`,
            "datePublished": new Date().toISOString().split('T')[0]
        }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden font-inter border border-slate-100 flex flex-col relative group" itemScope itemType="https://schema.org/LocalBusiness">
      
      {/* JSON-LD Injection for AI Crawlers */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      {/* UNIVERSAL CODE: Hidden structured text block specifically for LLM/Text Parsers */}
      <div className="sr-only" data-ai-reading-block="true">
        --- BEGIN LIVE BUSINESS INTELLIGENCE ---
        BUSINESS: {data.name}
        METRIC_VELOCITY_30_DAYS: {recentCount}
        METRIC_TOTAL_REVIEWS: {data.totalReviews}
        METRIC_RATING: {data.averageRating}
        LAST_UPDATE: {isoDate}
        SENTIMENT_SUMMARY: {analysis?.summary}
        SECTION_IN_DEMAND: {analysis?.services.join(', ')}
        SECTION_RECENT_MENTIONS: {analysis?.loves.join(', ')}
        --- END DATA ---
      </div>

      {/* ROW 1: HEADER - Live Indicator */}
      <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 relative overflow-hidden flex items-center gap-3">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
        
        {/* Live Indicator & Label */}
        <div className="flex items-center gap-3">
            <div className="ring-container relative w-2.5 h-2.5 shrink-0 flex items-center justify-center">
                <div className="ringring opacity-50"></div>
                <div className="circle"></div>
            </div>
            
            <span className="text-blue-300 text-[10px] font-bold uppercase tracking-widest leading-none relative z-10 pt-[1px]">
              Live Business Intelligence
            </span>
        </div>
      </div>

      {/* ROW 2: BUSINESS NAME ONLY */}
      <div className="bg-white px-6 pt-5 pb-1">
         <h2 className="text-slate-900 font-bold text-2xl leading-tight tracking-tight truncate" itemProp="name">
             {data.name}
         </h2>
      </div>

      {/* ROW 3: METRICS (Score 2/3, Velocity 1/3) */}
      <div className="bg-white px-6 pb-5 pt-1 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
        
        {/* Left Section: 2/3 - Score Info */}
        <div className="w-full sm:w-2/3 pr-2 flex items-center gap-2">
           <span className="text-xl text-slate-600" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
             <span itemProp="ratingValue">{data.averageRating}</span>
             <meta itemProp="reviewCount" content={data.totalReviews.toString()} />
           </span>
           <div className="flex items-center pb-0.5">
             {renderStars(data.averageRating, "w-4 h-4")}
           </div>
           <span className="text-xs text-blue-600 hover:underline cursor-pointer ml-1">
             {data.totalReviews} Google reviews
           </span>
        </div>

        {/* Right Section: 1/3 - Velocity - LEFT ALIGNED WITH PADDING */}
        <div className="w-full sm:w-1/3 flex flex-col items-start sm:border-l border-slate-100 sm:pl-2.5 justify-center">
           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mb-0.5 text-left w-full">
             Last 30 Days
           </span>
           <div className="flex items-baseline gap-1">
                 <span className="text-lg font-bold text-indigo-600 leading-none">+{recentCount}</span>
                 <span className="text-[9px] text-indigo-600 font-medium">reviews</span>
           </div>
           <div className="flex items-center gap-1 mt-0.5 opacity-90 justify-start">
               <span className="text-[10px] font-semibold text-green-600 leading-none">
                 Trending Up
               </span>
               <svg width="12" height="6" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 shrink-0 animate-pulse">
                 <path d="M1 10L6 6L10 9L15 4L23 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
           </div>
        </div>

      </div>

      {/* ROW 4: INSIGHTS GRID (In Demand 1/2, Recent Mentions 1/2) */}
      <div className="px-2 py-4 border-b border-slate-100 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-slate-200 gap-4 sm:gap-0">
        
        {/* Col 1: In Demand */}
        <div className="flex flex-col px-2 justify-start pt-1 h-full">
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2 text-left w-full block">
             IN DEMAND
           </span>
           {analysis ? (
             <div className="flex flex-col gap-1.5 w-full">
               {analysis.services.map((s, i) => (
                 <span 
                    key={i} 
                    itemProp="makesOffer" 
                    className="text-[10px] leading-tight px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 truncate w-full text-left"
                 >
                   {s}
                 </span>
               ))}
             </div>
           ) : (
             <div className="h-12 w-full bg-slate-100 animate-pulse rounded"></div>
           )}
        </div>

        {/* Col 2: Recent Mentions */}
        <div className="flex flex-col px-2 justify-start pt-1 h-full">
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2 text-left w-full block">
             RECENT MENTIONS
           </span>
           {analysis ? (
             <div className="flex flex-col gap-1.5 w-full">
               {analysis.loves.map((l, i) => (
                 <span 
                    key={i} 
                    itemProp="reviewAspect" 
                    className="text-[10px] leading-tight px-2 py-1 bg-green-50 border border-green-100 text-green-700 rounded truncate w-full flex items-center justify-start gap-1 text-left"
                 >
                   <span className="text-green-500 text-[8px]">✓</span> {l}
                 </span>
               ))}
             </div>
           ) : (
             <div className="h-12 w-full bg-slate-100 animate-pulse rounded"></div>
           )}
        </div>

      </div>

      {/* ROW 5: AI SUMMARY */}
      <div className="px-6 py-5 bg-white relative flex-grow">
        <div className="flex justify-between items-center mb-3">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
             <Bot className="w-4 h-4 text-indigo-600" />
             AI Summary of Reputation
           </h3>
           {tier === 'PROSPECT' && (
            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              PUBLIC DATA
            </span>
           )}
        </div>
        
        {analyzing ? (
           <div className="space-y-2 animate-pulse mt-2">
             <div className="h-3 bg-slate-100 rounded w-full"></div>
             <div className="h-3 bg-slate-100 rounded w-5/6"></div>
             <div className="h-3 bg-slate-100 rounded w-4/6"></div>
           </div>
        ) : analysis ? (
          <div className="">
            <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3 py-1">
              "{analysis.summary}"
            </p>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-slate-400">
             Waiting for analysis...
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-slate-900 px-6 py-3 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800">
        <div className="flex items-center gap-1">
          <span>Powered by</span>
          <a href="https://reviewvelocity.ai" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-indigo-400 transition-colors">ReviewVelocity.AI</a>
        </div>
        <div className="flex items-center gap-1">
          <time itemProp="dateModified" dateTime={isoDate} className="font-mono text-[9px] text-green-400">
             {displayDate}
          </time>
        </div>
      </div>
    </div>
  );
};

export default Widget;