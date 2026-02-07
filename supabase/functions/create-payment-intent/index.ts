// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This function creates a Stripe PaymentIntent for the Charter Legacy checkout.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

console.log('Payment Intent Function Loaded')

serve(async (req) => {
  // CORS Headers for Frontend Access
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle Preflight Request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Parse Request Body
    const { packageId, userId } = await req.json()

    if (!packageId || !userId) {
      throw new Error('Missing packageId or userId')
    }

    // 2. Determine Price (Server-Side Validation prevent tampering)
    let amount = 0
    let description = ''

    switch (packageId) {
        case 'founder':
            amount = 24900 // $249.00
            description = 'Standard LLC Package'
            break
        case 'medical':
            amount = 49900 // $499.00
            description = 'Medical PLLC Package'
            break
        case 'contractor':
            amount = 59900 // $599.00
            description = 'Contractor LLC Package'
            break
        case 'will':
            amount = 39900 // $399.00
            description = 'Legacy Will Package'
            break
        default:
            throw new Error('Invalid Package ID')
    }

    // 3. Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId,
        packageId: packageId,
        product: description
      }
    })

    // 4. Return Client Secret to Frontend
    return new Response(
      JSON.stringify({ 
          clientSecret: paymentIntent.client_secret,
          amount: amount,
          description: description
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
