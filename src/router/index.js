import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/versionDiff.vue'
import print from '../views/print.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
    // component: print
  },
  
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
