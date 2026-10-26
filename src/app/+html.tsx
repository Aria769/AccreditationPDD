import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="AccreditationPDD" />
        <meta name="theme-color" content="#232227" />
        <link rel="manifest" href="/AccreditationPDD/manifest.json" />
        <link rel="apple-touch-icon" href="/AccreditationPDD/icon-192.png" />

        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              touch-action: manipulation;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            body {
              overscroll-behavior: none;
              position: fixed;
              width: 100%;
            }
          `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
