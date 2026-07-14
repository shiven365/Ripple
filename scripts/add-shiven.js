const API_URL = 'http://localhost:4000/api';

async function apiCall(endpoint, method, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 409) return { exists: true }; 
    throw new Error(`API Error ${res.status} on ${endpoint}: ${err}`);
  }
  return res.json();
}

async function run() {
  console.log('Registering shiven@gmail.dev...');
  
  const user = { 
    email: 'shiven@gmail.dev', 
    password: 'Password123!', 
    username: 'shiven40gmail.com' 
  };
  
  try {
    let authRes = await apiCall('/auth/register', 'POST', user);
    if (authRes.exists) {
      console.log('User already registered!');
    } else {
      console.log('Successfully registered user!');
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}

run();
