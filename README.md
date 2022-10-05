# Support Ukraine <img alt="ukraine" height="32" width="32" src="https://github.githubassets.com/images/icons/emoji/unicode/1f1fa-1f1e6.png">

While you're reading this text we're suffering from russia's bombs. Please help us to stand against russia's invasion and prevent World War III. It's pretty easy with **[UNITED24 fundraising platform](https://u24.gov.ua/)**. Thank you!

## YueS GUI components for Node.js and Deno

Basic set of GUI components for YueS GUI server (intended to be used with Node.js or Deno libs). Follows [original components API](https://libyue.com/docs/v0.11.0/lua/index.html) as close as possible. Therefore you may use original docs.  
Written in [Typescript](https://www.typescriptlang.org) without external dependencies.  
It's meant to be used as a dependency while creating your own high-level GUI libraries. It's recommended not to use this library directly in your apps.  
Builds itself using [tsup](https://tsup.egoist.dev).

### Basics

Requires calling `init(server: Server, EventEmitter: typeof EventEmitter)` method before creating any components and `destroy(childProcessTimeout?: number)` after you've finished your work. You don't need to init or destroy the server you're passing to `init` call, this lib will do it for you. All you need is passing server instance (`new Server()`) imported from your platform-dependent implementation of YueS client and `EventEmitter` constructor. For Node.js the client is located on NPM as [`yues-client`](https://www.npmjs.com/package/yues-client), for Deno or Bun there is no implemented clients yet.  
For any underlaying client lib, the initialization/destroy of this lib should look the same:
```ts
// for Deno, replace imports with links
import { Server } from 'yues-client';
import { init, destroy, Window } from 'yues-gui-components';
import { EventEmitter } from 'node:events';

await init(new Server(), EventEmitter);

async function createSample() {
    // create window
    const window = new Window({});
    // make sure window component's initialized before calling any method
    await window.initialized;
    // destroy all the suff after window has been closed
    window.once('close', () => destroy());
    // call any methods
    await window.center();
    await window.activate();
}
```

### Implemented components
> Components you may construct and use directly  
> \* _A lot of original components may be missing yet_
- **[Window](https://libyue.com/docs/v0.11.0/lua/api/window.html)**
- **[Color](https://libyue.com/docs/v0.11.0/lua/api/color.html)**
- **[Image](https://libyue.com/docs/v0.11.0/lua/api/image.html)**

### Implemented basic components
> Components that can't be constructed but they're the basics for more complex components  
> \* _A lot of original components may be missing yet_
- **[Responder](https://libyue.com/docs/v0.11.0/lua/api/responder.html)**
- **[View](https://libyue.com/docs/v0.11.0/lua/api/view.html)**
