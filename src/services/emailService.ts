import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { messageId: info.messageId });
    } catch (error) {
      logger.error('Error sending email', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <h1>Bienvenue sur Moxbnb, ${firstName}!</h1>
      <p>Merci de vous être inscrit sur notre plateforme.</p>
      <p>Nous sommes ravis de vous accueillir dans notre communauté de voyageurs et d'hôtes en Tunisie.</p>
      <p>Cordialement,<br>L'équipe Moxbnb</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Bienvenue sur Moxbnb!',
      html,
    });
  }

  async sendBookingConfirmationEmail(email: string, bookingDetails: any): Promise<void> {
    const html = `
      <h1>Réservation Confirmée!</h1>
      <p>Votre réservation a été confirmée avec succès.</p>
      <h3>Détails de la réservation:</h3>
      <p><strong>Type:</strong> ${bookingDetails.type}</p>
      <p><strong>Date d'arrivée:</strong> ${bookingDetails.checkIn}</p>
      <p><strong>Nombre d'invités:</strong> ${bookingDetails.guests}</p>
      <p><strong>Prix total:</strong> ${bookingDetails.totalPrice} ${bookingDetails.currency}</p>
      <p>Merci de choisir Moxbnb!</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Réservation Confirmée - Moxbnb',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Réinitialisation du mot de passe</h1>
      <p>Vous avez demandé de réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
      <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Réinitialiser le mot de passe
      </a>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Réinitialisation du mot de passe - Moxbnb',
      html,
    });
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <h1>Vérification de l'email</h1>
      <p>Merci de vous être inscrit sur Moxbnb.</p>
      <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email:</p>
      <a href="${verificationUrl}" style="background-color: #e11d48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Vérifier mon email
      </a>
      <p>Ce lien expirera dans 24 heures.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Vérification de l\'email - Moxbnb',
      html,
    });
  }

  async sendNewMessageEmail(email: string, messageDetails: any): Promise<void> {
    const html = `
      <h1>Nouveau message</h1>
      <p>Vous avez reçu un nouveau message de ${messageDetails.senderName}.</p>
      <p><strong>Message:</strong></p>
      <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${messageDetails.content}
      </p>
      <p>Connectez-vous à votre compte Moxbnb pour répondre.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Nouveau message de ${messageDetails.senderName} - Moxbnb`,
      html,
    });
  }

  async sendReviewNotificationEmail(email: string, reviewDetails: any): Promise<void> {
    const html = `
      <h1>Nouvel avis reçu!</h1>
      <p>${reviewDetails.reviewerName} a laissé un avis sur votre ${reviewDetails.itemType}.</p>
      <p><strong>Note:</strong> ${reviewDetails.rating}/5 ⭐</p>
      <p><strong>Commentaire:</strong></p>
      <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${reviewDetails.comment || 'Aucun commentaire'}
      </p>
      <p>Merci d'utiliser Moxbnb!</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Nouvel avis reçu - Moxbnb`,
      html,
    });
  }
}

export const emailService = new EmailService();
