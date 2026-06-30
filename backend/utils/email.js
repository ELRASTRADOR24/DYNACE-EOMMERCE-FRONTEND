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

      <h3>Adresse de Livraison (La Poste) :</h3>
      <p>
        ${shippingAddress.fullName}<br />
        ${shippingAddress.address}<br />
        ${shippingAddress.postalCode} ${shippingAddress.city}<br />
        ${shippingAddress.country}<br />
        <strong>Téléphone :</strong> ${shippingAddress.phone || 'Non renseigné'}
      </p>

      <h3>Produits à Expédier :</h3>
      <ul>
        ${itemsHtml}
      </ul>

      <br />
      <p>Veuillez préparer le colis et informer le client dès qu'il est expédié.</p>
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
