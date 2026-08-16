import { NextResponse } from 'next/server';
import { Booking } from '@/types';
import { jsPDF } from 'jspdf';
import { formatINR, formatDate } from '@/lib/utils';

// Helper to format currency in HTML
function formatCurrencyHtml(amount: number) {
  return `&#8377;${amount.toLocaleString('en-IN')}`;
}

// Generate Rich Customer Confirmation Email HTML
function getCustomerConfirmationHtml(booking: Booking, headerHtml: string, footerHtml: string) {
  return `
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; font-family: sans-serif; line-height: 1.6; color: #333;">
      ${headerHtml}
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${booking.customer.name}</strong>,</p>
        <p style="font-size: 15px;">
          ${booking.orderStatus === 'Confirmed'
            ? `Your pre-booking for authentic Kerala Kitchen Onam Sadya is <strong>confirmed</strong>!`
            : `We have received your pre-booking request for authentic Kerala Kitchen Onam Sadya. We will notify you once it is confirmed!`}
        </p>
        
        <div style="background-color: #FFF8E1; border: 1px solid #FFE082; padding: 15px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #B78103; display: block; letter-spacing: 0.5px;">Booking ID</span>
          <strong style="font-size: 22px; font-family: monospace; color: #2E7D32; display: block; margin: 4px 0;">${booking.bookingNumber}</strong>
          ${booking.tokenNumber ? `<span style="font-size: 12px; font-weight: bold; background-color: #2E7D32; color: white; padding: 3px 10px; border-radius: 10px; display: inline-block;">Token: ${booking.tokenNumber}</span>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.date}</td></tr>
          <tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Time Slot:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.timeSlot}</td></tr>
          <tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Fulfillment:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${booking.fulfillment}</td></tr>
          <tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Sadya Package:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.sadyaItem.name} (${booking.quantity.adults} Pax)</td></tr>
          ${booking.extras && booking.extras.length > 0 ? `<tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Extras:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.extras.map(e => `${e.name} (x${e.quantity})`).join(', ')}</td></tr>` : ''}
          ${booking.fulfillment === 'delivery' ? `
          <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="padding: 8px 0; color: #666;">Delivery Address:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; line-height: 1.4;">
              ${booking.deliveryAddress || booking.customer.address || ''}
              ${booking.landmark ? `<br/><span style="font-size: 11px; color: #666; font-weight: normal;">Landmark: ${booking.landmark}</span>` : ''}
              ${booking.customer.pincode ? `<br/><span style="font-size: 11px; color: #666; font-weight: normal;">PIN Code: ${booking.customer.pincode}</span>` : ''}
            </td>
          </tr>
          ` : ''}
          <tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Total Paid:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2E7D32; font-size: 16px;">${formatCurrencyHtml(booking.totalAmount)}</td></tr>
        </table>

        ${booking.fulfillment === 'delivery' && booking.deliveryOtp ? `
          <div style="background-color: #E8F5E9; border: 1px solid #C8E6C9; padding: 15px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #2E7D32; display: block; letter-spacing: 0.5px;">Delivery Verification OTP</span>
            <strong style="font-size: 26px; font-family: monospace; color: #1B5E20; display: block; letter-spacing: 6px; margin: 4px 0; padding-left: 6px;">${booking.deliveryOtp}</strong>
            <span style="font-size: 11px; color: #388E3C; display: block;">Provide this 4-digit code to the delivery driver to verify receipt.</span>
          </div>
        ` : ''}

        <p style="font-size: 14px; color: #555;">Please find your formal invoice PDF attached to this email. To track your order status in real time, check your customer dashboard at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track?id=${booking.bookingNumber}" style="color: #2E7D32; font-weight: bold; text-decoration: underline;">Live Tracker</a>.</p>
      </div>
      ${footerHtml}
    </div>
  `;
}

// Generate server-side PDF invoice and return as Base64 string
function buildServerInvoiceBase64(booking: Booking): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const darkGreen = [46, 125, 50];
  const gold = [212, 175, 55];
  const darkCharcoal = [33, 33, 33];
  const lightBg = [253, 251, 247];

  // Draw background & headers
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.rect(0, 38, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('KERALA KITCHEN', 15, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Authentic Onam Sadya Pre-Booking Invoice', 15, 27);

  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(booking.bookingNumber, 195, 22, { align: 'right' });

  // Details box
  let y = 52;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, y, 180, 32, 2, 2, 'FD');

  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Date:', 22, y + 10);
  doc.text('Fulfillment Date:', 22, y + 20);
  doc.text('Time Slot:', 110, y + 10);
  doc.text('Fulfillment Mode:', 110, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(booking.createdAt), 52, y + 10);
  doc.text(formatDate(booking.date), 56, y + 20);
  doc.text(booking.timeSlot, 135, y + 10);
  doc.text(booking.fulfillment.toUpperCase(), 150, y + 20);

  y += 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text('Customer Information', 15, y);

  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`Name: ${booking.customer.name}`, 15, y + 5);
  doc.text(`Phone: ${booking.customer.phone}`, 15, y + 12);
  doc.text(`Email: ${booking.customer.email}`, 15, y + 19);

  if (booking.fulfillment === 'delivery' && (booking.deliveryAddress || booking.customer.address)) {
    doc.text(`Delivery Address: ${booking.deliveryAddress || booking.customer.address}, PIN: ${booking.customer.pincode || ''}`, 15, y + 26);
    y += 7;
  }

  y += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text('Order Breakdown', 15, y);

  y += 6;
  doc.setFillColor(240, 245, 240);
  doc.rect(15, y, 180, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Item Description', 20, y + 5.5);
  doc.text('Qty / Pax', 120, y + 5.5);
  doc.text('Amount', 185, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(booking.sadyaItem.name, 20, y + 7);
  doc.text(`${booking.quantity.adults} Adult(s)${booking.quantity.children ? `, ${booking.quantity.children} Child(ren)` : ''}`, 120, y + 7);
  const basePrice = booking.sadyaItem.price * (booking.quantity.adults + booking.quantity.children * 0.6);
  doc.text(formatINR(basePrice), 185, y + 7, { align: 'right' });

  y += 12;
  booking.extras.forEach((extra) => {
    doc.text(`Extra: ${extra.name}`, 20, y + 5);
    doc.text(`x${extra.quantity}`, 120, y + 5);
    doc.text(formatINR(extra.price * extra.quantity), 185, y + 5, { align: 'right' });
    y += 9;
  });

  doc.setDrawColor(200, 200, 200);
  doc.line(15, y + 3, 195, y + 3);

  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 130, y);
  doc.text(formatINR(booking.subtotal), 185, y, { align: 'right' });

  if (booking.discount > 0) {
    y += 7;
    doc.setTextColor(180, 0, 0);
    doc.text(`Discount (${booking.couponApplied?.code || 'Promo'}):`, 130, y);
    doc.text(`-${formatINR(booking.discount)}`, 185, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  if (booking.deliveryCharge > 0) {
    y += 7;
    doc.text('Delivery Charge:', 130, y);
    doc.text(formatINR(booking.deliveryCharge), 185, y, { align: 'right' });
  }

  y += 10;
  doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.rect(125, y - 5, 70, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL AMOUNT:', 130, y + 2);
  doc.text(formatINR(booking.totalAmount), 190, y + 2, { align: 'right' });

  y += 25;
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()} (${booking.paymentMethod.toUpperCase()})`, 15, y);
  doc.text(`Order Status: ${booking.orderStatus}`, 15, y + 7);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing Kerala Kitchen to celebrate your Onam Festival!', 15, y + 20);
  doc.text('Please present this invoice or QR code at pickup/delivery.', 15, y + 26);

  return (doc as any).output('base64');
}

