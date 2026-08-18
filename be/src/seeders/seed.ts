import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { sequelize, User, Sale } from '../models/index.js';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_IMAGE_DIR = path.join(__dirname, '../../../sample-image');
const FILES_DIR = path.join(__dirname, '../../files');

interface UserData {
  email: string;
  name: string;
  password: string;
}

interface ProductData {
  productName: string;
  description: string;
  price: number;
  image: string;
}

const users: UserData[] = [
  { email: 'seller1@example.com', name: '판매자1', password: '1234' },
  { email: 'seller2@example.com', name: '판매자2', password: '1234' },
  { email: 'seller3@example.com', name: '판매자3', password: '1234' },
];

const products: ProductData[] = [
  { productName: 'LG 이동식 에어컨', description: 'LG 이동식 에어컨 판매합니다. 상태 좋습니다.', price: 350000, image: 'LG이동식에어컨.jpeg' },
  { productName: 'LG 그램 노트북', description: 'LG 그램 노트북 깨끗하게 사용했습니다.', price: 800000, image: 'LG 그램.jpg' },
  { productName: 'LG 모니터', description: 'LG 32인치 모니터 판매합니다.', price: 250000, image: 'lg 모니터.jpeg' },
  { productName: 'Boss 블루투스 스피커', description: 'Boss 블루투스 스피커 거의 새것입니다.', price: 120000, image: 'Boss 블루투스 스피커.avif' },
  { productName: '남성 지갑', description: '가죽 남성 지갑 판매합니다.', price: 45000, image: '남성지갑.jpg' },
  { productName: '애플워치', description: '애플워치 SE 2세대 판매합니다.', price: 280000, image: '애플워치.jpg' },
  { productName: '청바지', description: '리바이스 청바지 30사이즈 판매합니다.', price: 35000, image: '청바지.jpg' },
  { productName: '맥북프로', description: '맥북프로 14인치 M3 Pro 판매합니다.', price: 2500000, image: '맥북프로.jpeg' },
  { productName: '선풍기', description: '다이슨 선풍기 판매합니다.', price: 150000, image: '선풍기.jpeg' },
  { productName: '쿠쿠 밥솥', description: '쿠쿠 전기밥솥 6인용 판매합니다.', price: 80000, image: '쿠쿠밥솥.jpeg' },
  { productName: '갤럭시 Z 폴드6', description: '갤럭시 Z 폴드6 256GB 판매합니다.', price: 1800000, image: '갤럭시 Z 폴드8.jpeg' },
  { productName: '맥세이프 보조배터리', description: '애플 맥세이프 보조배터리 판매합니다.', price: 85000, image: '맥세이프 보조배터리.jpg' },
  { productName: '에어포스', description: '나이키 에어포스 1 270사이즈 판매합니다.', price: 95000, image: '에어포스.avif' },
];

const copyImages = (): void => {
  if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SAMPLE_IMAGE_DIR);
  for (const file of files) {
    if (file.startsWith('.')) continue;
    const src = path.join(SAMPLE_IMAGE_DIR, file);
    const dest = path.join(FILES_DIR, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  }
};

const seed = async (): Promise<void> => {
  try {
    await sequelize.sync({ force: true });
    console.log('DB 초기화 완료');

    copyImages();
    console.log('이미지 복사 완료');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, config.bcrypt.saltRounds);
      await User.create({ ...user, password: hashedPassword });
    }
    console.log('사용자 생성 완료');

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const user = users[i % users.length];
      await Sale.create({
        productName: product.productName,
        description: product.description,
        price: product.price,
        email: user.email,
        photo: product.image,
      });
    }
    console.log('상품 생성 완료');

    console.log('\nSeeding 완료!');
    console.log('테스트 계정: seller1@example.com / 1234');
    process.exit(0);
  } catch (error) {
    console.error('Seeding 실패:', error);
    process.exit(1);
  }
};

seed();
