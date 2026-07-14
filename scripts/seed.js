const API_URL = 'http://localhost:4000/api';

const USERS = [
  { email: 'alice@ripple.dev', password: 'Password123!', display_name: 'Alice', bio: 'Tech enthusiast & traveler 🌍', avatar_url: 'https://i.pravatar.cc/300?img=1' },
  { email: 'bob@ripple.dev', password: 'Password123!', display_name: 'Bob', bio: 'Just here for the memes', avatar_url: 'https://i.pravatar.cc/300?img=11' },
  { email: 'charlie@ripple.dev', password: 'Password123!', display_name: 'Charlie', bio: 'Photography is my passion 📸', avatar_url: 'https://i.pravatar.cc/300?img=12' },
  { email: 'diana@ripple.dev', password: 'Password123!', display_name: 'Diana', bio: 'Design. Code. Sleep.', avatar_url: 'https://i.pravatar.cc/300?img=5' },
  { email: 'eve@ripple.dev', password: 'Password123!', display_name: 'Eve', bio: 'Always listening...', avatar_url: 'https://i.pravatar.cc/300?img=9' },
  { email: 'frank@ripple.dev', password: 'Password123!', display_name: 'Frank', bio: 'Foodie 🍔', avatar_url: 'https://i.pravatar.cc/300?img=8' },
  { email: 'grace@ripple.dev', password: 'Password123!', display_name: 'Grace', bio: 'Making waves! 🌊', avatar_url: 'https://i.pravatar.cc/300?img=20' },
  { email: 'henry@ripple.dev', password: 'Password123!', display_name: 'Henry', bio: 'Coffee addict ☕', avatar_url: 'https://i.pravatar.cc/300?img=15' },
  { email: 'shiven@gmail.dev', password: 'Password123!', display_name: 'shiven', bio: 'New to Ripple!', avatar_url: 'https://i.pravatar.cc/300?img=26' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function apiCall(endpoint, method, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let retries = 3;
  while (retries > 0) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 429) {
      await sleep(2000);
      retries--;
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      if (res.status === 409) return null; // Ignore conflicts
      throw new Error(`API Error ${res.status} on ${endpoint}: ${err}`);
    }
    return res.json();
  }
  throw new Error(`API Error 429 on ${endpoint}`);
}

