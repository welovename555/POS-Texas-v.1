// Path ที่เรียกใช้ supabaseClient.js ต้องเป็นแบบ relative จากตำแหน่งของ main.js เอง
import { supabase } from './lib/supabaseClient.js';

const app = document.getElementById('app');

if (app) {
    app.innerHTML = '<h1>Texas POS</h1><p>System Ready. Connected.</p>';
    console.log('Application Initialized Successfully!');
    console.log('Supabase instance:', supabase);
} else {
    console.error('Root #app element not found!');
}
