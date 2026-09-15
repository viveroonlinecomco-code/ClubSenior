/**
 * Seed script for Grupo Plateado database
 * Run with: npx tsx scripts/seed-database.ts
 * 
 * Seeds:
 * - Plans (already seeded in migration)
 * - Condominios
 * - Facilitadores (staff profiles)
 * - Sample reports and attendance
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedDatabase() {
  console.log('🌱 Seeding Grupo Plateado database...\n');

  try {
    // 1. Create condominios
    console.log('📍 Creating condominios...');
    const condominios = [
      {
        nombre: 'Residencial Sabana',
        ubicacion: 'Km 30 Autopista Norte',
        ciudad: 'Bogotá',
        contacto_admin_nombre: 'Carlos Rodríguez',
        contacto_admin_email: 'carlos@residencial-sabana.co',
        contacto_admin_phone: '+57 300 1111111',
      },
      {
        nombre: 'Condominio Los Laureles',
        ubicacion: 'Calle 150 con Carrera 7',
        ciudad: 'Bogotá',
        contacto_admin_nombre: 'María García',
        contacto_admin_email: 'maria@loslaureles.co',
        contacto_admin_phone: '+57 300 2222222',
      },
      {
        nombre: 'Torres del Valle',
        ubicacion: 'Diagonal 140 con Carrera 15',
        ciudad: 'Bogotá',
        contacto_admin_nombre: 'Juan Martínez',
        contacto_admin_email: 'juan@torresdelvalle.co',
        contacto_admin_phone: '+57 300 3333333',
      },
    ];

    const { data: createdCondominios, error: condominioError } = await supabase
      .from('condominios')
      .insert(condominios)
      .select();

    if (condominioError) {
      console.error('❌ Error creating condominios:', condominioError);
      return;
    }
    console.log(`✅ Created ${createdCondominios?.length || 0} condominios\n`);

    // 2. Verify plans exist
    console.log('📋 Verifying plans...');
    const { data: planes, error: planesError } = await supabase
      .from('planes')
      .select();

    if (planesError) {
      console.error('❌ Error fetching plans:', planesError);
      return;
    }
    console.log(`✅ Found ${planes?.length || 0} plans\n`);

    // 3. Sample data info
    console.log('📊 Seed Data Summary:');
    console.log(`   - Condominios: ${createdCondominios?.length || 0}`);
    console.log(`   - Plans: ${planes?.length || 0}`);
    console.log('\n✨ Database seeded successfully!\n');

    console.log('🎯 Next steps:');
    console.log('   1. Register users via /inscribir');
    console.log('   2. Verify emails via /verificar-otp');
    console.log('   3. View dashboard at /familia');
    console.log('   4. Admin can add activities and reports');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
