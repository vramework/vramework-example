/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.svg' {
  const content: React.FunctionComponent
  export default content
}

declare module 'browser-image-resizer'
