// client/e2e/mockData.js
// Shared mock data for the checkout flow E2E tests.
// All prices are in paise (Indian rupees * 100) to match the app's convention.

export const MOCK_PRODUCTS = [
  {
    productId: "prod-001",
    id: "prod-001",
    name: "Premium Resistance Bands Set",
    brand: "FitFlex",
    category: "Equipment",
    price: 129900,
    originalPrice: 159900,
    rating: 4.5,
    reviews: 234,
    image: "https://placehold.co/400x400/f5f5f4/78716c?text=Bands",
    badge: "BESTSELLER",
    stock: 50,
    reserved: 0,
  },
  {
    productId: "prod-002",
    id: "prod-002",
    name: "Organic Whey Protein Isolate",
    brand: "PureFuel",
    category: "Nutrition",
    price: 249900,
    originalPrice: 299900,
    rating: 4.7,
    reviews: 891,
    image: "https://placehold.co/400x400/f5f5f4/78716c?text=Whey",
    badge: null,
    stock: 120,
    reserved: 5,
  },
  {
    productId: "prod-003",
    id: "prod-003",
    name: "Smart Fitness Watch Pro",
    brand: "PulseTech",
    category: "Wearables",
    price: 799900,
    originalPrice: 999900,
    rating: 4.3,
    reviews: 412,
    image: "https://placehold.co/400x400/f5f5f4/78716c?text=Watch",
    badge: "NEW",
    stock: 25,
    reserved: 2,
  },
];

export const MOCK_CART_EMPTY = {
  items: [],
};

export const MOCK_CART_WITH_ITEM = {
  items: [{ productId: "prod-001", quantity: 1 }],
};

export const MOCK_USER_PROFILE = {
  name: "Test User",
  phone: "+919876543210",
  addresses: [
    {
      id: "addr-001",
      label: "Home",
      line1: "42 Fitness Street",
      line2: "Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400053",
      country: "India",
      phone: "+919876543210",
    },
    {
      id: "addr-002",
      label: "Work",
      line1: "7th Floor, Tech Park",
      line2: "BKC",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400051",
      country: "India",
      phone: "+919876543210",
    },
  ],
  defaultAddressId: "addr-001",
};

export const MOCK_DISCOUNT_STATUS = {
  eligible: true,
  discountPercent: 10,
  discountUsed: false,
};

export const MOCK_DEMO_PAYMENT = {
  paymentId: "pay_mock_test_123456",
  success: true,
};
