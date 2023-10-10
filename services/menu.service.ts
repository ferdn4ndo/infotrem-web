import { MenuItem } from "~/types/menu-item.type";
import { MenuList } from "~/types/meny-list.type";

const items: MenuList = {
  1: {
    icon: 'mdi:mdi-apps',
    title: 'Feed',
    path: '/',
  },
  2: {
    icon: 'mdi:mdi-chart-bubble',
    title: 'Material Rodante',
    path: '/inspire',
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAll = async (): Promise<MenuItem[]> => {
  await sleep(10);

  return Object.values(items)
};
