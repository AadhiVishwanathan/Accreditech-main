import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client for user management
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const evaluatorsData = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@aicte.gov.in',
        expertise: ['Computer Science', 'Artificial Intelligence', 'Data Science'],
        experience_years: 15,
        location: 'Delhi',
        workload: 3,
        max_workload: 8,
        phone: '+91 9876543210'
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@aicte.gov.in',
        expertise: ['Information Technology', 'Software Engineering', 'Database Systems'],
        experience_years: 12,
        location: 'Mumbai',
        workload: 6,
        max_workload: 10,
        phone: '+91 9876543211'
      },
      {
        name: 'Prof. Amit Verma',
        email: 'amit.verma@aicte.gov.in',
        expertise: ['Electronics', 'VLSI Design', 'Computer Networks'],
        experience_years: 20,
        location: 'Bangalore',
        workload: 8,
        max_workload: 8,
        phone: '+91 9876543212'
      }
    ]

    const results = []

    for (const evaluator of evaluatorsData) {
      try {
        console.log(`Creating user for ${evaluator.email}`)
        
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: evaluator.email,
          password: 'admin123',
          email_confirm: true,
          user_metadata: {
            name: evaluator.name,
            user_type: 'evaluator'
          }
        })

        if (authError) {
          console.error(`Auth error for ${evaluator.email}:`, authError)
          results.push({ email: evaluator.email, status: 'error', error: authError.message })
          continue
        }

        console.log(`Auth user created for ${evaluator.email}:`, authData.user?.id)

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            user_id: authData.user!.id,
            user_type: 'evaluator'
          })

        if (profileError) {
          console.error(`Profile error for ${evaluator.email}:`, profileError)
        }

        // Create evaluator record
        const { error: evaluatorError } = await supabaseAdmin
          .from('evaluators')
          .upsert({
            user_id: authData.user!.id,
            name: evaluator.name,
            email: evaluator.email,
            expertise: evaluator.expertise,
            experience_years: evaluator.experience_years,
            location: evaluator.location,
            workload: evaluator.workload,
            max_workload: evaluator.max_workload,
            phone: evaluator.phone,
            is_active: true
          })

        if (evaluatorError) {
          console.error(`Evaluator record error for ${evaluator.email}:`, evaluatorError)
          results.push({ 
            email: evaluator.email, 
            status: 'partial', 
            error: `Evaluator record error: ${evaluatorError.message}`,
            userId: authData.user!.id
          })
        } else {
          results.push({ 
            email: evaluator.email, 
            status: 'success',
            userId: authData.user!.id
          })
        }

      } catch (error) {
        console.error(`Error creating evaluator ${evaluator.email}:`, error)
        results.push({ email: evaluator.email, status: 'error', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Evaluator creation process completed',
        results 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})