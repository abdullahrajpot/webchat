// soloLayoutConfig.js
import {
  SIDEBAR_VARIANTS,
  SIDEBAR_STYLES,
  SIDEBAR_VIEWS,
  SIDEBAR_SCROLL_TYPES,
  SIDEBAR_ANCHOR_POSITIONS,
} from "@jumbo/utilities/constants";

export const soloLayoutConfig = {
  sidebar: {
    open: false,
    hide: true,
    variant: SIDEBAR_VARIANTS.PERSISTENT,
    style: SIDEBAR_STYLES.FULL_HEIGHT,
    view: SIDEBAR_VIEWS.FULL,
    scrollType: SIDEBAR_SCROLL_TYPES.FIXED,
    anchor: SIDEBAR_ANCHOR_POSITIONS.LEFT,
    width: 0,
    minWidth: 0,
    drawer: false,
  },
  header: {
    hide: false,
    fixed: true,
    sx: { height: 80 },
  },
  footer: { hide: false },
};
export const CONTAINER_MAX_WIDTH = 1320;


