import { getCrossProjectStats } from './src/services/statistics';

async function test() {
  console.log('Testing getCrossProjectStats...');
  try {
    const result = await getCrossProjectStats({});
    console.log('SUCCESS! Got result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERROR:');
    console.error(error);
    process.exit(1);
  }
}

test();
