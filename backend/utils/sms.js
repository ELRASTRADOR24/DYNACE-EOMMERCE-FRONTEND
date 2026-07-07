import twilio from 'twilio';

/**
 * Envoie une notification SMS à l'administrateur lors d'une nouvelle commande.
 * Échoue silencieusement avec un avertissement si les identifiants ne sont pas configurés dans le .env
 */
export const sendAdminOrderSMS = async (order) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone || !adminPhone) {
    console.warn("⚠️ Twilio SMS : Notification non envoyée. Identifiants Twilio manquants (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, ADMIN_PHONE_NUMBER).");
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    
    // Contenu personnalisé du SMS
    const clientName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim();
    const itemsSummary = order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || 'Aucun article';
    const amount = order.totalAmount || 0;
    
    const adminUrl = `https://dynaceglobalesante-top.com/admin?tab=orders`;

    const smsBody = `🛒 Nouvelle Commande Dynace Global !\n\n` +
                    `Client : ${clientName || 'Anonyme'}\n` +
                    `Total : ${amount} €\n` +
                    `Articles : ${itemsSummary}\n` +
                    `Voir la commande : ${adminUrl}`;

    const message = await client.messages.create({
      body: smsBody,
      from: twilioPhone,
      to: adminPhone
    });

    console.log(`✅ SMS de notification envoyé avec succès à l'admin (${adminPhone}). SID : ${message.sid}`);
  } catch (err) {
    console.error("❌ Erreur d'envoi du SMS Twilio à l'admin :", err.message);
  }
};
