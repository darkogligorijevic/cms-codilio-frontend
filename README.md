# Кодилио ЦМС

*Документација frontend дела апликације*
29.06.2025.

---

## САДРЖАЈ

1. УВОД
2. ЦИЉЕВИ СИСТЕМА
3. АРХИТЕКТУРА СИСТЕМА
4. ДЕТАЉНА СТРУКТУРА ПРОЈЕКТА
5. УПУТСТВО ЗА ИНСТАЛАЦИЈУ И ПОКРЕТАЊЕ
6. API СЛОЈ И SERVER-SIDE ЛОГИКА
7. ОРГАНИЗАЦИОНА СТРУКТУРА И АДМИН ПАНЕЛИ
8. FRONTEND — ЈАВНИ САЈТ, СЕКЦИЈЕ, SEO И LAYOUT
9. ДИЗАЈН СИСТЕМ, TAILWIND, POSTCSS И СТИЛИЗОВАЊЕ
10. БЕЗБЕДНОСНЕ СМЕРНИЦЕ, НАЈБОЉЕ ПРАКСЕ И БУДУЋА ПРОШИРЕЊА

---

## 1. УВОД

Овај систем је модуларна веб апликација која омогућава централизовано управљање садржајем (CMS), изградњу и уређивање веб страница на прилагодљив начин и подршку за управљање организационом структуром и корисницима.

Примарна намена је омогућавање једноставног али моћног административног панела преко ког се управља свим аспектима сајта, као и динамичког фронтенда који се аутоматски прилагођава подацима и конфигурацији.

**Кључни корисници:**

* Администратори који управљају садржајем, услугама и медијима
* Уредници који додају и уређују чланке и странице
* Технички тим који одржава систем и интеграције
* Крајњи корисници који користе јавни фронтенд

**Основне карактеристике:**

* Потпун административни панел са више модула
* Динамички јавни фронтенд са подршком за произвољне slug руте
* Богата библиотека компоненти и секција за изградњу страница
* Управљање корисницима и ролама
* Организациона структура са подршком за документацију
* Галерије, медијска библиотека и drag-drop отпремање
* Подршка за Docker контејнеризацију
* CI/CD pipeline преко Jenkins-а
* TypeScript + Next.js app router архитектура

---

## 2. ЦИЉЕВИ СИСТЕМА

Циљ овог система је омогућавање:

* Централизованог управљања садржајем кроз веб интерфејс
* Динамичког генерисања јавног веб сајта на основу унетог садржаја
* Лако додавање и измена страница преко конфигурабилних секција
* Потпуна контрола корисника и улога
* Једноставан деплојмент и одржавање захваљујући Docker и Jenkins алатима
* Подршка за SEO оптимизацију
* Безбедно руковање медијима и корисничким подацима

**Вредности које систем доноси:**

* Скратити време објаве садржаја
* Смањити потребу за техничким особљем при свакој измени сајта
* Централизовано управљати медијима и документима
* Омогућити сложену организациону структуру са поддокументима и улогама
* Омогућити вишејезичност и SEO оптимизацију

**Стандарди квалитета:**

* Висока модуларност кода
* Јасно дефинисани слојеви (frontend/admin UI, логика, инфраструктура)
* Статичка провера типова уз TypeScript
* Усклађеност са Next.js архитектуром (app router)
* Коришћење савремених CSS алата (Tailwind, PostCSS)
* Лакоћа у имплементацији CI/CD pipeline-а
* Контејнеризација преко Docker-а






## 3. АРХИТЕКТУРА СИСТЕМА

Апликација је развијена по монолитној full-stack веб архитектури на основу Next.js фрејмворка. Иако нема засебан „бекенд сервер“ као у класичним MERN апликацијама, Next.js омогућава:

* Frontend rendering (CSR/SSR/SSG/ISR)
* Server-side logic (Server Components, API routes)
* Потпуну интеграцију TypeScript-а
* Јединствени build system

---

### 3.1. Слојеви апликације

* (1) Frontend јавни сајт
* (2) Административни панел
* (3) UI библиотека компоненти
* (4) Серверска логика (server-side rendering, data fetching, динамичке руте)
* (5) Инфраструктурни слој (Docker, Jenkins, CI/CD)

---

### 3.2. Frontend (јавни сајт)

