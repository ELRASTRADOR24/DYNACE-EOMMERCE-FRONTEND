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

// Unified mail sender supporting Resend API in production and Nodemailer in development
const sendEmail = async ({ to, subject, html, replyTo }) => {
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
      if (!res.ok) {
        console.error("Resend API Error details:", data);
        return false;
      }
      console.log("Email envoyé avec succès via Resend. ID:", data.id);
      return true;
    } catch (err) {
      console.error("Resend API Fetch error:", err.message);
      return false;
    }
  }

  // Fallback to local Nodemailer SMTP
  if (!process.env.EMAIL_USER) {
    console.log('Simulation Email (Configurez EMAIL_USER dans .env ou RESEND_API_KEY) :', { to, subject });
    return true;
  }

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
    console.log("Email envoyé avec succès via SMTP.");
    return true;
  } catch (error) {
    console.error("Nodemailer SMTP Error:", error.message);
    return false;
  }
};

export const sendContactEmail = async ({ name, email, subject, message }) => {
  const adminEmail = process.env.EMAIL_USER || 'dynaceglogal@gmail.com';
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
  const adminEmail = process.env.EMAIL_USER || 'dynaceglogal@gmail.com';

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; font-weight: 500;">${item.name}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: right; font-weight: 600;">${(item.price * item.quantity).toFixed(2)} €</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .email-wrapper { max-width: 650px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #153A89 0%, #0f2b66 100%); padding: 35px 30px; }
        .header h1 { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 1.5px; text-transform: uppercase; }
        .header p { color: #94b8ff; font-size: 14px; margin: 5px 0 0 0; }
        .alert-bar { background-color: #10b981; color: #ffffff; text-align: center; padding: 14px 20px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }
        .content { padding: 35px 30px; }
        .section-title { font-size: 13px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
        .info-grid { display: table; width: 100%; margin-bottom: 25px; }
        .info-col { display: table-cell; vertical-align: top; width: 50%; padding-right: 15px; }
        .info-col:last-child { padding-right: 0; padding-left: 15px; }
        .info-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px; }
        .info-value { font-size: 15px; color: #1e293b; font-weight: 500; line-height: 1.5; margin-bottom: 12px; }
        .order-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .order-table th { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; text-align: left; padding: 10px 15px; background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; }
        .total-row { text-align: right; padding: 8px 15px; font-size: 14px; color: #64748b; }
        .grand-total { font-size: 20px; font-weight: 800; color: #153A89; padding-top: 12px; border-top: 2px solid #e2e8f0; }
        .shipping-label { border: 3px dashed #153A89; border-radius: 12px; padding: 25px; margin: 30px 0; background-color: #fafbff; }
        .shipping-label-header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #153A89; }
        .shipping-label-header h3 { font-size: 18px; color: #153A89; margin: 0; text-transform: uppercase; font-weight: 800; }
        .shipping-label-header p { font-size: 12px; color: #64748b; margin: 5px 0 0 0; }
        .label-grid { display: table; width: 100%; }
        .label-from, .label-to { display: table-cell; vertical-align: top; width: 50%; }
        .label-from { padding-right: 15px; }
        .label-to { padding-left: 15px; border-left: 2px solid #e2e8f0; }
        .label-section-title { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
        .label-name { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .label-address { font-size: 14px; color: #475569; line-height: 1.6; }
        .label-ref { text-align: center; margin-top: 18px; padding-top: 15px; border-top: 2px solid #e2e8f0; }
        .label-ref span { font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700; color: #153A89; background-color: #eef2ff; padding: 6px 16px; border-radius: 6px; }
        .footer { text-align: center; padding: 25px 30px; background-color: #f1f5f9; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>DYNACE GLOBAL</h1>
          <p>Tableau de bord • Notification de commande</p>
        </div>
        <div class="alert-bar">
          ✅ NOUVELLE COMMANDE REÇUE — ACTION REQUISE
        </div>
        <div class="content">
          <div class="section-title">Résumé de la commande</div>
          <div class="info-grid">
            <div class="info-col">
              <div class="info-label">N° Commande</div>
              <div class="info-value" style="font-family: 'Courier New', monospace; font-size: 17px; color: #153A89; font-weight: 700;">${orderId}</div>
              <div class="info-label">Date</div>
              <div class="info-value">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              <div class="info-label">Montant total payé</div>
              <div class="info-value" style="font-size: 22px; font-weight: 800; color: #10b981;">${totalAmount.toFixed(2)} €</div>
            </div>
            <div class="info-col">
              <div class="info-label">Client</div>
              <div class="info-value" style="font-weight: 700;">${user.firstName} ${user.lastName}</div>
              <div class="info-label">Email</div>
              <div class="info-value"><a href="mailto:${user.email}" style="color: #153A89; text-decoration: none;">${user.email}</a></div>
              <div class="info-label">Téléphone</div>
              <div class="info-value">${shippingAddress.phone || 'Non renseigné'}</div>
            </div>
          </div>
          
          <div class="section-title">Adresse de livraison</div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 5px;">${shippingAddress.fullName}</div>
            <div style="font-size: 14px; color: #475569; line-height: 1.6;">
              ${shippingAddress.address}<br>
              ${shippingAddress.postalCode} ${shippingAddress.city}<br>
              ${shippingAddress.country || 'France'}
            </div>
          </div>
          
          <div class="section-title">Produits à expédier</div>
          <table class="order-table">
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
          <div class="total-row" style="text-align: right; padding: 12px 15px;">Total : ${totalAmount.toFixed(2)} €</div>
          
          <div class="shipping-label">
            <div class="shipping-label-header">
              <h3>📦 Fiche d'Expédition</h3>
              <p>Imprimez cette fiche et collez-la sur le colis, ou recopiez les informations sur Colissimo en ligne</p>
            </div>
            <div class="label-grid">
              <div class="label-from">
                <div class="label-section-title">Expéditeur</div>
                <div class="label-name">DYNACE GLOBAL</div>
                <div class="label-address">
                  (Votre adresse d'expédition)<br>
                  France
                </div>
              </div>
              <div class="label-to">
                <div class="label-section-title">Destinataire</div>
                <div class="label-name">${shippingAddress.fullName}</div>
                <div class="label-address">
                  ${shippingAddress.address}<br>
                  ${shippingAddress.postalCode} ${shippingAddress.city}<br>
                  ${shippingAddress.country || 'France'}<br>
                  ${shippingAddress.phone ? 'Tél: ' + shippingAddress.phone : ''}
                </div>
              </div>
            </div>
            <div class="label-ref">
              <span>REF: ${orderId}</span>
            </div>
          </div>
          
          <div style="margin-top: 30px; background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 100%); border: 2px solid #153A89; border-radius: 14px; padding: 25px; ">
            <h3 style="font-size: 17px; color: #153A89; margin: 0 0 18px 0; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; text-align: center;">🚚 Envoyer le colis en 3 étapes</h3>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="background-color: #153A89; color: #fff; font-size: 14px; font-weight: 800; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; margin-right: 10px;">1</span>
                <strong style="font-size: 15px; color: #1e293b;">Cliquez sur le lien ci-dessous pour aller sur Colissimo</strong>
              </div>
              <div style="text-align: center; margin: 10px 0;">
                <a href="https://www.laposte.fr/colissimo-en-ligne/expedier" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00468b 0%, #153A89 100%); color: #ffffff; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,70,139,0.3);">
                  📦 Ouvrir Colissimo en ligne →
                </a>
              </div>
              <div style="text-align: center; margin-top: 8px;">
                <a href="https://www.mondialrelay.fr" target="_blank" style="color: #64748b; font-size: 12px; text-decoration: underline;">ou utiliser Mondial Relay</a>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="background-color: #153A89; color: #fff; font-size: 14px; font-weight: 800; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; margin-right: 10px;">2</span>
                <strong style="font-size: 15px; color: #1e293b;">Achetez l'étiquette d'envoi en recopiant les informations</strong>
              </div>
              <p style="font-size: 14px; color: #475569; margin: 0 0 0 38px; line-height: 1.5;">Utilisez l'adresse du destinataire ci-dessus. Une fois payée, imprimez votre fiche Colissimo et collez-la sur votre paquet.</p>
            </div>
            
            <div>
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="background-color: #153A89; color: #fff; font-size: 14px; font-weight: 800; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; margin-right: 10px;">3</span>
                <strong style="font-size: 15px; color: #1e293b;">Renseignez le numéro de suivi dans l'administration</strong>
              </div>
              <p style="font-size: 14px; color: #475569; margin: 0 0 0 38px; line-height: 1.5;">Allez sur votre tableau de bord admin, passez la commande en statut "Expédié" et saisissez le numéro de suivi Colissimo obtenu. Le client sera alors notifié automatiquement par e-mail avec son lien de suivi.</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>Dynace Global Administration System • Automated Notification</p>
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
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} €</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .email-wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #153A89; padding: 40px 20px; text-align: center; }
        .header h2 { color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
        .header h1 { color: #e2e8f0; font-size: 18px; font-weight: 400; margin: 0; }
        .content { padding: 40px 30px; color: #334155; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #1e293b; }
        .intro-text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
        .order-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px; }
        .order-card-header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px; }
        .order-number { font-size: 16px; font-weight: 700; color: #153A89; }
        .order-items { width: 100%; border-collapse: collapse; }
        .order-items th { font-size: 12px; text-transform: uppercase; color: #94a3b8; text-align: left; padding-bottom: 10px; }
        .order-items td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 15px; }
        .item-name { font-weight: 600; color: #334155; }
        .item-qty { color: #64748b; font-size: 14px; text-align: center; }
        .item-price { text-align: right; font-weight: 500; }
        .totals { margin-top: 20px; width: 100%; text-align: right; }
        .totals-row { padding: 5px 0; font-size: 14px; color: #64748b; }
        .grand-total { font-size: 18px; font-weight: 700; color: #153A89; padding-top: 10px; margin-top: 10px; border-top: 2px solid #e2e8f0; }
        .shipping-box { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .shipping-title { font-size: 13px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 10px; letter-spacing: 0.5px; }
        .shipping-address { font-size: 15px; line-height: 1.5; color: #475569; }
        .cta-container { text-align: center; margin: 40px 0 20px; }
        .cta-button { display: inline-block; background-color: #00ACD8; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 15px 35px; border-radius: 30px; letter-spacing: 0.5px; border: 2px solid #00ACD8; }
        .footer { text-align: center; padding: 30px; background-color: #f1f5f9; font-size: 13px; color: #94a3b8; line-height: 1.5; }
        .footer a { color: #153A89; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h2>DYNACE GLOBAL</h2>
          <h1>Merci d'avoir acheté chez nous</h1>
        </div>
        <div class="content">
          <div class="greeting">Bonjour ${order.first_name},</div>
          <div class="intro-text">
            Nous sommes ravis de vous confirmer que votre paiement a bien été reçu.<br/>
            <strong>Votre colis sera préparé et expédié sous peu.</strong> Nos équipes y accordent le plus grand soin.
          </div>
          
          <div class="order-card">
            <div class="order-card-header">
              <span class="order-number">Commande n° ${order.order_number}</span>
            </div>
            <table class="order-items">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th style="text-align: center;">Qté</th>
                  <th style="text-align: right;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="totals">
              <div class="totals-row">Sous-total : ${order.subtotal.toFixed(2)} €</div>
              <div class="totals-row">Frais de livraison : ${order.shipping === 0 ? 'Offerts' : `${order.shipping.toFixed(2)} €`}</div>
              <div class="grand-total">Total payé : ${order.total.toFixed(2)} €</div>
            </div>
          </div>
          
          <div class="shipping-box">
            <div class="shipping-title">Adresse de Livraison</div>
            <div class="shipping-address">
              <strong>${order.first_name} ${order.last_name}</strong><br/>
              ${order.address}<br/>
              ${order.postal_code} ${order.city}
            </div>
          </div>
          
          <div class="cta-container">
            <a href="https://dynace-shop.vercel.app/track?order=${order.order_number}&email=${encodeURIComponent(order.email)}" class="cta-button">
              Suivre ma commande en temps réel
            </a>
          </div>
        </div>
        <div class="footer">
          <p>
            Ceci est un e-mail automatique, merci de ne pas y répondre directement.<br/>
            Pour toute question, contactez notre support client via la page <a href="https://dynace-shop.vercel.app/contact">Contact</a> de notre site.
          </p>
          <p>&copy; ${new Date().getFullYear()} Dynace Global. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.email,
    subject: `Commande confirmée : ${order.order_number} - Dynace Global`,
    html
  });
};

export const sendShippingConfirmationEmail = async (order, trackingNumber) => {
  const trackingLink = `https://www.laposte.fr/outils/suivre-un-envoi?code=${trackingNumber}`;

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
            Bonne nouvelle ! Votre commande <strong>#${order.order_number}</strong> a été expédiée. Elle est actuellement entre les mains du transporteur et arrive très bientôt chez vous.
          </div>
          <div class="tracking-box">
            <div style="font-size: 14px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">Numéro de suivi Colissimo</div>
            <div class="tracking-number">${trackingNumber}</div>
            <a href="${trackingLink}" target="_blank" class="cta-button">Suivre mon colis sur La Poste</a>
          </div>
          <div style="font-size: 14px; color: #64748b; line-height: 1.5;">
            Vous pouvez également suivre l'avancée de votre préparation et la livraison directement sur notre boutique en cliquant sur le lien ci-dessous :<br/>
            <a href="https://dynace-shop.vercel.app/track?order=${order.order_number}&email=${encodeURIComponent(order.email)}" style="color: #153A89; font-weight: 600; text-decoration: none;">Suivre sur notre site</a>
          </div>
        </div>
        <div class="footer">
          <p>Ceci est un e-mail automatique, merci de ne pas y répondre directement.<br/>Pour toute question, contactez notre support via la page <a href="https://dynace-shop.vercel.app/contact">Contact</a>.</p>
          <p>&copy; ${new Date().getFullYear()} Dynace Global. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.email,
    subject: `Votre commande #${order.order_number} a été expédiée ! 🚀`,
    html
  });
};
