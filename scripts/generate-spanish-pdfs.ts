import fs from 'fs'
import path from 'path'

// This is a simple script to generate basic Spanish PDF documents
// In a real implementation, you would create proper PDF documents with legal content

const spanishDocuments = {
  'terms-of-service': {
    title: 'Términos de Servicio',
    content: `
TÉRMINOS DE SERVICIO - COOL BANK

1. ACEPTACIÓN DE TÉRMINOS
Al abrir una cuenta con Cool Bank, usted acepta estar sujeto a estos términos y condiciones.

2. SERVICIOS BANCARIOS
Cool Bank proporciona servicios bancarios incluidos pero no limitados a:
- Cuentas de ahorro
- Cuentas corrientes  
- Cuentas del mercado monetario

3. RESPONSABILIDADES DEL CLIENTE
- Mantener información de cuenta exacta y actualizada
- Notificar inmediatamente cualquier actividad no autorizada
- Cumplir con todas las políticas del banco

4. TARIFAS Y CARGOS
Las tarifas se detallan en nuestro Programa de Tarifas separado.

5. TERMINACIÓN
Cualquiera de las partes puede terminar esta relación con aviso previo.

Este documento está en español para conveniencia del cliente. 
En caso de discrepancia, la versión en inglés prevalece.

© 2024 Cool Bank. Todos los derechos reservados.
    `
  },
  'privacy-policy': {
    title: 'Política de Privacidad',
    content: `
POLÍTICA DE PRIVACIDAD - COOL BANK

RECOPILACIÓN DE INFORMACIÓN
Recopilamos información personal que usted nos proporciona cuando:
- Abre una cuenta
- Realiza transacciones
- Se comunica con nosotros

USO DE LA INFORMACIÓN
Utilizamos su información para:
- Proporcionar servicios bancarios
- Cumplir con requisitos regulatorios
- Mejorar nuestros servicios

PROTECCIÓN DE DATOS
Implementamos medidas de seguridad para proteger su información personal.

DIVULGACIÓN A TERCEROS
No vendemos ni alquilamos su información personal a terceros.

DERECHOS DEL CLIENTE
Usted tiene derecho a:
- Acceder a su información personal
- Solicitar correcciones
- Limitar el uso de su información

CONTACTO
Para preguntas sobre privacidad, contáctenos al 1-800-COOLBNK.

Efectivo: Enero 2024
© 2024 Cool Bank. Todos los derechos reservados.
    `
  },
  'checking-account-agreement': {
    title: 'Acuerdo de Cuenta Corriente',
    content: `
ACUERDO DE CUENTA CORRIENTE - COOL BANK

TÉRMINOS DE LA CUENTA CORRIENTE

1. ELEGIBILIDAD
Para abrir una cuenta corriente, debe:
- Ser mayor de 18 años
- Proporcionar identificación válida
- Hacer un depósito mínimo inicial

2. CARACTERÍSTICAS DE LA CUENTA
- Acceso a cajeros automáticos
- Banca en línea y móvil
- Cheques personalizados disponibles
- Tarjeta de débito incluida

3. LÍMITES Y RESTRICCIONES
- Límites diarios de cajeros automáticos
- Restricciones en transacciones internacionales
- Políticas de sobregiro

4. TARIFAS
Consulte nuestro Programa de Tarifas actual para:
- Tarifas de mantenimiento mensual
- Tarifas de sobregiro
- Tarifas de cajeros automáticos fuera de la red

5. RESPONSABILIDADES
- Mantener registros exactos
- Reportar discrepancias dentro de 60 días
- Notificar cambios de información

TÉRMINOS SUJETOS A CAMBIO
Este acuerdo puede modificarse con aviso previo de 30 días.

© 2024 Cool Bank. Todos los derechos reservados.
    `
  },
  'savings-account-agreement': {
    title: 'Acuerdo de Cuenta de Ahorros',
    content: `
ACUERDO DE CUENTA DE AHORROS - COOL BANK

TÉRMINOS DE LA CUENTA DE AHORROS

1. PROPÓSITO
La cuenta de ahorros está diseñada para ayudarle a ahorrar dinero y ganar intereses.

2. TASAS DE INTERÉS
- Tasas competitivas del mercado
- Interés compuesto diariamente
- Interés pagado mensualmente

3. DEPÓSITOS MÍNIMOS
- Depósito mínimo de apertura: $25
- Saldo mínimo para ganar intereses: $100

4. LIMITACIONES DE RETIRO
De acuerdo con las regulaciones federales:
- Máximo 6 retiros por mes
- Tarifas por exceso de transacciones

5. CARACTERÍSTICAS
- Banca en línea y móvil
- Transferencias automáticas disponibles
- Estados de cuenta mensuales

6. CIERRE DE CUENTA
- Notificación requerida por escrito
- Tarifas de cierre pueden aplicar
- Fondos restantes emitidos por cheque

PROTECCIÓN FDIC
Los depósitos están asegurados hasta $250,000 por depositor.

© 2024 Cool Bank. Todos los derechos reservados.
    `
  },
  'fee-schedule': {
    title: 'Programa de Tarifas',
    content: `
PROGRAMA DE TARIFAS - COOL BANK

CUENTAS CORRIENTES
- Mantenimiento mensual: $10 (exento con saldo mínimo)
- Sobregiro: $35 por artículo
- Cheque devuelto: $30
- Reposición de tarjeta de débito: $10

CUENTAS DE AHORROS  
- Mantenimiento mensual: $5 (exento con saldo mínimo)
- Exceso de transacciones: $10 por transacción

SERVICIOS DE CAJEROS AUTOMÁTICOS
- Cajeros de Cool Bank: Gratis
- Cajeros fuera de la red: $3.00
- Consultas de saldo: $1.00

SERVICIOS ADICIONALES
- Cheques de caja: $10
- Orden de pago: $8
- Transferencias telefónicas: $15
- Investigación de cuentas: $25/hora

SERVICIOS INTERNACIONALES
- Transferencias internacionales salientes: $45
- Transferencias internacionales entrantes: $15

TARIFAS POR SOBREGIRO
- Protección de sobregiro: $35 por transferencia
- Tarifas de sobregiro extendido: $7 por día

Las tarifas están sujetas a cambios con aviso previo de 30 días.

Efectivo: Enero 2024
© 2024 Cool Bank. Todos los derechos reservados.
    `
  },
  'patriot-act-notice': {
    title: 'Aviso de la Ley USA PATRIOT',
    content: `
AVISO DE LA LEY USA PATRIOT - COOL BANK

INFORMACIÓN IMPORTANTE SOBRE PROCEDIMIENTOS PARA ABRIR NUEVAS CUENTAS

Para ayudar al gobierno de los Estados Unidos a combatir el financiamiento del terrorismo y las actividades de lavado de dinero, la ley federal requiere que todas las instituciones financieras obtengan, verifiquen y registren información que identifique a cada persona que abra una cuenta.

LO QUE ESTO SIGNIFICA PARA USTED:
Cuando usted abra una cuenta, le pediremos:
- Su nombre
- Dirección  
- Fecha de nacimiento
- Número de identificación del contribuyente u otra información de identificación

También podemos pedirle:
- Su licencia de conducir u otros documentos de identificación
- Información adicional para verificar su identidad

VERIFICACIÓN DE IDENTIDAD
Podemos verificar esta información a través de:
- Bases de datos de consumidores
- Servicios de verificación de identidad
- Documentos proporcionados por usted

CUMPLIMIENTO REGULATORIO
Este requisito es parte del esfuerzo continuo para proteger el sistema financiero contra actividades ilegales.

Su cooperación es apreciada y requerida por ley.

© 2024 Cool Bank. Todos los derechos reservados.
    `
  }
}

// Generate simple text files with Spanish content (in a real implementation, you'd create actual PDFs)
function generateSpanishDocuments() {
  const documentsDir = path.join(process.cwd(), 'public', 'documents', 'es')
  
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true })
  }

  Object.entries(spanishDocuments).forEach(([id, doc]) => {
    const content = `${doc.title}\n${'='.repeat(doc.title.length)}\n\n${doc.content.trim()}`
    const filePath = path.join(documentsDir, `${id}.pdf`)
    
    // For demo purposes, we'll create text files with .pdf extension
    // In a real implementation, you would use a PDF generation library
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`Generated: ${filePath}`)
  })

  console.log('\nSpanish documents generated successfully!')
  console.log('Note: These are text files for demo purposes.')
  console.log('In production, use a proper PDF generation library like jsPDF or Puppeteer.')
}

// Run the script
generateSpanishDocuments()