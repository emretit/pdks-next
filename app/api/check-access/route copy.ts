import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Kart numarası user_id olarak geliyor
        const card_number = body.user_id;

        if (!card_number) {
            return NextResponse.json({
                response: "close_relay",
                error: "Kart numarası bulunamadı"
            });
        }

        // Kart okuma kaydını ekle
        const { error: insertError } = await supabase
            .from('card_readings')
            .insert([{
                card_no: card_number,
                device_id: 1
            }]);

        if (insertError) {
            console.error('Kayıt hatası:', insertError);
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

        // Kart numarası kayıtlı ise kapıyı aç
        return NextResponse.json({
            response: employees?.length > 0 ? "open_relay" : "close_relay"
        });

    } catch (error) {
        console.error('API Hatası:', error);
        return NextResponse.json({ response: "close_relay" });
    }
}