import React from 'react';
import { Cloud, Key, Server, Globe, ShieldCheck, Lock } from 'lucide-react';

const SetupGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto space-y-10">
      
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-3xl font-bold text-slate-900">Deployment Guide</h2>
        <p className="text-slate-500 mt-2 text-lg">Follow these exact steps to launch your ReviewVelocity Agency Engine.</p>
      </div>

      {/* STEP 1: GOOGLE CLOUD */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-indigo-700">
           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold">1</div>
           <h3 className="text-xl font-bold">Google Cloud Configuration</h3>
        </div>
        <div className="ml-11 prose prose-slate text-sm text-slate-600 space-y-3">
          <p>You need a single Google Cloud Project to power both the Maps data and the AI intelligence.</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" className="text-indigo-600 font-medium hover:underline">Google Cloud Console</a>.</li>
            <li>Click <strong>Select a project</strong> > <strong>New Project</strong>. Name it "Agency Engine" and click Create.</li>
            <li><strong>Enable Billing:</strong> A billing account is required for the Maps API (even for the free tier). Go to <strong>Billing</strong> in the menu and link a credit card.</li>
          </ol>
        </div>
      </section>

      {/* STEP 2: ENABLE APIs */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-indigo-700">
           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold">2</div>
           <h3 className="text-xl font-bold">Enable Required APIs</h3>
        </div>
        <div className="ml-11 prose prose-slate text-sm text-slate-600 space-y-3">
          <p>Your project needs two specific brains enabled.</p>
          <ul className="space-y-2">
             <li className="flex items-start gap-2">
               <span className="font-bold text-slate-800">A. Places API (New):</span>
               <span>Search for "Places API (New)" in the library and click <strong>Enable</strong>. <span className="text-red-600 font-bold">Crucial:</span> Do not select the old "Places API". Look for the "(New)" tag.</span>
             </li>
             <li className="flex items-start gap-2">
               <span className="font-bold text-slate-800">B. Google Generative Language API:</span>
               <span>Search for "Generative Language API" (often labeled as Gemini) and click <strong>Enable</strong>.</span>
             </li>
          </ul>
        </div>
      </section>

      {/* STEP 3: API KEYS */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-indigo-700">
           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold">3</div>
           <h3 className="text-xl font-bold">Generate Your Keys</h3>
        </div>
        <div className="ml-11 bg-slate-50 p-5 rounded-lg border border-slate-200 text-sm space-y-4">
           <div>
             <h4 className="font-bold text-slate-900 mb-1">Key #1: The Master Key</h4>
             <p className="text-slate-600 mb-2">Go to <strong>Credentials</strong> > <strong>Create Credentials</strong> > <strong>API Key</strong>.</p>
             <p className="text-slate-600">Copy this string. You will use this single key for BOTH services in Vercel to keep things simple.</p>
           </div>
           
           <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
             <strong className="text-yellow-800 block mb-1">Security Note for Production:</strong>
             <p className="text-yellow-700 text-xs">
               Once deployed, edit this key in Google Cloud Console. Under "Application Restrictions", select "Websites" and add your Vercel domain (e.g., <code>https://your-app.vercel.app</code>). This prevents others from stealing your quota.
             </p>
           </div>
        </div>
      </section>

      {/* STEP 4: GITHUB */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-indigo-700">
           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold">4</div>
           <h3 className="text-xl font-bold">Push to GitHub</h3>
        </div>
        <div className="ml-11 text-sm text-slate-600 space-y-2">
           <p>1. Create a new repository on <a href="https://github.com/new" target="_blank" className="text-indigo-600 underline">GitHub.com</a>.</p>
           <p>2. If you are using an IDE, commit all files and push to this new repository.</p>
           <p>3. If you are using Google AI Studio, ensure your code is synced to your GitHub account.</p>
        </div>
      </section>

      {/* STEP 5: VERCEL DEPLOYMENT */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-indigo-700">
           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold">5</div>
           <h3 className="text-xl font-bold">Deploy to Vercel</h3>
        </div>
        <div className="ml-11 bg-slate-900 text-slate-300 p-5 rounded-lg border border-slate-800 text-sm space-y-4 font-mono">
           <p className="text-white font-sans font-bold">1. Log in to Vercel and "Add New Project".</p>
           <p className="text-white font-sans font-bold">2. Import your GitHub repository.</p>
           <p className="text-white font-sans font-bold">3. Expand "Environment Variables" and add these TWO exactly:</p>
           
           <div className="space-y-2 pl-4 border-l-2 border-indigo-500 my-4">
              <div className="flex flex-col">
                <span className="text-indigo-400 font-bold">API_KEY</span>
                <span className="text-xs text-slate-500">Value: (Paste your Google Cloud API Key)</span>
              </div>
              <div className="flex flex-col pt-2">
                <span className="text-indigo-400 font-bold">VITE_GOOGLE_MAPS_API_KEY</span>
                <span className="text-xs text-slate-500">Value: (Paste the SAME Key)</span>
              </div>
           </div>

           <p className="text-white font-sans font-bold">4. Click Deploy.</p>
        </div>
      </section>

      {/* STEP 6: OAUTH CONFIGURATION */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-indigo-700">
           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold">6</div>
           <h3 className="text-xl font-bold">OAuth Configuration (Client Mode)</h3>
        </div>
        <div className="ml-11 bg-slate-50 p-5 rounded-lg border border-slate-200 text-sm space-y-4">
           <div className="flex items-start gap-3">
             <Lock className="w-5 h-5 text-indigo-500 mt-1" />
             <div className="space-y-2 text-slate-600">
               <p>To enable the <strong>Connect Google Business Profile</strong> feature, you must configure the OAuth Consent Screen.</p>
               <ol className="list-decimal pl-5 space-y-2">
                 <li>Go to <strong>APIs & Services</strong> > <strong>OAuth consent screen</strong>. Select "External" and fill in required fields (App Name, Email).</li>
                 <li>Add the scope: <code>https://www.googleapis.com/auth/business.manage</code> manually.</li>
                 <li>Add Test Users: Add your own email address to test it immediately.</li>
                 <li>Go to <strong>Credentials</strong> > <strong>Create Credentials</strong> > <strong>OAuth Client ID</strong>.</li>
                 <li>Application Type: <strong>Web application</strong>.</li>
                 <li>
                   <strong>Authorized Javascript Origins:</strong> Add BOTH:
                   <ul className="list-disc pl-5 mt-1 text-xs font-mono bg-slate-100 p-2 rounded">
                     <li>http://localhost:5173</li>
                     <li>https://your-vercel-app-name.vercel.app (Your Deployment URL)</li>
                   </ul>
                 </li>
                 <li>Copy the <strong>Client ID</strong>. You will paste this into the Dashboard input field or save it as <code>VITE_GOOGLE_CLIENT_ID</code> in Vercel environment variables.</li>
               </ol>
             </div>
           </div>
        </div>
      </section>

       <section className="bg-green-50 p-6 rounded-xl border border-green-100 mt-8">
         <h3 className="text-lg font-bold text-green-800 flex items-center gap-2 mb-2">
           <ShieldCheck className="w-5 h-5" /> 
           Ready for Business
         </h3>
         <p className="text-green-700 text-sm leading-relaxed">
           Once deployed, your application is live and operating in two distinct modes:
           <br/><br/>
           <strong className="text-green-900">1. Prospecting Mode (Sales Tool):</strong><br/>
           This is the default. It uses the public Places API to fetch the 5 most recent reviews for <em>any</em> business you search. It requires no login or special permissions, making it perfect for generating instant value during sales calls.
           <br/><br/>
           <strong className="text-green-900">2. Client Mode (Production Fulfillment):</strong><br/>
           This is the "Agency Grade" engine. When a client signs up, you connect their Google Business Profile via OAuth. This unlocks deep history (25+ reviews) and full 30-day velocity tracking, generating the final production widget code for their live website.
         </p>
       </section>

    </div>
  );
};

export default SetupGuide;