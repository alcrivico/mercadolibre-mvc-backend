"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("producto", [
      {
        id: 1,
        titulo: 'Toshiba OLED Smart TV 42" 4K UHD',
        descripcion:
          'El Toshiba OLED Smart TV 42" 4K UHD 2023 es un producto de última tecnología que te permitirá disfrutar de una experiencia visual inigualable. Este modelo cuenta con una pantalla OLED de 42 pulgadas con resolución 4K UHD, lo que te permitirá ver tus contenidos favoritos con una calidad de imagen excepcional.',
        precio: 13880,
        stock: 10,
        archivoid: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        titulo:
          'Xiaomi Poco M5s 8GB 256GB 6.43" AMOLED Snapdragon 680 33W Azul',
        descripcion:
          'Pantalla AMOLED 6.43" Full HD. Cámara cuádruple 64 Mpx. Batería 5000 mAh con carga rápida.',
        precio: 2009,
        stock: 15,
        archivoid: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        titulo:
          "Apple MacBook Air (13 pulgadas, 2020, Chip M1, 256 GB SSD, 8 GB RAM) - Gris espacial",
        descripcion:
          "La notebook más delgada y ligera de Apple viene con los superpoderes del chip M1. Termina todos tus proyectos mucho más rápido con el CPU de 8 núcleos y disfruta como nunca antes de apps y juegos con gráficos avanzados gracias al GPU de hasta 8 núcleos. Además, el Neural Engine de 16 núcleos se encarga de acelerar todos los procesos de aprendizaje automático.",
        precio: 25999,
        stock: 5,
        archivoid: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        titulo:
          "Hamilton Beach Licuadora Varoma Plástico De 1.25 Litros 4 Velocidades Negro",
        descripcion:
          "Hamilton Beach es la combinación ideal de potencia y funcionalidad. Con 350 watts de potencia, podrás preparar cualquier receta, y gracias a sus 4 velocidades (2 continuas y 2 pulsos), elegir el grado de licuado de tus alimentos. Ideal para preparar desde una crema hasta una salsa tipo majada o un smoothie para comenzar el día.",
        precio: 365,
        stock: 20,
        archivoid: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        titulo:
          "Silla De Escritorio Ejecutiva Ergonómica Styrka - Color Negro Material del Asiento Algodón",
        descripcion:
          "La selección de una silla adecuada es crucial para prevenir los dolores futuros con esta silla Styrka, disfrutarás de la comodidad y el bienestar necesario durante tu jornada laboral. Su diseño permite que se integre fácilmente en cualquier espacio de tu casa u oficina, aportando un estilo moderno.",
        precio: 1957,
        stock: 5,
        archivoid: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        titulo: "Bolsa Andrea Para Mujer Grabado Cocodrilo Doble Asa Beige",
        descripcion:
          "Esta bolsa no solo es versátil y elegante, sino que también ofrece una sensación táctil excepcional gracias a su textura increíble.",
        precio: 427,
        stock: 10,
        archivoid: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        titulo:
          "Pelota De Fútbol Forza Laminado F5-1998 Rollers Pro Color Bordo",
        descripcion:
          "Encuentra en el F5-1998 la calidad e innovación que Rollers puede brindar. Disfruta de tus momentos de entrenamiento y juego, así como de diversión, con una pelota que es ideal para ti.",
        precio: 521.26,
        stock: 15,
        archivoid: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        titulo: "Lámpara De Pie De Interior Cristal Decorativa Moderna",
        descripcion:
          "Elegante lámpara de cristal: esta pantalla está hecha de varias piezas de cristal brillante, el diseño cristalino del elegante juego de millones de facetas es un complemento cómodo y moderno, más bonito y con mejor transmisión de la luz.",
        precio: 142.08,
        stock: 10,
        archivoid: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        titulo: "Trituradora Papel GBC Corte Cruzado Hasta 12 Hojas",
        descripcion:
          "Protege tu privacidad destruyendo los documentos que contengan información confidencial con la Destructora Momentum PX12-86. Gracias a su corte cruzado, tritura cada documento en pequeñas tiras, evitando que tus datos caigan en manos equivocadas.",
        precio: 2923.29,
        stock: 5,
        archivoid: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        titulo: "Play-Doh Kitchen Creations Repartidor De Pizzas",
        descripcion:
          "¡Buen provecho! Aquí viene el Nuevo Repartidor de Pizzas. No es solamente un juguete para niños y niñas de 3 a 5 años. Es, además, un juguete Play-Doh con temática de pizzas que les permitirá crear y repartir su propia comida de juguete.",
        precio: 2454.68,
        stock: 10,
        archivoid: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        titulo: "Silla Alta Para Bebé 3 en 1 Periquera Bebé Happy",
        descripcion:
          "Una silla alta tipo periquera es la mejor forma de permitir a los pequeños compartir la hora de la comida con toda la familia. Deja que tu bebé se siente a la mesa y gane confianza para aprender a alimentarse por sí mismo. Incluye bandeja para comer desmontable y arnés de seguridad.",
        precio: 1999,
        stock: 8,
        archivoid: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 12,
        titulo: "Báscula Digital Renpho Es-Corpio Negra, Hasta 180 Kg",
        descripcion:
          "El peso corporal no es lo único que muestra esta báscula, otros datos de composición corporal, incluidos el peso, el IMC y el porcentaje de grasa corporal almacenado en la aplicación.",
        precio: 380.13,
        stock: 12,
        archivoid: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 13,
        titulo: "Labial Líquido MAC Powder Kiss",
        descripcion:
          "Sé protagonista con la ayuda del Labial MAC. Para el día o la noche, con un nude delicado o un rojo vibrante, vive el color sin necesidad de retoques. ¡Son perfectos para cualquier ocasión!.",
        precio: 559,
        stock: 20,
        archivoid: 13,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 14,
        titulo: "Videojuego Mario Kart 8 Deluxe Nintendo Switch Físico",
        descripcion:
          "Acelera a través de las pistas del Reino Champiñón, bajo el agua, en el cielo, de cabeza y sin frenos, y llega a la meta para obtener la victoria! Programa motores en el modo Multijugador local, en los torneos en línea del Juego, en el modo batalla que ha sido mejorado ¡y más!.",
        precio: 849,
        stock: 10,
        archivoid: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 15,
        titulo: "Café Soluble Nescafé Taster's Choice Colombia 190g",
        descripcion:
          "Nescafé Taster's Choice Colombia ofrece una experiencia sensorial única, proporcionando un balance perfecto en cada taza. Elaborado con altos estándares de calidad y una mezcla de granos únicos, este café soluble mantiene un sabor, aroma y cuerpo distintivos gracias a su proceso de liofilización, que resalta las notas más puras del café al evitar el uso de altas temperaturas.",
        precio: 232.1,
        stock: 45,
        archivoid: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("producto", null, {});
  },
};
