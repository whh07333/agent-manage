# Page snapshot

```yaml
- generic [ref=e2]:
  - heading "Unexpected Application Error!" [level=2] [ref=e3]
  - heading "Cannot read properties of null (reading 'systemHealth')" [level=3] [ref=e4]
  - generic [ref=e5]: "TypeError: Cannot read properties of null (reading 'systemHealth') at RealtimeMonitoring (http://localhost:5173/src/pages/RealtimeMonitoring/index.tsx?t=1774523751623:578:106) at Object.react_stack_bottom_frame (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:12868:12) at renderWithHooks (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:4213:19) at updateFunctionComponent (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:5569:16) at beginWork (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:6140:20) at runWithFiberInDEV (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:851:66) at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:8429:92) at workLoopSync (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:8325:37) at renderRootSync (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:8309:6) at performWorkOnRoot (http://localhost:5173/node_modules/.vite/deps/client-DgpY3klJ.js?v=18ed5c98:7994:27)"
  - paragraph [ref=e6]: 💿 Hey developer 👋
  - paragraph [ref=e7]:
    - text: You can provide a way better UX than this when your app throws errors by providing your own
    - code [ref=e8]: ErrorBoundary
    - text: or
    - code [ref=e9]: errorElement
    - text: prop on your route.
```