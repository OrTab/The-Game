// declare module '@or-tab/my-server' {
//   import { IncomingMessage, Server } from 'http';
//   type TMethods = 'get' | 'post' | 'put' | 'delete';
//   type TApiCallback = (
//     path: string,
//     cb: (request: IncomingMessage, response: ServerResponse) => void
//   ) => void;
//   type TMyServer = {
//     app: {
//       get: TApiCallback;
//       post: TApiCallback;
//       put: TApiCallback;
//       delete: TApiCallback;
//       enableCorsForOrigins: (origins: string[]) => void;
//       setStaticFolder: (folderName: string) => void;
//     };
//     server: Server;
//   };
//   const myServer: TMyServer;
//   export = myServer;
// }
