"""Cross-domain filter/search logic: recipes by tag/ingredient/allergen/text.

Doesn't belong to any single domain, so it lives in its own small module
rather than being bolted onto ``recipe.service``.
"""

from __future__ import annotations

from sqlalchemy import or_

from ..allergen.models import Allergen, IngredientAllergen
from ..core.pagination import paginate
from ..ingredient.models import Ingredient
from ..recipe.models import Recipe
from ..recipe_ingredient.models import RecipeIngredient
from ..tag.models import RecipeTag, Tag


def search_recipes(
    tag: str | None,
    ingredient: str | None,
    allergen: str | None,
    q: str | None,
    page: int,
    page_size: int,
) -> dict:
    query = Recipe.query.order_by(Recipe.created_at.desc(), Recipe.id.desc())

    if tag:
        query = (
            query.join(Recipe.recipe_tags)
            .join(RecipeTag.tag)
            .filter(Tag.name.ilike(tag))
        )
    if ingredient:
        query = (
            query.join(Recipe.recipe_ingredients)
            .join(RecipeIngredient.ingredient)
            .filter(Ingredient.name.ilike(ingredient))
        )
    if allergen:
        query = (
            query.join(Recipe.recipe_ingredients)
            .join(RecipeIngredient.ingredient)
            .join(Ingredient.ingredient_allergens)
            .join(IngredientAllergen.allergen)
            .filter(Allergen.name.ilike(allergen))
        )
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Recipe.title.ilike(like), Recipe.description.ilike(like))
        )

    query = query.distinct()
    return paginate(query, page, page_size)