// Send email via Resend HTTP API (handles optional Base64 attachments)
async function sendEmail(opts: { to: string; subject: string; html: string; attachments?: { content: string; filename: string }[] }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kerala Kitchen <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not found in environment. Operating in sandbox fallback logging mode.');
    console.log(`[EMAIL SANDBOX LOG] Simulated dispatch to: "${opts.to}" | subject: "${opts.subject}" | attachments: ${opts.attachments?.map(a => a.filename).join(', ') || 'none'}`);
    return { sandbox: true, to: opts.to, subject: opts.subject };
  }

  if (!opts.to || !opts.to.includes('@')) {
    throw new Error(`Invalid recipient email address: "${opts.to}"`);
  }

  const payload: any = {
    from: fromEmail,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
  };

  if (opts.attachments) {
    payload.attachments = opts.attachments;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error ${response.status}: ${errorBody}`);
  }

  return await response.json();
}

// Self-sign JWT for Google Cloud API Auth
async function getFcmAccessToken(serviceAccount: { client_email: string; private_key: string }) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const pem = serviceAccount.private_key
    .replace(/\\n/g, '\n')
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const keyBuffer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const base64UrlEncode = (str: string) => {
    return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signatureInput}.${signatureBase64}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google OAuth token exchange failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

// Send Push Notification via Firebase Messaging REST API
async function sendPushNotification(opts: { token: string; title: string; body: string; link: string }) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not found. Operating in push sandbox logging mode.');
    console.log(`[PUSH SANDBOX LOG] Simulated push to: "${opts.token}" | title: "${opts.title}" | body: "${opts.body}" | link: "${opts.link}"`);
    return { sandbox: true };
  }

  try {
    let serviceAccount;
    if (serviceAccountJson.trim().startsWith('{')) {
      serviceAccount = JSON.parse(serviceAccountJson);
    } else {
      serviceAccount = JSON.parse(atob(serviceAccountJson));
    }

    const accessToken = await getFcmAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: opts.token,
          notification: {
            title: opts.title,
            body: opts.body,
          },
          data: {
            link: opts.link,
          },
          webpush: {
            fcm_options: {
              link: opts.link,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`FCM API response failed ${response.status}: ${errText}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('❌ Failed to dispatch push notification:', err);
    return { error: err.message };
  }
}

