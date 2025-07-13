import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/database/connection';
import { sendEmail } from '@lib/email/sender';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import ContactMessage from '@models/ContactMessage';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();
    const { name, email, subject, category, message, priority, userType } = data;

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create contact message record
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      category,
      message,
      priority: priority || 'medium',
      userType: userType || 'parent',
      status: 'new',
      source: 'website',
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'We received your message - MINTOONS Support',
      template: 'contact_confirmation',
      data: {
        name,
        subject,
        ticketId: contactMessage._id.toString().slice(-8).toUpperCase(),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@mintoons.com',
      },
    });

    // Send notification to support team
    await sendEmail({
      to: process.env.SUPPORT_EMAIL || 'support@mintoons.com',
      subject: `New ${priority} priority contact: ${subject}`,
      template: 'contact_notification',
      data: {
        name,
        email,
        subject,
        category,
        message,
        priority,
        userType,
        ticketId: contactMessage._id.toString().slice(-8).toUpperCase(),
        adminUrl: `${process.env.APP_URL}/admin/support/${contactMessage._id}`,
      },
    });

    // Track contact form submission
    trackEvent(TRACKING_EVENTS.CONTACT_FORM_SUBMIT, {
      category,
      userType,
      priority,
      messageLength: message.length,
    });

    return NextResponse.json({
      success: true,
      ticketId: contactMessage._id.toString().slice(-8).toUpperCase(),
      message: 'Message sent successfully. We\'ll get back to you soon!',
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}