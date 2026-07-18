import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Create a transporter for local SMTP testing
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  family: 4, // Force IPv4
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
  auth: {
    user: process.env.EMAIL_USER || 'votre.email@gmail.com',
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || 'votre_mot_de_passe_application',
  },
  tls: {
    rejectUnauthorized: false
  }
});

// SMTP Mailer helper function
const sendEmailSMTP = async ({ to, subject, html, replyTo }) => {
  const mailOptions = {
    from: `"Dynace Global" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };
  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès via Gmail SMTP à :", to);
    return true;
  } catch (error) {
    console.error("Nodemailer SMTP Error:", error.message);
    return false;
  }
};

// Unified mail sender supporting Resend API (with automatic Gmail SMTP fallback)
export const sendEmail = async ({ to, subject, html, replyTo }) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const body = {
      from: `Dynace Global <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    };
    if (replyTo) {
      body.reply_to = replyTo;
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.ok) {
        console.log("Email envoyé avec succès via Resend. ID:", data.id);
        return true;
      }

      console.error("Resend API Error details:", data);

      // Fallback to Gmail SMTP if Resend fails and SMTP is configured
      if (process.env.EMAIL_USER) {
        console.log("Resend a échoué. Tentative de repli sur Gmail SMTP...");
        return sendEmailSMTP({ to, subject, html, replyTo });
      }
      return false;
    } catch (err) {
      console.error("Resend API Fetch error:", err.message);
      if (process.env.EMAIL_USER) {
        console.log("Erreur Resend Fetch. Tentative de repli sur Gmail SMTP...");
        return sendEmailSMTP({ to, subject, html, replyTo });
      }
      return false;
    }
  }

  // Fallback directly to local Nodemailer SMTP (Gmail)
  if (process.env.EMAIL_USER) {
    return sendEmailSMTP({ to, subject, html, replyTo });
  }

  console.log('Simulation Email (Configurez EMAIL_USER dans .env pour envoyer de vrais e-mails) :', { to, subject });
  return true;
};

export const sendContactEmail = async ({ name, email, subject, message }) => {
  const adminEmail = process.env.ADMIN_RECEIVER_EMAIL || process.env.EMAIL_USER || 'dynaceglogal@gmail.com';
  const html = `
    <h2>Nouveau Message de Contact</h2>
    <p><strong>De :</strong> ${name} (${email})</p>
    <p><strong>Sujet :</strong> ${subject}</p>
    <hr />
    <p style="white-space: pre-wrap;">${message}</p>
  `;
  return sendEmail({
    to: adminEmail,
    subject: `Nouveau Message de Contact : ${subject}`,
    html,
    replyTo: email
  });
};

