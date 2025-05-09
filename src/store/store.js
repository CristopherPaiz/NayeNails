// src/store/exampleStore.js
import { create } from "zustand";

const useStoreNails = create((set) => ({
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GETS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  message: "Hola Mundo desde Zustand!",
  imagenesInicio: [
    { url: "https://torridnails.it/cdn/shop/articles/Buy_your_kit_d05f3ce0-e86a-4845-b23b-4038f9160196.jpg", legend: "" },
    { url: "https://media.vogue.es/photos/5e46dd6814cc4800084d7613/16:9/w_1280,c_limit/VOGUE-Manicura-Bolsos5332-copia.jpg", legend: "" },
    {
      url: "https://estaticosgn-cdn.deia.eus/clip/c20bfc11-6149-4868-8833-194cbeab1ed9_16-9-discover-aspect-ratio_default_0_x1480y2480.jpg",
      legend: "",
    },
  ],

  imagenesGaleria: [
    { id: "img-1", src: "/pics/1.jpg", thumb: "/pics/1.jpg", alt: "Imagen 1", lgSize: "1920-1280" },
    { id: "img-2", src: "/pics/2.jpg", thumb: "/pics/2.jpg", alt: "Imagen 2", lgSize: "1024-768" },
    { id: "img-3", src: "/pics/3.jpg", thumb: "/pics/3.jpg", alt: "Imagen 3", lgSize: "1600-1200" },
    { id: "img-4", src: "/pics/4.jpg", thumb: "/pics/4.jpg", alt: "Imagen 4", lgSize: "1280-853" },
    { id: "img-5", src: "/pics/5.jpg", thumb: "/pics/5.jpg", alt: "Imagen 5", lgSize: "1920-1080" },
    { id: "img-6", src: "/pics/6.jpg", thumb: "/pics/6.jpg", alt: "Imagen 6", lgSize: "1000-667" },
    { id: "img-7", src: "/pics/7.jpg", thumb: "/pics/7.jpg", alt: "Imagen 7", lgSize: "1400-933" },
    { id: "img-8", src: "/pics/8.jpg", thumb: "/pics/8.jpg", alt: "Imagen 8", lgSize: "900-600" },
    { id: "img-9", src: "/pics/9.jpg", thumb: "/pics/9.jpg", alt: "Imagen 9", lgSize: "2048-1365" },
    { id: "img-10", src: "/pics/10.jpg", thumb: "/pics/10.jpg", alt: "Imagen 10", lgSize: "1600-1067" },
  ],

  todasLasUnas: [
    {
      id: 1,
      nombre: "Manicura Tradicional Roja y Francesa",
      servicios: ["manicura-tradicional", "disenos-personalizados"],
      colores: ["rojo", "blanco-puro"],
      efectos: [],
      imagen: "https://hips.hearstapps.com/hmg-prod/images/saveclip-app-447253732-18266870164224106-8409522755200379066-n-6751e53a212af.jpg",
      descripcion: "Una hermosa combinación clásica con un toque francés elegante.",
      precio: "Q25",
      oferta: null,
      duracion: "45 min",
    },
    {
      id: 2,
      nombre: "Acrílicas Ojo de Gato Azul y 3D Plata",
      servicios: ["unas-acrilicas"],
      colores: ["azul-profundo", "plata"],
      efectos: ["ojo-de-gato", "3d"],
      imagen: "https://media.glamour.mx/photos/666cbc04486c89a986c40c35/1:1/w_2000,h_2000,c_limit/un%CC%83as-efecto-ojo-de-gato.jpg",
      descripcion: "Impactantes uñas acrílicas con efecto ojo de gato y detalles 3D.",
      precio: "Q55",
      oferta: "Q50",
      duracion: "1h 30min",
    },
    {
      id: 3,
      nombre: "Polygel Nude con Efecto Sugar",
      servicios: ["polygel"],
      colores: ["tonos-nude"],
      efectos: ["efecto-sugar"],
      imagen: "https://i.pinimg.com/736x/07/6c/03/076c0381824d36e87f338b2b32ab1723.jpg",
      descripcion: "Elegancia sutil con la textura única del efecto sugar.",
      precio: "Q40",
      duracion: "1h",
    },
    {
      id: 4,
      nombre: "Semipermanente Metálico y Glitter",
      servicios: ["esmalte-semipermanente"],
      colores: ["metalicos", "glitters"],
      efectos: [],
      imagen: "https://i.pinimg.com/474x/e3/bd/60/e3bd6091063a98a9ff181cbbc3a1bb9a.jpg",
      descripcion: "Brillo y glamour con acabados metálicos y destellos de glitter.",
      precio: "Q30",
      duracion: "50 min",
    },
    {
      id: 5,
      nombre: "Manicura Rusa Pastel con Diseño Floral",
      servicios: ["manicura-rusa", "disenos-personalizados"],
      colores: ["pasteles"],
      efectos: [],
      imagen: "https://semilac.es/media/catalog/product/cache/67d9e1c93bb19887b3b9eeb5a5253fad/s/t/stylizacja_071.jpg",
      descripcion: "Delicadeza y arte en tus uñas con tonos pastel y diseño floral.",
      precio: "Q35",
      duracion: "1h 15min",
    },
    {
      id: 6,
      nombre: "Uñas en Gel Neón y Clásicas",
      servicios: ["unas-en-gel"],
      colores: ["neon", "clasicos"],
      efectos: [],
      imagen: "https://i.pinimg.com/564x/14/b2/c6/14b2c6d9fa6e74e5f5b24aa8bc29265e.jpg",
      descripcion: "Contraste vibrante de colores neón con la elegancia de los clásicos.",
      precio: "Q45",
      oferta: "Q40",
      duracion: "1h 10min",
    },
    {
      id: 7,
      nombre: "Polygel Ojo de Gato y Encapsulado Floral",
      servicios: ["polygel"],
      colores: ["negro", "tonos-nude"],
      efectos: ["ojo-de-gato", "encapsulados"],
      imagen: "https://i.pinimg.com/736x/b5/27/25/b527259a05c47960a0826fc7a0e9f581.jpg",
      descripcion: "Profundidad magnética del ojo de gato con delicados encapsulados florales.",
      precio: "Q60",
      duracion: "1h 45min",
    },
  ],

  TAG_COLORS: {
    servicios: {
      bg: "bg-blue-100 dark:bg-blue-500/30",
      text: "text-blue-700 dark:text-blue-300",
      hoverBg: "hover:bg-blue-200 dark:hover:bg-blue-500/50",
    },
    colores: {
      bg: "bg-pink-100 dark:bg-pink-500/30",
      text: "text-pink-700 dark:text-pink-300",
      hoverBg: "hover:bg-pink-200 dark:hover:bg-pink-500/50",
    },
    efectos: {
      bg: "bg-green-100 dark:bg-green-500/30",
      text: "text-green-700 dark:text-green-300",
      hoverBg: "hover:bg-green-200 dark:hover:bg-green-500/50",
    },
    default: {
      bg: "bg-gray-200 dark:bg-gray-600",
      text: "text-gray-700 dark:text-gray-200",
      hoverBg: "hover:bg-gray-300 dark:hover:bg-gray-500",
    },
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // SETS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  setMessage: (newMessage) => set({ message: newMessage }),
}));

export default useStoreNails;
