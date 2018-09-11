const Redis = require('ioredis');
const elasticsearch = require('./clients/elasticsearch');

const { createRecord, setupElasticsearch } = require('./utils');

(async () => {
  await setupElasticsearch();
  await seedRedis(10000);
  await importRecords();
})();

const BUFFER_SIZE = 350;

async function importRecords() {
  console.log('importing records from redis -> elasticsearch');

  const redis = new Redis({ host: 'redis' });

  let records = [];
  let count = 0;

  do {
    record = await redis.rpop('records');
    records.push({ index: { _index: 'records', _type: 'all' } });
    records.push(JSON.parse(record));

    if (record && records.length >= BUFFER_SIZE) {
      count += records.length;
      console.log('indexed', count);
      await elasticsearch.bulk({
        body: records
      });
      records = [];
    }
  } while (record);

  await redis.disconnect();
}

async function seedRedis(numRecords) {
  const redis = new Redis({ host: 'redis' });

  console.log('flushing redis');
  await redis.flushall();

  for (let i = 0; i < numRecords; i += 1) {
    await redis.rpush('records', JSON.stringify(createRecord()));

    if (i % (numRecords / 10) === 0) {
      console.log(`${i} records seeded in redis`);
    }
  }

  console.log('done seeding redis');
  await redis.disconnect();
}
