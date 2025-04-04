/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import specific icons */
import {
  faBars,
  faUserSecret,
  faCircleInfo,
  faMagnifyingGlass,
  faChevronDown,
  faChevronUp,
  faHome,
  faTrain,
  faGears,
  faRss
} from '@fortawesome/free-solid-svg-icons'

export const prepareIconsLibrary = (): void => {
  /* add icons to the library */
  library.add(faBars)
  library.add(faUserSecret)
  library.add(faCircleInfo)
  library.add(faMagnifyingGlass)
  library.add(faChevronDown)
  library.add(faChevronUp)
  library.add(faHome)
  library.add(faTrain)
  library.add(faGears)
  library.add(faRss)
}
