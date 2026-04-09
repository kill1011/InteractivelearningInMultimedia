# Supabase Setup Guide

## Quick Setup Steps

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project: `lvjknbdcemkzndrtpxif`

### Step 2: Create Tables
1. Navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `backend/database/schema.sql`
4. Paste it into the SQL editor
5. Click **Run** button (or press Ctrl+Enter)
6. Wait for success confirmation

### Step 3: Verify Tables
1. Go to **Table Editor** in left sidebar
2. Verify all these tables exist:
   - `auth.users` (auto-created)
   - `users`
   - `lessons`
   - `quizzes`
   - `questions`
   - `quiz_attempts`
   - `progress`
   - `simulations`
   - `achievements`
   - `user_achievements`
   - `leaderboard_cache`

### Step 4: Configure RLS Policies
The policies are included in schema.sql, but you can verify:
1. Go to **Authentication > Policies** for each table
2. Confirm policies are enabled (lock icon should be locked)

### Step 5: Test Connection
Your backend is already configured to:
- Connect to Supabase
- Create seed data on first run
- Initialize achievements

To test, run:
```bash
cd backend
npm run dev
```

You should see:
```
Supabase connection successful
Initializing database...
Database initialized with seed data
Server is running on http://localhost:3001
```

## Environment Variables

Your `.env` files already have the correct keys:

**backend/.env**
```
SUPABASE_URL=https://lvjknbdcemkzndrtpxif.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**app/.env**
```
VITE_SUPABASE_URL=https://lvjknbdcemkzndrtpxif.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Next Steps

### 1. Create Initial Users
In Supabase Dashboard:

**Authentication > Users**
1. Click **Add user**
2. Create instructor account:
   - Email: `instructor@example.com`
   - Password: `your-password`
   - Role: instructor (via users table later)
3. Create student account:
   - Email: `student@example.com`
   - Password: `your-password`
   - Role: student

### 2. Add Sample Lessons
You can populate lessons through:
- The admin UI (once built)
- Direct SQL insert:
```sql
INSERT INTO lessons (title, description, category, duration_minutes, media_type, is_published, instructor_id)
VALUES (
  'Multimedia Basics',
  'Introduction to multimedia concepts',
  'Fundamentals',
  30,
  'text',
  true,
  'instructor-uuid'
);
```

### 3. Connect Frontend
Update `app/src/contexts/AuthContext.tsx`:

```typescript
import { supabase } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 4. Create API Routes (Backend)
Add routes to `backend/server.js`:

```javascript
import { authenticateToken } from './middleware/auth.middleware.js';
import { supabase } from './config/database.js';

// Lessons endpoints
app.get('/api/lessons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('is_published', true)
      .order('order_index');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected: Get user progress
app.get('/api/progress/dashboard', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*, lessons(title, category)')
      .eq('student_id', req.user.id);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Troubleshooting

### Issue: "Cannot find table"
- Ensure schema.sql ran completely without errors
- Check Table Editor to verify table exists

### Issue: "RLS policy denied"
- Verify you're authenticated (token in Authorization header)
- Check that your user ID matches the record you're accessing

### Issue: Seed data not created
- This runs automatically on first backend start
- Check server logs for errors
- Manually insert achievements if needed

### Issue: Port already in use
- Change PORT in `.env` to an available port
- Or: `Get-NetTCPConnection -LocalPort 3001 | Stop-Process -Force`

## Database Backup

Supabase automatically backs up your database, but you can:
1. Go to **Settings > Backups**
2. Create manual backup anytime
3. Download backups for safekeeping

## Performance Tips

1. **Indexes**: Already created for common queries
2. **RLS**: Minimal overhead, essential for security
3. **Connection Pooling**: Supabase handles automatically
4. **Caching**: Use `leaderboard_cache` table for expensive queries

## Support

For Supabase issues: [docs.supabase.com](https://docs.supabase.com)
For project-specific help, refer to `SCHEMA_DOCUMENTATION.md`
