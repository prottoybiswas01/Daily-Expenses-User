const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const SharedLink = require('../models/SharedLink');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const connectDB = require('../config/db');

// Read Nodemailer / Gmail SMTP environment variables
const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASS || process.env.EMAIL_PASS;

let transporter = null;
if (gmailUser && gmailPass) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });
} else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Read Resend API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Helper to dynamically derive base client URL under any custom domain / hosting setup
const getClientBaseUrl = (req) => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.replace(/\/$/, '');
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.CUSTOM_DOMAIN) {
    return process.env.CUSTOM_DOMAIN.replace(/\/$/, '');
  }

  if (req.headers.origin) {
    return req.headers.origin.replace(/\/$/, '');
  }
  if (req.headers.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      return refUrl.origin.replace(/\/$/, '');
    } catch (e) {
      // ignore invalid referer parsing
    }
  }

  // Fallback to host headers (works seamlessly with custom domains on Vercel, cPanel, Nginx, Cloudflare)
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (req.connection && req.connection.encrypted ? 'https' : 'http');

  if (host) {
    return `${protocol}://${host}`.replace(/\/$/, '');
  }

  return 'http://localhost:5173';
};

// Helper function to build email HTML
const buildGuardianEmailHtml = (guardianName, studentName, studentEmail, accessCode, guardianLink) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; padding: 30px; color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #121826; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 12px 32px rgba(0,0,0,0.5);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
            💰 Daily Expenses & Student Budget Tracker
          </h2>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">Guardian Observer Statement Notification</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
          Dear <strong>${guardianName}</strong>,
        </p>

        <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
          Your student <strong>${studentName}</strong> (<a href="mailto:${studentEmail}" style="color: #818cf8;">${studentEmail}</a>) has granted you <strong>Guardian Observer Access</strong> to view their live monthly budget allowance, real-time expenses, and wallet balances.
        </p>

        <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #a5b4fc;">
            <strong>Observer Access Code:</strong> <span style="font-family: monospace; font-size: 18px; color: #ffffff; letter-spacing: 1px;">${accessCode}</span>
          </p>
          <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            Permission Level: <strong>Read-Only Financial Statement Observer</strong>
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${guardianLink}" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);">
            🔗 Open Student Financial Statement
          </a>
        </div>

        <p style="font-size: 13px; color: #9ca3af; line-height: 1.5;">
          If the button above does not open directly, copy and paste the link below into your web browser:
          <br/>
          <a href="${guardianLink}" style="color: #818cf8; word-break: break-all;">${guardianLink}</a>
        </p>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 28px 0;" />

        <div style="text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">This email was sent automatically by Daily Expenses & Student Budget Tracker.</p>
        </div>
      </div>
    </div>
  `;
};

// Unified email dispatch helper supporting Gmail SMTP (No domain required) & Resend
const sendEmailNotification = async ({ to, subject, html, recipientEmail, studentName }) => {
  // Method 1: Nodemailer (Gmail SMTP / Custom SMTP) -> 100% FREE, NO DOMAIN REQUIRED, 500 emails/day to ANY email address
  if (transporter) {
    try {
      const fromAddr = gmailUser || process.env.SMTP_USER;
      const info = await transporter.sendMail({
        from: `"${studentName} via Daily Expenses" <${fromAddr}>`,
        to,
        subject,
        html
      });
      console.log('[Nodemailer Sent Success]:', info.messageId);
      return { success: true, method: 'Nodemailer (Gmail SMTP)' };
    } catch (err) {
      console.error('[Nodemailer Send Error]:', err);
      // fallback to Resend if available
    }
  }

  // Method 2: Resend API Key
  if (resend) {
    try {
      const sender = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
      const { data, error } = await resend.emails.send({
        from: sender,
        to,
        subject,
        html
      });

      if (error) {
        console.error('[Resend Email Response Error]:', error);
        let msg = error.message || 'Resend Email API Error';
        if (error.name === 'validation_error' || error.statusCode === 403 || error.status === 403) {
          msg = `[Resend Domain Restriction]: Free test domain (onboarding@resend.dev) can only send emails to your registered Resend account email. To send to ANY recipient without buying/adding a domain, set GMAIL_USER & GMAIL_APP_PASS in Vercel Environment Variables!`;
        }
        return { success: false, error: msg };
      }
      return { success: true, method: 'Resend API', data };
    } catch (e) {
      console.error('[Resend Send Catch Exception]:', e);
      return { success: false, error: e.message };
    }
  }

  return {
    success: false,
    error: 'No email service configured. Please set GMAIL_USER & GMAIL_APP_PASS (100% Free, No domain needed, 500 emails/day) in Vercel Environment Variables.'
  };
};

// @desc    Generate a new Guardian Observer access code & Send Email
// @route   POST /api/guardian/generate
exports.generateSharedLink = async (req, res) => {
  try {
    await connectDB();
    const { recipientEmail, recipientName } = req.body;

    if (!recipientEmail || !recipientName) {
      return res.status(400).json({ success: false, message: 'Recipient name and email are required' });
    }

    const accessCode = 'REF-' + Math.floor(100000 + Math.random() * 900000);

    const sharedLink = await SharedLink.create({
      userId: req.user._id,
      accessCode,
      recipientEmail,
      recipientName,
      status: 'Active',
      permission: 'Read-Only Observer'
    });

    const user = await User.findById(req.user._id);
    const baseUrl = getClientBaseUrl(req);
    const guardianLink = `${baseUrl}/guardian-view/${accessCode}`;

    const subject = `[Guardian Observer] Financial Statement Access from ${user.name}`;
    const html = buildGuardianEmailHtml(recipientName, user.name, user.email, accessCode, guardianLink);

    const dispatchResult = await sendEmailNotification({
      to: recipientEmail,
      subject,
      html,
      recipientEmail,
      studentName: user.name
    });

    res.status(201).json({
      success: true,
      data: sharedLink,
      guardianLink,
      emailSent: dispatchResult.success,
      emailError: dispatchResult.success ? null : `Link created. Note on email dispatch: ${dispatchResult.error}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Re-send Guardian access link email
