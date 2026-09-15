// src/app/api/contratos/guardar/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('[CONTRATOS] POST /api/contratos/guardar');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const body = await req.json();
    console.log('[CONTRATOS] Body:', { email: body.email, tipo: 'sponsor+participant' });
    
    const {
      usuarioId,
      email,
      sponsorContractAceptado,
      participantContractAceptado,
      sponsorFirma,
      participantFirma,
    } = body;

    // Validar inputs
    if (!usuarioId || !email) {
      console.warn('[CONTRATOS] Faltan usuarioId o email');
      return NextResponse.json(
        { error: 'usuarioId y email son requeridos' },
        { status: 400 }
      );
    }

    if (!sponsorFirma || !participantFirma) {
      console.warn('[CONTRATOS] Faltan firmas');
      return NextResponse.json(
        { error: 'Ambas firmas son requeridas' },
        { status: 400 }
      );
    }

    // ✅ PASO 1: Guardar Sponsor Contract
    console.log('[CONTRATOS] Guardando Sponsor Contract...');
    const { data: sponsorData, error: sponsorError } = await supabase
      .from('contratos')
      .insert([
        {
          usuario_email: usuarioId,
          tipo: 'sponsor',
          contenido: 'Contrato de Sponsor - Grupo Plateado',
          aceptado: sponsorContractAceptado === true,
          firma_base64: sponsorFirma,
          email: email,
        },
      ])
      .select()
      .single();

    if (sponsorError) {
      console.error('[CONTRATOS] Error Sponsor:', sponsorError);
      return NextResponse.json(
        { 
          success: false,
          error: `Error guardando sponsor contract: ${sponsorError.message}`,
          details: sponsorError.details || sponsorError.hint
        },
        { status: 500 }
      );
    }

    console.log('[CONTRATOS] ✅ Sponsor guardado:', sponsorData?.id);

    // ✅ PASO 2: Guardar Participant Contract
    console.log('[CONTRATOS] Guardando Participant Contract...');
    const { data: participantData, error: participantError } = await supabase
      .from('contratos')
      .insert([
        {
          usuario_email: usuarioId,
          tipo: 'participant',
          contenido: 'Contrato de Participante - Grupo Plateado',
          aceptado: participantContractAceptado === true,
          firma_base64: participantFirma,
          email: email,
        },
      ])
      .select()
      .single();

    if (participantError) {
      console.error('[CONTRATOS] Error Participant:', participantError);
      return NextResponse.json(
        { 
          success: false,
          error: `Error guardando participant contract: ${participantError.message}`,
          details: participantError.details || participantError.hint
        },
        { status: 500 }
      );
    }

    console.log('[CONTRATOS] ✅ Participant guardado:', participantData?.id);

    // ✅ SUCCESS
    console.log('[CONTRATOS] ✅ Ambos contratos guardados exitosamente');
    return NextResponse.json(
      {
        success: true,
        message: 'Contratos guardados exitosamente',
        sponsorContractId: sponsorData?.id,
        participantContractId: participantData?.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[CONTRATOS] Error crítico:', error.message);
    console.error('[CONTRATOS] Stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: `Error del servidor: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
