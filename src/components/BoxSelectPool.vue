<template>
  <Box>
    <label class="d-block">Pool</label>
    <ButtonSelectPool customClass="h2 d-block" :default="poolAddress" v-model="id" />
    <PoolInfo :pool="pool" />
  </Box>
</template>

<script>
import Pool from '@/helpers/_REChainEXChange/pool';

export default {
  props: ['poolAddress'],
  data() {
    return {
      id: false,
      pool: false
    };
  },
  watch: {
    async id(value, oldValue) {
      if (value !== oldValue) {
        const { asset0, asset1 } = this.settings.pools[value];
        const pool = new Pool(value, [asset0, asset1]);
        await pool.init();
        pool.marketcap = pool.getMarketcap(this.settings);
        this.pool = pool;
        this.$emit('input', pool);
      }
    }
  }
};
</script>