// @route   POST /api/guardian/resend/:id
exports.resendSharedLink = async (req, res) => {
  try {
    await connectDB();
    const link = await SharedLink.findOne({ _id: req.params.id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Shared link not found' });
    }

    const user = await User.findById(req.user._id);
    const baseUrl = getClientBaseUrl(req);
    const guardianLink = `${baseUrl}/guardian-view/${link.accessCode}`;

    const subject = `[Guardian Observer] Financial Statement Access from ${user.name}`;
    const html = buildGuardianEmailHtml(link.recipientName, user.name, user.email, link.accessCode, guardianLink);

    const dispatchResult = await sendEmailNotification({
      to: link.recipientEmail,
      subject,
      html,
      recipientEmail: link.recipientEmail,
      studentName: user.name
    });

    if (!dispatchResult.success) {
      return res.status(400).json({ success: false, message: dispatchResult.error });
    }

    res.json({ success: true, message: `Observer link email re-sent successfully to ${link.recipientEmail}` });
  } catch (error) {
    console.error('[resendSharedLink exception]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active shared links for current user
// @route   GET /api/guardian/links
exports.getSharedLinks = async (req, res) => {
  try {
    await connectDB();
    const links = await SharedLink.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke & Permanently delete shared link from Mongo Atlas
// @route   DELETE /api/guardian/links/:id
exports.revokeSharedLink = async (req, res) => {
  try {
    await connectDB();
    const link = await SharedLink.findOne({ _id: req.params.id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Shared link not found' });
    }
    // Permanent deletion to optimize MongoDB Atlas storage & performance
    await link.deleteOne();
    res.json({ success: true, message: 'Access link permanently deleted from MongoDB' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Public endpoint for Guardian Observer mode verification
// @route   GET /api/guardian/view/:accessCode
exports.getGuardianViewData = async (req, res) => {
  try {
    await connectDB();
    const { accessCode } = req.params;

    const link = await SharedLink.findOne({ accessCode, status: 'Active' });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Invalid or revoked reference access code' });
    }

    const studentUser = await User.findById(link.userId).select('name email monthlyBudget currency');
    if (!studentUser) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    const transactions = await Transaction.find({ userId: studentUser._id }).sort({ date: -1 });
    const wallets = await Wallet.find({ userId: studentUser._id });

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    let netBalance = 0;
    wallets.forEach(w => netBalance += w.balance);

    res.json({
      success: true,
      guardianName: link.recipientName,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        monthlyBudget: studentUser.monthlyBudget
      },
      wallets,
      transactions
    });
  } catch (error) {
    console.error('[guardianController] getGuardianViewData error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
