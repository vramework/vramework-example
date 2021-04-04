import * as React from 'react'
import { useRouter } from 'next/router'

const appColors: Record<string, string> = {}

appColors.base = `:root {
  --site-width: 960px;
  --color-bg: rgb(var(--color-rgb-bg));
  --color-bg-inverse: rgb(var(--color-rgb-inverse));
  --color-bg-secondary: rgb(var(--color-rgb-bg-secondary));
  --color-bg-inverse: black;
  --color-bg-footer: var(--color-tertiary);
  --color-error: red;
  --color-primary: rgb(var(--color-rgb-primary));
  --color-secondary: rgb(var(--color-rgb-secondary));
  --color-tertiary: rgb(var(--color-rgb-tertiary));
  --layout-box-shadow: var(--shd,0 0 5px rgba(var(--color-rgb-bg-inverse),.4));
  --primary-box-shadow: var(--shd,0 0 5px rgba(var(--color-rgb-primary),.4));
  --secondary-box-shadow: var(--shd,0 0 5px rgba(var(--color-rgb-secondary),.4));

  --inquirer-background-color: #f0f0f0;
  --inquirer-color: #3a3a3a;
  --inquirer-option-backgroundimage: linear-gradient(#fff, #d2d2d2);
  --inquirer-option-hover-backgroundimage: linear-gradient(rgba(var(--color-rgb-tertiary), 0.75), var(--color-tertiary));
  --inquirer-option-boxshadow: 0px 10px 7px -9px rgb(0 0 0 / 80%);
}`

appColors.default = `:root {
  --color-rgb-bg-inverse: 0,0,0;
  --color-rgb-bg: 255, 255, 255;
  --color-rgb-primary: 222, 39, 216;
  --color-rgb-secondary: 66, 196, 255;
  --color-rgb-bg-inverse: 0, 0, 0;
  --color-rgb-tertiary: 37, 58, 98;
  --color-rgb-bg-secondary: 242,249,251;
}`

appColors.dark = `:root {
  --site-width: 960px;
  --color-primary: #de27d8;
  --color-secondary: #42c4ff;
  --color-tertiary: #c9daf8;
  --color-bg: black;
  --color-rgb-bg: 0, 0, 0;
  --color-bg-inverse: white;
  --color-rgb-bg-inverse: 255, 255, 255;
  --color-bg-footer: #444444;
  --color-error: red;
  --layout-box-shadow: var(--shd,0 0 5px rgba(255,255,255,.7));
}`

appColors.one = `:root {
  --color-primary: #fc176e;
  --color-secondary: #2de7c9;
  --color-tertiary: #31124e;
  --color-bg-secondary: #fff3f9;
  --color-bg-primary: #f2fcfb;
}`

appColors.two = `:root {
  --color-primary: #fc176e;
  --color-secondary: #2de7c9;
  --color-tertiary: #093e46;
  --color-bg-secondary: #f2fcfb;
  --color-bg-primary: #fcf3f0;
}`

appColors.three = `:root {
  --color-primary: #fda92a;
  --color-rgb-primary: 253, 169, 42;
  --color-secondary: #9a1ead;
  --color-rgb-secondary: 154, 30, 173;
  --color-tertiary: #31124e;
  --color-rgb-tertiary: 49, 18, 78;
  --color-bg-secondary: #faf8ff;
  --color-rgb-bg-secondary: 250, 248, 255;
  --color-bg-primary: #fffdfd;
  --color-bg-primary: 255, 253, 253;
}`

appColors.four = `:root {
  --color-primary: #fc176e;
  --color-secondary: #2de7c9;
  --color-tertiary: #093e46;
  --color-bg-secondary: #f2fcfb;
  --color-bg-primary: #fff3f9;
}`

appColors.five = `:root {
  --color-primary: #fc176e;
  --color-secondary: #4ac5fc;
  --color-tertiary: #09295c;
  --color-bg-secondary: #f0f9fc;
  --color-bg-primary: #fcf0f5;
}`

export const useThemeColors = () => {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = React.useState<keyof typeof appColors>('default')
  React.useEffect(() => {
    const routeTheme = router.query.theme as string
    const storageTheme = localStorage.getItem('theme')
    if (typeof routeTheme !== 'undefined') {
      localStorage.setItem('theme', routeTheme as string)
      setSelectedTheme(routeTheme)
    } else if (storageTheme) {
      setSelectedTheme(storageTheme)
    }
  }, [router.query])
  return `${appColors.base}\n${appColors[selectedTheme]}`
}