* Заснован на Next.js app router архитектури
* Фолдер: /app/(frontend)
* Динамичке руте: \[slug] и \[...slug]
* Подршка за произвољно дубоке URL хијерархије
* Layout.tsx дефинише глобални изглед (Header, Footer)
* Компоненте као SectionRenderer за динамичко слагање секција
* SEO оптимизација кроз meta-tags.tsx

---

### 3.3. Административни панел

* Фолдер: /app/dashboard

* Layout.tsx дефинише оквир са навигацијом

* Главна страница: page.tsx

* Модуларна структура:

  * settings
  * posts
  * users
  * mailer
  * organizational-structure
  * galleries
  * pages
  * categories
  * services
  * media
  * relof-index (statistics, requirements, recommendations, categories)

* CRUD форме за додавање, измену и брисање

* Табеле са пагинацијом и претрагом

* Dynamic routing за edit/view страницe по ID-ју

---

### 3.4. UI СЛОЈ

* Фолдер /components/ui
* Један од кључних делова система
* Универзалне React компоненте
* Tailwind CSS за модуларно стилизовање
* Примери:

  * Form
  * Input, Select, Checkbox, Switch
  * Button
  * Table са пагинацијом
  * Dialog, Popover
  * RichTextEditor
  * DragDropUpload
  * MediaPicker
  * DynamicField
  * Tabs
  * Avatar
  * Badge
  * Sonner (notification system)

---

### 3.5. Frontend секције

* Фолдер /components/frontend/sections

* Подељене по врстама:

  * Hero
  * CTA
  * Cards
  * Team
  * Logos
  * Contact

* Свака секција:

  * Самостална React компонента
  * Прихвата пропове за садржај
  * Tailwind-дизајн

* SectionRenderer за динамичко склапање на страници

---

### 3.6. Серверска логика (Server Components)

* Next.js омогућава Server Components и Data fetching на серверу
* Server-side rendering (SSR)
* Static site generation (SSG)
* Incremental static regeneration (ISR)
* Унутар /app/page.tsx могуће директно fetch-овати податке
* Могућа имплементација /app/api рута

---

### 3.7. API слој

* Next.js подржава API routes у /app/api
* Иако у структури ZIP није било примера, систем је потпуно спреман за додавање
* Пример потенцијалних рута:

  * /app/api/auth
  * /app/api/users
  * /app/api/posts
  * /app/api/services
  * /app/api/media
  * /app/api/mailer
  * /app/api/organization

---

### 3.8. Инфраструктурни слој

* Dockerfile:

  * Node база
  * Копирање зависности
  * npm install
  * Build Next.js production
  * EXPOSE 3000
  * CMD \["npm", "start"]

* Jenkinsfile:

  * Checkout
  * Install
  * Lint
  * Build
  * Deploy

* PostCSS + Tailwind:

  * Utility-first стилизовање
  * Vendor prefixes

* TypeScript:

  * Статичка провера типова
  * Боља одрживост кода








## 4. ДЕТАЉНА СТРУКТУРА ПРОЈЕКТА


### 4.1. Коренски директоријум

**package.json**

* Садржи све зависности пројекта.
* Скрипте:

  * npm run dev – покреће дев сервер
  * npm run build – прави production билд
  * npm start – стартује production сервер
  * npm run lint – провера стила кода

**tsconfig.json**

* TypeScript подешавања:

  * strict режим
  * baseUrl и paths алијаси за лакши import
  * Target ESNext

**next.config.ts**

* Next.js конфигурација:

  * reactStrictMode
  * experimental опције
  * Images domains
  * Redirects/Rewrites ако требају

**Dockerfile**

* Омогућава исти билд локално и на серверу.
* Кораци:

  * FROM node:18
  * WORKDIR /app
  * COPY package\*.json
  * RUN npm install
  * COPY . .
  * RUN npm run build
  * EXPOSE 3000
  * CMD \["npm", "start"]

**Jenkinsfile**

* CI/CD pipeline:

  * Checkout репозиторијума
  * npm install
  * npm run lint
  * npm run build
  * Docker build & deploy

**postcss.config.mjs**

* Tailwind и PostCSS:

  * tailwindcss
  * autoprefixer

**components.json**

* Региструје секције и компоненте за page builder.

**README.md**

* Упутство за постављање пројекта.

---

### 4.2. /app директоријум

**/app/layout.tsx**

* Главни layout за цео app router.
* ThemeProvider за светли/тамни режим.
* Head секција.

**/app/globals.css**

