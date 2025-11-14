<script lang="ts" setup>
import { ref } from 'vue'
import type { Card } from '@/types/card'

interface Props {
  card: Card
}

defineProps<Props>()

const isExpanded = ref(false)

const toggleDescription = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div :class="{ expanded: isExpanded }" class="card">
    <a :href="card.link" class="card-image-link" target="_blank">
      <img :alt="card.title" :src="card.icon" class="card-image" />
    </a>
    <div class="card-content">
      <h3>
        {{ card.title }}
        <a :href="card.link" class="icon go-to-link" target="_blank">
          <img alt="launch" src="/img/launch.svg" />
        </a>
      </h3>
      <p>
        {{ card.short_description }}
        <button class="icon show-description" @click="toggleDescription">
          <img alt="info" src="/img/info.svg" />
        </button>
      </p>
      <div :class="{ show: isExpanded }" class="description">
        <p v-for="(paragraph, index) in card.description" :key="index">
          {{ paragraph }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  overflow: hidden;
  align-items: flex-start;
  margin: 0;
  padding: 20px;
  transition: all 0.5s ease;
  transform: scale(1);
  border-radius: 10px;
  background-color: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  break-inside: avoid;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
}

.card.expanded {
  transform: scale(1.02);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
  grid-row: span 2;
}

.card img {
  max-width: 100px;
  height: 100px;
  margin-right: 20px;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  border-radius: 10px;
}

.card img:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

.card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
}

.card h3 {
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  transition: color 0.3s ease;
  color: #fff;
}

.card h3:hover {
  color: #ffcc00;
}

.card p {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: color 0.3s ease;
  color: #ccc;
}

.card .description {
  overflow: hidden;
  max-height: 0;
  padding: 0 10px;
  transition:
    max-height 0.5s ease,
    opacity 0.5s ease,
    transform 0.5s ease;
  transform: translateY(-10px);
  opacity: 0;
  border-top: 1px solid #444;
}

.card .description.show {
  max-height: 900px;
  padding: 10px;
  transform: translateY(0);
  opacity: 1;
}

.card .description p {
  margin-bottom: 10px;
  transition: opacity 0.3s ease;
}

.card .description p:hover {
  opacity: 0.8;
}

.card .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  color: #fff;
  border: none;
  background: none;
}

.card .icon:hover {
  transform: scale(1.2);
  opacity: 0.8;
}

.card .icon img {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.card .icon img:hover {
  transform: rotate(15deg);
}

.card h3 .icon,
.card p .icon {
  margin-left: 10px;
}
@media (max-width: 768px) {
  .card.expanded {
    transform: scale(1);
    grid-row: span 1;
  }

  .card {
    align-items: center;
    flex-direction: column;
  }

  .card img {
    margin-bottom: 20px;
  }

  .card-content {
    align-items: center;
  }

  .card .icon {
    margin: 0;
  }
}
</style>