export async function POST(request: Request) {
  try {
    const { booking, type } = (await request.json()) as { booking: Booking; type: 'new_booking' | 'status_update' };

    if (!booking) {
      return NextResponse.json({ error: 'Missing booking details' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@keralakitchen.com';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Fetch FCM token from request or fallback to query from DB
    let fcmToken = (booking as any).fcmToken || (booking as any).fcm_token;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!fcmToken && supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase
          .from('bookings')
          .select('fcm_token')
          .eq('id', booking.id)
          .single();
        if (data?.fcm_token) {
          fcmToken = data.fcm_token;
        }
      } catch (dbErr) {
        console.warn('FCM token lookup in database failed:', dbErr);
      }
    }

    // HTML Email template parts
    const headerHtml = `
      <div style="background-color: #2E7D32; color: white; padding: 25px; text-align: center; border-radius: 16px 16px 0 0; font-family: sans-serif;">
        <h1 style="margin: 0; font-family: serif; font-size: 28px;">Kerala Kitchen Valiyaparamba</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #D4AF37; font-weight: bold; letter-spacing: 1px;">AUTHENTIC ONAM SADYA 2026</p>
      </div>
    `;

    const footerHtml = `
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 16px 16px; font-family: sans-serif; font-size: 12px; color: #6c757d; border-top: 1px dashed #dee2e6;">
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #2E7D32;">Kerala Kitchen Hotel</p>
        <p style="margin: 0 0 15px 0;">Valiyaparamba, Kozhikode, Kerala - 673602</p>
        <p style="margin: 0;">Need help? Call us at <strong>9447445078</strong> / <strong>9745627203</strong></p>
      </div>
    `;

    const emailActions: Promise<any>[] = [];
    const pushActions: Promise<any>[] = [];

    // Pre-build the PDF Invoice Base64 attachment for confirmations
    let pdfBase64 = '';
    try {
      pdfBase64 = buildServerInvoiceBase64(booking);
    } catch (pdfErr) {
      console.error('Failed to compile PDF Invoice server-side:', pdfErr);
    }

    const attachments = pdfBase64 ? [{ content: pdfBase64, filename: `${booking.bookingNumber}-Invoice.pdf` }] : undefined;

    if (type === 'new_booking') {
      // 1. Admin Alert Email (always dispatched for new requests)
      const adminSubject = `🚨 New Booking Alert: #${booking.bookingNumber} (${booking.customer.name})`;
      const adminHtml = `
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; font-family: sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #8E2430; color: white; padding: 20px; text-align: center; border-radius: 16px 16px 0 0;">
            <h2 style="margin: 0;">New Onam Sadya Booking</h2>
            <p style="margin: 5px 0 0 0; font-size: 13px;">Pre-booking received for validation</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <h3 style="margin-top: 0; color: #8E2430; font-family: serif; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #666;">Booking ID:</td><td style="padding: 6px 0; font-weight: bold;">${booking.bookingNumber}</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Fulfillment:</td><td style="padding: 6px 0; font-weight: bold; text-transform: uppercase;">${booking.fulfillment}</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Date/Time:</td><td style="padding: 6px 0; font-weight: bold;">${booking.date} (${booking.timeSlot})</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Sadya Package:</td><td style="padding: 6px 0; font-weight: bold;">${booking.sadyaItem.name} (${booking.quantity.adults} Pax)</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Total Value:</td><td style="padding: 6px 0; font-weight: bold; color: #8E2430;">${formatCurrencyHtml(booking.totalAmount)}</td></tr>
            </table>

            <h3 style="color: #8E2430; font-family: serif; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #666;">Name:</td><td style="padding: 6px 0; font-weight: bold;">${booking.customer.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Phone:</td><td style="padding: 6px 0; font-weight: bold;"><a href="tel:${booking.customer.phone}">${booking.customer.phone}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Email:</td><td style="padding: 6px 0; font-weight: bold;">${booking.customer.email}</td></tr>
            </table>

            <p style="text-align: center; margin-top: 25px;">
              <a href="${siteUrl}/admin" style="background-color: #8E2430; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Manage in Admin Panel</a>
            </p>
          </div>
          ${footerHtml}
        </div>
      `;

      emailActions.push(sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml, attachments }));

      // 2. Customer Confirmation Email & Push Notification (dispatched immediately on new booking)
      const isConfirmed = booking.orderStatus === 'Confirmed';
      const customerSubject = isConfirmed
        ? `🍛 Booking Confirmed! Onam Sadya Order #${booking.bookingNumber}`
        : `🍛 Pre-Booking Received! Onam Sadya Order #${booking.bookingNumber}`;
      
      const customerHtml = getCustomerConfirmationHtml(booking, headerHtml, footerHtml);
      
      emailActions.push(sendEmail({ to: booking.customer.email, subject: customerSubject, html: customerHtml, attachments }));

      if (fcmToken) {
        pushActions.push(sendPushNotification({
          token: fcmToken,
          title: isConfirmed ? 'Pre-Booking Confirmed! 🍛' : 'Pre-Booking Received! 🍛',
          body: isConfirmed
            ? `Your Kerala Kitchen Onam Sadya order #${booking.bookingNumber} is confirmed!`
            : `We have received your pre-booking request #${booking.bookingNumber}!`,
          link: `${siteUrl}/track?id=${booking.bookingNumber}`,
        }));
      }
    } else if (type === 'status_update') {
      // If status changed to Confirmed, send the rich Customer Confirmation Email (previously skipped for Cash/COD)
      if (booking.orderStatus === 'Confirmed') {
        const customerSubject = `🍛 Booking Confirmed! Onam Sadya Order #${booking.bookingNumber}`;
        const customerHtml = getCustomerConfirmationHtml(booking, headerHtml, footerHtml);
        
        emailActions.push(sendEmail({ to: booking.customer.email, subject: customerSubject, html: customerHtml, attachments }));

        if (fcmToken) {
          pushActions.push(sendPushNotification({
            token: fcmToken,
            title: 'Pre-Booking Confirmed! 🍛',
            body: `Your Kerala Kitchen Onam Sadya order #${booking.bookingNumber} is confirmed!`,
            link: `${siteUrl}/track?id=${booking.bookingNumber}`,
          }));
        }
      } else {
        // Send standard status update email
        const statusSubject = `🍛 Onam Sadya Order #${booking.bookingNumber} Status: ${booking.orderStatus}`;
        const statusDetails = {
          'Confirmed': 'Your booking is confirmed. We will begin preparation on festival day.',
          'Preparing': 'Our chefs have started preparing your feast in the kitchen!',
          'Ready': 'Your hot Sadya is ready at the counter!',
          'Out for Delivery': 'Our delivery executive is on the way to your doorstep!',
          'Delivered': 'Order delivered! We wish you a happy and prosperous Onam celebration.',
          'Cancelled': 'Your booking has been cancelled. Contact support for refund inquiries.',
          'Booked': 'Your pre-booking request has been logged.',
        }[booking.orderStatus] || `Your order status has been updated to ${booking.orderStatus}.`;

        const customerHtml = `
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; font-family: sans-serif; line-height: 1.6; color: #333;">
            ${headerHtml}
            <div style="padding: 24px; background-color: #ffffff;">
              <p style="font-size: 16px; margin-top: 0;">Dear <strong>${booking.customer.name}</strong>,</p>
              <p style="font-size: 15px;">We have updated the status of your Kerala Kitchen Onam Sadya order.</p>

              <div style="background-color: #f1f8e9; border-left: 4px solid #2e7d32; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #666; display: block;">Current Order Status</span>
                <strong style="font-size: 18px; color: #2e7d32; display: block; margin: 2px 0;">✨ ${booking.orderStatus}</strong>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #555;">${statusDetails}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; color: #555;">
                <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0;">Order Reference:</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.bookingNumber}</td></tr>
                <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0;">Fulfillment Mode:</td><td style="padding: 6px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${booking.fulfillment}</td></tr>
                <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0;">Package Details:</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.sadyaItem.name} (${booking.quantity.adults} Pax)</td></tr>
                ${booking.fulfillment === 'delivery' ? `
                <tr style="border-bottom: 1px solid #f9f9f9;">
                  <td style="padding: 6px 0;">Delivery Address:</td>
                  <td style="padding: 6px 0; font-weight: bold; text-align: right; line-height: 1.4;">
                    ${booking.deliveryAddress || booking.customer.address || ''}
                    ${booking.landmark ? `<br/><span style="font-size: 11px; color: #666; font-weight: normal;">Landmark: ${booking.landmark}</span>` : ''}
                    ${booking.customer.pincode ? `<br/><span style="font-size: 11px; color: #666; font-weight: normal;">PIN Code: ${booking.customer.pincode}</span>` : ''}
                  </td>
                </tr>
                ` : ''}
                ${booking.fulfillment === 'delivery' && booking.deliveryOtp && booking.orderStatus === 'Out for Delivery' ? `
                  <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0; color: #1b5e20;">Doorstep Delivery OTP:</td><td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1b5e20; font-family: monospace; font-size: 15px; letter-spacing: 1px;">${booking.deliveryOtp}</td></tr>
                ` : ''}
              </table>

              <p style="font-size: 14px;">View live details on our <a href="${siteUrl}/track?id=${booking.bookingNumber}" style="color: #2E7D32; font-weight: bold; text-decoration: underline;">Pre-Booking Tracker</a>.</p>
            </div>
            ${footerHtml}
          </div>
        `;

        emailActions.push(sendEmail({ to: booking.customer.email, subject: statusSubject, html: customerHtml, attachments }));

        if (fcmToken) {
          pushActions.push(sendPushNotification({
            token: fcmToken,
            title: `Order Status: ${booking.orderStatus} ✨`,
            body: statusDetails,
            link: `${siteUrl}/track?id=${booking.bookingNumber}`,
          }));
        }
      }
    }

    // Await all dispatches in parallel, isolating failures so one broken channel
    // (e.g. a rejected admin email) can never prevent the customer email from sending.
    const [emailResults, pushResults] = await Promise.all([
      Promise.allSettled(emailActions),
      Promise.allSettled(pushActions),
    ]);

    const summary = {
      emails: emailResults.map((r, i) =>
        r.status === 'fulfilled'
          ? { ok: true, sandbox: !!(r.value as any)?.sandbox, ...(r.value as any) }
          : { ok: false, error: (r as PromiseRejectedResult).reason?.message || String((r as PromiseRejectedResult).reason) }
      ),
      pushes: pushResults.map((r) =>
        r.status === 'fulfilled'
          ? { ok: true, ...(r.value as any) }
          : { ok: false, error: (r as PromiseRejectedResult).reason?.message || String((r as PromiseRejectedResult).reason) }
      ),
      totalEmails: emailResults.length,
      failedEmails: emailResults.filter((r) => r.status === 'rejected').length,
    };

    if (summary.failedEmails > 0) {
      console.error('❌ Some notification dispatches failed:', JSON.stringify(summary, null, 2));
    }

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('❌ Notification dispatcher crashed:', error);
    return NextResponse.json({ error: error.message || 'Notification Dispatch Error' }, { status: 500 });
  }
}