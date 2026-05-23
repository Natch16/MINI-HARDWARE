/**
 * seed.js — Populates localStorage with default data on first visit
 */

import { Store } from './store.js';

function seedData() {
  // Migrate old address if still set to the previous default
  const existingSettings = Store.getSettings();
  if (existingSettings.address && existingSettings.address.includes('Rizal Street')) {
    Store.saveSettings({
      ...existingSettings,
      address: 'P-7 Pangasihan, Gingoog City, Misamis Oriental',
    });
  }

  if (localStorage.getItem(Store.KEYS.CATEGORIES)) return;

  const categories = [
    { id: 'cat-1', name: 'Tools' },
    { id: 'cat-2', name: 'Construction Materials' },
    { id: 'cat-3', name: 'Electrical Supplies' },
    { id: 'cat-4', name: 'Plumbing' },
  ];

  const products = [
    {
      id: 'prod-1',
      name: 'Heavy Duty Hammer',
      price: 250,
      category: 'cat-1',
      image: 'https://www.toolmarket.com.au/cdn/shop/products/tolsen-fibreglass-18kg4lbs-sledge-hammer-956931.jpg?v=1611286973',
      previews: [
        
      ],
      description: 'A professional-grade heavy duty hammer built for both construction workers and DIY enthusiasts. Features a forged steel head for maximum impact and a rubber-grip fiberglass handle that absorbs vibration, reducing hand fatigue during extended use. Ideal for framing, demolition, carpentry, and general repair work. The balanced weight distribution ensures accurate strikes every time.',
      specs: {
        material: 'Steel Head with Rubber Grip Handle',
        size: 'Medium (13 inches)',
        weight: '1.2 kg',
        usage: 'Construction, Carpentry, Repair, Demolition',
        brand: "JUDY'S Hardware Brand",
        warranty: '1 Year',
      },
      available: true,
    },
    {
      id: 'prod-2',
      name: 'Cordless Power Drill',
      price: 1800,
      category: 'cat-1',
      image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80',
      previews: [
        
      ],
      description: 'Cordless power drill with an 18V lithium-ion battery, variable speed trigger, and keyless chuck for quick bit changes. Suitable for drilling into wood, metal, and masonry. Includes a built-in LED work light and a belt clip for hands-free carrying on the job site.',
      specs: {
        material: 'ABS Plastic Body, Steel Chuck',
        size: 'Compact (18cm length)',
        weight: '1.5 kg (with battery)',
        usage: 'Drilling, Screwdriving, Woodwork, Metalwork',
        brand: 'ProDrill',
        warranty: '1 Year',
      },
      available: true,
    },
    {
      id: 'prod-3',
      name: 'Flat Head Screwdriver Set',
      price: 180,
      category: 'cat-1',
      image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80',
      previews: [
        
      ],
      description: 'A set of 6 flat head screwdrivers in various sizes. Chrome-vanadium steel blades with ergonomic non-slip handles. Suitable for electronics, furniture assembly, and general maintenance.',
      specs: {
        material: 'Chrome-Vanadium Steel',
        size: 'Set of 6 (3mm to 8mm)',
        weight: '0.4 kg (set)',
        usage: 'Electronics, Furniture, General Maintenance',
        brand: 'ToolMaster',
        warranty: '6 Months',
      },
      available: true,
    },
    {
      id: 'prod-4',
      name: 'Adjustable Wrench',
      price: 320,
      category: 'cat-1',
      image: 'https://www.scottdirect.com/media/catalog/product/cache/9464c5395799d1e2572fd817787467c1/s/t/stanley-bi-material-adjustable-wrench.jpg',
      previews: [
      ],
      description: 'Heavy-duty adjustable wrench with a wide jaw opening up to 35mm. Drop-forged chrome-vanadium steel construction for maximum strength. Ideal for plumbing, automotive, and general repair work.',
      specs: {
        material: 'Chrome-Vanadium Steel',
        size: '12 inches (300mm)',
        weight: '0.6 kg',
        usage: 'Plumbing, Automotive, General Repair',
        brand: 'GripPro',
        warranty: '1 Year',
      },
      available: true,
    },
    {
      id: 'prod-5',
      name: 'Assorted Nails (500g)',
      price: 85,
      category: 'cat-1',
      image: 'https://5.imimg.com/data5/SELLER/Default/2023/9/340820640/TR/NY/KB/26190490/whatsapp-image-2023-09-04-at-18-25-48-250x250.jpeg',
      previews: [],
      description: 'Assorted common wire nails in a 500g pack. Includes sizes from 1 inch to 3 inches. Galvanized for rust resistance. Suitable for framing, roofing, and general carpentry.',
      specs: {
        material: 'Galvanized Steel',
        size: 'Assorted (1" to 3")',
        weight: '500g',
        usage: 'Framing, Roofing, Carpentry',
        brand: 'SteelFix',
        warranty: 'N/A',
      },
      available: true,
    },
    {
      id: 'prod-6',
      name: 'Portland Cement (40kg)',
      price: 320,
      category: 'cat-2',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmeCTZF0ibpFx8awMDskdlHbxPaJUfFedp5A&s',
      previews: [],
      description: 'High-strength Portland cement for concrete mixing, masonry, and plastering. Type I/II general purpose cement suitable for most construction applications.',
      specs: {
        material: 'Portland Cement Type I/II',
        size: '40kg bag',
        weight: '40 kg',
        usage: 'Concrete, Masonry, Plastering',
        brand: 'Republic Cement',
        warranty: 'N/A',
      },
      available: true,
    },
    {
      id: 'prod-7',
      name: 'Hollow Blocks (per piece)',
      price: 18,
      category: 'cat-2',
      image: 'https://4.imimg.com/data4/XE/NF/MY-4464694/concrete-block.jpg',
      previews: [],
      description: 'Standard 4-inch hollow concrete blocks for wall construction. Meets ASTM standards for compressive strength.',
      specs: {
        material: 'Concrete',
        size: '4" x 8" x 16"',
        weight: '8 kg per piece',
        usage: 'Wall Construction, Partitions',
        brand: 'Local Manufacturer',
        warranty: 'N/A',
      },
      available: false,
    },
    {
      id: 'prod-8',
      name: 'Electrical Wire (per meter)',
      price: 45,
      category: 'cat-3',
      image: 'https://www.shopbuildmate.com/cdn/shop/files/COVER-RTN14ABL150_700x700.jpg?v=1693201499',
      previews: [],
      description: 'THHN 12AWG copper electrical wire, suitable for residential and light commercial wiring. 600V rated, heat and moisture resistant.',
      specs: {
        material: 'Copper Conductor, THHN Insulation',
        size: '12 AWG',
        weight: 'Per meter',
        usage: 'Residential Wiring, Panel Connections',
        brand: 'Phelps Dodge',
        warranty: 'N/A',
      },
      available: true,
    },
    {
      id: 'prod-9',
      name: 'Circuit Breaker 20A',
      price: 380,
      category: 'cat-3',
      image: 'https://image.made-in-china.com/202f0j00UQdqtaYGmbcu/Bh-10A-20A-30A-40A-50A-60A-100A-Bolt-on-Circuit-Breaker.webp',
      previews: [],
      description: '20-ampere single-pole circuit breaker for panel board installation. Provides overload and short-circuit protection.',
      specs: {
        material: 'Thermoplastic Housing',
        size: 'Standard DIN Rail',
        weight: '0.15 kg',
        usage: 'Panel Board, Circuit Protection',
        brand: 'Schneider Electric',
        warranty: '1 Year',
      },
      available: true,
    },
    {
      id: 'prod-10',
      name: 'PVC Pipe 1/2" (per length)',
      price: 95,
      category: 'cat-4',
      image: 'https://img.lazcdn.com/g/p/28f3287c62db4366667a659dd55b0618.jpg_720x720q80.jpg',
      previews: [],
      description: 'Schedule 40 PVC pipe, 1/2 inch diameter, 3 meters per length. Suitable for cold water supply lines and drainage.',
      specs: {
        material: 'uPVC (Unplasticized PVC)',
        size: '1/2" diameter, 3m length',
        weight: '0.5 kg per length',
        usage: 'Water Supply, Drainage',
        brand: 'Neltex',
        warranty: 'N/A',
      },
      available: true,
    },
    {
      id: 'prod-11',
      name: 'Gate Valve 1/2"',
      price: 220,
      category: 'cat-4',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmUOD8aN8FWUQUKzwcagBkv5aAm3yFuMS_Aw&s',
      previews: [],
      description: 'Brass gate valve for water supply lines, 1/2 inch threaded connection. Full-bore design for minimal flow restriction.',
      specs: {
        material: 'Brass Body, Stainless Steel Stem',
        size: '1/2" BSP Thread',
        weight: '0.2 kg',
        usage: 'Water Supply Shutoff',
        brand: 'Kitz',
        warranty: '6 Months',
      },
      available: false,
    },
  ];

  const settings = {
    businessName: "JUDY'S Mini Hardware",
    contactInfo: '(Contact number to be provided)',
    address: 'P-7 Pangasihan, Gingoog City, Misamis Oriental',
  };

  Store.save(Store.KEYS.CATEGORIES, categories);
  Store.save(Store.KEYS.PRODUCTS, products);
  Store.saveSettings(settings);
  Store.save(Store.KEYS.INQUIRIES, []);
}

export { seedData };
