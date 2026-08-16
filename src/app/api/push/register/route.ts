import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    const { bookingId, profileId, fcmToken } = await request.json();

    if (!fcmToken) {
      return NextResponse.json({ error: 'Missing fcmToken' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured. Simulating FCM token registration.');
      return NextResponse.json({ success: true, simulated: true });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (bookingId) {
      const { error } = await supabase
        .from('bookings')
        .update({ fcm_token: fcmToken })
        .eq('id', bookingId);
      
      if (error) throw error;
    }

    if (profileId) {
      const { error } = await supabase
        .from('profiles')
        .update({ fcm_token: fcmToken })
        .eq('id', profileId);
      
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Push registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration Error' }, { status: 500 });
  }
}
