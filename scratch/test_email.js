import { sendCustomerOrderConfirmationEmail } from '../backend/utils/email.js';

async function test() {
  console.log('Sending test customer email...');
  const success = await sendCustomerOrderConfirmationEmail({
    order_number: 'CMD-TEST-12345',
    email: 'johansonzoda@gmail.com', // Sending to the customer's personal email
    first_name: 'Jean',
    last_name: 'Dupont',
    subtotal: 90.00,
    shipping: 4.90,
    total: 94.90,
    address: '123 Avenue des Champs',
    postal_code: '75000',
    city: 'Paris',
    items: [
      { name: 'Sachet Digestion', quantity: 2, price: 45.00 }
    ]
  });
  
  if (success) {
    console.log('✅ Email client envoyé avec succès !');
  } else {
    console.log('❌ Échec de l\'envoi de l\'email client.');
  }
}

test();
