import prisma from '../lib/prisma';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function brevoSend(payload: {
  sender: { name: string; email: string };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string };
}) {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

function baseTemplate(content: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>TennisTournament</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <!-- Header -->
            <tr>
              <td style="background:#111111;border-top:3px solid #22c55e;border-radius:8px 8px 0 0;padding:28px 40px;text-align:center;">
                <span style="font-size:26px;font-weight:800;color:#22c55e;letter-spacing:-0.5px;">TENNIS</span>
                <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">TOURNAMENT</span>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="background:#1a1a1a;padding:36px 40px;color:#e5e7eb;">
                ${content}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#111111;border-bottom:3px solid #22c55e;border-radius:0 0 8px 8px;padding:20px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#6b7280;">TennisTournament &mdash; Plataforma de torneos y ligas de tenis</p>
                <p style="margin:4px 0 0;font-size:12px;color:#4b5563;">Este correo fue enviado automáticamente, por favor no respondas.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.BREVO_API_KEY) return;
  const user = await prisma.user.findUnique({ where: { email: to }, select: { notificationsEnabled: true } });
  if (user && !user.notificationsEnabled) return;
  try {
    await brevoSend({
      sender: { name: 'TennisTournament', email: process.env.BREVO_SENDER || 'tennistournamenttfg@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
  } catch (err) {
    console.error('[EmailService] Error enviando correo:', err);
  }
}

// ─── Welcome email ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#22c55e;font-weight:700;">¡Bienvenido, ${name}!</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;">Tu cuenta en TennisTournament ha sido creada correctamente.</p>
    <p style="margin:0 0 12px;font-size:15px;color:#d1d5db;">Ahora puedes:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#d1d5db;font-size:14px;line-height:1.8;">
      <li>Inscribirte en torneos y ligas de tenis</li>
      <li>Seguir el cuadro de partidos en tiempo real</li>
      <li>Reportar y confirmar resultados de tus partidos</li>
      <li>Consultar tus estadísticas personales</li>
    </ul>
    <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">ACCEDER A LA PLATAFORMA</a>
  `);
  await sendMail(to, 'Bienvenido a TennisTournament', html);
}

// ─── Match scheduled email ───────────────────────────────────────────────────

export async function sendMatchScheduledEmail(
  to: string,
  playerName: string,
  opponentName: string,
  tournamentName: string,
  scheduledDate: Date
) {
  const dateStr = scheduledDate.toLocaleString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#22c55e;font-weight:700;">Partido programado</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;">Hola <strong style="color:#ffffff;">${playerName}</strong>, tienes un nuevo partido programado.</p>
    <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-left:4px solid #22c55e;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Torneo</td></tr>
        <tr><td style="color:#ffffff;font-size:16px;font-weight:600;padding-bottom:16px;">${tournamentName}</td></tr>
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Rival</td></tr>
        <tr><td style="color:#22c55e;font-size:16px;font-weight:700;padding-bottom:16px;">${opponentName}</td></tr>
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Fecha y hora</td></tr>
        <tr><td style="color:#ffffff;font-size:15px;font-weight:500;">${dateStr}</td></tr>
      </table>
    </div>
    <a href="${process.env.FRONTEND_URL}/tournaments" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">VER MIS TORNEOS</a>
  `);
  await sendMail(to, `Partido programado — ${tournamentName}`, html);
}

// ─── New match assigned (bracket generated) ──────────────────────────────────

export async function sendMatchAssignedEmail(
  to: string,
  playerName: string,
  opponentName: string,
  tournamentName: string,
  round: number
) {
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#22c55e;font-weight:700;">¡El torneo ha comenzado!</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;">Hola <strong style="color:#ffffff;">${playerName}</strong>, el cuadro ha sido generado y tienes un partido asignado.</p>
    <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-left:4px solid #22c55e;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Torneo</td></tr>
        <tr><td style="color:#ffffff;font-size:16px;font-weight:600;padding-bottom:16px;">${tournamentName}</td></tr>
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Rival</td></tr>
        <tr><td style="color:#22c55e;font-size:16px;font-weight:700;padding-bottom:16px;">${opponentName}</td></tr>
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Ronda</td></tr>
        <tr><td style="color:#ffffff;font-size:15px;font-weight:500;">Ronda ${round}</td></tr>
      </table>
    </div>
    <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">Cuando finalice el partido, recuerda reportar el resultado desde la plataforma.</p>
    <a href="${process.env.FRONTEND_URL}/tournaments" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">VER EL CUADRO</a>
  `);
  await sendMail(to, `Tu partido en ${tournamentName} — Ronda ${round}`, html);
}

// ─── Confirm result request ───────────────────────────────────────────────────

export async function sendConfirmResultEmail(
  to: string,
  playerName: string,
  opponentName: string,
  tournamentName: string,
  reportedWinnerName: string,
  score: string | null
) {
  const scoreInfo = score
    ? `<tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Marcador reportado</td></tr>
       <tr><td style="color:#ffffff;font-size:15px;font-weight:500;padding-bottom:16px;">${score}</td></tr>`
    : '';

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#22c55e;font-weight:700;">Resultado pendiente de confirmación</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;">Hola <strong style="color:#ffffff;">${playerName}</strong>, tu rival <strong style="color:#ffffff;">${opponentName}</strong> ha reportado el resultado de vuestro partido en <strong style="color:#ffffff;">${tournamentName}</strong>.</p>
    <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-left:4px solid #f59e0b;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Ganador reportado</td></tr>
        <tr><td style="color:#22c55e;font-size:16px;font-weight:700;padding-bottom:16px;">${reportedWinnerName}</td></tr>
        ${scoreInfo}
      </table>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#d1d5db;">Por favor accede a la plataforma para <strong>confirmar o disputar</strong> este resultado.</p>
    <a href="${process.env.FRONTEND_URL}/tournaments" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">CONFIRMAR RESULTADO</a>
  `);
  await sendMail(to, `Confirma el resultado de tu partido — ${tournamentName}`, html);
}

