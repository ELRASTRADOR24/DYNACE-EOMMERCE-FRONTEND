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
    description: "Rocenta est une formule holistique de haute précision conçue pour soutenir la vitalité cellulaire au quotidien. Elle favorise l'hydratation et l'élasticité de la peau, soutient la santé des articulations et des os, favorise un meilleur repos et la relaxation, et aide à maintenir la santé des cheveux et des ongles. Une approche complète du bien-être, de la beauté et de l'équilibre intérieur.",
    benefits: [
      "Favorise l'hydratation et l'élasticité de la peau",
      "Soutient la santé des articulations et des os",
      "Favorise un meilleur repos et la relaxation",
      "Aide à maintenir la santé des cheveux et des ongles"
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
    description: "Dynafuel est une formule premium conçue pour les hommes souhaitant optimiser leur énergie cellulaire, leur endurance et leur vitalité quotidienne. Il soutient l'énergie cellulaire et l'endurance, aide à maintenir un vieillissement sain et la vitalité, soutient le bien-être immunitaire, et aide à maintenir la clarté mentale et la concentration. Idéal pour les professionnels actifs, les sportifs et les hommes de plus de 40 ans.",
    benefits: [
      "Soutient l'énergie cellulaire et l'endurance quotidienne",
      "Aide à maintenir un vieillissement sain et la vitalité",
      "Soutient le bien-être immunitaire",
      "Favorise le bien-être et la clarté mentale"
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
    description: "Urbanism est une solution complète en deux phases pour la gestion du poids. Le jour, elle soutient le métabolisme et les routines de combustion des graisses. La nuit, elle favorise l'équilibre intestinal, la détoxification saine et le sommeil. Elle aide également à gérer l'appétit et les fringales, et à soutenir la digestion. Une approche naturelle, en accord avec les rythmes de votre corps.",
    benefits: [
      "Soutient le métabolisme et la combustion des graisses (jour)",
      "Aide à gérer l'appétit et les fringales",
      "Favorise l'équilibre intestinal et la digestion",
      "Soutient la détoxification saine pendant le sommeil"
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
    description: "Ace Brew réinvente l'expérience du café en y intégrant le NMN (Nicotinamide Mononucléotide), un précurseur du NAD+ reconnu pour son rôle dans la longévité cellulaire. Sans sucre ajouté, ce café d'exception soutient l'énergie cellulaire et l'endurance, aide à maintenir un vieillissement sain, soutient le bien-être immunitaire et favorise la clarté mentale. Idéal pour les amateurs de café soucieux de leur santé.",
    benefits: [
      "Enrichi au NMN, précurseur du NAD+ pour la longévité cellulaire",
      "Zéro sucre ajouté — saveur authentique et pure",
      "Soutient l'énergie cellulaire et la clarté mentale",
      "Aide à maintenir un vieillissement sain et la vitalité"
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
    description: "Dynace FitMax est un complexe minceur puissant conçu pour accélérer la perte de masse grasse. Il stimule le métabolisme de base, favorise la libération des lipides stockés et réduit l'absorption des glucides tout en fournissant une énergie propre et soutenue. Une solution pensée pour ceux qui veulent retrouver confiance en leur silhouette sans compromettre leur vitalité.",
    benefits: [
      "Stimule le métabolisme et la combustion des graisses",
      "Aide à contrôler l'appétit et les fringales",
      "Booste l'énergie et la concentration",
      "Soutient la gestion saine du taux de sucre sanguin"
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
    description: "Ace Guard est votre allié quotidien pour un système immunitaire fort et un vieillissement sain. Sa formule unique associe puissants antioxydants et nutriments essentiels pour renforcer les défenses naturelles de l'organisme, offrir une protection cellulaire optimale et soutenir l'équilibre immunitaire. Recommandé pour les personnes en quête de soutien immunitaire, celles surveillant leur taux de sucre ou de cholestérol, et celles confrontées à des problèmes respiratoires.",
    benefits: [
      "Renforce le soutien immunitaire quotidien",
      "Puissante protection antioxydante et anti-âge",
      "Aide à soutenir un vieillissement sain",
      "Soutient l'équilibre de la santé respiratoire"
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
    description: "Triple Root Coffee est un café d'exception formulé spécialement pour soutenir la vitalité masculine au quotidien. Il soutient l'endurance et les performances physiques, améliore l'énergie et la concentration, favorise une circulation saine et la santé cardiaque, et renforce la résilience au stress et le repos. Idéal pour les hommes actifs, les sportifs et les professionnels exigeants.",
    benefits: [
      "Soutient l'endurance et les performances physiques",
      "Améliore l'énergie et la concentration",
      "Favorise une circulation saine et la santé cardiaque",
      "Renforce la résilience au stress et favorise le repos"
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
    description: "LyftMax est le supplément complet pour le bien-être féminin. Sa formule raffinée soutient l'équilibre hormonal et accompagne les changements physiologiques naturels, aide à maintenir l'énergie et la peau, soutient la santé osseuse et le confort lors de la ménopause. Pensé pour les femmes traversant des changements hormonaux, stressées ou fatiguées, et celles qui recherchent confiance en leur corps et leur peau.",
    benefits: [
      "Soutient l'équilibre hormonal et le bien-être féminin",
      "Aide à maintenir l'énergie et l'éclat de la peau",
      "Soutient la santé osseuse et le confort articulaire",
      "Favorise la sérénité lors des changements hormonaux"
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
    description: "Le Collagène Beauté Dynace est une boisson de soin intérieure alliant collagène hautement biodisponible, acide hyaluronique et coenzyme Q10 pour révéler votre éclat naturel. Il raffermit la peau et estompe les ridules, assure une hydratation profonde durable, renforce les cheveux et les ongles cassants, et soutient la souplesse articulaire. Le soin beauté premium qui se consomme de l'intérieur.",
    benefits: [
      "Raffermit la peau et estompe visiblement les ridules",
      "Hydratation profonde et durable (acide hyaluronique)",
      "Renforce les cheveux et les ongles fragiles",
      "Soutient la souplesse et le confort articulaire"
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
    description: "Le Dynace Duo Toothpaste réinvente l'hygiène bucco-dentaire avec une approche Jour & Nuit. MorningShield (Thé Blanc & Jasmin) assure une haleine fraîche et protège l'émail en journée. NightRestore (Herbes & Menthe) répare, apaise les gencives et assainit la bouche pendant le sommeil. Ensemble, ils assurent une protection bucco-dentaire complète 24h/24.",
    benefits: [
      "Aide à maintenir une haleine fraîche durablement",
      "Favorise une hygiène buccale quotidienne complète",
      "Soutient le confort et la santé des gencives",
      "Routine double Matin & Soir pour une protection 24h"
    ],
    usage: "Utiliser MorningShield (tube Thé Blanc) le matin et NightRestore (tube Menthe) le soir."
  }
];

export const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log('Catalogue déjà présent dans MongoDB, on ignore le seeding initial.');
      return;
    }

    // Vider la collection products dans MongoDB au cas où
    await Product.deleteMany({});
    console.log('Remplissage de la table products (MongoDB) avec le catalogue Dynace Global...');
    
    const productsToSeed = initialProducts.map(prod => ({
      _id: prod.id, // ID textuel customisé mappé sur _id
      name: prod.name,
      price: prod.price,
      category: prod.category,
      image: prod.image,
      images: prod.images,
      summary: prod.summary,
      description: prod.description,
      benefits: prod.benefits,
      usage: prod.usage,
      stock: 50 // Stock initial par défaut
    }));
    
    await Product.insertMany(productsToSeed);
    console.log('✅ Catalogue Dynace Global inséré dans MongoDB avec succès.');

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

    // Seeding de quelques avis initiaux
    const admin = await User.findOne({ email: adminEmail });
    if (admin) {
      await Review.deleteMany({});
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
  } catch (err) {
    console.error('Erreur lors du seeding de la base de données MongoDB :', err.message);
  }
};
