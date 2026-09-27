// 图标来源：Lucide (ISC License) — https://lucide.dev
// 风格契约：24×24 viewBox / stroke 1.75 / round 端点与连接 / currentColor
// 生成说明：只保留 <svg> 内部子元素，去掉了 license 注释、class 属性与 stroke-width（由 Icon.astro 统一设定）

export type IconName =
  | 'menu'
  | 'search'
  | 'dark'
  | 'light'
  | 'circle-x'
  | 'circle-check'
  | 'target'
  | 'lightbulb'
  | 'pin'
  | 'brain'
  | 'calculator'
  | 'compass'
  | 'book-open'
  | 'triangle-alert'
  | 'git-branch'
  | 'file-pen'
  | 'flask'
  | 'hash'
  | 'layers'
  | 'arrow-left-right'
  | 'droplet'
  | 'flame'
  | 'magnet'
  | 'test-tube'
  | 'cloud-lightning'
  | 'mountain'
  | 'gem'
  | 'beaker'
  | 'pipette'
  | 'atom'
  | 'box'
  | 'hexagon'
  | 'clipboard-list'
  | 'flame-kindling'
  | 'test-tube-diagonal'
  | 'link'
  | 'route'
  | 'sigma'
  | 'scale'
  | 'triangle'
  | 'list-ordered'
  | 'trending-up'
  | 'orbit'
  | 'move-diagonal'
  | 'chart-column';

export const ICONS: Record<IconName, string> = {
  menu: '<path d="M4 5h16" /> <path d="M4 12h16" /> <path d="M4 19h16" />',
  search: '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />',
  dark: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
  light: '<circle cx="12" cy="12" r="4" /> <path d="M12 2v2" /> <path d="M12 20v2" /> <path d="m4.93 4.93 1.41 1.41" /> <path d="m17.66 17.66 1.41 1.41" /> <path d="M2 12h2" /> <path d="M20 12h2" /> <path d="m6.34 17.66-1.41 1.41" /> <path d="m19.07 4.93-1.41 1.41" />',
  'circle-x': '<circle cx="12" cy="12" r="10" /> <path d="m15 9-6 6" /> <path d="m9 9 6 6" />',
  'circle-check': '<circle cx="12" cy="12" r="10" /> <path d="m16 9-5.5 5.5L8 12" />',
  target: '<circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="6" /> <circle cx="12" cy="12" r="2" />',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /> <path d="M9 18h6" /> <path d="M10 22h4" />',
  pin: '<path d="M12 17v5" /> <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />',
  brain: '<path d="M12 18V5" /> <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /> <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /> <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /> <path d="M18 18a4 4 0 0 0 2-7.464" /> <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /> <path d="M6 18a4 4 0 0 1-2-7.464" /> <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />',
  calculator: '<rect width="16" height="20" x="4" y="2" rx="2" /> <line x1="8" x2="16" y1="6" y2="6" /> <line x1="16" x2="16" y1="14" y2="18" /> <path d="M16 10h.01" /> <path d="M12 10h.01" /> <path d="M8 10h.01" /> <path d="M12 14h.01" /> <path d="M8 14h.01" /> <path d="M12 18h.01" /> <path d="M8 18h.01" />',
  compass: '<circle cx="12" cy="12" r="10" /> <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />',
  'book-open': '<path d="M12 5v16" /> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /> <path d="M12 9v4" /> <path d="M12 17h.01" />',
  'git-branch': '<path d="M15 6a9 9 0 0 0-9 9V3" /> <circle cx="18" cy="6" r="3" /> <circle cx="6" cy="18" r="3" />',
  'file-pen': '<path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" /> <path d="M14 2v5a1 1 0 0 0 1 1h5" /> <path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" />',
  flask: '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" /> <path d="M6.453 15h11.094" /> <path d="M8.5 2h7" />',
  hash: '<line x1="4" x2="20" y1="9" y2="9" /> <line x1="4" x2="20" y1="15" y2="15" /> <line x1="10" x2="8" y1="3" y2="21" /> <line x1="16" x2="14" y1="3" y2="21" />',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /> <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /> <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />',
  'arrow-left-right': '<path d="M8 3 4 7l4 4" /> <path d="M4 7h16" /> <path d="m16 21 4-4-4-4" /> <path d="M20 17H4" />',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />',
  magnet: '<path d="m12 15 4 4" /> <path d="M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z" /> <path d="m5 8 4 4" />',
  'test-tube': '<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2" /> <path d="M8.5 2h7" /> <path d="M14.5 16h-5" />',
  'cloud-lightning': '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" /> <path d="m13 12-3 5h4l-3 5" />',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z" />',
  gem: '<path d="M10.5 3 8 9l4 13 4-13-2.5-6" /> <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" /> <path d="M2 9h20" />',
  beaker: '<path d="M4.5 3h15" /> <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" /> <path d="M6 14h12" />',
  pipette: '<path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" /> <path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" /> <path d="m2 22 .414-.414" />',
  atom: '<circle cx="12" cy="12" r="1" /> <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" /> <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /> <path d="m3.3 7 8.7 5 8.7-5" /> <path d="M12 22V12" />',
  hexagon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />',
  'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1" /> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /> <path d="M12 11h4" /> <path d="M12 16h4" /> <path d="M8 11h.01" /> <path d="M8 16h.01" />',
  'flame-kindling': '<path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z" /> <path d="m5 22 14-4" /> <path d="m5 18 14 4" />',
  'test-tube-diagonal': '<path d="M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3" /> <path d="m16 2 6 6" /> <path d="M12 16H4" />',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',
  route: '<circle cx="6" cy="19" r="3" /> <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /> <circle cx="18" cy="5" r="3" />',
  sigma: '<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2" />',
  scale: '<path d="M12 3v18" /> <path d="m19 8 3 8a5 5 0 0 1-6 0zV7" /> <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" /> <path d="m5 8 3 8a5 5 0 0 1-6 0zV7" /> <path d="M7 21h10" />',
  triangle: '<path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />',
  'list-ordered': '<path d="M11 5h10" /> <path d="M11 12h10" /> <path d="M11 19h10" /> <path d="M4 4h1v5" /> <path d="M4 9h2" /> <path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" />',
  'trending-up': '<path d="M16 7h6v6" /> <path d="m22 7-8.5 8.5-5-5L2 17" />',
  orbit: '<path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" /> <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" /> <circle cx="12" cy="12" r="3" /> <circle cx="19" cy="5" r="2" /> <circle cx="5" cy="19" r="2" />',
  'move-diagonal': '<path d="M11 19H5v-6" /> <path d="M13 5h6v6" /> <path d="M19 5 5 19" />',
  'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16" /> <path d="M18 17V9" /> <path d="M13 17V5" /> <path d="M8 17v-3" />',
};