async function seed() {
  console.log('🌱 Starting Seed Script...');
  const createdUsers = [];

  // 1. Register & Update Profiles
  for (const u of USERS) {
    try {
      await sleep(500);
      let authRes = await apiCall('/auth/register', 'POST', { email: u.email, password: u.password });
      if (!authRes) {
        authRes = await apiCall('/auth/login', 'POST', { email: u.email, password: u.password });
      } else {
        authRes = await apiCall('/auth/login', 'POST', { email: u.email, password: u.password });
      }

      const token = authRes.accessToken;
      let me = null;
      let retries = 5;
      while (retries > 0 && !me) {
        try {
          await sleep(1000);
          me = await apiCall('/users/me', 'GET', null, token);
        } catch (e) {
          retries--;
        }
      }

      if (!me) throw new Error("Profile creation timeout");

      await apiCall(`/users/${me.id}`, 'PUT', {
        display_name: u.display_name,
        bio: u.bio,
        avatar_url: u.avatar_url
      }, token);

      createdUsers.push({ ...me, token, email: u.email, password: u.password });
      console.log(`✅ Created user: ${u.display_name}`);
    } catch (e) {
      console.error(`❌ Failed to process user ${u.email}:`, e.message);
    }
  }

  // 2. Follow Graph (Alice & Diana are popular)
  console.log('\n🔗 Building Social Graph...');
  const alice = createdUsers.find(u => u.email === 'alice@ripple.dev');
  const diana = createdUsers.find(u => u.email === 'diana@ripple.dev');

  for (const u of createdUsers) {
    if (u.id === alice.id || u.id === diana.id) continue;
    if (alice) { await apiCall(`/users/${alice.id}/follow`, 'POST', null, u.token); await sleep(500); }
    if (diana) { await apiCall(`/users/${diana.id}/follow`, 'POST', null, u.token); await sleep(500); }

    const others = createdUsers.filter(x => x.id !== u.id && x.id !== alice.id && x.id !== diana.id);
    const randomFollow = others[Math.floor(Math.random() * others.length)];
    if (randomFollow) {
      await apiCall(`/users/${randomFollow.id}/follow`, 'POST', null, u.token);
      await sleep(500);
    }
  }

  await sleep(2000);

  // 3. Create Posts
  console.log('\n✍️ Creating Posts...');
  const POST_IDEAS = [
    { u: 'alice@ripple.dev', text: 'Hello Ripple! So excited to be here!', img: 'https://picsum.photos/600/600?random=1' },
    { u: 'bob@ripple.dev', text: 'Does anyone know how to exit vim?', img: null },
    { u: 'charlie@ripple.dev', text: 'Caught a beautiful sunset today.', img: 'https://picsum.photos/600/600?random=2' },
    { u: 'diana@ripple.dev', text: 'Just launched my new portfolio! Check it out.', img: 'https://picsum.photos/600/600?random=3' },
    { u: 'eve@ripple.dev', text: 'Just lurking.', img: null },
    { u: 'frank@ripple.dev', text: 'Making the best burgers tonight!', img: 'https://picsum.photos/600/600?random=4' },
    { u: 'grace@ripple.dev', text: 'Ripple is so fast and smooth! Great job devs.', img: null },
    { u: 'henry@ripple.dev', text: 'Need more coffee.', img: 'https://picsum.photos/600/600?random=5' },
    { u: 'alice@ripple.dev', text: 'Second post! Having fun playing around.', img: null },
    { u: 'diana@ripple.dev', text: 'Design systems are harder than they look.', img: 'https://picsum.photos/600/600?random=6' },
    { u: 'shiven@gmail.dev', text: 'This app is awesome!', img: null }
  ];

  const createdPosts = [];
  for (const post of POST_IDEAS) {
    const user = createdUsers.find(u => u.email === post.u);
    if (user) {
      try {
        const p = await apiCall('/posts', 'POST', { content: post.text, mediaUrl: post.img }, user.token);
        createdPosts.push({ id: p.id, token: user.token });
        console.log(`✅ Post by ${user.email}`);
        await sleep(500);
      } catch (e) {
        console.error(`Failed to post:`, e.message);
      }
    }
  }

  // 4. Likes & Comments
  console.log('\n❤️ Adding interactions...');
  for (const post of createdPosts) {
    const liker = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    await apiCall(`/posts/${post.id}/like`, 'POST', null, liker.token);

    if (Math.random() > 0.5) {
      const commenter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      await apiCall(`/posts/${post.id}/comments`, 'POST', { content: 'Great post!' }, commenter.token);
    }
  }

  // 5. Messages
  console.log('\n💬 Creating Messages...');
  const CONVERSATIONS = [
    { from: 'alice@ripple.dev', to: 'bob@ripple.dev', msgs: ["Hey Bob!", "Did you ever figure out vim?"] },
    { from: 'bob@ripple.dev', to: 'alice@ripple.dev', msgs: ["No... I had to buy a new laptop."] },
    { from: 'diana@ripple.dev', to: 'charlie@ripple.dev', msgs: ["Love that photo!", "What camera do you use?"] },
    { from: 'charlie@ripple.dev', to: 'diana@ripple.dev', msgs: ["Thanks! Sony A7III.", "Want to collab sometime?"] },
    { from: 'frank@ripple.dev', to: 'grace@ripple.dev', msgs: ["Hey Grace!", "Want to grab burgers later?"] }
  ];

  for (const convo of CONVERSATIONS) {
    const sender = createdUsers.find(u => u.email === convo.from);
    const receiver = createdUsers.find(u => u.email === convo.to);
    
    if (sender && receiver) {
      for (const msg of convo.msgs) {
        try {
          await apiCall('/messages', 'POST', { receiverId: receiver.id, content: msg }, sender.token);
          await sleep(800);
        } catch (e) {
          console.error(`Failed to send message: ${e.message}`);
        }
      }
      console.log(`✅ Seeded conversation between ${sender.display_name} and ${receiver.display_name}`);
    }
  }

  console.log('\n🎉 Seed Complete! You can login with any of the following:');
  console.table(createdUsers.map(u => ({ Email: u.email, Password: u.password, Name: u.display_name })));
}

seed().catch(console.error);
