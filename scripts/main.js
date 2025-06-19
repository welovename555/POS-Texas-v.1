import { supabase } from './lib/supabaseClient.js';

const app = document.getElementById('app');

function initializeApp() {
  if (!app) {
    console.error('Error: #app element not found!');
    return;
  }

  app.innerHTML = '<h1>Texas POS</h1><p>System Ready. Connected.</p>';
  console.log('Application Initialized Successfully!');
  console.log('Supabase instance:', supabase);
}

// Start the app
initializeApp();