export const sendOrderNotificationEmail = async ({ orderId, user, items, totalAmount, shippingAddress }) => {
  const adminEmail = process.env.ADMIN_RECEIVER_EMAIL || process.env.EMAIL_USER || 'dynaceglogal@gmail.com';
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.xn--dynaceglobalsant-top-q2b.com';
  const backendUrl = process.env.BACKEND_URL || 'https://dynace-backend.onrender.com';

  const supplierProductUrls = {
    rocenta: 'https://dynaceglobal.com/dynace-rocenta/',
    dynafuel: 'https://dynaceglobal.com/dynace-dynafuel/',
    tripleroot: 'https://dynaceglobal.com/dynace-triple-root/',
    lyftmax: 'https://dynaceglobal.com/dynace-lyftmax/',
    acebrew: 'https://dynaceglobal.com/dynace-ace-brew/',
    aceguard: 'https://dynaceglobal.com/dynace-ace-guard/',
    collagene: 'https://dynaceglobal.com/dynace-collagen/',
    toothpaste: 'https://dynaceglobal.com/dynace-toothpaste/'
  };

  const itemsHtml = items.map(item => {
    const cleanId = (item.id || '').toLowerCase();
    const supUrl = supplierProductUrls[cleanId] || 'https://dynaceglobal.com/';
    return `
      <tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 600;">
          ${item.name}
          <br/>
          <a href="${supUrl}" target="_blank" style="font-size: 0.75rem; color: #d4af37; text-decoration: none; font-weight: bold;">🛒 Page Fournisseur ↗</a>
        </td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center;">x${item.quantity}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; text-align: right; font-weight: 700;">${(item.price * item.quantity).toFixed(2)} €</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
        .wrapper { max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0a3c2c 0%, #052219 100%); padding: 35px 30px; text-align: center; border-bottom: 4px solid #d4af37; }
        .logo-img { width: 70px; height: 70px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .header h1 { color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
        .badge { background-color: #d4af37; color: #0a3c2c; display: inline-block; padding: 6px 16px; border-radius: 30px; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
        .content { padding: 35px 30px; }
        .section-title { font-size: 13px; text-transform: uppercase; color: #0a3c2c; font-weight: 800; letter-spacing: 1.5px; margin: 25px 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
        .grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .grid td { vertical-align: top; width: 50%; padding-right: 15px; }
        .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 3px; }
        .val { font-size: 14px; color: #1e293b; font-weight: 600; line-height: 1.5; margin-bottom: 12px; }
        .table-items { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table-items th { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; text-align: left; padding: 10px 15px; background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; }
        .action-box { background-color: #fafbfc; border: 2px dashed #d4af37; border-radius: 12px; padding: 25px; margin-top: 30px; }
        .action-box h3 { margin: 0 0 18px 0; font-size: 16px; color: #0a3c2c; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: center; }
        .action-btn { display: block; background-color: #0a3c2c; color: #ffffff !important; text-align: center; padding: 12px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; margin-bottom: 10px; border: 1px solid #0a3c2c; box-shadow: 0 4px 10px rgba(10,60,44,0.15); transition: background-color 0.2s; }
        .action-btn:hover { background-color: #052219; }
        .action-btn-gold { background-color: #d4af37; color: #0a3c2c !important; border: 1px solid #d4af37; box-shadow: 0 4px 10px rgba(212,175,55,0.2); }
        .action-btn-gold:hover { background-color: #bfa030; }
        .footer { background-color: #f8fafc; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img class="logo-img" src="${frontendUrl}/favicon.png" alt="Logo Dynace">
          <h1>Nouvelle Commande Reçue</h1>
          <span class="badge">A Traiter 📦</span>
        </div>
        <div class="content">
          <div class="section-title">Résumé de la Commande</div>
          <table class="grid">
            <tr>
              <td>
                <div class="label">N° de Commande</div>
                <div class="val" style="font-family: monospace; font-size: 16px; color: #0a3c2c; font-weight: bold;">${orderId}</div>
                <div class="label">Date de Commande</div>
                <div class="val">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                <div class="label">Total Payé par le Client</div>
                <div class="val" style="font-size: 18px; color: #10b981; font-weight: 800;">${totalAmount.toFixed(2)} €</div>
              </td>
              <td>
                <div class="label">Client</div>
                <div class="val" style="font-weight: 700;">${user.firstName} ${user.lastName}</div>
                <div class="label">Adresse E-mail</div>
                <div class="val"><a href="mailto:${user.email}" style="color: #0a3c2c; text-decoration: none;">${user.email}</a></div>
                <div class="label">Téléphone</div>
                <div class="val">${shippingAddress.phone || 'Non renseigné'}</div>
              </td>
            </tr>
          </table>

          <div class="section-title">Adresse d'Expédition</div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 14px; line-height: 1.6; color: #334155;">
            <strong>${shippingAddress.fullName}</strong><br/>
            ${shippingAddress.address}<br/>
            ${shippingAddress.postalCode} ${shippingAddress.city}<br/>
            ${shippingAddress.country || 'France'}
          </div>

          <div class="section-title">Détails des Produits</div>
          <table class="table-items">
            <thead>
              <tr>
                <th>Produit</th>
                <th style="text-align: center;">Qté</th>
                <th style="text-align: right;">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="action-box">
            <h3>⚡ Actions Rapides Administrateur</h3>
            
            <a href="https://member.dynaceglobal.com/" target="_blank" class="action-btn action-btn-gold">
              🛒 1. Acheter le stock chez le fournisseur (Backoffice Dynace) ↗
            </a>
            
            <a href="https://www.chronopost.fr/fr/particulier/envoyer-un-colis" target="_blank" class="action-btn">
              🏷️ 2. Générer l'étiquette d'expédition (Chronopost) ↗
            </a>

            <a href="${backendUrl}/api/orders/packing-slip/${orderId}" target="_blank" class="action-btn">
              🖨️ 3. Imprimer le bon de livraison ↗
            </a>

            <a href="${frontendUrl}/?tab=admin&order=${orderId}" target="_blank" class="action-btn">
              💻 4. Voir / Traiter la commande dans l'Administration ↗
            </a>

            <a href="${frontendUrl}/?tab=admin&subtab=users&search=${user.email}" target="_blank" class="action-btn">
              👤 5. Consulter la fiche client complète ↗
            </a>
          </div>
        </div>
        <div class="footer">
          <p>Système de Notification Automatique Dynace Global France & Europe</p>
          <p>© ${new Date().getFullYear()} Dynace Global. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🛒 Nouvelle Commande #${orderId} — ${totalAmount.toFixed(2)} € — ${user.firstName} ${user.lastName}`,
    html
  });
};