// ─── New tournament in league ─────────────────────────────────────────────────

export async function sendNewTournamentInLeagueEmail(
  to: string,
  memberName: string,
  leagueName: string,
  tournamentName: string,
  tournamentId: string,
  maxPlayers: number,
  location?: string | null,
  startDate?: Date | null
) {
  const locationLine = location
    ? `<tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Lugar</td></tr>
       <tr><td style="color:#ffffff;font-size:15px;padding-bottom:16px;">${location}</td></tr>`
    : '';
  const dateLine = startDate
    ? `<tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Inicio</td></tr>
       <tr><td style="color:#ffffff;font-size:15px;padding-bottom:16px;">${startDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>`
    : '';

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#22c55e;font-weight:700;">Nuevo torneo en tu liga</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;">Hola <strong style="color:#ffffff;">${memberName}</strong>, se ha creado un nuevo torneo en la liga <strong style="color:#ffffff;">${leagueName}</strong>.</p>
    <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-left:4px solid #22c55e;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Torneo</td></tr>
        <tr><td style="color:#ffffff;font-size:16px;font-weight:600;padding-bottom:16px;">${tournamentName}</td></tr>
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Plazas</td></tr>
        <tr><td style="color:#ffffff;font-size:15px;padding-bottom:16px;">${maxPlayers} jugadores</td></tr>
        ${locationLine}
        ${dateLine}
      </table>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#d1d5db;">¡Date prisa e inscríbete antes de que se agoten las plazas!</p>
    <a href="${process.env.FRONTEND_URL}/tournaments/${tournamentId}" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">INSCRIBIRME</a>
  `);
  await sendMail(to, `Nuevo torneo en ${leagueName}: ${tournamentName}`, html);
}

// ─── League announcement ──────────────────────────────────────────────────────

export async function sendLeagueAnnouncementEmail(
  to: string,
  memberName: string,
  leagueName: string,
  announcementContent: string,
  authorName: string
) {
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#22c55e;font-weight:700;">Nuevo anuncio en tu liga</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;">Hola <strong style="color:#ffffff;">${memberName}</strong>, hay un nuevo anuncio en la liga <strong style="color:#ffffff;">${leagueName}</strong>.</p>
    <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-left:4px solid #22c55e;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;">Publicado por ${authorName}</p>
      <p style="margin:0;font-size:15px;color:#e5e7eb;line-height:1.7;">${announcementContent}</p>
    </div>
    <a href="${process.env.FRONTEND_URL}/leagues" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">VER LIGA</a>
  `);
  await sendMail(to, `Anuncio en ${leagueName}`, html);
}

// ─── Contact form ─────────────────────────────────────────────────────────────

export async function sendContactEmail(senderName: string, senderEmail: string, message: string) {
  if (!process.env.BREVO_API_KEY) return;
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#22c55e;font-weight:700;">Nuevo mensaje de contacto</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;">Has recibido un nuevo mensaje desde el formulario de contacto de TennisTournament.</p>
    <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-left:4px solid #22c55e;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Nombre</td></tr>
        <tr><td style="color:#ffffff;font-size:15px;font-weight:500;padding-bottom:16px;">${senderName}</td></tr>
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Email</td></tr>
        <tr><td style="color:#22c55e;font-size:15px;font-weight:500;padding-bottom:16px;">${senderEmail}</td></tr>
        <tr><td style="color:#9ca3af;font-size:12px;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Mensaje</td></tr>
        <tr><td style="color:#e5e7eb;font-size:15px;line-height:1.7;">${message.replace(/\n/g, '<br/>')}</td></tr>
      </table>
    </div>
  `);
  try {
    await brevoSend({
      sender: { name: 'TennisTournament Contact', email: process.env.BREVO_SENDER || 'tennistournamenttfg@gmail.com' },
      to: [{ email: process.env.CONTACT_EMAIL || 'tennistournamenttfg@gmail.com' }],
      replyTo: { email: senderEmail },
      subject: `Contacto de ${senderName} — TennisTournament`,
      htmlContent: html,
    });
  } catch (err) {
    console.error('[EmailService] Error enviando correo de contacto:', err);
  }
}
