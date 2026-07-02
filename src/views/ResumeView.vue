<script lang="ts" setup>
import {
  Video,
  Bot,
  BookOpen,
  Zap,
  Pickaxe,
  Wallet,
  Pill,
  ClipboardList,
  Crown,
  Camera,
  Building2,
  type LucideIcon,
} from 'lucide-vue-next'
import { ref } from 'vue'
import CmdLine from '@/components/CmdLine.vue'
import { useCmdReplay } from '@/composables/useCmdReplay'

interface ResumeProject {
  id: number
  title: string
  icon: LucideIcon
  tags: string[]
  description: string[]
  links?: { url: string; label: string }[]
}

const projects: ResumeProject[] = [
  {
    id: 11,
    title: 'Ведущий канала ".net помойка"',
    icon: Video,
    tags: ['Стриминг', 'YouTube', 'Twitch'],
    description: ['Стримлю мелкое программирование для успокоения души и просвещения масс.'],
    links: [
      { url: 'http://bob217.ru', label: 'тут поделки со стрима' },
      { url: 'https://www.youtube.com/@bobito217', label: 'YouTube' },
      { url: 'https://www.twitch.tv/bobito217', label: 'Twitch' },
    ],
  },
  {
    id: 1,
    title: 'Гексапод',
    icon: Bot,
    tags: ['WinForm', 'OpenGL', 'C#'],
    description: [
      'Первый крупный заказ, запомнился, рисуем 2 круглых платформы, соединённые 6 втулками.',
      'Одна платформа неподвижна, другая перемещается в заданные координаты и вращается по углам Эйлера, за указанный промежуток времени, таймлайн, куча полей для данных, отрисовка.',
    ],
    links: [{ url: 'https://github.com/MaxNagibator/gusev', label: 'GitHub' }],
  },
  {
    id: 2,
    title: 'Репетиторство',
    icon: BookOpen,
    tags: ['Обучение', 'Программирование'],
    description: [
      'Было время, обучал молодых, основам программирования, мелочь, ничего серьёзного.',
    ],
    links: [{ url: 'http://tomsk.repetitors.info/comments.php?p=GritsinaMA', label: 'Отзывы' }],
  },
  {
    id: 3,
    title: 'Расчёт стоимости электроэнергии',
    icon: Zap,
    tags: ['WinForm', 'C#'],
    description: [
      'WinForm, уже и не помню точно, в эксельке контора одна считала, а потом начала на винформах переписывать, помог ей вобщем. Ничего специфического.',
    ],
    links: [{ url: 'https://github.com/MaxNagibator/calc-energy', label: 'GitHub' }],
  },
  {
    id: 4,
    title: 'Браузерная игра "Шахтёр"',
    icon: Pickaxe,
    tags: ['Angular', 'C#', 'WCF', 'Game'],
    description: [
      'Для души. Познаём angular, серверная часть на C# WCF.',
      'Рабочие добывают, воинов нанимаем, грабим другие деревни, шмотки выпадают, одеваем героя, делаем улучшения, строим домики.',
    ],
    links: [
      { url: 'https://vk.com/bob217miner', label: 'VK' },
      { url: 'https://www.dropbox.com/s/9bt66d1zbgfqr26/m1.png?dl=0', label: 'Скрин 1' },
      { url: 'https://www.dropbox.com/s/435avjywsxehkaz/m2.png?dl=0', label: 'Скрин 2' },
    ],
  },
  {
    id: 5,
    title: 'Расходы',
    icon: Wallet,
    tags: ['WCF', 'MVC', 'Android'],
    description: ['Для души. WCF, MVC, Android, бюджетный инструмент для записи расходов.'],
    links: [
      { url: 'https://vk.com/bob217money', label: 'VK' },
      { url: 'https://www.dropbox.com/s/mh6zoor6pu97sgf/f2.png?dl=0', label: 'Скрин 1' },
      { url: 'https://www.dropbox.com/s/e6uhw2ov5utlrjn/f1.png?dl=0', label: 'Скрин 2' },
    ],
  },
  {
    id: 6,
    title: 'ФИС (Фармацевтическая ИС)',
    icon: Pill,
    tags: ['MVC', 'Kendo', 'Angular', 'StimulSoft'],
    description: [
      'ФИС - из последнего, помощь товарищам из Казахстана. Информационная система для регистрации фармацевтического барахла (таблетки и тд.) с кучей функционала. MVC + Kendo, Angular.',
      'Моё участие (делаем функционал): Настройка времени приёма на внутреннем портале, и запись на приём на внешнем.',
      'Один из этапов экспертизы (Экспертный совет), реализация логики, печатные формы (StimulSoft Reports).',
      'Логирование обращений к сервисной части (всех подряд и индивидуальное красивое).',
      'Механизм ролей прав доступа. Что-то ещё по мелочам.',
    ],
  },
  {
    id: 7,
    title: 'Электронный журнал',
    icon: ClipboardList,
    tags: ['WinForm', 'C#'],
    description: ['Маленький проект на винформ, сдача и снятие объектов с охраны.'],
    links: [{ url: 'https://www.dropbox.com/s/z4a1oec1cjnyjb8/fsb.png?dl=0', label: 'Скрин' }],
  },
  {
    id: 8,
    title: 'Шахматишки',
    icon: Crown,
    tags: ['C#', 'NuGet', 'Plugins'],
    description: [
      'Это должно было быть моё портфолио, но в итоге пусть будет демонстрацией того, что чуток умею писать плагины и в нугетсы заливать сборки.',
    ],
    links: [
      { url: 'http://chess.bob217.ru/', label: 'Сайт' },
      { url: 'https://github.com/MaxNagibator/chess', label: 'GitHub' },
    ],
  },
  {
    id: 9,
    title: 'Инстамодели',
    icon: Camera,
    tags: ['.NET Core', 'Parsing', 'Console'],
    description: [
      'Простая консольная штука на .NET Core, которая логинится (через хитрый парсинг страницы) и скачивает фотографии людей из инстаграмма, по тегам или локации. Ну тут без ссылок и картинок.',
    ],
  },
  {
    id: 10,
    title: 'Департамент недвижимости Москвы',
    icon: Building2,
    tags: ['Legacy', 'Enterprise'],
    description: [
      'Поработал тут два месяца на полноценную занятость. Ну это печальный опыт легаси, но что-то полезное всё же сделал.',
      'Сложно делать фичи, когда локально не все проекты запускаются, а разбираться как их запустить не дают, да и сами не знают :)',
    ],
  },
]

