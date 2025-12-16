import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import bcryptjs from 'bcryptjs';

// Use the generated Prisma client directly. The datasource URL is loaded
// via `dotenv/config` and `prisma.config.ts` (Prisma will read `process.env.DATABASE_URL`).
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// =======================
// Seed data
// =======================

const SALT_ROUNDS = 10;

const userData: { name: string; email: string; password: string }[] = [
  {
    name: 'ADMIN',
    email: 'admin@gmail.com',
    password: 'Admin1234',
  },
];

const categoryData: Prisma.CategoryCreateInput[] = [
  { name: 'Ресторан' },
  { name: 'Бар' },
  { name: 'Кофе шоп' },
  { name: 'Зочид буудал' },
  { name: 'Дэлгүүр' },
];

const businessData: Omit<Prisma.BusinessCreateInput, 'category'>[] = [
  {
    name: 'Modern Nomads Сэнтрал',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Үндэсний болон европ хоолны өргөн сонголттой, уламжлалт интерьертэй дундаж-дээд ангиллын ресторан.',
    address:
      'Сүхбаатар дүүрэг, 1-р хороо, Энхтайвны өргөн чөлөө 15, Улаанбаатар',
    phone: '+976-7711-0001',
    email: 'info@modernnomads.mn',
    website: 'https://modernnomads.mn',
    googleMapUrl: 'https://maps.google.com/?q=Modern+Nomads+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/modernnomads.mn',
    instagramUrl: 'https://instagram.com/modernnomads.mn',
    timetable: 'Даваа-Ням 11:00-23:00',
  },
  {
    name: 'Beer House Chain Bar',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Крафт шар айраг, коктейль, амьд хөгжимтэй, орой үдэш цэнгэхэд тохиромжтой паб ба бар.',
    address:
      'Сүхбаатар дүүрэг, 8-р хороо, Бага тойруу 1, Peace Avenue орчим, Улаанбаатар',
    phone: '+976-7710-1002',
    email: 'info@beerhouse.mn',
    website: 'https://beerhouse.mn',
    googleMapUrl: 'https://maps.google.com/?q=Beer+House+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/beerhouse.mn',
    instagramUrl: 'https://instagram.com/beerhouse.mn',
    timetable: 'Даваа-Ням 17:00-02:00',
  },
  {
    name: "Millie's Espresso",
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Барууны хэв маягийн, өглөөний цай, кофе, амттан, хөнгөн хоолтой тохилог кафе.',
    address:
      'Сүхбаатар дүүрэг, 4-р хороо, Сөүлийн гудамж, Central Tower-ийн хажууд, Улаанбаатар',
    phone: '+976-7710-2003',
    email: 'hello@millies.mn',
    website: 'https://millies.mn',
    googleMapUrl: 'https://maps.google.com/?q=Millie%27s+Espresso+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/milliesespresso',
    instagramUrl: 'https://instagram.com/milliesespresso',
    timetable: 'Даваа-Баасан 08:00-21:00, Бямба-Ням 09:00-21:00',
  },
  {
    name: 'Shangri-La Улаанбаатар',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Таван одтой, хотын төвд байрлах, конвенц, арга хэмжээ болон бизнес/аялагчдад зориулсан тансаг зочид буудал.',
    address:
      'Сүхбаатар дүүрэг, 1-р хороо, Олимпын гудамж 19, Shangri-La Centre, Улаанбаатар',
    phone: '+976-7702-9999',
    email: 'reservations.slub@shangri-la.com',
    website: 'https://www.shangri-la.com/ulaanbaatar/shangrila/',
    googleMapUrl:
      'https://maps.google.com/?q=Shangri-La+Ulaanbaatar+Olympic+Street+19',
    facebookUrl: 'https://facebook.com/shangrilaulaanbaatar',
    instagramUrl: 'https://instagram.com/shangrilaulaanbaatar',
    timetable: '24/7',
  },
  {
    name: 'Улсын Их Дэлгүүр',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Хотын төвд байрлах, хувцас, гоёл чимэглэлийн бараа, цахилгаан хэрэгсэл, хүнс, бэлэг дурсгалын өргөн сонголттой их дэлгүүр.',
    address:
      'Чингэлтэй дүүрэг, 3-р хороо, Энхтайвны өргөн чөлөө 21, Улаанбаатар',
    phone: '+976-7577-8888',
    email: 'info@state-department-store.mn',
    website: 'https://www.nomin.mn',
    googleMapUrl:
      'https://maps.google.com/?q=State+Department+Store+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/ulsiniikhdelguur',
    instagramUrl: 'https://instagram.com/ulsiniikhdelguur',
    timetable: 'Даваа-Ням 10:00-22:00',
  },
  {
    name: 'Zen Japanese Restaurant',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Blue Sky tower-ийн дээд давхарт байрлах, жинхэнэ япон суши, загасны хоолны цэс бүхий ресторан.',
    address:
      'Сүхбаатар дүүрэг, 1-р хороо, Энхтайвны өргөн чөлөө 17, Blue Sky Tower, Улаанбаатар',
    phone: '+976-7710-3004',
    email: 'info@zenjapanese.mn',
    website: 'https://hotelbluesky.mn',
    googleMapUrl:
      'https://maps.google.com/?q=Zen+Japanese+Restaurant+Blue+Sky+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/zenjapaneserestaurant',
    instagramUrl: 'https://instagram.com/zenjapaneseub',
    timetable: 'Мягмар-Ням 17:00-23:00, Даваа амарна',
  },
  {
    name: 'Sky Lounge – Blue Sky',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Хотыг бүхэлд нь тольдох боломжтой, коктейль, жazz/house хөгжимтэй дээврийн лаунж бар.',
    address:
      'Сүхбаатар дүүрэг, 1-р хороо, Энхтайвны өргөн чөлөө 17, Blue Sky Tower 23-р давхар, Улаанбаатар',
    phone: '+976-7710-4005',
    email: 'reservation@skylounge.mn',
    website: 'https://hotelbluesky.mn',
    googleMapUrl: 'https://maps.google.com/?q=Sky+Lounge+Blue+Sky+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/skylounge.ub',
    instagramUrl: 'https://instagram.com/skylounge.ub',
    timetable: 'Пүрэв-Ням 18:00-02:00, Даваа-Лхагва амарна',
  },
  {
    name: 'Caffe Bene – Их Дэлгүүр салбар',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Кофе, амттан, сэндвич, амрах булан бүхий, сурагчид болон оффисынхонд түгээмэл кофе шоп.',
    address:
      'Чингэлтэй дүүрэг, 3-р хороо, Улсын Их Дэлгүүрийн 1-р давхар, Улаанбаатар',
    phone: '+976-7710-5006',
    email: 'info@caffebene.mn',
    website: 'https://caffebene.mn',
    googleMapUrl:
      'https://maps.google.com/?q=Caffe+Bene+State+Department+Store',
    facebookUrl: 'https://facebook.com/caffebene.mongolia',
    instagramUrl: 'https://instagram.com/caffebene.mongolia',
    timetable: 'Даваа-Ням 08:30-22:00',
  },
  {
    name: 'Blue Sky Hotel & Tower',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Сүхбаатарын талбайн хажууд байрлах, хотын тэнгэр баганадсан шилэн цамхаг, бизнес болон аяллын зорилтот тансаг зочид буудал.',
    address:
      'Сүхбаатар дүүрэг, 1-р хороо, Энхтайвны өргөн чөлөө 17, Улаанбаатар',
    phone: '+976-7010-0505',
    email: 'info@hotelbluesky.mn',
    website: 'https://hotelbluesky.mn',
    googleMapUrl:
      'https://maps.google.com/?q=Blue+Sky+Hotel+%26+Tower+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/hotelbluesky',
    instagramUrl: 'https://instagram.com/hotelbluesky',
    timetable: '24/7',
  },
  {
    name: 'Интерном Номын Дэлгүүр – Төв салбар',
    imageUrl:
      'https://mongolia-guide.com/uploads/main/ulaanbaatar/places/square.jpg',
    description:
      'Монголын хамгийн том номын сүлжээний төв салбар, ном, тоглоом, бичиг хэрэг, бэлэг дурсгалын өргөн сонголттой.',
    address:
      'Сүхбаатар дүүрэг, 8-р хороо, Бага тойруу 14, Интерном байр, Улаанбаатар',
    phone: '+976-7577-7700',
    email: 'info@internom.mn',
    website: 'https://internom.mn',
    googleMapUrl: 'https://maps.google.com/?q=Internom+Bookstore+Ulaanbaatar',
    facebookUrl: 'https://facebook.com/InternomBooks',
    instagramUrl: 'https://instagram.com/internom.mn',
    timetable: 'Даваа-Ням 10:00-20:00',
  },
];

