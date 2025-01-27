import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        return NextResponse.json({
            message: 'Hoş geldiniz!',
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        // Request body'i JSON olarak al
        const body = await request.json()

        // Body'i konsola logla
        console.log('Gelen POST isteği:', body)

        if (body.user_id === "309211491") {
            return NextResponse.json({
                response: "open_relay"
            })
        }

        return NextResponse.json({
            response: "close_relay"
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