* Tailwind основе:

  * @tailwind base;
  * @tailwind components;
  * @tailwind utilities;

**/app/favicon.ico**

* Иконица сајта.

---

### 4.3. /app/login

* /page.tsx
* Форма за пријаву корисника.
* Email/Password поља.
* Припрема за NextAuth или custom JWT handler.

---

### 4.4. /app/(frontend)

**layout.tsx**

* Глобални изглед за frontend:

  * Header
  * Footer
  * ThemeProvider
  * MetaTags

**page.tsx**

* Home страница.

**\[slug]/page.tsx и \[...slug]/page.tsx**

* Подршка за произвољне дубоке руте.
* Dynamic routing.
* Data fetching са server-side.

**SectionRenderer.tsx**

* Динамичко слагање секција на основу конфигурације из администрације.

---

### 4.5. /app/dashboard

**layout.tsx**

* Sidebar навигација.
* Header.
* Theme switching.

**page.tsx**

* Почетна административна страна.

---

#### Поддиректоријуми у /dashboard

**/settings**

* Подешавања система.

**/relof-index**

* statistics
* requirements
* recommendations
* categories
* Омогућава комплексно праћење индекса.

**/posts**

* CRUD интерфејс за чланке.
* /\[id]/page.tsx за едитовање по ID.

**/mailer**

* Слање и управљање поштом.

**/organizational-structure**

* Приказ хијерархије организације.
* /directors — документација директора.

**/profile**

* Кориснички профил.

**/users**

* Листа корисника.
* Додавање/брисање.

**/galleries**

* Листа галерија.
* /create
* /edit/\[id]
* /\[id]

**/pages**

* Управљање статичким страницама.

**/categories**

* Категорије садржаја.

**/services**

* Листа услуга.
* /create
* /\[id]
* /edit
* /documents

**/media**

* Медијска библиотека.
* Upload, преглед, брисање.











## 5. УПУТСТВО ЗА ИНСТАЛАЦИЈУ И ПОКРЕТАЊЕ


### 5.1. Преглед

Овај систем подржава:

* Локално покретање у развојном режиму
* Production build са Node сервером
* Docker контејнеризацију
* CI/CD процес са Jenkins-ом

---

### 5.2. Предуслови

Пре инсталације потребно је:

* Node.js 18 или новији
* npm 9 или новији
* Docker Engine (за контејнеризацију)
* Git CLI
* Jenkins (ако се користи CI/CD)
* Отворен порт 3000

---

### 5.3. Клонирање репозиторијума

```bash
git clone <URL_DO_REPOZITORIJUMA>
cd <име-фолдера>
```

---

### 5.4. Инсталација зависности

```bash
npm install
```

* Преузима све зависности из package.json
* Укључује Next.js, React, Tailwind, TypeScript, shadcn/ui

---

### 5.5. Локално покретање

```bash
npm run dev
```

