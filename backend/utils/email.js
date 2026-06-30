import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
// We use a safe fallback so that the server doesn't crash if EMAIL_USER is not set yet
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'votre.email@gmail.com', // Will be set in .env
    pass: process.env.EMAIL_PASS || 'votre_mot_de_passe_application', // App password
  },
});

export const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!process.env.EMAIL_USER) {
    console.log('Simulation Email Contact (Configurez EMAIL_USER dans .env) :', { name, email, subject, message });
    return true;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to the admin
    replyTo: email, // Reply goes to the customer
    subject: `Nouveau Message de Contact : ${subject}`,
    text: `Vous avez reçu un nouveau message de : ${name} (${email})\n\nSujet : ${subject}\n\nMessage :\n${message}`,
    html: `
      <h2>Nouveau Message de Contact</h2>
      <p><strong>De :</strong> ${name} (${email})</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <hr />
      <p style="white-space: pre-wrap;">${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de contact:", error);
    return false;
  }
};

export const sendOrderNotificationEmail = async ({ orderId, user, items, totalAmount, shippingAddress }) => {
  if (!process.env.EMAIL_USER) {
    console.log('Simulation Email Commande (Configurez EMAIL_USER dans .env) :', { orderId, totalAmount });
    return true;
  }

  const itemsHtml = items.map(item => 
    `<li>${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)} €</li>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to the admin
    subject: `Nouvelle Commande Reçue ! (${totalAmount.toFixed(2)} €) - Réf: ${orderId}`,
    html: `
      <h2>Félicitations, vous avez reçu une nouvelle commande !</h2>
      <p><strong>ID Commande :</strong> ${orderId}</p>
      <p><strong>Total Payé :</strong> ${totalAmount.toFixed(2)} €</p>
      
      <h3>Client :</h3>
      <p>
        Nom : ${user.firstName} ${user.lastName}<br />
        Email : ${user.email}
      </p>

      <h3>Adresse de Livraison :</h3>
      <p>
        ${shippingAddress.fullName}<br />
        ${shippingAddress.address}<br />
        ${shippingAddress.postalCode} ${shippingAddress.city}<br />
        ${shippingAddress.country}<br />
        <strong>Téléphone :</strong> ${shippingAddress.phone || 'Non renseigné'}
      </p>

      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #334155;">📦 Étiquette Colissimo</h3>
        <p style="margin-bottom: 5px;">Voici les informations prêtes à être copiées-collées pour créer votre étiquette d'expédition :</p>
        <pre style="background: #fff; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace;">
Prénom Nom : ${shippingAddress.fullName}
Adresse : ${shippingAddress.address}
Code Postal : ${shippingAddress.postalCode}
Ville : ${shippingAddress.city}
Pays : ${shippingAddress.country}
Téléphone : ${shippingAddress.phone || ''}
Email : ${user.email}
        </pre>
        <a href="https://www.laposte.fr/colissimo-en-ligne/votre-colis" target="_blank" style="display: inline-block; background-color: #00468b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
          Aller sur Colissimo En Ligne
        </a>
      </div>

      <h3>Produits à Expédier :</h3>
      <ul>
        ${itemsHtml}
      </ul>

      <br />
      <p>Veuillez préparer le colis et informer le client via le Dashboard dès qu'il est expédié.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de commande:", error);
    return false;
  }
};

export const sendCustomerOrderConfirmationEmail = async (order) => {
  if (!process.env.EMAIL_USER) {
    console.log('Simulation Email Client (Configurez EMAIL_USER dans .env) :', { orderId: order.order_number, email: order.email });
    return true;
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} €</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Dynace Global" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Confirmation de votre commande ${order.order_number} - Dynace Global`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #153A89;">Dynace Global</h2>
          <p style="font-size: 1.1rem; color: #475569;">Merci pour votre commande !</p>
        </div>
        <p>Bonjour <strong>${order.first_name} ${order.last_name}</strong>,</p>
        <p>Votre paiement a été validé avec succès. Voici le récapitulatif de votre commande <strong>${order.order_number}</strong> :</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Produit</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantité</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; font-size: 1.1rem; margin-top: 20px;">
          <p>Sous-total : ${order.subtotal.toFixed(2)} €</p>
          <p>Livraison : ${order.shipping === 0 ? 'Gratuit' : `${order.shipping.toFixed(2)} €`}</p>
          <p style="font-size: 1.3rem; color: #153A89; font-weight: bold;">Total : ${order.total.toFixed(2)} €</p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f1f5f9; border-radius: 6px;">
          <h4 style="margin-top: 0; color: #153A89;">Adresse de livraison :</h4>
          <p style="margin-bottom: 0; color: #475569;">
            ${order.first_name} ${order.last_name}<br/>
            ${order.address}<br/>
            ${order.postal_code} ${order.city}
          </p>
        </div>
        
        <p style="margin-top: 30px; font-size: 0.9rem; color: #94a3b8; text-align: center;">
          Cet e-mail a été envoyé automatiquement. Pour toute question, contactez notre support.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de confirmation client:", error);
    return false;
  }
};
