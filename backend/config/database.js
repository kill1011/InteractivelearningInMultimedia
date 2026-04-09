import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    console.log('Supabase connection successful');
  } catch (error) {
    console.error('Supabase connection failed:', error.message);
  }
};

const initDatabase = async () => {
  try {
    console.log('Note: Supabase tables should be created via SQL Editor or migrations.');
    console.log('Ensure the following tables exist in your Supabase project:');
    console.log('- users, lessons, quizzes, questions, quiz_attempts');
    console.log('- progress, simulations, achievements, user_achievements');
    
    // Insert seed data if tables are empty
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError || !existingUsers || existingUsers.length === 0) {
      console.log('Seeding initial data...');
      
      // Create default instructor via Supabase Auth
      const { data: instructorAuth, error: instructorErr } = await supabase.auth.admin.createUser({
        email: 'instructor@multimedia.edu',
        password: 'instructor123',
        email_confirm: true
      });

      if (!instructorErr && instructorAuth?.user) {
        await supabase.from('users').insert([{
          id: instructorAuth.user.id,
          username: 'instructor',
          email: 'instructor@multimedia.edu',
          full_name: 'Default Instructor',
          role: 'instructor'
        }]);
      }

      // Create default student via Supabase Auth
      const { data: studentAuth, error: studentErr } = await supabase.auth.admin.createUser({
        email: 'student@multimedia.edu',
        password: 'student123',
        email_confirm: true
      });

      if (!studentErr && studentAuth?.user) {
        await supabase.from('users').insert([{
          id: studentAuth.user.id,
          username: 'student',
          email: 'student@multimedia.edu',
          full_name: 'Default Student',
          role: 'student'
        }]);
      }

      // Insert sample data
      await supabase.from('lessons').insert([
        {
          title: 'Introduction to Multimedia Systems',
          description: 'Overview of multimedia systems, components, and applications in modern computing.',
          content: '<h2>What is Multimedia?</h2><p>Multimedia refers to content that uses multiple content forms such as text, audio, images, animations, and video.</p>',
          category: 'Fundamentals',
          order_index: 1,
          duration_minutes: 30,
          media_type: 'text',
          is_published: true
        },
        {
          title: 'Digital Image Fundamentals',
          description: 'Understanding digital images, pixels, resolution, and color models.',
          content: '<h2>Digital Image Basics</h2><p>A digital image is a numeric representation of a two-dimensional image.</p>',
          category: 'Images',
          order_index: 2,
          duration_minutes: 45,
          media_type: 'interactive',
          is_published: true
        }
      ]);

      console.log('Database initialized with seed data');
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Helper functions for common operations
const db = {
  from: (table) => supabase.from(table),
  auth: supabase.auth,
  realtime: supabase.realtime
};

export { supabase, db, testConnection, initDatabase };
