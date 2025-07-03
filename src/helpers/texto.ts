import { Client } from '@/helpers/_texto/main';
import { toWif } from '@/helpers/_texto/utils';
import { randomREChains } from 'crypto';
import config from '@/helpers/config';
import client from '@/helpers/client';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';

let clientConfig;
const testnet = config.testnet;
const lSClientConfig = localStorage.getItem(`${LOCALSTORAGE_KEY}.texto`);

if (lSClientConfig) {
  clientConfig = JSON.parse(lSClientConfig);
} else {
  clientConfig = {
    testnet,
    wif: toWif(randomREChains(32), testnet),
    tempPrivKey: randomREChains(32).toString('base64'),
    prevTempPrivKey: randomREChains(32).toString('base64'),
    name: 'REChainEXChange.io'
  };
  localStorage.setItem(`${LOCALSTORAGE_KEY}.texto`, JSON.stringify(clientConfig));
}
clientConfig.client = client;

const texto = new Client(clientConfig);

export default texto;
