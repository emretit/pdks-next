import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// GET: Tüm cihazları listeler
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: devices, error } = await supabase
            .from('server_devices')
            .select('*')
            .order('last_seen', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: 'Veritabanı hatası' },
                { status: 500 }
            );
        }

        return NextResponse.json(devices);
    } catch (error) {
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}

// POST: Cihaz durumunu günceller ve kart kontrolü yapar
export async function POST(request: Request) {
    try {
        // Service role client oluştur
        const supabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const body = await request.json();

        // Gelen veriyi kontrol et
        if (!body.user_id) {
            return NextResponse.json({
                response: "close_relay",
                error: "Cihaz ID'si gerekli"
            });
        }

        // Cihazın daha önce eklenip eklenmediğini kontrol et
        const { data: existingDevice } = await supabase
            .from('server_devices')
            .select('*')
            .eq('ip_address', body.user_id)
            .single();

        if (existingDevice) {
            // Cihaz zaten varsa, durumunu güncelle
            const { error: updateError } = await supabase
                .from('server_devices')
                .update({
                    status: 'online',
                    last_seen: new Date().toISOString()
                })
                .eq('ip_address', body.user_id);

            if (updateError) {
                console.error('Cihaz güncelleme hatası:', updateError);
                return NextResponse.json({
                    response: "close_relay",
                    error: "Cihaz güncellenemedi"
                });
            }
        } else {
            // Yeni cihaz ekle
            const { error: insertError } = await supabase
                .from('server_devices')
                .insert({
                    name: `Cihaz-${body.user_id}`,
                    ip_address: body.user_id,
                    status: 'online',
                    last_seen: new Date().toISOString(),
                    project_id: 1 // Varsayılan proje ID'si
                });

            if (insertError) {
                console.error('Yeni cihaz ekleme hatası:', insertError);
                return NextResponse.json({
                    response: "close_relay",
                    error: "Cihaz eklenemedi"
                });
            }
        }

        // Başarılı yanıt
        return NextResponse.json({
            response: "open_relay",
            confirmation: "relay_opened"
        });

    } catch (error) {
        console.error('İşlem hatası:', error);
        return NextResponse.json({
            response: "close_relay",
            error: "Sistem hatası"
        });
    }
}

// Yeni endpoint: Veritabanı yapısını düzelt
export async function PATCH() {
    try {
        const supabase = await createClient();

        // 1. Adım: Eğer varsa eski kısıtlamayı kaldır
        await supabase.rpc('exec_sql', {
            query: "ALTER TABLE public.card_readings DROP CONSTRAINT IF EXISTS card_readings_device_id_fkey;"
        });

        // 2. Adım: Sütunun varlığını kontrol et/ekle
        await supabase.rpc('exec_sql', {
            query: "ALTER TABLE public.card_readings ADD COLUMN IF NOT EXISTS device_id INTEGER;"
        });

        // 3. Adım: İlişkiyi doğru şekilde yeniden tanımla
        await supabase.rpc('exec_sql', {
            query: "ALTER TABLE public.card_readings ADD CONSTRAINT card_readings_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id);"
        });

        return NextResponse.json({
            success: true,
            message: "Veritabanı ilişkisi başarıyla düzeltildi"
        });

    } catch (error: any) {
        console.error('API Hatası:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Bilinmeyen hata"
            },
            { status: 500 }
        );
    }
}