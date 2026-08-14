import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RecipeListPage } from './pages/RecipeListPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeCreatePage } from './pages/RecipeCreatePage';
import { RecipeEditPage } from './pages/RecipeEditPage';
import { IngredientListPage } from './pages/IngredientListPage';
import { IngredientDetailPage } from './pages/IngredientDetailPage';
import { TagListPage } from './pages/TagListPage';
import { AllergenListPage } from './pages/AllergenListPage';

// Central route table wiring the page-level screens into the app shell.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RecipeListPage /> },
      { path: 'recipes/new', element: <RecipeCreatePage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'recipes/:id/edit', element: <RecipeEditPage /> },
      { path: 'ingredients', element: <IngredientListPage /> },
      { path: 'ingredients/:id', element: <IngredientDetailPage /> },
      { path: 'tags', element: <TagListPage /> },
      { path: 'allergens', element: <AllergenListPage /> },
    ],
  },
]);
