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
  ExternalLink,
  Lightbulb,
  type LucideIcon,
} from 'lucide-vue-next'

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
</script>

<template>
  <div class="resume">
    <div class="resume-header">
      <h1>Резюме</h1>
      <p class="resume-subtitle">BobGroup. Работаем на себя. Что вспомнилось:</p>
      <p class="resume-note">
        <Lightbulb class="note-icon" :size="18" />
        Если вы это смотрите, то сорян, на фронтенд деняк не хватило
      </p>
    </div>

    <div class="timeline">
      <article v-for="project in projects" :key="project.id" class="timeline-item">
        <div class="timeline-marker">
          <div class="marker-icon">
            <component :is="project.icon" :size="24" />
          </div>
          <span class="marker-number">#{{ project.id }}</span>
        </div>

        <div class="timeline-content">
          <header class="project-header">
            <h3 class="project-title">{{ project.title }}</h3>
            <div class="project-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </header>

          <div class="project-description">
            <p v-for="(paragraph, index) in project.description" :key="index">
              {{ paragraph }}
            </p>
          </div>

          <div v-if="project.links?.length" class="project-links">
            <a
              v-for="link in project.links"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="project-link"
            >
              <ExternalLink class="link-icon" :size="14" />
              {{ link.label }}
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.resume {
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.resume-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.resume-header h1 {
  margin-bottom: var(--spacing-sm);
}

.resume-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.resume-note {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.note-icon {
  font-size: var(--font-size-base);
}

.timeline {
  position: relative;
  padding-left: var(--spacing-2xl);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--color-accent),
    var(--color-link),
    var(--color-danger)
  );
}

.timeline-item {
  position: relative;
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}

.timeline-item:nth-child(1) {
  animation-delay: 0.1s;
}
.timeline-item:nth-child(2) {
  animation-delay: 0.15s;
}
.timeline-item:nth-child(3) {
  animation-delay: 0.2s;
}
.timeline-item:nth-child(4) {
  animation-delay: 0.25s;
}
.timeline-item:nth-child(5) {
  animation-delay: 0.3s;
}
.timeline-item:nth-child(6) {
  animation-delay: 0.35s;
}
.timeline-item:nth-child(7) {
  animation-delay: 0.4s;
}
.timeline-item:nth-child(8) {
  animation-delay: 0.45s;
}
.timeline-item:nth-child(9) {
  animation-delay: 0.5s;
}
.timeline-item:nth-child(10) {
  animation-delay: 0.55s;
}
.timeline-item:nth-child(11) {
  animation-delay: 0.6s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-marker {
  position: absolute;
  left: calc(-1 * var(--spacing-2xl) - 12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.marker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: var(--font-size-xl);
  background: var(--color-bg-secondary);
  border: 3px solid var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  z-index: 1;
  transition: all var(--transition-base);
}

.timeline-item:hover .marker-icon {
  border-color: var(--color-accent);
  transform: scale(1.1);
}

.marker-number {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}

.timeline-content {
  flex: 1;
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border-left: 4px solid transparent;
  transition: all var(--transition-base);
}

.timeline-item:hover .timeline-content {
  border-left-color: var(--color-accent);
  box-shadow: var(--shadow-lg);
}

.project-header {
  margin-bottom: var(--spacing-md);
}

.project-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  color: var(--color-accent);
  margin: 0 0 var(--spacing-sm) 0;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-link);
  background: rgba(0, 188, 212, 0.1);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 188, 212, 0.3);
}

.project-description {
  margin-bottom: var(--spacing-md);
}

.project-description p {
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.project-description p:last-child {
  margin-bottom: 0;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-bg-tertiary);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.project-link:hover {
  color: var(--color-accent);
  background: var(--color-bg-elevated);
}

.link-icon {
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .resume {
    padding: var(--spacing-lg);
  }

  .timeline {
    padding-left: var(--spacing-xl);
  }

  .timeline::before {
    left: 16px;
  }

  .timeline-marker {
    left: calc(-1 * var(--spacing-xl) - 8px);
  }

  .marker-icon {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-base);
  }

  .timeline-content {
    padding: var(--spacing-md);
  }

  .project-title {
    font-size: var(--font-size-base);
  }
}
</style>
