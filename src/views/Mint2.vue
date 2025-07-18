<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="1" />
      <BoxSelectPool :poolAddress="poolAddress" v-model="selectedPool" />
      <Box
        v-if="selectedPool.asset0 && selectedPool.reserve0 && selectedPool.reserve1"
        class="d-flex"
      >
        <div class="flex-auto">
          <label for="input" class="d-block">
            Deposit
            <LabelBalance :asset="inputAsset" @select="selectAmount" />
          </label>
          <InputAmount
            id="input"
            v-model="inputAmount"
            @change="updateOutputAmount"
            :asset="inputAsset"
          />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken
            :values="[selectedPool.asset0, selectedPool.asset1]"
            v-model="inputAsset"
          />
        </div>
      </Box>
      <Box v-else-if="selectedPool">
        <p class="text-white m-0">
          Add liquidity with both tokens first.
        </p>
      </Box>
      <Box v-if="rate">
        <label for="input">Exchange rate</label>
        <div class="text-white">
          1 <Ticker :asset="outputAsset" /> =
          {{ parseFloat(rate.toFixed(this.getDecimals(inputAsset))) }}
          <Ticker :asset="inputAsset" />
        </div>
        <div class="text-white">
          1 <Ticker :asset="inputAsset" /> =
          {{ parseFloat((1 / rate).toFixed(this.getDecimals(outputAsset))) }}
          <Ticker :asset="outputAsset" />
        </div>
      </Box>
      <Box v-if="rate">
        <p class="text-white m-0">
          Adding liquidity with just one token is basically the same as swapping half of the tokens,
          and then automatically adding liquidity with both tokens.<br />
          There is no slippage threshold when depositing only one token at once, so use with
          caution!
        </p>
      </Box>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!inputAsset || !inputAmount"
        >
          Add liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import Trade from '@/helpers/_REChainEXChange/trade';
import Factory from '@/helpers/_REChainEXChange/factory';
import { generateUri, toString } from '@/helpers/_REChainEXChange';

export default {
  data() {
    return {
      selectedPool: false,
      trade: false,
      inputAmount: '',
      inputAsset: '',
      poolAddress: this.$route.params.poolAddress,
      rate: 0
    };
  },
  watch: {
    async inputAmount(value, oldValue) {
      if (value !== oldValue) {
        this.updateOutputAmount();
      }
    },
    async inputAsset(value, oldValue) {
      if (value !== oldValue) {
        this.outputAsset =
          this.inputAsset === this.selectedPool.asset0
            ? this.selectedPool.asset1
            : this.selectedPool.asset0;
        await this.init();
        this.updateOutputAmount();
      }
    },
    async selectedPool(value, oldValue) {
      if (value !== oldValue) {
        this.inputAmount = '';
        this.rate = 0;
      }
    }
  },
  methods: {
    selectAmount(amount) {
      this.inputAmount = amount;
      this.updateOutputAmount();
    },
    getDecimals(assetId) {
      return this.settings.decimals[assetId] || 0;
    },
    updateRate() {
      if (!this.inputAsset || !this.outputAsset) {
        this.rate = 0;
        return;
      }
      const inputAmount = toString(this.inputAmount / 2, this.getDecimals(this.inputAsset));
      const outputAmount = toString(this.outputAmount, this.getDecimals(this.outputAsset));
      const rate = parseFloat((inputAmount / outputAmount).toFixed(6));
      if (rate <= 0 || rate === Infinity) {
        this.rate = 0;
        return;
      }
      this.rate = rate;
    },
    async init() {
      if (!this.inputAsset || !this.outputAsset) return;
      const settings = this.settings;
      const factory = new Factory(settings.pools, settings.pairs);
      this.trade = new Trade(factory, this.inputAsset, this.outputAsset);
      await this.trade.init();
    },
    handleSubmit() {
      const data = { mint: '1' };
      const address = this.selectedPool.address;
      const url = generateUri(address, data, this.inputAmount, this.inputAsset);
      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function() {
          opener.close();
        }, 5000);
      } else {
        location.href = url;
      }
    },
    updateOutputAmount() {
      if (!this.inputAsset || !this.outputAsset) return;
      if (this.inputAmount)
        this.outputAmount = this.trade.getAmountBought(this.inputAmount / 2) || '';
      this.updateRate();
    },
  }
};
</script>