* Доступно на [http://localhost:3000](http://localhost:3000)
* Подршка за hot-reload

---

### 5.6. Production билд

1. Изградња:

```bash
npm run build
```

2. Покретање:

```bash
npm start
```

* Node сервер користи оптимизован SSR

---

### 5.7. Docker билд и покретање

**Dockerfile** кораци:

1. Build:

```bash
docker build -t cms-app .
```

2. Run:

```bash
docker run -p 3000:3000 cms-app
```

* Сајт доступан на [http://localhost:3000](http://localhost:3000)

---

### 5.8. Пример Dockerfile садржаја

* FROM node:18-alpine
* WORKDIR /app
* COPY package\*.json ./
* RUN npm install
* COPY . .
* RUN npm run build
* EXPOSE 3000
* CMD \["npm", "start"]

---

### 5.9. CI/CD процес са Jenkins-ом

**Jenkinsfile** дефинише:

* Clone репозиторијум
* npm install
* npm run lint
* npm run build
* Docker build & deploy

---

#### Пример pipeline корака

* Checkout
* Install
* Lint
* Build
* Deploy:

```bash
docker build -t cms-app .
docker stop cms || true
docker rm cms || true
docker run -d --name cms -p 3000:3000 cms-app
```

---

### 5.10. Портови

* Локално: 3000
* Production: 3000
* Docker: -p 3000:3000

---

### 5.11. Препоруке за продукцију

* NODE\_ENV=production
* SSL преко Nginx reverse proxy
* CORS подешавање ако је потребно
* Monitoring (npr. pm2 или Docker health check)



















## 6. API СЛОЈ И SERVER-SIDE ЛОГИКА


### 6.1. Улога серверског дела у Next.js

Next.js app router омогућава јединствену архитектуру где frontend и server-side логика живе заједно у истој код бази.

**Главне карактеристике:**

* Server-side rendering (SSR)
* Static site generation (SSG)
* Incremental static regeneration (ISR)
* Server Components
* API routes

---

### 6.2. Server Components

* Подразумевано све .tsx датотеке у /app су server компоненти.
* Могу директно fetch-овати податке са базе или API-ја.
* Немају приступ browser-only функцијама (window, localStorage).

**Пример улоге:**

* Учитавање листе корисника на серверу.
* Генерисање HTML-а са већ уплетеним подацима.

---

### 6.3. Клијентске компоненте

* Означене са „use client“ директивом.
* Користе React state и effect.
* Комуницирају са API-јем преко fetch или Axios.

---

### 6.4. Data Fetching

**Пример:**

* /app/dashboard/users/page.tsx
* Server компонента позива getUsers() и рендерује табелу.

**Предности:**

* SSR са свежим подацима.
* Бољи SEO.
* Мање client-side захтева.

---

### 6.5. API Routes

* Next.js подржава /app/api структуру.
* У овом пројекту није било имплементираних у достављеном ZIP-у, али структура је припремљена.

**Могући примери:**

* /app/api/auth
* /app/api/users
* /app/api/posts
* /app/api/media
* /app/api/services
* /app/api/mailer
* /app/api/organization

---

### 6.6. Пример API руте

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ users: [] });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  return NextResponse.json({ message: 'User created', user: data });
}
```

---

### 6.7. Потенцијални API endpoints

* Аутентификација и регистрација
* Управљање корисницима
* CRUD за постове
* Upload медија
* Управљање услугама
* Слање мејлова

---

### 6.8. Upload медија

* Компоненте:

  * drag-drop-upload.tsx
  * media-picker.tsx
* Server-side логика:

  * Прима FormData
  * Чува слике на диск или CDN
  * Враћа URL

**Безбедност:**

* MIME type валидација
* Ограничење величине
* Аутентификација

---

### 6.9. Аутентификација

* NextAuth или custom JWT решење.
* JWT или cookie-based session.
* Провера приступа у middleware-у.

**Пример middleware логике:**

* Проверити token у cookie.
* Ако не постоји – redirect на /login.

---

### 6.10. Безбедносне праксе

* Rate limiting на API рута.
* Input validation.
* CSRF protection.
* HTTPS у production-у.
* Ограничење upload-а по величини и типу.
* Статичка анализа кода.








































## 7. ОРГАНИЗАЦИОНА СТРУКТУРА И АДМИН ПАНЕЛИ


### 7.1. Преглед административног панела

Админ панел је централно место за управљање свим подацима.
Смештен у директоријуму:

```
/app/dashboard
```

✅ Главни layout:

* Sidebar навигација
* Header са променом теме
* Конзистентан изглед

✅ Улазна страница:

* /app/dashboard/page.tsx

---

### 7.2. Организациона структура

**Путања:**

```
/app/dashboard/organizational-structure
```

✅ Подстранице:

* page.tsx – приказ целе структуре
* /directors/page.tsx – документација директора

---

#### 7.2.1. Функције

* Дефинисање организационих јединица
* Приказ хијерархије
* CRUD форме за јединице
* Повезивање докумената са директорима

---

#### 7.2.2. Компоненте

* organizational-chart.tsx – визуелни преглед хијерархије
* org-structure-nav.tsx – навигација
* organizational-unit-form.tsx – форма за додавање/уређивање
* director-documents.tsx – управљање документима

---

### 7.3. Корисници

**Путања:**

```
/app/dashboard/users
```

✅ Функције:

* Листа свих корисника
* Претрага и филтрирање
* Додавање новог
* Уређивање
* Брисање

✅ Улоге и ауторизација:

* Admin
* Editor
* Viewer

✅ Форма:

* Email
* Име и презиме
* Лозинка (bcrypt хашована)
* Улога

---

### 7.4. Галерије

**Путања:**

```
/app/dashboard/galleries
```

✅ Странице:

* page.tsx
* /create/page.tsx
* /edit/\[id]/page.tsx
* /\[id]/page.tsx

✅ Функционалности:

* Приказ свих галерија
* Филтрирање
* Додавање нове
* Уређивање
* Брисање

✅ Медијски елементи:

* media-picker.tsx – избор слика
* drag-drop-upload.tsx – drag & drop отпремање

---

### 7.5. Медијска библиотека

**Путања:**

```
/app/dashboard/media
```

✅ Главна страница:

* /page.tsx

✅ Функције:

* Upload нових фајлова
* Претрага
* Брисање
* Преглед у већој величини

✅ Компоненте:

* drag-drop-upload.tsx
* media-picker.tsx
* rich-text-editor-drag-drop.tsx

---

### 7.6. Mailer модул

**Путања:**

```
/app/dashboard/mailer
```

✅ Улога:

* Управљање слањем е-поште
* Newsletter
* Индивидуалне поруке
* Темплејти

✅ Компоненте:

* Форма са:

  * Пријемником
  * Subject-ом
  * Body (rich-text editor)
* Историја послатих порука

---

### 7.7. Pages и Categories модули

✅ /app/dashboard/pages

* CRUD статичких страница
* SEO подаци
* Подешавање секција

✅ /app/dashboard/categories

* Груписање садржаја
* Филтери

---

### 7.8. Services модул

✅ /app/dashboard/services

* Списак услуга
* CRUD:

  * /create
  * /\[id]
  * /edit
  * /documents

✅ Подршка за:

* Назив
* Опис
* Цена
* Документација
* Upload прилога

---

### 7.9. Posts модул

✅ /app/dashboard/posts

* CRUD чланака
* /\[id]/page.tsx за детаље

✅ Поља:

* Назив
* Садржај (rich-text editor)
* Слика
* Категорија
* SEO meta

---

### 7.10. Relof-Index модул

✅ /app/dashboard/relof-index

* Поддиректоријуми:

  * /statistics
  * /requirements
  * /recommendations
  * /categories

✅ Улога:

* Комплексно праћење индекса
* Извештаји и статистике





















## 8. FRONTEND — ЈАВНИ САЈТ, СЕКЦИЈЕ, SEO И LAYOUT


### 8.1. Преглед Frontend слоја

* Смештен у директоријуму:

  ```
  /app/(frontend)
  ```
* Омогућава јавни приказ сајта са динамичким страницама.
* Потпуно је конфигурисан за:

  * Server-side rendering
  * Static site generation
  * SEO оптимизацију
  * Динамичко слагање секција

---

### 8.2. Структура директоријума

✅ Фајлови:

* layout.tsx

  * Главни изглед
  * Укључује header, footer, meta тагове
* page.tsx

  * Почетна страна
* \[slug]/page.tsx

  * Једно-ниво динамичке странице
* \[...slug]/page.tsx

  * Више-ниво динамичке странице

---

### 8.3. layout.tsx

✅ Садржи глобални layout за јавни део:

* Head секција са meta таговима
* ThemeProvider
* Header
* Footer
* Main content

✅ Предности:

* Јединствен изглед
* Лакше одржавање

---

### 8.4. Header и Footer

✅ Налази се у:

```
/components/frontend/header.tsx
/components/frontend/footer.tsx
```

✅ Функције:

* Лого
* Навигација
* Социјалне мреже
* Контакт информације

✅ Динамичност:

* Мени из базе или конфигурације
* Подршка за више језика (опционо)

---

### 8.5. Динамичке руте

✅ \[slug]/page.tsx

* Сервира странице једног нивоа
* Пример: /about

✅ \[...slug]/page.tsx

* Подршка за произвољно дубоке URL-ове
* Пример: /blog/article/123

✅ Data fetching:

* Server-side
* Позивање backend-а или базе
* Враћање JSON конфигурације са секцијама

---

### 8.6. Section Renderer

✅ Кључна компонента:

```
/components/frontend/section-renderer.tsx
```

✅ Улога:

* Прихвата листу секција као JSON
* Рендерује их по редоследу
* Мапира тип секције на компоненту

✅ Пример JSON:

```
[
  { "type": "Hero", "props": {...} },
  { "type": "CTA", "props": {...} }
]
```

✅ Предности:

* Page builder функционалност
* Лако додавање нових секција без кода

---

### 8.7. Frontend секције

✅ Налази се у:

```
/components/frontend/sections
```

✅ Подељено по врстама:

**Hero секције:**

* image-hero.tsx
* video-hero.tsx
* hero-left.tsx
* hero-stack.tsx

**CTA:**

* cta-one.tsx

**Team:**

* team-one.tsx

**Logos:**

* logos-one.tsx

**Contact:**

* contact-one.tsx
* contact-two.tsx

**Cards:**

* top-card.tsx
* bottom-card.tsx
* left-card.tsx
* right-card.tsx

✅ Карактеристике:

* Tailwind дизајн
* Прихватање пропова
* Самосталност

---

### 8.8. Пример интеграције SectionRenderer

* Унутар \[slug]/page.tsx:

```
const sections = await getSectionsFromCMS(params.slug);
return (
  <SectionRenderer sections={sections} />
);
```

✅ Секције се рендерују редом на страници.

---

### 8.9. SEO и MetaTags

✅ Компонента:

```
/components/meta-tags.tsx
```

✅ Улога:

* Управља <head> елементом
* Title
* Description
* OpenGraph
* Twitter card

✅ Пример:

```
<MetaTags
  title="About Us"
  description="Learn more about our company"
