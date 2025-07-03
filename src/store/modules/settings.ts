import Vue from 'vue';
import store from '@/store';
import client from '@/helpers/client';
import {
  getAAState,
  getAAStateVars,
  getAAsByBaseAAs,
  FACTORY_ADDRESS,
  PROXY_BASE_ADDRESSES,
  TOKEN_REGISTRY_ADDRESS
} from '@/helpers/_REChainEXChange';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';
import units from '@/helpers/units.json';

const state = {
  isLoading: false,
  assets: {},
  assetToSymbol: {},
  decimals: {},
  exchangeRates: {},
  pools: {},
  pairs: {},
  poolToProxy: {},
  count: 0
};

client.subscribe(result => {
  const [command, { subject, body }] = result;
  if (command === 'justsaying' && subject === 'exchange_rates') {
    store.commit('exchangeRates', body);
  }
});

const mutations = {
  isLoading(_state, payload) {
    Vue.set(_state, 'isLoading', payload);
  },
  init(_state, { factory, proxies, a2sRegistry, descriptionRegistry, decimalsRegistry }) {
    const lSUnit = localStorage.getItem(`${LOCALSTORAGE_KEY}.unit`);
    const assets = { base: lSUnit ? JSON.parse(lSUnit) : units[0] };
    Vue.set(_state, 'assetToSymbol', a2sRegistry.a2s);
    const decimals = { base: assets.base.decimals };
    Object.entries(descriptionRegistry.current).forEach((current: any) => {
      const asset = current[0].replace('desc_', '');
      decimals[asset] = parseInt(decimalsRegistry.decimals[current[1]]) || 0;
    });
    Vue.set(_state, 'decimals', decimals);
    if (factory.pools) {
      Vue.set(_state, 'pools', factory.pools);
      Vue.set(_state, 'pairs', factory.pairs);
      Vue.set(_state, 'count', factory.count);
      Object.entries(factory.pools).forEach((pool: any) => {
        if (pool[1].asset) {
          [pool[1].asset0, pool[1].asset1].forEach(asset => {
            if (asset !== 'base')
              assets[asset] = { symbol: a2sRegistry.a2s[asset], decimals: decimals[asset] || 0 };
          });
        }
      });
    }
    Vue.set(_state, 'assets', assets);
    let poolToProxy = {};
    Object.entries(proxies).forEach((proxy: any) => {
      if (proxy[1].definition[1].params.pool_aa) {
        poolToProxy[proxy[1].definition[1].params.pool_aa] = proxy[1].address;
      }
    });
    Vue.set(_state, 'poolToProxy', poolToProxy);
  },
  unit(_state, payload) {
    Vue.set(_state.assets, 'base', payload);
    Vue.set(_state.decimals, 'base', payload.decimals);
  },
  exchangeRates(_state, payload) {
    Vue.set(_state, 'exchangeRates', payload);
  }
};

const actions = {
  init: async ({ commit }) => {
    commit('isLoading', true);
    const address = localStorage.getItem(`${LOCALSTORAGE_KEY}.address`);
    if (address) store.dispatch('login', address);
    const factory = await getAAState(FACTORY_ADDRESS);
    const proxies =
      PROXY_BASE_ADDRESSES && PROXY_BASE_ADDRESSES.length
        ? await getAAsByBaseAAs(PROXY_BASE_ADDRESSES)
        : [];
    const a2sRegistry = await getAAStateVars(TOKEN_REGISTRY_ADDRESS, 'a2s_', '_');
    const descriptionRegistry = await getAAStateVars(TOKEN_REGISTRY_ADDRESS, 'current_desc_', '_');
    const decimalsRegistry = await getAAStateVars(TOKEN_REGISTRY_ADDRESS, 'decimals_', '_');
    commit('init', { factory, proxies, a2sRegistry, descriptionRegistry, decimalsRegistry });
    commit('isLoading', false);
  },
  unit: ({ commit }, unit) => {
    localStorage.setItem(`${LOCALSTORAGE_KEY}.unit`, JSON.stringify(unit));
    commit('unit', unit);
  }
};

export default {
  state,
  mutations,
  actions
};
