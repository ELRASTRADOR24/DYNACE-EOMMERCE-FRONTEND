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
    summary: "Thérapie cellulaire globale — Régénération, immunité & réparation ADN (Formule originale du Dr. Raj).",
    description: "Rocenta est le produit phare de Dynace Global. Formulé à 100% à base de plantes et de cellules souches végétales sans aucun effet secondaire, il stimule la régénération cellulaire profonde, répare l'ADN, purifie l'organisme et inverse le processus de vieillissement.",
    ingredients: [
      "Placenta de Rose Bulgare (Cellules Souches Végétales)",
      "NMN (Nicotinamide Mononucléotide — Recherche Harvard)",
      "Extrait d'Algue Brune (Élimination des métaux lourds)",
      "Extrait de Germe de Lotus (Éclat & jeunesse de la peau)",
      "Melon Amer (Glycémie & régulation du cholestérol)",
      "Ashwagandha (Sommeil profond & fertilité)",
      "Coenzyme Q10 (Santé cardiaque & énergie)",
      "Clou de Girofle (Puissant antioxydant)",
      "Luzerne / Alfalfa (Richesse en minéraux & vitalité)"
    ],
    benefits: [
      "Stimule la régénération naturelle des cellules souches dans le corps",
      "Inverse le vieillissement cellulaire et aide à réparer l'ADN",
      "Améliore la circulation sanguine vers tous les organes vitaux",
      "Favorise un sommeil profond, réparateur et régénérant",
      "Purifie l'organisme et réduit les gonflements et douleurs"
    ],
    usage: "Le matin à jeun. Découper le sachet avec des ciseaux. Verser la poudre SOUS la langue. Laisser dissoudre 30 secondes à 1 minute. Attendre AU MOINS 20 minutes avant de boire de l'eau ou de manger. Boire 2 à 3 litres d'eau dans les 24h.",
    doctorNotes: "Conseil Dr. Raj : Les 7 à 10 premiers jours, consommer 1 jour sur 2 (lundi oui, mardi non...) pour habituer l'organisme. Maximum 2 sachets/jour."
  },
  {
    id: "aceguard",
    name: "Dynace Ace Guard",
    price: 32.00,
    category: "vitalite",
    image: "/images/aceguard.png",
    images: ["/images/aceguard.png", "/images/aceguard_2.png", "/images/aceguard_3.png"],
    summary: "Bouclier immunitaire & protection cellulaire (Triple formulation de cellules souches).",
    description: "Aceguard est l'armure antioxydante de référence développée par Dynace Global. Enrichi d'une triple formulation de cellules souches et d'ingrédients botaniques exclusifs, il protège le cœur, le foie, régule la glycémie et renforce massivement le système immunitaire.",
    ingredients: [
      "Triple formulation de Cellules Souches végétales",
      "Bêta-Glucane d'Algues (Immunité & régulation glycémie)",
      "Gymnema Sylvestre (Contrôle du taux de sucre sanguin)",
      "Champignon Lait de Tigre (Santé cardiovasculaire & pulmonaire)",
      "Extrait de Graine Noire / Nigelle (Immunité & cœur)",
      "Feuille de Mûrier Blanc (Santé du foie & détoxification)"
    ],
    benefits: [
      "Renforcement puissant et durable du système immunitaire",
      "Soutien respiratoire (asthme, pneumonie, sinusite)",
      "Soulagement des douleurs articulaires et de l'arthrite",
      "Protection de la muqueuse gastrique et prévention des ulcères",
      "Action synergique renforcée lorsqu'il est combiné avec Rocenta"
    ],
    usage: "Le matin à jeun. Diluer 1 sachet dans exactement 100 ml d'eau plate (température ambiante). JAMAIS d'eau chaude ! Attendre 15 à 20 minutes avant de manger ou boire.",
    doctorNotes: "Ne jamais diluer dans de l'eau chaude. En cure combinée avec Rocenta, attendre 15-20 minutes entre les deux."
  },
  {
    id: "urbanism",
    name: "Dynace Urbanism (Sunz + Moonz)",
    price: 60.00,
    category: "minceur",
    image: "/images/urbanism.png",
    images: ["/images/urbanism.png", "/images/urbanism_2.png", "/images/urbanism_3.png"],
    summary: "Gestion du poids ciblée Jour & Nuit — Brûlez le jour (SUNZ), purifiez la nuit (MOONZ).",
    description: "Urbanism est le programme minceur révolutionnaire du Dr. Raj. Contrairement aux régimes restrictifs, Urbanism vous permet de conserver vos 3 repas quotidiens normaux. SUNZ (Morosil® Orange Sicilienne) brûle la graisse viscérale le jour, tandis que MOONZ (Sinetrol® France) purifie et évacue les toxines pendant la nuit.",
    ingredients: [
      "Morosil® (Extrait d'Orange Sicilienne breveté - Brûleur diurne)",
      "Sinetrol® (Actif breveté origine France - Purificateur nocturne)",
      "Complexe d'extraits botaniques coupe-faim naturels",
      "Agents remodelants de la silhouette et du métabolisme"
    ],
    benefits: [
      "Cible en priorité la graisse viscérale (interne) profonde",
      "SUNZ le matin : active la combustion des graisses et régule l'appétit",
      "MOONZ le soir (1-2h avant le coucher) : élimine les toxines pendant la nuit",
      "Permet de perdre du poids tout en gardant 3 repas normaux par jour",
      "Formule de cure Dr. Raj : Nombre de boîtes = (Kilos à perdre ÷ 2) + 1"
    ],
    usage: "SUNZ le matin avec le petit-déjeuner. MOONZ 1h à 2h avant le coucher. Consommer quotidiennement avec constance.",
    doctorNotes: "Calculateur officiel : Pour 10 kg à perdre, commander (10 ÷ 2) + 1 = 6 boîtes de cure."
  },
  {
    id: "acebrew",
    name: "Dynace Ace Brew Coffee",
    price: 32.00,
    category: "energie",
    image: "/images/acebrew.png",
    images: ["/images/acebrew.png", "/images/acebrew_2.png", "/images/acebrew_3.png"],
    summary: "Le café santé & longévité au NMN — Contrôle la glycémie et régénère les cellules.",
    description: "Acebrew est l'un des cafés les plus sains au monde. Combinant du NMN (Nicotinamide Mononucléotide) et du Gymnema Sylvestre, il remplace le café sucré nocif par une boisson d'exception qui normalise le taux de sucre, booste l'énergie et prévient le vieillissement.",
    ingredients: [
      "NMN (Nicotinamide Mononucléotide — Longévité cellulaire)",
      "Gymnema Sylvestre (Normalise la glycémie et le sucre)",
      "Café Arabica Premium sélectionné (Zéro sucre artificiel ajouté)"
    ],
    benefits: [
      "Normalise le taux de sucre dans le sang (idéal pour diabétiques)",
      "Procure une énergie propre, constante et sans énervement",
      "Stimule la jeunesse cellulaire et protège contre le vieillissement",
      "Favorise la concentration et la mémoire dès la première tasse"
    ],
    usage: "Dissoudre un sachet dans 150ml d'eau chaude. À savourer le matin au petit-déjeuner.",
    doctorNotes: "Point fort Dr. Raj : Contrôle la glycémie chez les diabétiques, contrairement aux cafés sucrés industriels."
  },
  {
    id: "fitmax",
    name: "Dynace FitMax",
    price: 60.00,
    stock: 0,
    category: "minceur",
    image: "/images/fitmax.png",
    images: ["/images/fitmax.png"],
    summary: "Formule thermogénique avancée pour la combustion des graisses tenaces.",
    description: "FitMax est le complément thermogénique développé pour stimuler le métabolisme et accélérer la perte de masse grasse lors d'un programme d'affinement ou d'activité physique régulière.",
    ingredients: [
      "Extraits Thermogéniques botaniques",
      "Brûleurs de lipides concentrés",
      "Complexes énergisants anti-fatigue"
    ],
    benefits: [
      "Active la thermogenèse et la combustion des graisses",
      "Transforme les réserves lipidiques en énergie physique",
      "Aide à affiner la silhouette et redessiner la masse musculaire",
      "Prévient les baisses de forme durant l'affinement"
    ],
    usage: "Prendre un sachet dilué dans un verre d'eau 30 minutes avant le repas principal.",
    doctorNotes: "Peut être combiné avec Urbanism pour des résultats accélérés."
  },
  {
    id: "tripleroot",
    name: "Dynace Triple Root Coffee",
    price: 32.00,
    category: "energie",
    image: "/images/tripleroot.png",
    images: ["/images/tripleroot.png", "/images/tripleroot_2.png", "/images/tripleroot_3.png"],
    summary: "Café vitalité & santé sexuelle masculine — Testostérone, endurance & performance.",
    description: "Triple Root Coffee est réservé aux hommes adultes. Après 40 ans, la baisse de testostérone diminue l'énergie et la puissance sexuelle. Formulé à partir de racines puissantes, il augmente naturellement le taux de testostérone, prolonge l'érection et améliore la qualité spermatique.",
    ingredients: [
      "Extrait de Triple Racines Végétales Ancestrales",
      "Actifs tonifiants masculins concentrés",
      "Café de spécialité riche en antioxydants"
    ],
    benefits: [
      "Augmente naturellement le taux de testostérone masculine",
      "Prolonge la durée de l'érection et la vigueur",
      "Améliore le nombre et la qualité des spermatozoïdes (oligospermie)",
      "Stimule la libido et combat la fatigue nerveuse et physique"
    ],
    usage: "RÉSERVÉ AUX HOMMES ADULTES. Mélanger 1/2 sachet dans 80ml d'eau chaude 1h à 2h avant le moment intime.",
    doctorNotes: "AVERTISSEMENT DR. RAJ : Réservé aux hommes adultes UNIQUEMENT. Ne JAMAIS donner aux enfants ou adolescents."
  },
  {
    id: "lyftmax",
    name: "Dynace LyftMax",
    price: 60.00,
    category: "vitalite",
    image: "/images/lyftmax.png",
    images: ["/images/lyftmax.png", "/images/lyftmax_2.png", "/images/lyftmax_3.png"],
    summary: "Santé hormonale & beauté féminine — Estro-G 100®, fermeté poitrine & ménopause.",
    description: "Lyftmax est le soin d'exception dédié à l'équilibre féminin. Grâce à son actif breveté Estro-G 100®, il harmonise les hormones (œstrogène et progestérone), raffermit la poitrine et la silhouette dès 35 ans, régule les cycles et soulage les désagréments de la ménopause.",
    ingredients: [
      "Estro-G 100® (Actif breveté équilibreur hormonal puissant 100% naturel)",
      "Complexes vasculaires pour la circulation gynécologique",
      "Actifs tonifiants musculaires & cutanés"
    ],
    benefits: [
      "Soin Poitrine & Silhouette (35 ans+) : Raffermit et redessine naturellement les seins",
      "Femmes Actives : Régule les cycles menstruels et soutient la fertilité",
      "Ménopause (50 ans+) : Atténue sécheresse vaginale, insomnies & sautes d'humeur",
      "Apporte éclat, fermeté et jeunesse globale au corps féminin"
    ],
    usage: "Le matin (après le repas en cas de sensibilité gastrique). Verser sous la langue et laisser dissoudre. Cure conseillée : 5 à 6 mois pour la poitrine.",
    doctorNotes: "Combinaison beauté féminine idéale : Rocenta + Lyftmax + Collagène."
  },
  {
    id: "collagene",
    name: "Dynace Collagène Beauté",
    price: 60.00,
    category: "beaute",
    image: "/images/collagene.png",
    images: ["/images/collagene.png", "/images/collagene_2.png", "/images/collagene_3.png"],
    summary: "Élixir nocturne de jeunesse — Peau repulpée, cheveux forts, ongles solides & GABA.",
    description: "Le Collagène Beauté Dynace associe Collagène Marin haut de gamme, NMN, Nid d'Oiseau, Élastine et GABA. Pris lors du rituel du soir, il agit pendant le sommeil pour lisser les rides, fortifier cheveux et ongles, et assouplir les articulations.",
    ingredients: [
      "Collagène Marin hautement biodisponible (Poisson)",
      "NMN (Nicotinamide Mononucléotide - Longévité cellulaire)",
      "Nid d'Oiseau (Nutrition intensive de l'émail cutané)",
      "Élastine (Éclat, souplesse & rebond de la peau)",
      "GABA (Détente mentale & sommeil réparateur)"
    ],
    benefits: [
      "Repulpe la peau et permet de paraître jusqu'à 5 ans plus jeune",
      "Régénère la fibre capillaire et fortifie la solidité des ongles",
      "Assouplit les articulations et améliore la mobilité à la marche",
      "Le GABA garantit un sommeil réparateur essentiel au renouvellement"
    ],
    usage: "Rituel nocturne 1h à 2h avant le coucher. Verser sous la langue, laisser dissoudre 1 min. Mâcher les 10% restants. Cure de 4 à 5 mois.",
    doctorNotes: "Le collagène travaille pendant la nuit grâce au GABA. Consommer avant de dormir."
  },
  {
    id: "toothpaste",
    name: "Dynace Duo Toothpaste",
    price: 25.00,
    category: "beaute",
    image: "/images/toothpaste.png",
    images: ["/images/toothpaste.png", "/images/toothpaste_2.png", "/images/toothpaste_3.png"],
    summary: "Soin bucco-dentaire Jour & Nuit — MorningShield (Thé Blanc) & NightRestore (Plantes).",
    description: "Le Dynace Duo Toothpaste réinvente l'hygiène bucco-dentaire avec son protocole 24h/24. MorningShield (Thé Blanc) blanchit l'émail et assure une haleine fraîche le jour. NightRestore (Herbes apaisantes) répare les gencives et assainit la bouche durant la nuit.",
    ingredients: [
      "MorningShield : Extrait de Thé Blanc & Agents Blanchissants doux",
      "NightRestore : Complexes de Plantes Apaisantes & Réparatrices des gencives"
    ],
    benefits: [
      "Blanchit l'émail et protège efficacement contre les taches",
      "Garantit une haleine ultra-fraîche du matin au soir",
      "Apaise et renforce activement les gencives sensibles",
      "Protocole complet 24h/24 pour un sourire éclatant de santé"
    ],
    usage: "MorningShield (tube Thé Blanc) le matin après le petit-déjeuner. NightRestore (tube Herbes) le soir au coucher."
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
