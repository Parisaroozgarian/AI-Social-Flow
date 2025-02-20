# AI Social Flow

AI Social Flow is a web application designed to optimize your social media presence through AI-driven content generation, scheduling, and analytics. By leveraging intelligent content insights, it enables users to plan, create, and analyze posts for maximum engagement across platforms like Twitter/X, Instagram, LinkedIn, and Facebook.

<br />

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Installation](#installation)  
4. [Usage](#usage)  
5. [Project Structure](#project-structure)  
6. [Contributing](#contributing)  
7. [Collaborators](#collaborators)  
8. [License](#license)

<br />

## Features

- **AI-Powered Content Generation**  
  Generate social media posts with relevant hashtags, optimal tone, and engagement predictions.

- **Content Analysis**  
  Evaluate sentiment, track performance trends, and refine content strategies based on data-driven insights.

- **Scheduling & Calendar**  
  Plan posts in advance, pick the best times for publishing, and keep an organized schedule.

- **User Profile & Customization**  
  Switch between light/dark/system themes, enable or disable notifications, and manage your connected social accounts.

- **Robust Authentication**  
  Secure login and protected routes ensure only authorized users can generate, schedule, or edit content.

<br />

## Tech Stack

- **Frontend**:  
  - [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)  
  - [Tailwind CSS](https://tailwindcss.com/) for styling  
  - [React Query (TanStack)](https://tanstack.com/query) for data fetching and caching  
  - [Wouter](https://github.com/molefrog/wouter) for routing  

- **Backend** (if applicable):  
  - [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), or similar framework  
  - ORM solutions such as [Prisma](https://www.prisma.io/) or [Drizzle](https://orm.drizzle.team/)  
  - [Zod](https://github.com/colinhacks/zod) or [Joi](https://joi.dev/) for input validation  

- **Other**:  
  - [Date-fns](https://date-fns.org/) for date manipulation  
  - [Lucide React](https://lucide.dev/) icons  
  - [Zod](https://github.com/colinhacks/zod) for schema validation  

<br />

## Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/Parisaroozgarian/AI-Social-Flow.git
   cd AI-Social-Flow
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**  
   - Create a `.env` file if needed (e.g., for API keys, database credentials).  
   - Example:
     ```bash
     VITE_API_BASE_URL=https://api.example.com
     API_KEY=your-api-key
     ```

4. **Run the Project**  
   - **Development**:
     ```bash
     npm run dev
     # or
     yarn dev
     ```
     Access via [http://localhost:3000](http://localhost:3000).

   - **Production Build**:
     ```bash
     npm run build
     npm run serve
     # or
     yarn build
     yarn serve
     ```

<br />

## Usage

- **AI Generation**: Navigate to the “Generate” page to produce AI-assisted social media content.  
- **Analyze Content**: Visit the “Analyze” page and paste your text to get engagement predictions, sentiment scores, and suggested hashtags.  
- **View History**: Check the “History” tab for previous analyses or content generations.  
- **Schedule Posts**: Use the “Schedule” page to set a specific time and date for your social media posts.  
- **Profile & Settings**: Manage your theme, notifications, language preferences, and connect social accounts.

<br />

## Project Structure

Typical structure if combining frontend and backend in one repo (modify to match your setup):

```
AI-Social-Flow/
├─ public/                   # Static assets
├─ src/
│  ├─ components/            # Shared UI components
│  ├─ pages/                 # Page-level components (Generate, Analyze, Schedule, etc.)
│  ├─ hooks/                 # Reusable React hooks (useAuth, useToast, etc.)
│  ├─ lib/                   # Common libraries (e.g., theme provider, query client)
│  ├─ shared/                # Shared types or schema definitions
│  ├─ styles/                # Global or additional styling
│  ├─ App.tsx                # Main routes and layout
│  └─ main.tsx               # Entry point for React/Vite
├─ server/                   # Optional Node.js backend
│  ├─ routes/
│  ├─ controllers/
│  └─ index.ts
├─ package.json
├─ tailwind.config.js/ts
├─ postcss.config.js
├─ tsconfig.json
└─ vite.config.ts
```

<br />

## Contributing

1. **Fork** this repository and clone your fork locally.  
2. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feat/new-feature
   ```
3. **Commit Changes**:
   ```bash
   git commit -m "Add new feature or fix"
   ```
4. **Push** the branch to your fork:
   ```bash
   git push origin feat/new-feature
   ```
5. **Open a Pull Request** against the main repository. Please include a clear summary of your changes.

<br />

## Collaborators

- **[Parisa Roozgarian](https://github.com/Parisaroozgarian)**
- **[Soheil Jalaeianfarimani](https://github.com/samjalaen)**


We welcome new contributors and suggestions. Feel free to open an [issue](https://github.com/Parisaroozgarian/AI-Social-Flow/issues) or start a discussion.

<br />

## License

This project is licensed under the [MIT License](./LICENSE). See the [LICENSE file](./LICENSE) for details.
```

--- 