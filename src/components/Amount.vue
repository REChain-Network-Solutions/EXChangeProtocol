<template>
  <span v-text="str" />
</template>

<script>
import { toString } from '@/helpers/_REChainEXChange';

export default {
  props: ['value', 'asset'],
  computed: {
    str() {
      const asset = this.settings.assets[this.asset];
      const decimals = asset ? asset.decimals : 0;
      return toString(this.value, decimals);
    }
  }
};
</script>