export const sendCustomerOrderConfirmationEmail = async (order) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.xn--dynaceglobalsant-top-q2b.com';
  const adminEmail = process.env.ADMIN_RECEIVER_EMAIL || process.env.EMAIL_USER || 'dynaceglogal@gmail.com';

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155; font-weight: 500;">${item.name}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #64748b; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #1e293b; text-align: right; font-weight: 700;">${(item.price * item.quantity).toFixed(2)} €</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0a3c2c 0%, #052219 100%); padding: 40px 20px; text-align: center; border-bottom: 4px solid #d4af37; }
        .logo-img { width: 70px; height: 70px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .header h2 { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px; }
        .header h1 { color: #d4af37; font-size: 15px; font-weight: 600; margin: 0; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; color: #334155; }
        .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #0a3c2c; }
        .intro-text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
        .order-card { background-color: #fafcfb; border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin-bottom: 30px; }
        .order-number { font-size: 15px; font-weight: 800; color: #0a3c2c; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 15px; display: block; }
        .order-items { width: 100%; border-collapse: collapse; }
        .order-items th { font-size: 11px; text-transform: uppercase; color: #94a3b8; text-align: left; padding-bottom: 10px; }
        .totals { margin-top: 20px; width: 100%; border-collapse: collapse; text-align: right; }
        .totals-row { font-size: 14px; color: #64748b; padding: 6px 0; }
        .grand-total { font-size: 19px; font-weight: 800; color: #0a3c2c; padding-top: 12px; margin-top: 10px; border-top: 2px solid #e2e8f0; }
        .details-grid { display: table; width: 100%; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .details-col { display: table-cell; width: 50%; vertical-align: top; }
        .details-title { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px; }
        .details-val { font-size: 14px; color: #475569; line-height: 1.6; }
        .cta-container { text-align: center; margin: 40px 0 20px; }
        .cta-button { display: inline-block; background-color: #d4af37; color: #0a3c2c !important; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 35px; border-radius: 30px; letter-spacing: 0.5px; border: 2px solid #d4af37; box-shadow: 0 4px 12px rgba(212,175,55,0.25); }
        .cta-button-secondary { display: inline-block; background-color: transparent; color: #0a3c2c !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 10px 25px; border-radius: 30px; border: 2px solid #0a3c2c; margin-top: 15px; }
        .footer { text-align: center; padding: 30px; background-color: #f8fafc; font-size: 13px; color: #94a3b8; line-height: 1.6; border-top: 1px solid #e2e8f0; }
        .footer a { color: #0a3c2c; text-decoration: none; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img class="logo-img" src="${frontendUrl}/favicon.png" alt="Logo Dynace">
          <h2>DYNACE GLOBAL</h2>
          <h1>Confirmation de Commande</h1>
        </div>
        <div class="content">
          <div class="greeting">Bonjour ${order.first_name},</div>
          <div class="intro-text">
            Nous vous remercions pour votre achat ! Votre paiement a été validé avec succès. <br/>
            Notre équipe prépare actuellement vos produits avec le plus grand soin.
          </div>
          
          <div class="order-card">
            <span class="order-number">Commande n° ${order.order_number}</span>
            <table class="order-items">
              <thead>
                <tr>
                  <th style="font-size: 11px; text-transform: uppercase; color: #94a3b8; text-align: left; padding-bottom: 10px;">Produit</th>
                  <th style="font-size: 11px; text-transform: uppercase; color: #94a3b8; text-align: center; padding-bottom: 10px;">Qté</th>
                  <th style="font-size: 11px; text-transform: uppercase; color: #94a3b8; text-align: right; padding-bottom: 10px;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <table class="totals">
              <tr>
                <td class="totals-row">Sous-total :</td>
                <td class="totals-row" style="font-weight: 600; color: #334155;">${order.subtotal.toFixed(2)} €</td>
              </tr>
              ${order.discount_amount > 0 ? `
              <tr>
                <td class="totals-row" style="color: #10b981;">Réduction (${order.coupon_code}) :</td>
                <td class="totals-row" style="font-weight: 600; color: #10b981;">-${order.discount_amount.toFixed(2)} €</td>
              </tr>
              ` : ''}
              <tr>
                <td class="totals-row">Frais de livraison :</td>
                <td class="totals-row" style="font-weight: 600; color: #334155;">${order.shipping === 0 ? 'Offerts' : `${order.shipping.toFixed(2)} €`}</td>
              </tr>
              <tr>
                <td class="totals-row grand-total">Total payé :</td>
                <td class="totals-row grand-total">${order.total.toFixed(2)} €</td>
              </tr>
            </table>

            <div class="details-grid">
              <div class="details-col">
                <div class="details-title">Adresse de Livraison</div>
                <div class="details-val">
                  <strong>${order.first_name} ${order.last_name}</strong><br/>
                  ${order.address}<br/>
                  ${order.postal_code} ${order.city}<br/>
                  ${order.country || 'France'}
                </div>
              </div>
              <div class="details-col">
                <div class="details-title">Informations de livraison</div>
                <div class="details-val">
                  <strong>Mode de paiement :</strong> Carte bancaire (Stripe Sécurisé)<br/>
                  <strong>Date estimée :</strong> sous 3 à 5 jours ouvrés<br/>
                  <strong>Mode d'envoi :</strong> Livraison à domicile
                </div>
              </div>
            </div>
          </div>
          
          <div class="cta-container">
            <a href="${frontendUrl}/track?order=${order.order_number}" class="cta-button">
              🚚 Suivre ma commande en temps réel
            </a>
            <br/>
            <a href="${frontendUrl}" class="cta-button-secondary">
              👤 Accéder à mon compte
            </a>
          </div>
        </div>
        <div class="footer">
          <p>
            Une question ? Notre support client est à votre disposition par e-mail à <a href="mailto:${adminEmail}">${adminEmail}</a> ou directement via notre formulaire de contact.<br/>
            Pour votre sécurité, nous ne vous demanderons jamais vos coordonnées bancaires par e-mail.
          </p>
          <p>© ${new Date().getFullYear()} Dynace Global. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.email,
    subject: `Commande confirmée : ${order.order_number} - Dynace Global`,
    html,
    replyTo: adminEmail
  });
};

export const sendShippingConfirmationEmail = async (order, trackingNumber) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.xn--dynaceglobalsant-top-q2b.com';
  const trackingLink = `https://www.chronopost.fr/fr/chrono_suividecolis?listeNumeros=${trackingNumber}`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .email-wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #10b981; padding: 40px 20px; text-align: center; }
        .header h2 { color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; margin-bottom: 10px; }
        .header h1 { color: #ffffff; font-size: 18px; font-weight: 400; margin: 0; }
        .content { padding: 40px 30px; color: #334155; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #1e293b; }
        .intro-text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
        .tracking-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px; text-align: center; }
        .tracking-number { font-family: monospace; font-size: 20px; font-weight: bold; color: #153A89; margin: 15px 0; letter-spacing: 1px; }
        .cta-button { display: inline-block; background-color: #10b981; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 15px 35px; border-radius: 30px; letter-spacing: 0.5px; border: 2px solid #10b981; margin-top: 10px; }
        .footer { text-align: center; padding: 30px; background-color: #f1f5f9; font-size: 13px; color: #94a3b8; line-height: 1.5; }
        .footer a { color: #153A89; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h2>DYNACE GLOBAL</h2>
          <h1>Votre commande est en route !</h1>
        </div>
        <div class="content">
          <div class="greeting">Bonjour ${order.first_name || 'Client'},</div>
          <div class="intro-text">
            Bonne nouvelle ! Votre commande <strong>#${order.order_number}</strong> a été expédiée. Elle est actuellement entre les mains de Chronopost et arrive très bientôt chez vous.
          </div>
          <div class="tracking-box">
            <div style="font-size: 14px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">Numéro de suivi Chronopost</div>
            <div class="tracking-number">${trackingNumber}</div>
            <a href="${trackingLink}" target="_blank" class="cta-button">Suivre mon colis sur Chronopost</a>
          </div>
          <div style="font-size: 14px; color: #64748b; line-height: 1.5;">
            Vous pouvez également suivre l'avancée de votre préparation et la livraison directement sur notre boutique en cliquant sur le lien ci-dessous :<br/>
            <a href="${frontendUrl}/track?order=${order.order_number}" style="color: #153A89; font-weight: 600; text-decoration: none;">Suivre sur notre site</a>
          </div>
        </div>
        <div class="footer">
          <p>Ceci est un e-mail automatique, merci de ne pas y répondre directement.<br/>Pour toute question, contactez notre support via la page <a href="${frontendUrl}/contact">Contact</a>.</p>
          <p>&copy; ${new Date().getFullYear()} Dynace Global. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const adminEmail = process.env.EMAIL_USER || 'dynaceglogal@gmail.com';

  return sendEmail({
    to: order.email,
    subject: `Votre commande #${order.order_number} a été expédiée ! 🚀`,
    html,
    replyTo: adminEmail
  });
};
