/**
 * 지금 코드가 기대하는 테이블이 실제 DB 에 다 있는지 확인한다.
 *
 *   npm run db:check
 *
 * "테이블이 안 생긴다" 는 대부분 아래 둘 중 하나다.
 *   1) npm start 로 옛 dist/ 를 실행 중  → npm run build 또는 npm run dev
 *   2) .env 의 DB_HOST/DB_PORT/DB_NAME 이 보고 있는 DB 와 다름
 * 이 스크립트는 둘 다 한 번에 드러낸다.
 */
import { sequelize } from '../src/models/index.js';
import config from '../src/config/config.js';

async function main() {
  console.log(
    `대상 DB : ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`,
  );

  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error('✗ 접속 실패:', (err as Error).message);
    process.exit(1);
  }

  const models = Object.keys(sequelize.models);
  const expected = models.map((n) => String(sequelize.models[n].getTableName()));
  console.log(`등록된 모델 : ${models.join(', ')}`);

  const actual = await sequelize.getQueryInterface().showAllTables();
  console.log(`실제 테이블 : ${actual.join(', ') || '(없음)'}`);

  const missing = expected.filter((t) => !actual.includes(t));

  if (missing.length === 0) {
    console.log('\n✓ 모든 테이블이 존재합니다.');
  } else {
    console.log(`\n✗ 누락: ${missing.join(', ')}`);
    console.log('  → sync 를 한 번 돌립니다…');
    await sequelize.sync({ force: false });
    const now = await sequelize.getQueryInterface().showAllTables();
    const still = expected.filter((t) => !now.includes(t));
    if (still.length === 0) {
      console.log('  ✓ 생성 완료:', missing.join(', '));
    } else {
      console.log('  ✗ 여전히 없음:', still.join(', '));
    }
  }

  // 행 수까지 보여줘야 "다른 DB 를 보고 있다" 를 알아챌 수 있다
  for (const t of actual) {
    const [c] = await sequelize.query(`SELECT COUNT(*) AS n FROM "${t}"`);
    console.log(`  ${t}: ${(c as { n: number }[])[0].n} 행`);
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
