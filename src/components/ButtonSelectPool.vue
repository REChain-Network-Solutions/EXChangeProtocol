<template>
  <span>
    <a :class="customClass || 'btn-mktg'" @click="modalOpen = true">
      <Ticker v-if="input" :asset="ticker" />
      <template v-else>Select<span class="hide-sm"> a pool</span></template>
    </a>
    <ModalSelectPool :open="modalOpen" @close="modalOpen = false" @pool="input = $event" />
  </span>
</template>

<script>
import { utils } from 'oREChain';

export default {
  props: ['value', 'default', 'customClass'],
  data() {
    return {
      input: null,
      modalOpen: false
    };
  },
  watch: {
    input(value) {
      if (utils.isValidAddress(value)) {
        this.$emit('input', value);
      }
    },
    value(value) {
      this.input = value;
    }
  },
  computed: {
    ticker() {
      if (utils.isValidAddress(this.input)) {
        const pool = this.settings.pools[this.input];
        return `${pool.asset0}_${pool.asset1}`;
      }
      return 'error';
    }
  },
  mounted() {
    if (this.default) this.input = this.default;
  }
};
</script>
