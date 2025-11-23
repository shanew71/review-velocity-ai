import React from 'react';
import { BookOpen, Key, DollarSign, Shield, Cloud } from 'lucide-react';

const SetupGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="text-indigo-600" />
          Deployment & Integration Guide
        </h2>
        <p className="text-slate-500 mt-2">Follow these steps to deploy the ReviewVelocity Agency Engine.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-500" /> 
          1. API Setup & Key Generation
        </h3>
        <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-700 space-y-2">
          <p><strong>Google Gemini API:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Go to <a href="https://aistudio.google.com/" target="_blank" className="text-indigo-600 underline">Google AI Studio</a>.</li>
            <li>Sign in and click "Get API Key" in the top left.</li>
            <li>Create a key in a new project (recommended).</li>
            <li>Copy this key string. You will need it for the deployment step.</li>
          </ol>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-indigo-500" /> 
          2. Billing Setup
        </h3>
        <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-700 space-y-2">
           <p>The Gemini API has a free tier, but for production use, you should link a billing account.</p>
           <ol className="list-decimal pl-5 space-y-1">
            <li>Visit the <a href="https://console.cloud.google.com/billing" target="_blank" className="text-indigo-600 underline">Google Cloud Console Billing</a> page.</li>
            <li>Select the project you created in AI Studio.</li>
            <li>Click "Link a Billing Account" and follow the credit card prompts.</li>
            <li><em>Note:</em> The "Flash" model used in this app is highly cost-effective.</li>
           </ol>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" /> 
          3. Authentication (OAuth) for Client Tier
        </h3>
        <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-700 space-y-2">
           <p>The "Client Tier" requires access to the Google Business Profile API.</p>
           <ul className="list-disc pl-5 space-y-2">
             <li>In the Google Cloud Console, navigate to <strong>APIs & Services &gt; Credentials</strong>.</li>
             <li>Create an <strong>OAuth 2.0 Client ID</strong>.</li>
             <li>Set the authorized JavaScript origin to your production URL (e.g., https://your-app.vercel.app).</li>
             <li>Enable the <strong>Google Business Profile Performance API</strong> and <strong>My Business Account Management API</strong> in the Library.</li>
             <li><em>Integration Note:</em> In a full production build, you would replace the "Simulate Auth" button in this code with the `react-google-login` component using this Client ID.</li>
           </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-indigo-500" /> 
          4. Deployment to Vercel
        </h3>
        <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-700 space-y-2">
           <p>This codebase is ready for Vercel.</p>
           <ol className="list-decimal pl-5 space-y-1">
            <li>Push this code to a GitHub repository.</li>
            <li>Log in to Vercel and click "Add New Project".</li>
            <li>Import your GitHub repository.</li>
            <li>In the <strong>Environment Variables</strong> section, add:
                <br/>
                <code>API_KEY</code> = <em>(Paste your Gemini API Key here)</em>
            </li>
            <li>Click <strong>Deploy</strong>.</li>
           </ol>
        </div>
      </section>
    </div>
  );
};

export default SetupGuide;
