import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { applyRouteMeta, SITE_DESCRIPTION, SITE_TITLE } from '@/utils/meta'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    noindex?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
      },
    },
    {
      path: '/resume',
      name: 'resume',
      component: () => import('../views/ResumeView.vue'),
      meta: {
        title: 'Резюме – bob217',
        description:
          'Резюме bobito217 как вывод git reflog: опыт, стек и проекты на C# и .NET по записям истории.',
      },
    },
    {
      path: '/donate',
      name: 'donate',
      component: () => import('../views/DonateView.vue'),
      meta: {
        title: 'Поддержка проектов – bob217',
        description:
          'Как поддержать проекты bob217: donate.stream, USDT BEP20 и QR-коды для перевода без лишних шагов.',
      },
    },
    {
      path: '/tarkov',
      name: 'tarkov',
      component: () => import('../views/TarkovView.vue'),
      meta: {
        title: 'Время Таркова – bob217',
        description:
          'Игровое время Escape from Tarkov и таймеры крафтов: когда выходить в рейд и когда забирать выхлоп.',
      },
    },
    {
      path: '/pulls',
      name: 'pulls',
      component: () => import('../views/PullRequestsView.vue'),
      meta: {
        title: 'Открытые Pull Request – bob217',
        description:
          'Открытые pull request по репозиториям bob217 с графом веток: что сейчас в работе и ждёт ревью.',
      },
    },
    {
      path: '/log',
      name: 'log',
      component: () => import('../views/LogView.vue'),
      meta: {
        title: 'Лента коммитов – bob217',
        description:
          'Лента коммитов по репозиториям bob217 как git log --graph: что и когда менялось в каждом проекте.',
      },
    },
    {
      path: '/issues',
      name: 'issues',
      component: () => import('../views/IssuesView.vue'),
      meta: {
        title: 'Открытые задачи – bob217',
        description:
          'Открытые issue по репозиториям bob217: что ждёт работы, где идёт обсуждение и сколько задача висит.',
      },
    },
    {
      path: '/repos',
      name: 'repos',
      component: () => import('../views/RepoMapView.vue'),
      meta: {
        title: 'Карта репозиториев – bob217',
        description:
          'Карта репозиториев и форков bob217: языки, вклад контрибьюторов и связи между проектами.',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'О нас – bob217',
        description:
          'Кто пишет код в проектах bob217: вывод git shortlog по контрибьюторам с числом коммитов.',
      },
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: 'Страница не найдена – bob217',
        description: 'fatal: pathspec не найден. Такой страницы на bob217.ru нет.',
        noindex: true,
      },
    },
    {
      path: '/500',
      name: 'error',
      component: () => import('../views/ErrorView.vue'),
      meta: {
        title: 'Ошибка – bob217',
        description: 'fatal: что-то сломалось на стороне bob217.ru.',
        noindex: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

router.afterEach(applyRouteMeta)

export default router