const logKey = ref(0)
const { phaseClass, start, print } = useCmdReplay(() => 1100)

const replay = (): void => {
  print()
  logKey.value += 1
}
</script>

<template>
  <div class="resume" :class="phaseClass">
    <div class="resume-container">
      <header class="resume-header">
        <CmdLine @run="start" @done="replay">git reflog --author bob217</CmdLine>
        <h1 class="cmd-out">Резюме</h1>
        <p class="resume-subtitle cmd-out" style="--print-delay: 80ms">
          BobGroup. Работаем на себя. Что вспомнилось:
        </p>
        <p class="cmd-note cmd-out" style="--print-delay: 160ms">
          # сорян, на фронтенд деняк не хватило
        </p>
      </header>

      <ul :key="logKey" class="log cmd-out" style="--print-delay: 200ms">
        <li
          v-for="(project, i) in projects"
          :key="project.id"
          class="entry"
          :class="{ 'is-head': i === 0 }"
          :style="{ '--i': i }"
        >
          <span class="rail" aria-hidden="true">
            <span class="node"></span>
          </span>
          <article class="entry-body">
            <header class="entry-head">
              <component :is="project.icon" class="entry-icon" :size="18" />
              <h3 class="entry-title">{{ project.title }}</h3>
              <span v-if="i === 0" class="head-ref">HEAD@{0}</span>
            </header>
            <p class="entry-refs">({{ project.tags.join(', ') }})</p>
            <div class="entry-text">
              <p v-for="(paragraph, j) in project.description" :key="j">
                {{ paragraph }}
              </p>
            </div>
            <div v-if="project.links?.length" class="entry-links">
              <a
                v-for="link in project.links"
                :key="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="entry-link"
              >
                {{ link.label }}
              </a>
            </div>
          </article>
        </li>
        <li class="tail" aria-hidden="true" :style="{ '--i': projects.length }">
          <span class="rail">
            <span class="node tail-node"></span>
          </span>
          <span class="tail-label">дальше не вспомнилось…</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.resume {
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.resume-container {
  width: 100%;
  max-width: var(--max-width-content);
  margin: 0 auto;
}

.resume-header {
  margin-bottom: var(--spacing-xl);
}

.resume-header h1 {
  margin: 0;
}

.resume-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0 0 var(--spacing-sm) 0;
}

.cmd-note {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
}

.log {
  --node-y: 30px;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry,
.tail {
  --stagger: min(calc(var(--i) * 45ms), 600ms);
  position: relative;
  display: grid;
  grid-template-columns: 28px 1fr;
  animation: entry-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: var(--stagger);
}

@keyframes entry-in {
  from {
    opacity: 0;
    transform: translateX(-28px);
  }
  60% {
    opacity: 1;
    transform: translateX(4px);
  }
}

.rail {
  position: relative;
}

.rail::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: var(--color-bg-tertiary);
  transform-origin: top;
  animation: rail-draw 0.45s ease backwards;
  animation-delay: var(--stagger);
}

@keyframes rail-draw {
  from {
    transform: scaleY(0);
  }
}

.log li:first-child .rail::before {
  top: var(--node-y);
}

.node {
  position: absolute;
  left: 50%;
  top: var(--node-y);
  transform: translate(-50%, -50%);
  width: 11px;
  height: 11px;
  border-radius: var(--radius-full);
  background: var(--color-text-muted);
  transition: all var(--transition-fast);
  animation: node-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--stagger) + 140ms);
}

@keyframes node-pop {
  from {
    transform: translate(-50%, -50%) scale(0);
  }
}

.is-head .node {
  background: var(--color-accent);
  box-shadow: var(--shadow-glow);
}

.entry:hover .node {
  background: var(--color-accent);
}

.entry-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.entry:hover .entry-body {
  background: var(--color-bg-secondary);
}

.entry-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.entry-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.entry:hover .entry-icon {
  color: var(--color-accent);
}

.entry-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.head-ref {
  padding: 0 var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-full);
}

.entry-refs {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-success);
  margin: 0;
}

.entry-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.entry-text p {
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin: 0;
}

.entry-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.entry-link {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-link);
  text-decoration: none;
}

.entry-link::before {
  content: '→ ';
}

.entry-link:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}

.tail {
  --node-y: 18px;
  min-height: 36px;
}

.tail .rail::before {
  bottom: calc(100% - var(--node-y));
}

.tail-node {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-text-muted);
}

.tail-label {
  align-self: center;
  padding-left: var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .resume {
    padding: var(--spacing-lg);
  }

  .entry-title {
    font-size: var(--font-size-base);
  }
}

@media (prefers-reduced-motion: reduce) {
  .entry,
  .tail,
  .rail::before,
  .node {
    animation: none;
  }
}
</style>