/>
```

✅ Предности:

* SEO оптимизација
* Подршка за дељење на друштвеним мрежама

---

### 8.10. ThemeProvider

✅ Компонента:

```
/components/theme-provider.tsx
```

✅ Управља:

* Light/Dark режимом
* Tailwind класама
* User preference (localStorage)

✅ Пример:

```
<body className={darkMode ? 'dark' : ''}>
```

✅ Tailwind:

* .bg-white dark\:bg-black
* .text-black dark\:text-white

---

### 8.11. Предности архитектуре

✅ Статички билд за брз loading
✅ Server-side rendering за SEO
✅ Page builder за лако прављење страница
✅ Једноставно додавање нових секција
✅ Tailwind за доследан дизајн
## 9. ДИЗАЈН СИСТЕМ, TAILWIND, POSTCSS И СТИЛИЗОВАЊЕ


### 9.1. Преглед дизајн система

✅ Апликација користи Tailwind CSS као главни utility-first framework.
✅ Омогућава модуларно, компонентно стилизовање.
✅ Подржава:

* Светли и тамни режим
* Responsive дизајн
* Dynamic theme switching преко ThemeProvider

---

### 9.2. Tailwind CSS

✅ Конфигурација се позива у:

```
postcss.config.mjs
```

✅ Основне директиве у:

```
/app/globals.css
```

Пример:

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

✅ Tailwind Config:

* Путање до компонената за purging
* Theme екстензије
* Dark mode стратегија (class)

---

#### 9.2.1. Предности Tailwind-а

* Utility-класе омогућавају брз развој
* Јединствен дизајн језик
* Минимални bundle преко tree-shaking-а
* Конзистентност UI-ја

---

#### 9.2.2. Пример у React компоненти

```
<button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
  Submit