// =======================
// Helper functions
// =======================

async function clearDatabase() {
  console.log('Clearing existing data...');

  await prisma.business.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared');
}

async function createUsers() {
  console.log('Creating users...');

  for (const u of userData) {
    const hashedPassword = await bcryptjs.hash(u.password, SALT_ROUNDS);

    await prisma.user.create({
      data: {
        ...u,
        password: hashedPassword,
      },
    });
  }

  console.log(`Created ${userData.length} users`);
}

async function createCategories() {
  console.log('Creating categories...');

  const createdCategories: Array<{ id: string; name: string }> = [];

  for (const category of categoryData) {
    const created = await prisma.category.create({
      data: category,
    });
    createdCategories.push(created);
  }

  console.log(`Created ${createdCategories.length} categories`);

  return createdCategories;
}

async function createBusinesses(
  categories: Awaited<ReturnType<typeof createCategories>>
) {
  console.log('Creating businesses...');

  // Бизнесүүдийг категоритой нь index-ээр ээлжилж хуваарилна
  const businessesWithCategories: Prisma.BusinessCreateInput[] =
    businessData.map((business, index) => {
      const category = categories[index % categories.length];

      return {
        ...business,
        // ЧУХАЛ: Prisma-д relation-ийг албан ёсоор ингэж өгнө
        category: {
          connect: { id: category.id },
        },
      };
    });

  const createdBusinesses: Array<{ id: string; name: string }> = [];

  for (const business of businessesWithCategories) {
    const created = await prisma.business.create({
      data: business,
    });
    createdBusinesses.push({ id: created.id, name: created.name });
  }

  console.log(`Created ${createdBusinesses.length} businesses`);

  return createdBusinesses;
}

// =======================
// Main
// =======================

async function main() {
  try {
    console.log('Starting database seeding...');

    await clearDatabase();
    await createUsers();
    const categories = await createCategories();
    await createBusinesses(categories);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

process.on('SIGINT', async () => {
  console.log('Received SIGINT, disconnecting...');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
