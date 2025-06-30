import { mainScreen__route } from './screens/main';

async function main() {
  do{
    console.log("\n--------------------");
    await mainScreen__route();
  } while(true);
}

main(); 