</button>
```

✅ Конзистентно и читљиво.

---

### 9.3. PostCSS

✅ Конфигурација:

```
postcss.config.mjs
```

Садржај:

```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

✅ Улога:

* Tailwind компилација
* Vendor префикси за компатибилност browser-а

---

### 9.4. Dark Mode

✅ Tailwind dark mode стратегија: class.
✅ ThemeProvider управља:

* Light/Dark режимом
* User preference (localStorage)

✅ Пример у HTML:

```
<body className={darkMode ? 'dark' : ''}>
```

✅ Tailwind класе:

* .bg-white dark\:bg-black
* .text-black dark\:text-white

---

### 9.5. Компонентно стилизовање

✅ Све компоненте користе Tailwind utility-класе.
✅ Нема посебних CSS фајлова по компонентама.
✅ Омогућено:

* Брзо прототипирање
* Једнообразан стил
* Лако рефакторисање

---

### 9.6. ThemeProvider детаљи

✅ Context за тему:

* Светла
* Тамна
* Auto (системска подешавања)

✅ Toggle пример:

```
<button onClick={toggleTheme}>
  Toggle Theme
</button>
```

✅ Чува избор у localStorage.

---

### 9.7. Responsive Design

✅ Tailwind mobile-first стратегија.
✅ Пример:

```
<div className="text-lg md:text-xl lg:text-2xl">
  Responsive Text
</div>
```

✅ Подршка за:

* Flex
* Grid
* Breakpoints
* Gap и spacing

---

### 9.8. Компоненте са варијантама

✅ Button:

