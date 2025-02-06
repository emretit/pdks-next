import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
        const supabase = await createClient();
        const body = await request.json();
        const clientIP = request.headers.get('x-forwarded-for') || 'bilinmiyor';

        // IP adresini düzelt
        const cleanIP = clientIP.replace('::ffff:', '');

        // IP adresine göre cihazı bul
        const { data: deviceData, error: deviceError } = await supabase
            .from('server_devices')
            .select('*')
            .eq('ip_address', cleanIP)
            .single();

        if (deviceData) {
            // Mevcut cihazı güncelle
            const { error: updateError } = await supabase
                .from('server_devices')
                .update({
                    status: 'online',
                    last_seen: new Date().toISOString(),
                    last_request_time: new Date().toISOString()
                })
                .eq('id', deviceData.id);

            if (updateError) {
                console.error('Cihaz güncelleme hatası:', updateError);
            }
        } else {
            // Yeni cihaz ekle
            const { error: insertError } = await supabase
                .from('server_devices')
                .insert([{
                    name: `Cihaz-${cleanIP}`,
                    ip_address: cleanIP,
                    status: 'online',
                    last_seen: new Date().toISOString(),
                    last_request_time: new Date().toISOString()
                }]);

            if (insertError) {
                console.error('Yeni cihaz ekleme hatası:', insertError);
            }
        }

        // Kart kontrolü ve diğer işlemler...
        const card_number = body.user_id;
        if (!card_number) {
            return NextResponse.json({
                response: "close_relay",
                error: "Kart numarası bulunamadı"
            });
        }

        // Çalışan kontrolü
        const { data: employees, error } = await supabase
            .from("employees")
            .select("card_number")
            .eq("card_number", card_number);

        if (error) {
            console.error('Sorgu hatası:', error);
            return NextResponse.json({ response: "close_relay" });
        }

        return NextResponse.json({
            response: employees?.length > 0 ? "open_relay" : "close_relay"
        });

    } catch (error) {
        console.error('API Hatası:', error);
        return NextResponse.json({ response: "close_relay" });
    }
}