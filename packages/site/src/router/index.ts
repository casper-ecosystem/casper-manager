// Composables
/* eslint-disable no-restricted-globals  */
/* eslint import/extensions: "off" */
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: async () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: async () =>
          import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
