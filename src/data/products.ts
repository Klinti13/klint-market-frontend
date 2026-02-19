import type { Product } from '../types';

export const productsList: Product[] = [
  { id: 1, name: 'Vaj Ulliri Ekstra i Virgjër 1L', price: 850, oldPrice: 1200, category: 'Bio', badge: '-30%', image: "https://images.unsplash.com/photo-1638324396229-632af05042dd?q=80&w=2286&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 2, name: 'Vezë Fshati Bio (10 copë)', price: 300, category: 'Bio', badge: '100% Bio', image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?q=80&w=2334&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 3, name: 'Mjaltë Natyral 500g', price: 900, category: 'Bio', image: "https://plus.unsplash.com/premium_photo-1663957861996-8093b48a22e6?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 4, name: 'Qumësht Bajame Premium 1L', price: 280, category: 'Bio', badge: 'Vegan', image: "https://images.unsplash.com/photo-1626196340077-601ba2a67e4f?q=80&w=934&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 5, name: 'Tërshërë Organike 500g', price: 250, category: 'Bio', image: "https://images.unsplash.com/photo-1586810504230-09dab6b8e01b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 6, name: 'Çaj Mali Organik 100g', price: 150, oldPrice: 200, category: 'Bio', badge: 'Ofertë', image: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

  { id: 11, name: 'Qumësht i Freskët 1L', price: 150, category: 'Bulmet', image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1365&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 12, name: 'Djathë i Bardhë i Butë 500g', price: 450, category: 'Bulmet', image: "https://images.unsplash.com/photo-1661349008073-136bed6e6788?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 13, name: 'Kos Natyral 1kg', price: 180, category: 'Bulmet', image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?q=80&w=982&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 14, name: 'Gjalpë i Freskët 250g', price: 350, category: 'Bulmet', image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 15, name: 'Kaçkavall Dele 400g', price: 650, oldPrice: 800, category: 'Bulmet', badge: 'Ofertë', image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=2346&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
 

  { id: 24, name: 'Fileto Pule Premium 500g', price: 450, oldPrice: 600, category: 'Mish & Peshk', badge: 'Super Çmim', image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 25, name: 'Mish Viçi i Grirë 1kg', price: 1200, category: 'Mish & Peshk', image: "https://images.unsplash.com/photo-1618788856642-8e491177d973?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 26, name: 'Salmon i Freskët Norvegjez 500g', price: 1500, category: 'Mish & Peshk', badge: 'E Freskët', image: "https://images.unsplash.com/photo-1641898378373-0ef528eec4be?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 27, name: 'Peshk Kocë 1kg', price: 900, oldPrice: 1100, category: 'Mish & Peshk', badge: '-18%', image: "https://plus.unsplash.com/premium_photo-1693221705305-6eff5fa8e483?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 28, name: 'Biftek Viçi 600g', price: 1800, category: 'Mish & Peshk', image: "https://images.unsplash.com/photo-1690983330536-3b0089d07cf9?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
 

  { id: 37, name: 'Lëng Portokalli i Freskët 1L', price: 200, oldPrice: 350, category: 'Pije', badge: '-40%', image: "https://plus.unsplash.com/premium_photo-1720071055021-54aacea5b719?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 38, name: 'Ujë Natyral 1.5L', price: 60, category: 'Pije', image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 39, name: 'Coca Cola 1.5L', price: 180, category: 'Pije', image: "https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 40, name: 'Birrë Premium 500ml', price: 120, category: 'Pije', badge: '18+', image: "https://images.unsplash.com/photo-1642647237318-3e30ff181a3c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
 
  { id: 49, name: 'Mollë të Kuqe 1kg', price: 120, category: 'Fruta & Perime', image: "https://images.unsplash.com/photo-1694614826204-0b7dd87603d6?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 50, name: 'Domate të Kuqe 1kg', price: 150, category: 'Fruta & Perime', image: "https://images.unsplash.com/photo-1444731961956-751ed90465a5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
  { id: 51, name: 'Banane 1kg', price: 180, category: 'Fruta & Perime', image: "https://images.unsplash.com/photo-1668762924684-a9753a0a887c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 52, name: 'Avokado Hass (2 copë)', price: 350, category: 'Fruta & Perime', badge: 'E Shëndetshme', image: "https://images.unsplash.com/photo-1612506266679-606568a33215?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 53, name: 'Patate të Bardha 2kg', price: 160, category: 'Fruta & Perime', image: "https://images.unsplash.com/photo-1508313880080-c4bef0730395?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
 
  { id: 61, name: 'Kafe 100% Arabica 250g', price: 550, oldPrice: 800, category: 'Të Ndryshme', badge: 'Bestseller', image: "https://images.unsplash.com/photo-1643881578598-3480a9b7788b?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 62, name: 'Makarona Spageti 500g', price: 140, category: 'Të Ndryshme', image: "https://images.unsplash.com/photo-1559394452-087c19c260ac?q=80&w=2352&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 63, name: 'Oriz Basmati 1kg', price: 320, category: 'Të Ndryshme', image: "https://images.unsplash.com/photo-1643622357625-c013987d90e7?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 64, name: 'Çokollatë e Zezë 100g', price: 250, category: 'Të Ndryshme', image: "https://images.unsplash.com/photo-1586400928533-da0dbdca07fb?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
  
];