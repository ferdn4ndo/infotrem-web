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
  faRss,
  faMap,
  faPhotoFilm,
  faMoon,
  faSun,
  faBuilding,
  faIndustry,
  faLocationDot,
  faRoute,
  faUpload,
  faUser,
  faKey,
  faShieldHalved
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
  library.add(faMap)
  library.add(faPhotoFilm)
  library.add(faMoon)
  library.add(faSun)
  library.add(faBuilding)
  library.add(faIndustry)
  library.add(faLocationDot)
  library.add(faRoute)
  library.add(faUpload)
  library.add(faUser)
  library.add(faKey)
  library.add(faShieldHalved)
}
