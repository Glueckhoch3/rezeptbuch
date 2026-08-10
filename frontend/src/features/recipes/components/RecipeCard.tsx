import { Link } from 'react-router-dom';
import type { Recipe } from '../types';

interface Props {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: Props) {
  return (
    <li className="recipe-card">
      <Link to={`/recipes/${recipe.id}`} className="recipe-card-title">
        {recipe.title}
      </Link>
      {recipe.description && <p className="muted">{recipe.description}</p>}
      <span className="recipe-card-meta">
        {recipe.ingredients.length} ingredients · {recipe.worksteps.length}{' '}
        steps
      </span>
    </li>
  );
}
