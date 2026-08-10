<script lang="ts" setup>
import { computed } from 'vue'
import { useCards } from '@/composables/useCards'
import { useCardRepos } from '@/composables/useCardRepos'
import { useCmdCycle } from '@/composables/useCmdCycle'
import { useCmdReplay } from '@/composables/useCmdReplay'
import CmdLine from '@/components/CmdLine.vue'
import InfoBlock from '@/components/InfoBlock.vue'
import CardSection from '@/components/CardSection.vue'
import SectionList from '@/components/SectionList.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import PiggyBank from '@/components/PiggyBank.vue'

const BASE_COMMANDS = ['cat README.md', 'git status --short', 'ls -la ~/projects'] as const

const { cardsData } = useCards()
const { repos, freshest } = useCardRepos()

const commands = computed<readonly string[]>(() =>
  freshest.value
    ? [...BASE_COMMANDS, `git log -1 --oneline ${freshest.value.name}`]
    : BASE_COMMANDS,
)

const { current } = useCmdCycle(() => commands.value)

const sectionCount = computed(() => Object.keys(cardsData.value).length)
const { phaseClass, start, print } = useCmdReplay(() => 240 + sectionCount.value * 100)
</script>

<template>
  <ErrorBoundary>
    <div class="home" :class="phaseClass">
      <header class="hero">
        <CmdLine :text="current" @run="start" @done="print" />
        <h1 class="hero-title cmd-out">Привет, сладенький ^_^</h1>
        <p class="hero-lead cmd-out" style="--print-delay: 90ms">
          Чем мы тут занимаемся, примерно в 18:00 МСК начинаем.
        </p>
        <a
          class="hero-cta cmd-out"
          style="--print-delay: 140ms"
          href="https://t.me/@druzhok_kruzhok_bot"
          target="_blank"
          rel="noopener noreferrer"
        >
          уведомления тут в телеге
        </a>
      </header>

      <InfoBlock class="cmd-out" style="--print-delay: 200ms" />

      <SectionList class="cmd-out" style="--print-delay: 220ms" :repo-count="repos.size" />

      <div>
        <CardSection
          v-for="(cards, section, i) in cardsData"
          :key="section"
          class="cmd-out"
          :style="{ '--print-delay': `${240 + i * 100}ms` }"
          :cards="cards"
          :repos="repos"
          :title="String(section)"
        />
      </div>
    </div>

    <PiggyBank />
  </ErrorBoundary>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.hero {
  padding-top: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.hero-title {
  justify-content: flex-start;
  width: auto;
  margin: 0 0 var(--spacing-md);
  padding: var(--spacing-xs) 0 0;
  text-align: left;
  font-size: clamp(var(--font-size-3xl), 6.5vw, var(--font-size-4xl));
  line-height: var(--line-height-tight);
}

.hero-lead {
  max-width: 62ch;
  margin: 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.hero-cta {
  display: inline-block;
  padding: var(--spacing-sm) 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-link);
  text-decoration: underline dotted;
  text-underline-offset: 5px;
  text-decoration-color: rgba(0, 188, 212, 0.45);
}

.hero-cta:hover {
  color: var(--color-link-hover);
  text-decoration-color: currentcolor;
}

.cmd-prompt {
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .home {
    padding: 0 var(--spacing-md);
  }

  .hero {
    padding-top: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
  }
}
</style>
