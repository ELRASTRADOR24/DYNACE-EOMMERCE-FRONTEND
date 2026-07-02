import { Product, User, Review } from './database.js';
import bcrypt from 'bcryptjs';

const initialProducts = [
  {
    id: "rocenta",
    name: "Dynace Rocenta",
    price: 49.90,
    category: "vitalite",
    image: "/images/rocenta.png",
    images: ["/images/rocenta.png", "/images/rocenta_2.png", "/images/rocenta_3.png"],
    summary: "Soutien à la vitalité cellulaire — régénération, hydratation et éclat de l'intérieur.",
    description: "Rocenta est l'élixir ultime de vitalité cellulaire. Cette formule d'exception régénère votre organisme en profondeur, redonne éclat et jeunesse à votre peau, et renforce vos articulations, vos ongles et vos cheveux. Profitez d'une sensation de bien-être absolu et d'une énergie débordante chaque jour.",
    benefits: [
      "Active la régénération cellulaire et la jeunesse de la peau",
      "Renforce et assouplit les articulations et les os",
      "Améliore considérablement la qualité du repos et de la relaxation",
      "Sublime l'éclat des cheveux et la force des ongles"
    ],
    usage: "Prendre un sachet par jour de préférence le matin avant le petit-déjeuner."
  },
  {
    id: "dynafuel",
    name: "Dynace Dynafuel",
    price: 39.90,
    category: "energie",
    image: "/images/dynafuel.png",
    images: ["/images/dynafuel.png", "/images/dynafuel_2.png", "/images/dynafuel_3.png"],
    summary: "Supplément d'énergie cellulaire et de vitalité masculine pour hommes actifs.",
    description: "Dynafuel est un puissant booster de performance et de vitalité masculine. Spécialement formulé pour libérer une énergie cellulaire maximale, il déploie une endurance physique et mentale hors du commun au quotidien, renforce les défenses naturelles et favorise une concentration laser pour relever tous vos défis.",
    benefits: [
      "Booste instantanément l'énergie cellulaire et l'endurance",
      "Maximise les performances physiques et la force musculaire",
      "Renforce intensément le système immunitaire",
      "Optimise la clarté mentale et la concentration laser"
    ],
    usage: "Diluer un sachet dans 100ml d'eau tiède. À consommer en milieu de journée."
  },
  {
    id: "urbanism",
    name: "Dynace Urbanism",
    price: 42.90,
    category: "minceur",
    image: "/images/urbanism.png",
    images: ["/images/urbanism.png", "/images/urbanism_2.png", "/images/urbanism_3.png"],
    summary: "Soutien à la gestion du poids Jour & Nuit — brûlez le jour, détoxifiez la nuit.",
    description: "Urbanism réinvente la minceur avec sa double formule révolutionnaire Jour & Nuit. Brûlez activement les graisses et accélérez votre métabolisme pendant la journée, puis laissez l'organisme éliminer les toxines et affiner votre silhouette pendant votre sommeil. L'allié parfait pour sculpter votre corps sans frustration.",
    benefits: [
      "Accélère la combustion des graisses et le métabolisme (jour)",
      "Régule naturellement l'appétit et élimine les fringales",
      "Détoxifie l'organisme en profondeur pendant la nuit",
      "Aplatit le ventre et facilite une digestion légère"
    ],
    usage: "Un sachet Jour dilué dans 150ml d'eau le matin. Un sachet Nuit le soir au coucher."
  },
  {
    id: "acebrew",
    name: "Dynace Ace Brew",
    price: 24.90,
    category: "energie",
    image: "/images/acebrew.png",
    images: ["/images/acebrew.png", "/images/acebrew_2.png", "/images/acebrew_3.png"],
    summary: "Café au NMN sans sucre ajouté — savourez votre café, libérez votre vitalité cellulaire.",
    description: "Découvrez Ace Brew, le café premium enrichi en NMN pour allier plaisir gourmand et longévité cellulaire. Sans aucun sucre ajouté, cette boisson d'exception libère une énergie constante, favorise la jeunesse cellulaire de votre organisme, et apporte une clarté d'esprit remarquable dès la première tasse.",
    benefits: [
      "Enrichi en NMN pour stimuler la jeunesse et la longévité cellulaire",
      "Zéro sucre ajouté — goût de café riche et authentique",
      "Procure une énergie propre et durable sans excitation",
      "Favorise la concentration et la mémoire au quotidien"
    ],
    usage: "Dissoudre un sachet dans une tasse d'eau chaude (150ml). À déguster le matin."
  },
  {
    id: "fitmax",
    name: "Dynace FitMax",
    price: 35.90,
    category: "minceur",
    image: "/images/fitmax.png",
    images: ["/images/fitmax.png"],
    summary: "Formule thermogénique avancée pour optimiser le contrôle du poids.",
    description: "FitMax est le brûleur de graisse thermogénique le plus puissant de sa génération. Formulé pour activer instantanément la perte de poids, il cible les graisses stockées, réduit l'absorption des sucres et transforme vos calories en énergie pure pour sculpter rapidement et sans fatigue la silhouette de vos rêves.",
    benefits: [
      "Cible et élimine rapidement les graisses stockées",
      "Bloque efficacement l'assimilation des glucides",
      "Fournit une énergie physique débordante et constante",
      "Aide à réguler le taux de sucre pour éviter le stockage"
    ],
    usage: "Prendre un sachet dilué dans un verre d'eau 30 minutes avant le repas principal."
  },
  {
    id: "aceguard",
    name: "Dynace Ace Guard",
    price: 38.90,
    category: "vitalite",
    image: "/images/aceguard.png",
    images: ["/images/aceguard.png", "/images/aceguard_2.png", "/images/aceguard_3.png"],
    summary: "Votre bouclier immunitaire quotidien — protection antioxydante et soutien à la longévité.",
    description: "Ace Guard est le bouclier antioxydant ultime de votre organisme. Grâce à sa synergie de super-nutriments, il renforce puissamment vos défenses naturelles, prévient les signes du vieillissement et maintient une vitalité et une respiration optimales tout au long de l'année.",
    benefits: [
      "Renforce et consolide le système immunitaire",
      "Puissant effet antioxydant contre le vieillissement cellulaire",
      "Soutient la respiration et la vitalité globale",
      "Maintient un métabolisme sain et équilibré au quotidien"
    ],
    usage: "Un sachet par jour dilué dans un verre d'eau tempérée le matin à jeun."
  },
  {
    id: "tripleroot",
    name: "Dynace Triple Root Coffee",
    price: 27.90,
    category: "energie",
    image: "/images/tripleroot.png",
    images: ["/images/tripleroot.png", "/images/tripleroot_2.png", "/images/tripleroot_3.png"],
    summary: "Café vitalité pour hommes — endurance, résilience et clarté d'esprit au quotidien.",
    description: "Triple Root Coffee est la boisson de force par excellence. Ce café d'exception, formulé à base de racines de plantes puissantes, décuple instantanément l'endurance masculine, booste les performances physiques, active une concentration absolue et combat efficacement la fatigue physique et nerveuse.",
    benefits: [
      "Décuple l'endurance et les performances physiques masculines",
      "Procure un surcroît d'énergie et de vitalité immédiat",
      "Favorise une excellente circulation sanguine",
      "Renforce la résistance au stress et à la fatigue quotidienne"
    ],
    usage: "Dissoudre un sachet dans 150ml d'eau chaude. Une tasse le matin pour démarrer avec vigueur."
  },
  {
    id: "lyftmax",
    name: "Dynace LyftMax",
    price: 44.90,
    category: "vitalite",
    image: "/images/lyftmax.png",
    images: ["/images/lyftmax.png", "/images/lyftmax_2.png", "/images/lyftmax_3.png"],
    summary: "Le bien-être au féminin, chaque jour — équilibre hormonal, éclat et vitalité.",
    description: "LyftMax est l'élixir d'équilibre et de beauté spécialement conçu pour les femmes. Cette formule précieuse harmonise naturellement le corps féminin, booste l'énergie quotidienne, favorise la santé des os et révèle un teint éclatant de jeunesse et de fermeté.",
    benefits: [
      "Harmonise et régule naturellement l'équilibre féminin",
      "Redonne éclat, fermeté et jeunesse à la peau",
      "Fortifie la structure osseuse et le confort articulaire",
      "Procure bien-être physique et sérénité mentale au quotidien"
    ],
    usage: "Un sachet dilué dans 200ml d'eau fraîche par jour, de préférence le matin."
  },
  {
    id: "collagene",
    name: "Dynace Collagène Beauté",
    price: 46.90,
    category: "beaute",
    image: "/images/collagene.png",
    images: ["/images/collagene.png", "/images/collagene_2.png", "/images/collagene_3.png"],
    summary: "Élixir de beauté cellulaire — peau repulpée, cheveux renforcés, ongles solides.",
    description: "Le Collagène Beauté Dynace est un véritable élixir de jeunesse. Associant collagène marin ultra-biodisponible, acide hyaluronique et Coenzyme Q10, cette formule haut de gamme repulpe la peau, estompe visiblement les rides, fortifie intensément les cheveux et les ongles, et redonne confort à vos articulations.",
    benefits: [
      "Repulpe visiblement la peau et lisse les rides et ridules",
      "Hydrate la peau en profondeur pour un effet rebondi immédiat",
      "Régénère et fortifie la fibre capillaire et les ongles",
      "Préserve la jeunesse et la souplesse des articulations"
    ],
    usage: "Mélanger un sachet dans un verre d'eau fraîche le soir au coucher."
  },
  {
    id: "toothpaste",
    name: "Dynace Duo Toothpaste",
    price: 19.90,
    category: "beaute",
    image: "/images/toothpaste.png",
    images: ["/images/toothpaste.png", "/images/toothpaste_2.png", "/images/toothpaste_3.png"],
    summary: "Soin bucco-dentaire Jour & Nuit — MorningShield au Thé Blanc & NightRestore aux Herbes.",
    description: "Le Dynace Duo Toothpaste réinvente votre sourire avec son protocole Jour & Nuit unique. MorningShield (Thé Blanc) blanchit l'émail et garantit une haleine fraîche toute la journée. NightRestore (Plantes apaisantes) répare les gencives et assainit la bouche durant votre sommeil pour une protection totale 24h/24.",
    benefits: [
      "Blanchit l'émail et protège contre les taches au quotidien",
      "Assure une haleine ultra-fraîche du matin au soir",
      "Apaise et renforce activement les gencives sensibles",
      "Soin complet 24h/24 pour un sourire éclatant de santé"
    ],
    usage: "Utiliser MorningShield (tube Thé Blanc) le matin et NightRestore (tube Menthe) le soir."
  }
];

