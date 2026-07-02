const BASE_URL = 'https://dynace-backend.onrender.com';

async function testAll() {
  console.log("=== DEBUT DE L'INTEGRATION DES TESTS SUR L'API DE PRODUCTION ===");
  let failed = false;

  // Test 1: GET /api/products
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();
    
    // Check if FitMax is present
    const fitmax = products.find(p => p.id === 'fitmax');
    if (!fitmax) {
      console.error("❌ Test 1: Dynace FitMax est introuvable.");
      failed = true;
    } else {
      console.log("✅ Test 1: GET /api/products fonctionne. FitMax est présent.");
      if (fitmax.description.includes("brûleur de graisse thermogénique le plus puissant")) {
        console.log("   -> Description FitMax mise à jour et vendeuse.");
      } else {
        console.error("   ❌ Description FitMax non mise à jour.");
        failed = true;
      }
    }
  } catch (err) {
    console.error("❌ Test 1 échoué :", err.message);
    failed = true;
  }

  // Test 2: POST /api/newsletter/subscribe
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log("✅ Test 2: Inscription Newsletter réussie.");
    } else {
      console.error("❌ Test 2 échoué :", data.error || "Réponse non conforme.");
      failed = true;
    }
  } catch (err) {
    console.error("❌ Test 2 échoué :", err.message);
    failed = true;
  }

  // Test 3: POST /api/contact
  try {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        subject: "Question Produit",
        message: "Ceci est un message de test automatique en production avec les nouveaux identifiants."
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log("✅ Test 3: Envoi message Contact réussi.");
    } else {
      console.error("❌ Test 3 échoué :", data.error || "Erreur serveur.");
      failed = true;
    }
  } catch (err) {
    console.error("❌ Test 3 échoué :", err.message);
    failed = true;
  }

  // Test 4: GET /api/orders/track/:orderNumber (Security check)
  try {
    // 4a: Without email (should return 400)
    const resNoEmail = await fetch(`${BASE_URL}/api/orders/track/nonexistent`);
    if (resNoEmail.status === 400) {
      console.log("✅ Test 4a: L'accès sans e-mail est bloqué (400 Bad Request) - Sécurité OK.");
    } else {
      console.error("❌ Test 4a échoué : Devrait retourner 400 sans email. Status:", resNoEmail.status);
      failed = true;
    }

    // 4b: With wrong email (should return 403 or 404 since it's nonexistent)
    const resWrongEmail = await fetch(`${BASE_URL}/api/orders/track/nonexistent?email=test@example.com`);
    if (resWrongEmail.status === 404) {
      console.log("✅ Test 4b: Commande inexistante avec email retourne bien 404 - OK.");
    } else {
      console.error("❌ Test 4b échoué : Devrait retourner 404. Status:", resWrongEmail.status);
      failed = true;
    }
  } catch (err) {
    console.error("❌ Test 4 échoué :", err.message);
    failed = true;
  }

  // Test 5: POST /api/auth/login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "admin@dynace.com",
        password: "admin12345"
      })
    });
    const data = await res.json();
    if (res.ok && data.token && data.user.isAdmin) {
      console.log("✅ Test 5: Connexion en Administrateur réussie.");
    } else {
      console.error("❌ Test 5 échoué : Connexion administrative rejetée.", data);
      failed = true;
    }
  } catch (err) {
    console.error("❌ Test 5 échoué :", err.message);
    failed = true;
  }

  console.log("\n=== BILAN DES TESTS DE PRODUCTION ===");
  if (failed) {
    console.error("❌ Certains tests ont échoué en production. Veuillez vérifier les logs.");
    process.exit(1);
  } else {
    console.log("🎉 Tous les tests API se sont déroulés avec succès sur le serveur live de production !");
    process.exit(0);
  }
}

testAll();
