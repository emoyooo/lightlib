import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import icons you want to use
import {
  faHouse,
  faMagnifyingGlass,
  faBook,
  faUser,
  faArrowLeft,
  faArrowRight,
  faHeart,
  faShare,
  faBookmark,
  faClock,
  faFire,
  faStar,
  faBookOpen,
  faCheck,
  faPlus,
  faCamera,
  faTrophy,
  faGear,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faXmark,
  faGlobe,
  faArrowDown,
  faUsers,
  faFilter,
  faGripVertical,
  faList,
  faBars,
  faChartColumn,
  faCrosshairs,
} from '@fortawesome/free-solid-svg-icons'

import {
  faHeart as faHeartRegular,
  faBookmark as faBookmarkRegular,
  faClock as faClockRegular,
} from '@fortawesome/free-regular-svg-icons'

// Add icons to library
library.add(
  faCrosshairs,
  faHouse,
  faMagnifyingGlass,
  faBook,
  faUser,
  faArrowLeft,
  faArrowRight,
  faHeart,
  faHeartRegular,
  faShare,
  faBookmark,
  faBookmarkRegular,
  faClock,
  faClockRegular,
  faFire,
  faStar,
  faBookOpen,
  faCheck,
  faPlus,
  faCamera,
  faTrophy,
  faGear,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faXmark,
  faGlobe,
  faArrowDown,
  faUsers,
  faFilter,
  faGripVertical,
  faList,
  faBars,
  faChartColumn,
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
