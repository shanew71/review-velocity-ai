import React from 'react';
import { BusinessData, AnalysisResult, Tier } from '../types';
import { CheckCircle, Bot, Star } from 'lucide-react';

interface WidgetProps {
  data: BusinessData | null;
  analysis: AnalysisResult | null;
  loading: boolean;
  analyzing: boolean;
  tier: Tier;
  error?: string | null;
}

const Widget: React.FC<WidgetProps> = ({ data, analysis, loading, analyzing, tier, error }) => {
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

  // DEBUG: Log the dates to see why count is wrong
  console.log("📅 DEBUG VELOCITY CALCULATION:");
  console.log("Now:", now.toISOString());
  console.log("30 Days Ago:", thirtyDaysAgo.toISOString());
  data.reviews.forEach(r => console.log(`Review Date: ${r.date} | Is Recent? ${new Date(r.date) > thirtyDaysAgo}`));

  const recentReviews = data.reviews.filter(r => new Date(r.date) > thirtyDaysAgo);
  const recentCount = recentReviews.length;

  // Format Date for Footer
  const updateTimestamp = analysis?.lastUpdated || Date.now();
  const updateDate = new Date(updateTimestamp);
  // User friendly display string: Nov 25, 10:29 AM
  const dateString = updateDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeString = updateDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const displayDate = `Last Updated: ${dateString}, ${timeString}`;
  // ISO string for machines
  const isoDate = updateDate.toISOString();

  // Helper to render precision stars
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

  // Prepare display data (with fallback mocks for preview)
  const servicesToShow = (analysis && analysis.services.length > 0)
    ? analysis.services
    : ['Dental Implants', 'Invisalign', 'Cosmetic Dentistry', 'Emergency Care', 'Crowns'];

  const lovesToShow = (analysis && analysis.loves.length > 0)
    ? analysis.loves
    : ['Professional Staff', 'Clean Office', 'Gentle Care', 'Modern Tech'];

  let summaryToShow = "Analyzing recent customer reviews to generate reputation summary...";
  if (analysis?.summary) {
    summaryToShow = analysis.summary;
  } else if (!analyzing && error) {
    summaryToShow = "AI Analysis unavailable at this time.";
  }

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
    "description": `Live Business Intelligence: ${data.name} is currently trending with ${recentCount} new reviews in the last 30 days. Rated ${data.averageRating}/5 stars. Sentiment: ${summaryToShow}.`,
    "makesOffer": servicesToShow.map(s => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": s
      }
    })),
    "reviewAspect": lovesToShow
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden font-inter border border-slate-200 flex flex-col relative group" itemScope itemType="https://schema.org/LocalBusiness">

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
        SENTIMENT_SUMMARY: {summaryToShow}
        SECTION_SERVICES: {servicesToShow.join(', ')}
        SECTION_LOVES: {lovesToShow.join(', ')}
        --- END DATA ---
      </div>

      {/* ROW 1: HEADER (Dark Blue Gradient) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 flex items-center gap-3 relative overflow-hidden">
        {/* Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="ring-container relative w-3 h-3 shrink-0 flex items-center justify-center">
            <div className="ringring opacity-50"></div>
            <div className="circle"></div>
          </div>

          <span className="text-blue-300 text-[10px] font-bold uppercase tracking-widest leading-none relative z-10 pt-[1px]">
            LIVE BUSINESS INTELLIGENCE
          </span>
        </div>
      </div>

      {/* ROW 2: BUSINESS NAME (Black, Bold, Full Width) */}
      <div className="bg-white px-6 pt-5 pb-1">
        <h2 className="text-black font-bold text-2xl leading-tight tracking-tight truncate" itemProp="name">
          {data.name}
        </h2>
      </div>

      {/* ROW 3: METRICS (Split 2/3 and 1/3) */}
      <div className="bg-white px-6 pb-5 pt-2 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">

        {/* Left Section: 2/3 - Score Info */}
        <div className="w-full sm:w-2/3 pr-2 flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
          <span className="text-lg text-slate-600 font-semibold flex items-baseline gap-0.5" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
            <span className="font-bold text-slate-700" itemProp="ratingValue">{data.averageRating}</span>
            <span className="text-xs text-slate-400 font-medium">/5</span>
          </span>

          {/* Stars */}
          {renderStars(data.averageRating, "w-3.5 h-3.5")}

          {/* Review Count Text (No Link) */}
          <span className="text-blue-600 text-xs sm:text-sm font-medium ml-0.5" itemProp="reviewCount">
            {data.totalReviews} Google reviews
          </span>
        </div>

        {/* Right Section: 1/3 - Velocity Metric */}
        <div className="w-full sm:w-1/3 border-l-0 sm:border-l border-slate-100 pl-0 sm:pl-4 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">LAST 30 DAYS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-600">+{recentCount} <span className="text-sm font-medium text-indigo-600">reviews</span></span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-green-600 font-medium">Trending Up</span>
            {/* Custom SVG for Kinked Line Graph (No Arrow Head) */}
            <svg
              className="w-5 h-4 text-green-500 animate-pulse-deep"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 16 10 16 21 5" />
            </svg>
          </div>
        </div>
      </div>

      {/* ROW 4: AI SUMMARY */}
      <div className="bg-white px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Summary of Reputation</h3>
        </div>
        <div className="pl-4 border-l-4 border-indigo-200">
          <p className={`text-sm leading-relaxed italic ${!analyzing && error ? 'text-red-500' : 'text-slate-600'}`}>
            "{summaryToShow}"
          </p>
        </div>
      </div>

      {/* ROW 5: INSIGHTS GRID (Split 1/2 and 1/2) */}
      <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row gap-6">

        {/* Column 1: In Demand (Vertical List) */}
        <div className="w-full sm:w-1/2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">In Demand</h4>
          <div className="flex flex-col gap-2 items-start">
            {servicesToShow.slice(0, 5).map((s, i) => (
              <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 font-medium shadow-sm w-full truncate">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Column 2: Recent Mentions (Pills) */}
        <div className="w-full sm:w-1/2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Mentions</h4>
          <div className="flex flex-wrap gap-2">
            {lovesToShow.slice(0, 5).map((l, i) => (
              <span key={i} className="px-2 py-1 bg-green-50 border border-green-100 rounded text-xs text-indigo-700 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" /> {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 6: FOOTER */}
      <div className="bg-black px-6 py-3 flex flex-col sm:flex-row justify-between items-center text-[10px] gap-2 sm:gap-0">
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Powered by</span>
          <a href="https://reviewvelocity.ai" target="_blank" className="text-white font-bold hover:text-slate-200 transition-colors">
            ReviewVelocity.AI
          </a>
        </div>
        <div>
          {/* Semantic Timestamp for AI Freshness Proof */}
          <time itemProp="dateModified" dateTime={isoDate} className="font-mono text-green-500">
            {displayDate}
          </time>
        </div>
      </div>

    </div>
  );
};

export default Widget;