export const seedProducts = async () => {
  try {
    console.log('Synchronisation du catalogue des produits (MongoDB)...');
    for (const prod of initialProducts) {
      await Product.findByIdAndUpdate(
        prod.id,
        {
          name: prod.name,
          price: prod.price,
          category: prod.category,
          image: prod.image,
          images: prod.images,
          summary: prod.summary,
          description: prod.description,
          benefits: prod.benefits,
          usage: prod.usage,
          $setOnInsert: { stock: 50 }
        },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Catalogue Dynace Global synchronisé avec succès.');

    // Seeding de l'utilisateur Administrateur par défaut
    const adminEmail = 'admin@dynace.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin12345', 10);
      const newAdmin = new User({
        first_name: 'Admin',
        last_name: 'Dynace',
        email: adminEmail,
        password: hashedPassword,
        address: 'Boutique Dynace Global',
        postal_code: '75001',
        city: 'Paris',
        is_admin: true
      });
      await newAdmin.save();
      console.log('✅ Utilisateur Administrateur par défaut créé : admin@dynace.com / admin12345');
    }

    // Seeding de quelques avis initiaux si la table est vide
    const reviewsCount = await Review.countDocuments();
    if (reviewsCount === 0) {
      const admin = await User.findOne({ email: adminEmail });
      if (admin) {
        const initialReviews = [
          {
            product_id: "rocenta",
            user_id: admin._id,
            name: "Sophie M.",
            rating: 5,
            comment: "Le Dynace Rocenta a complètement transformé ma forme physique. Je ressens une vitalité incroyable au quotidien et ma peau est devenue éclatante et bien plus ferme !"
          },
          {
            product_id: "tripleroot",
            user_id: admin._id,
            name: "Lucas R.",
            rating: 5,
            comment: "Le Triple Root Coffee est exceptionnel. Il me donne un boost d'énergie immédiat sans les palpitations ni les crashs de l'après-midi du café classique. Le goût est délicieux !"
          },
          {
            product_id: "aceguard",
            user_id: admin._id,
            name: "Clara D.",
            rating: 5,
            comment: "AceGuard a été un miracle pour ma digestion. Plus de ballonnements ni de lourdeurs après les repas, mon ventre est redevenu plat et ma flore intestinale est en pleine santé."
          }
        ];
        await Review.insertMany(initialReviews);
        console.log('✅ Avis initiaux insérés dans MongoDB avec succès.');
      }
    }
  } catch (err) {
    console.error('Erreur lors du seeding de la base de données MongoDB :', err.message);
  }
};
