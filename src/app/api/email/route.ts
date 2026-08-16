import { NextResponse } from 'next/server';
import { Booking } from '@/types';

// Helper to format currency in HTML
function formatCurrencyHtml(amount: number) {
  return `&#8377;${amount.toLocaleString('en-IN')}`;
}

// Send email via Resend HTTP API (fetch-based, Cloudflare Workers compatible)
async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kerala Kitchen <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not found in environment. Operating in sandbox fallback logging mode.');
    console.log(`[EMAIL SANDBOX LOG] Simulated dispatch to: "${opts.to}" | subject: "${opts.subject}"`);
    return { sandbox: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error ${response.status}: ${errorBody}`);
  }

  return await response.json();
}

export async function POST(request: Request) {
  try {
    const { booking, type } = (await request.json()) as { booking: Booking; type: 'new_booking' | 'status_update' };

    if (!booking) {
      return NextResponse.json({ error: 'Missing booking details' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@keralakitchen.com';

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

    if (type === 'new_booking') {
      // 1. Customer Confirmation Email
      const customerSubject = `🍛 Booking Confirmed! Onam Sadya Order #${booking.bookingNumber}`;
      const customerHtml = `
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; font-family: sans-serif; line-height: 1.6; color: #333;">
          ${headerHtml}
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 16px; margin-top: 0;">Dear <strong>${booking.customer.name}</strong>,</p>
            <p style="font-size: 15px;">Your pre-booking for authentic Kerala Kitchen Onam Sadya is <strong>confirmed</strong>!</p>
            
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
              ${booking.extras.length > 0 ? `<tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Extras:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.extras.map(e => `${e.name} (x${e.quantity})`).join(', ')}</td></tr>` : ''}
              <tr style="border-bottom: 1px solid #f1f1f1;"><td style="padding: 8px 0; color: #666;">Total Paid:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2E7D32; font-size: 16px;">${formatCurrencyHtml(booking.totalAmount)}</td></tr>
            </table>

            ${booking.fulfillment === 'delivery' && booking.deliveryOtp ? `
              <div style="background-color: #E8F5E9; border: 1px solid #C8E6C9; padding: 15px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #2E7D32; display: block; letter-spacing: 0.5px;">Delivery Verification OTP</span>
                <strong style="font-size: 26px; font-family: monospace; color: #1B5E20; display: block; letter-spacing: 6px; margin: 4px 0; padding-left: 6px;">${booking.deliveryOtp}</strong>
                <span style="font-size: 11px; color: #388E3C; display: block;">Provide this 4-digit code to the delivery driver to verify receipt.</span>
              </div>
            ` : ''}

            <p style="font-size: 14px; color: #555;">To track your order status in real time, check your customer dashboard at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track?id=${booking.bookingNumber}" style="color: #2E7D32; font-weight: bold; text-decoration: underline;">Live Tracker</a>.</p>
          </div>
          ${footerHtml}
        </div>
      `;

      // 2. Admin Alert Email
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
              ${booking.fulfillment === 'delivery' ? `
                <tr><td style="padding: 6px 0; color: #666;">Address:</td><td style="padding: 6px 0; font-weight: bold;">${booking.deliveryAddress || booking.customer.address}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Landmark:</td><td style="padding: 6px 0; font-weight: bold;">${booking.landmark || booking.customer.landmark || 'None'}</td></tr>
              ` : ''}
            </table>

            <p style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="background-color: #8E2430; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Manage in Admin Panel</a>
            </p>
          </div>
          ${footerHtml}
        </div>
      `;

      // Dispatch both emails in parallel
      await Promise.all([
        sendEmail({ to: booking.customer.email, subject: customerSubject, html: customerHtml }),
        sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml }),
      ]);
    } else if (type === 'status_update') {
      // 3. Status Transition Notification Email
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
              <span style="font-size: 10px; font-bold; text-transform: uppercase; color: #666; display: block;">Current Order Status</span>
              <strong style="font-size: 18px; color: #2e7d32; display: block; margin: 2px 0;">✨ ${booking.orderStatus}</strong>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #555;">${statusDetails}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; color: #555;">
              <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0;">Order Reference:</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.bookingNumber}</td></tr>
              <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0;">Fulfillment Mode:</td><td style="padding: 6px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${booking.fulfillment}</td></tr>
              <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0;">Package Details:</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.sadyaItem.name} (${booking.quantity.adults} Pax)</td></tr>
              ${booking.fulfillment === 'delivery' && booking.deliveryOtp && booking.orderStatus === 'Out for Delivery' ? `
                <tr style="border-bottom: 1px solid #f9f9f9;"><td style="padding: 6px 0; color: #1b5e20;">Doorstep Delivery OTP:</td><td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1b5e20; font-family: monospace; font-size: 15px; letter-spacing: 1px;">${booking.deliveryOtp}</td></tr>
              ` : ''}
            </table>

            <p style="font-size: 14px;">View live details on our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track?id=${booking.bookingNumber}" style="color: #2E7D32; font-weight: bold; text-decoration: underline;">Pre-Booking Tracker</a>.</p>
          </div>
          ${footerHtml}
        </div>
      `;

      await sendEmail({ to: booking.customer.email, subject: statusSubject, html: customerHtml });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Email dispatcher crashed:', error);
    return NextResponse.json({ error: error.message || 'Email Dispatch Error' }, { status: 500 });
  }
}