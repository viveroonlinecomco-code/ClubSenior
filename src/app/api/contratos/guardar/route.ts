// src/app/api/contratos/guardar/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const body = await req.json();
    const {
      usuarioId,
      email,
      sponsorContractAceptado,
      participantContractAceptado,
      sponsorFirma,
      participantFirma,
    } = body;

    // Validar inputs
    if (!usuarioId || !email || !sponsorFirma || !participantFirma) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // PASO 1: Guardar Sponsor Contract
    const { data: sponsorData, error: sponsorError } = await supabase
      .from('contratos')
      .insert([
        {
          usuario_email: usuarioId,
          tipo: 'sponsor',
          contenido: 'Contrato de Sponsor - ClubSenior',
          aceptado: sponsorContractAceptado,
          firma_base64: sponsorFirma,
          email: email,
        },
      ])
      .select()
      .single();

    if (sponsorError) {
      console.error('Error guardando sponsor contract:', sponsorError);
      return NextResponse.json(
        { error: `Error guardando sponsor contract: ${sponsorError.message}` },
        { status: 500 }
      );
    }

    // PASO 2: Guardar Participant Contract
    const { data: participantData, error: participantError } = await supabase
      .from('contratos')
      .insert([
        {
          usuario_email: usuarioId,
          tipo: 'participant',
          contenido: 'Contrato de Participante - ClubSenior',
          aceptado: participantContractAceptado,
          firma_base64: participantFirma,
          email: email,
        },
      ])
      .select()
      .single();

    if (participantError) {
      console.error('Error guardando participant contract:', participantError);
      return NextResponse.json(
        { error: `Error guardando participant contract: ${participantError.message}` },
        { status: 500 }
      );
    }

    // Contratos guardados exitosamente - no modificar tabla usuarios existente

    // SUCCESS
    return NextResponse.json(
      {
        success: true,
        message: 'Contratos guardados exitosamente',
        sponsorContractId: sponsorData.id,
        participantContractId: participantData.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error en /api/contratos/guardar:', error);
    return NextResponse.json(
      { error: `Error del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
