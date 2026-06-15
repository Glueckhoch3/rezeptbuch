import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { RecipeListPage } from './pages/RecipeListPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeCreatePage } from './pages/RecipeCreatePage';
import { RecipeEditPage } from './pages/RecipeEditPage';

// Central route table wiring the page-level screens into the app shell.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <RecipeListPage /> },
      { path: 'recipes/new', element: <RecipeCreatePage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'recipes/:id/edit', element: <RecipeEditPage /> },
    ],
  },
]);
