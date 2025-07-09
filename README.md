# CinemaRadar 🎬

A modern, responsive movie discovery application built with Angular 17+ and powered by The Movie Database (TMDB) API. Features world-class UI/UX, dark/light themes, advanced search, favorites, sharing, and more.

## 🚀 Features

- **Movie Discovery**: Browse trending, popular, and upcoming movies
- **Actor Profiles**: Detailed actor information and filmography
- **Advanced Search**: Search movies and actors with filters
- **Theme Support**: Beautiful dark/light mode toggle
- **Favorites**: Save and manage your favorite movies
- **Share & Download**: Share movies and download custom cards
- **Responsive Design**: Mobile-first, fully responsive layout
- **Accessibility**: WCAG compliant with proper ARIA labels
- **SSR/SSG**: Server-side rendering and static site generation
- **Performance**: Optimized for speed and SEO

## 🛠️ Tech Stack

- **Frontend**: Angular 17+, TypeScript, SCSS
- **UI Library**: Angular Material
- **API**: The Movie Database (TMDB) API
- **Build Tool**: Angular CLI
- **Deployment**: Vercel (recommended)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/Derric01/Cinema_Radar.git
cd Cinema_Radar
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Environment Variables section below)

4. Start the development server:
```bash
ng serve
```

Navigate to `http://localhost:4200/` to view the application.

## 🌍 Environment Variables

> **⚠️ IMPORTANT DISCLAIMER**: This project uses The Movie Database (TMDB) API for educational and study purposes only. The API key included in this repository is for demonstration and learning purposes. For production use, please obtain your own API key from [TMDB](https://www.themoviedb.org/settings/api) and respect their terms of service and usage guidelines.

For local development, create a `.env` file in the root directory:

```bash
# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
YOUTUBE_BASE_URL=https://www.youtube.com/embed
```

For production deployment on Vercel, add these environment variables in your Vercel dashboard:

```bash
TMDB_API_KEY=your_production_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
YOUTUBE_BASE_URL=https://www.youtube.com/embed
```

## 📦 Build & Deploy

### Local Build
```bash
ng build --configuration=production
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add the environment variables listed above
3. Deploy with these settings:
   - **Framework Preset**: Angular
   - **Build Command**: `ng build --configuration=production`
   - **Output Directory**: `dist/cinema-radar`
   - **Install Command**: `npm install`

## 🎨 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   ├── layout/         # Header, footer components
│   │   └── shared/         # Movie cards, person cards, etc.
│   ├── pages/              # Route components
│   │   ├── home/          # Home page
│   │   ├── search/        # Search page
│   │   ├── movie-details/ # Movie details page
│   │   └── actor-details/ # Actor details page
│   ├── services/          # Business logic services
│   ├── models/            # TypeScript interfaces
│   └── environments/      # Environment configurations
├── assets/               # Static assets
└── styles.scss          # Global styles
```

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