```
<button className="bg-primary text-white hover:bg-primary-dark">
```

✅ Card:

```
<div className="rounded-lg shadow-lg p-4 bg-white dark:bg-gray-800">
```

✅ Badge:

```
<span className="bg-red-500 text-white px-2 py-1 rounded">
```

---

### 9.9. Конзистентна палета боја

✅ Tailwind config пример:

```
theme: {
  extend: {
    colors: {
      primary: '#1D4ED8',
      secondary: '#9333EA',
    }
  }
}
```

✅ Омогућава:

* Јединствен визуелни идентитет
* Лако одржавање брендинг смерница

---

### 9.10. Предлози за проширење

✅ Tailwind Plugins:

* Forms
* Typography
* Aspect Ratio
* Line Clamp

✅ CSS variables:

* Боје теме
* Dynamic switching

✅ Tailwind UI или Shadcn/ui:

* Премијум компоненте
* Доследан стил

































## 10. БЕЗБЕДНОСНЕ СМЕРНИЦЕ, НАЈБОЉЕ ПРАКСЕ И БУДУЋА ПРОШИРЕЊА


### 10.1. Преглед безбедности у Next.js

Next.js app router подразумева server-side rendering и serverless функције. То омогућава да критични делови логике и података остану на серверу и недоступни су директно клијенту.

**Кључно:**

* Контроле приступа и аутентификација се морају експлицитно имплементирати.

---

### 10.2. Аутентификација

✅ Login страница:

* /app/login/page.tsx
* Email/Password форма.

✅ Препоручена имплементација:

* NextAuth.js
* JWT (JSON Web Token)
* Secure cookie sessions

✅ Улоге (RBAC):

* Admin
* Editor
* Viewer

✅ На сваком API позиву:

* Провера JWT/cookie
* Провера улоге

---

#### 10.2.1. Пример middleware провере

* Проверава присуство token-а у cookie.
* Ако нема – редиректује на /login.

Пример логике:

Ако user.role !== 'admin' → врати 403.

---

### 10.3. Ауторизација

✅ Унутар API рута:

* Провера корисничке улоге
* Одбијање неовлашћених захтева

---

### 10.4. Безбедност API рута

✅ Rate Limiting:

* Спречава brute force
* Пример алата: rate-limiter-flexible

✅ Input Validation:

* Заштита од SQL injection/XSS
* Коришћење Zod или Yup

✅ CSRF Protection:

* За POST форме
* CSRF токен у cookie + body

✅ HTTPS:

* Увек у production окружењу

✅ Ограничење upload-а:

* Максимална величина
* MIME type валидација

---

### 10.5. Helmet и HTTP Headers

✅ Подешавање сигурносних header-а:

* Content-Security-Policy
* X-Frame-Options
* X-Content-Type-Options
* Referrer-Policy

✅ Може се користити Helmet middleware у custom server-у.

---

### 10.6. Управљање лозинкама

✅ bcrypt hashing
✅ Никада у plain тексту
✅ Reset токен:

* Једнократан
* Временски ограничен

✅ Rate limiting за login:

* Спречава brute force

---

### 10.7. Upload безбедност

✅ MIME type валидација:

* image/jpeg, image/png
* Одбацити .exe, .js

✅ Ограничење величине:

* Пример: Max 5MB

✅ Складиштење:

* Локални диск са дозволама
* CDN (AWS S3)

✅ Virus scanning (опционо):

* ClamAV

---

### 10.8. Најбоље праксе у развоју

✅ Статичка анализа:

* ESLint
* Typescript strict

✅ Testing:

* Unit тестови
* E2E (Cypress, Playwright)

✅ Code Review:

* Pull Request policy

✅ CI/CD:

* Jenkins pipeline
* Аутоматски build/test/deploy

✅ Monitoring:

* Health checks
* Error logs

---

### 10.9. Најбоље праксе за деплојмент

✅ Production билд:

```
npm run build
npm start
```

✅ Docker:

* Stable Node image
* Multi-stage build

✅ Reverse proxy:

* Nginx
* Certbot за SSL

✅ Scaling:

* Docker Swarm
* Kubernetes

---

### 10.10. Будућа проширења

✅ NextAuth интеграција
✅ RBAC у админ панелу
✅ Multi-language подршка
✅ GraphQL API
✅ CDN за статичке фајлове
✅ Cloud storage (AWS S3)
✅ Webhook интеграција
✅ Real-time notifications


