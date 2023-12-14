/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import specific icons */
import {
  faBars,
  faUserSecret,
  faCircleInfo,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons'

export const prepareIconsLibrary = (): void => {
  /* add icons to the library */
  library.add(faBars)
  library.add(faUserSecret)
  library.add(faCircleInfo)
  library.add(faMagnifyingGlass)
}
