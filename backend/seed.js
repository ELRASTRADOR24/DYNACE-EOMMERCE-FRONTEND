import { Product, User, Review } from './database.js';
import bcrypt from 'bcryptjs';

const initialProducts = [
  {
    id: "rocenta",
    name: "Dynace Rocenta",
    price: 60.00,
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
    price: 60.00,
    stock: 0,
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
    price: 60.00,
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
    price: 32.00,
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
    price: 60.00,
    stock: 0,
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
    price: 32.00,
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
    price: 32.00,
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
    price: 60.00,
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
    price: 60.00,
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
    price: 25.00,
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
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Synchronisation du catalogue des produits (MongoDB)...');
      for (const prod of initialProducts) {
        const updateData = {
          name: prod.name,
          price: prod.price,
          category: prod.category,
          image: prod.image,
          images: prod.images,
          summary: prod.summary,
          description: prod.description,
          benefits: prod.benefits,
          usage: prod.usage,
        };

        if (prod.stock !== undefined) {
          updateData.stock = prod.stock;
        } else {
          updateData.$setOnInsert = { stock: 50 };
        }

        await Product.findByIdAndUpdate(
          prod.id,
          updateData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Catalogue Dynace Global synchronisé avec succès.');
    } else {
      console.log('Catalogue déjà existant en base de données, pas de ré-initialisation.');
    }

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

    // Seeding de quelques avis initiaux réalistes et professionnels
    const admin = await User.findOne({ email: adminEmail });
    if (admin) {
      // Nettoyer les anciens avis de test écrits par l'admin pour insérer la nouvelle liste propre
      await Review.deleteMany({ user_id: admin._id });

      const initialReviews = [
        {
          product_id: "rocenta",
          user_id: admin._id,
          name: "Marie-Laure D.",
          rating: 4,
          comment: "J'étais un peu sceptique au début par rapport au concept de thérapie cellulaire par sachet, mais après 3 semaines d'utilisation quotidienne du Rocenta, je suis bluffée. Mon teint est visiblement plus éclatant, j'ai moins de rougeurs sur le visage et je me sens beaucoup moins fatiguée en fin de journée. Je recommande à 100% !",
          created_at: new Date('2026-02-15T14:30:22Z')
        },
        {
          product_id: "rocenta",
          user_id: admin._id,
          name: "Thomas B.",
          rating: 4,
          comment: "Très bon produit pour la peau et la vitalité. Mes douleurs aux genoux après le sport ont diminué. Le goût de melon est agréable et pas trop sucré. Seul petit bémol, le prix est un peu élevé mais la qualité est clairement là.",
          created_at: new Date('2026-03-10T11:15:45Z')
        },
        {
          product_id: "rocenta",
          user_id: admin._id,
          name: "Sandrine P.",
          rating: 3,
          comment: "Livraison un peu longue (reçu en 5 jours au lieu de 3), mais le produit lui-même est de très bonne qualité. Je commence à voir des effets sur mon sommeil.",
          created_at: new Date('2026-04-02T16:45:10Z')
        },
        {
          product_id: "tripleroot",
          user_id: admin._id,
          name: "Jean-Pierre L.",
          rating: 4,
          comment: "Un excellent café qui donne un vrai coup de fouet sans l'effet d'excitation ou de tremblement du café classique. Je le prends tous les matins avant d'aller travailler. Niveau endurance et concentration, c'est le jour et la nuit. Top !",
          created_at: new Date('2025-11-28T08:20:00Z')
        },
        {
          product_id: "tripleroot",
          user_id: admin._id,
          name: "Nicolas M.",
          rating: 5,
          comment: "Acheté sur recommandation d'un ami pour lutter contre la fatigue chronique. Non seulement le goût est excellent (très riche), mais l'effet sur l'énergie est durable sur toute la journée. Plus besoin de boire 4 cafés par jour.",
          created_at: new Date('2026-01-15T09:40:15Z')
        },
        {
          product_id: "aceguard",
          user_id: admin._id,
          name: "Catherine P.",
          rating: 5,
          comment: "Je l'utilise depuis le début de l'hiver pour renforcer mon immunité. Normalement, j'attrape tous les rhumes qui passent, mais cette année, rien du tout ! Je me sens protégée et en pleine forme.",
          created_at: new Date('2025-12-18T10:12:30Z')
        },
        {
          product_id: "aceguard",
          user_id: admin._id,
          name: "Sébastien G.",
          rating: 3,
          comment: "Très bon bouclier antioxydant. Digestion impeccable et haleine fraîche. Par contre, le goût est un peu fort au début, il faut s'y habituer. Je mets 3/5 pour le goût, mais l'efficacité est bien là.",
          created_at: new Date('2026-02-28T15:24:18Z')
        },
        {
          product_id: "collagene",
          user_id: admin._id,
          name: "Sandrine K.",
          rating: 4,
          comment: "J'ai testé de nombreuses marques de collagène, mais celle-ci est de loin la plus efficace. Mes ongles ne se dédoublent plus et mes cheveux ont retrouvé du volume. Ma peau semble aussi plus repulpée au réveil.",
          created_at: new Date('2026-03-22T17:10:05Z')
        },
        {
          product_id: "collagene",
          user_id: admin._id,
          name: "Isabelle V.",
          rating: 5,
          comment: "Excellent produit. Les rides du front se sont estompées après un mois. Je prends un sachet chaque soir avant de dormir et les résultats sont bien visibles.",
          created_at: new Date('2026-05-05T21:40:00Z')
        },
        {
          product_id: "toothpaste",
          user_id: admin._id,
          name: "Julien R.",
          rating: 4,
          comment: "Le concept jour/nuit est génial. Le dentifrice du matin donne une fraîcheur incroyable et nettoie bien les taches de café. Celui du soir est très doux pour les gencives. Mes dents sont visiblement plus blanches.",
          created_at: new Date('2026-04-18T08:30:12Z')
        },
        {
          product_id: "toothpaste",
          user_id: admin._id,
          name: "Amandine F.",
          rating: 4,
          comment: "Bonne efficacité sur la sensibilité des gencives et blanchiment progressif. Le goût du thé blanc le matin est très agréable.",
          created_at: new Date('2026-06-12T13:15:20Z')
        },
        {
          product_id: "lyftmax",
          user_id: admin._id,
          name: "Valérie M.",
          rating: 4,
          comment: "Ce produit a stabilisé mes variations d'humeur et ma fatigue liée aux cycles hormonaux. Je me sens beaucoup plus équilibrée et sereine au quotidien. Une vraie libération pour moi.",
          created_at: new Date('2026-05-19T10:05:30Z')
        },
        {
          product_id: "lyftmax",
          user_id: admin._id,
          name: "Nathalie D.",
          rating: 5,
          comment: "Excellent pour le bien-être féminin. Ma peau est plus nette et j'ai retrouvé une belle énergie physique. Je ne peux plus m'en passer.",
          created_at: new Date('2026-06-25T16:50:00Z')
        },
        {
          product_id: "acebrew",
          user_id: admin._id,
          name: "Marc A.",
          rating: 4,
          comment: "Un café de qualité supérieure avec les bienfaits du NMN. Zéro sucre ajouté, ce qui est parfait pour mon régime. Il donne une clarté d'esprit immédiate.",
          created_at: new Date('2026-06-30T09:12:45Z')
        },
        {
          product_id: "urbanism",
          user_id: admin._id,
          name: "Chloé B.",
          rating: 4,
          comment: "Le programme Jour/Nuit fonctionne à merveille. Le sachet Jour coupe la faim et donne de l'énergie, tandis que le sachet Nuit aide à dégonfler le ventre. J'ai perdu 3 kg en 3 semaines sans sensation de manque.",
          created_at: new Date('2026-05-28T14:35:10Z')
        },
        {
          product_id: "urbanism",
          user_id: admin._id,
          name: "Émilie T.",
          rating: 3,
          comment: "Très bon allié minceur. Il aide vraiment à réguler l'appétit. Par contre, le sachet Nuit me fait boire beaucoup d'eau. 3/5 à cause de ce petit désagrément, mais les kilos s'envolent.",
          created_at: new Date('2026-06-18T20:15:00Z')
        },
        {
          product_id: "dynafuel",
          user_id: admin._id,
          name: "David P.",
          rating: 4,
          comment: "Un booster de vitalité extraordinaire. Je ressens une force physique et une endurance décuplées lors de ses séances de sport. Dommage qu'il soit en rupture de stock actuellement, j'attends le réapprovisionnement avec impatience !",
          created_at: new Date('2026-07-01T15:20:00Z')
        },
        {
          product_id: "fitmax",
          user_id: admin._id,
          name: "Laurent B.",
          rating: 4,
          comment: "Le meilleur brûleur de graisses thermogénique que j'ai essayé. Il donne une pêche d'enfer pendant les entraînements et aide à sécher rapidement. Vivement le retour en stock !",
          created_at: new Date('2026-07-04T11:45:00Z')
        }
      ];
      await Review.insertMany(initialReviews);
      console.log('✅ Avis initiaux réalistes insérés dans MongoDB avec succès.');
    }
  } catch (err) {
    console.error('Erreur lors du seeding de la base de données MongoDB :', err.message);
  }
};
