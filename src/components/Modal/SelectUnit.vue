<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body flex-auto my-5">
      <h2 class="mx-4 mb-3 text-white">Unit</h2>
      <a
        class="d-block py-2 mt-n1 px-4 text-white highlight"
        @click="select(unit)"
        v-for="(unit, i) in units"
        :key="i"
      >
        {{ unit.symbol }}
        <span class="float-right text-gray" v-if="exchangeRates">
          1 {{ unit.symbol }} ≈ ${{ getRate(unit.decimals) }}
        </span>
      </a>
    </div>
  </Modal>
</template>

<script>
import units from '@/helpers/units.json';

export default {
  props: ['open'],
  data() {
    return {
      units
    };
  },
  computed: {
    exchangeRates() {
      return this.settings.exchangeRates;
    }
  },
  methods: {
    select(unit) {
      this.$store.dispatch('unit', unit);
      this.$emit('close');
    },
    getRate(decimals) {
      const multiplier = 10 ** decimals;
      return ((multiplier * this.exchangeRates.GREChain_USD) / 1e9).toLocaleString('en-US', {
        maximumSignificantDigits: 3
      });
    }
  }
};
</script>
