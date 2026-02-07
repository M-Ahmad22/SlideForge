import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { action, targetUserId, secretKey } = await req.json();

    // For setup-first-admin action, verify the secret key
    if (action === 'setup-first-admin') {
      // Check if any admin exists
      const { data: existingAdmins, error: checkError } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (checkError) throw checkError;

      if (existingAdmins && existingAdmins.length > 0) {
        return new Response(JSON.stringify({ 
          error: 'An admin already exists. Use the admin dashboard to manage roles.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate the secret key (using a simple hash of the service role key)
      // In production, you might want a more sophisticated approach
      const validSecret = `slideforge-setup-${supabaseServiceKey.slice(0, 8)}`;
      
      if (secretKey !== validSecret) {
        console.log('Expected:', validSecret, 'Got:', secretKey);
        return new Response(JSON.stringify({ 
          error: 'Invalid secret key for admin setup' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!targetUserId) {
        return new Response(JSON.stringify({ 
          error: 'Target user ID is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Promote the user to admin
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: targetUserId, role: 'admin' });

      if (insertError) throw insertError;

      // Also create a subscription entry for the admin
      const { error: subError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({ 
          user_id: targetUserId, 
          plan: 'enterprise', 
          max_slides: 999 
        });

      // Ignore subscription error if already exists
      console.log('Admin setup complete for user:', targetUserId);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Admin account created successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-setup:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to perform admin action' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
