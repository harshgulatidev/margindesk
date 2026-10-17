import { access } from 'node:fs/promises';
for (const name of ['index.html','app.js','math.js','style.css','icon.svg']) {
  await access(new URL(`../dist/${name}`, import.meta.url));
}
console.log('MarginDesk static assets are ready in dist/. Start the web app with npm start.');
