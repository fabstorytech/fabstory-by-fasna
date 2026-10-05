import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cwrcmppwattowaxcjkdf.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, settings: data || null },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.settings) {
      return NextResponse.json({ success: false, error: 'Settings payload is required' }, { status: 400 });
    }

    const settings = body.settings;

    const fullPayload: any = {
      id: 'default',
      hero_desktop_image: settings.heroDesktopImage,
      hero_mobile_image: settings.heroMobileImage,
      hero_title: settings.heroTitle,
      hero_subtitle: settings.heroSubtitle,
      updated_at: new Date().toISOString(),
    };

    if (settings.slide1Active !== undefined) fullPayload.slide1_active = settings.slide1Active;

    if (settings.heroDesktopImage2 !== undefined) fullPayload.hero_desktop_image_2 = settings.heroDesktopImage2;
    if (settings.heroMobileImage2 !== undefined) fullPayload.hero_mobile_image_2 = settings.heroMobileImage2;
    if (settings.heroTitle2 !== undefined) fullPayload.hero_title_2 = settings.heroTitle2;
    if (settings.heroSubtitle2 !== undefined) fullPayload.hero_subtitle_2 = settings.heroSubtitle2;
    if (settings.slide2Active !== undefined) fullPayload.slide2_active = settings.slide2Active;

    if (settings.heroDesktopImage3 !== undefined) fullPayload.hero_desktop_image_3 = settings.heroDesktopImage3;
    if (settings.heroMobileImage3 !== undefined) fullPayload.hero_mobile_image_3 = settings.heroMobileImage3;
    if (settings.heroTitle3 !== undefined) fullPayload.hero_title_3 = settings.heroTitle3;
    if (settings.heroSubtitle3 !== undefined) fullPayload.hero_subtitle_3 = settings.heroSubtitle3;
    if (settings.slide3Active !== undefined) fullPayload.slide3_active = settings.slide3Active;

    if (settings.loginImage !== undefined) fullPayload.login_image = settings.loginImage;
    if (settings.loginTitle !== undefined) fullPayload.login_title = settings.loginTitle;
    if (settings.loginSubtitle !== undefined) fullPayload.login_subtitle = settings.loginSubtitle;

    // Upsert using Supabase Service Role client to bypass RLS restrictions
    let { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert([fullPayload], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[Site Settings API] Full payload upsert failed, retrying core columns:', error.message);
      const corePayload: any = {
        id: 'default',
        hero_desktop_image: settings.heroDesktopImage,
        hero_mobile_image: settings.heroMobileImage,
        hero_title: settings.heroTitle,
        hero_subtitle: settings.heroSubtitle,
        updated_at: new Date().toISOString(),
      };
      if (settings.loginImage !== undefined) corePayload.login_image = settings.loginImage;
      if (settings.loginTitle !== undefined) corePayload.login_title = settings.loginTitle;
      if (settings.loginSubtitle !== undefined) corePayload.login_subtitle = settings.loginSubtitle;

      const retryRes = await supabaseAdmin
        .from('site_settings')
        .upsert([corePayload], { onConflict: 'id' })
        .select();

      if (retryRes.error) {
        console.error('[Site Settings API] Core payload upsert error:', retryRes.error);
        return NextResponse.json({ success: false, error: retryRes.error.message }, { status: 500 });
      }
      data = retryRes.data;
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[Site Settings API] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
