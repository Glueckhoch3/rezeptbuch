"""Custom Flask CLI commands (database seeding)."""

from __future__ import annotations

import click
from flask import Flask

from .recipe import service as recipe_service
from .recipe.models import Recipe

SEED_RECIPES = [
    {
        "title": "Spaghetti Aglio e Olio",
        "description": "A simple, classic Italian pasta dish.",
        "origin": "Italy",
        "tags": ["pasta", "quick", "vegetarian"],
        "ingredients": [
            {"amount": "400", "unit": "g", "name": "Spaghetti"},
            {"amount": "4", "unit": "cloves", "name": "Garlic"},
            {"amount": "120", "unit": "ml", "name": "Olive oil"},
            {"amount": "1", "unit": "pinch", "name": "Chili flakes"},
        ],
        "worksteps": [
            {
                "title": "Cook the pasta",
                "description": "Cook the spaghetti in salted water until al dente.",
            },
            {
                "title": "Fry the garlic",
                "description": "Gently fry the sliced garlic and chili in olive oil.",
            },
            {
                "title": "Combine",
                "description": "Toss the drained pasta with the oil and serve.",
            },
        ],
    },
    {
        "title": "Pancakes",
        "description": "Fluffy breakfast pancakes.",
        "origin": "US",
        "tags": ["breakfast", "quick"],
        "ingredients": [
            {"amount": "200", "unit": "g", "name": "Flour"},
            {"amount": "2", "unit": "", "name": "Eggs"},
            {"amount": "300", "unit": "ml", "name": "Milk"},
            {"amount": "1", "unit": "tbsp", "name": "Sugar"},
        ],
        "worksteps": [
            {
                "title": "Mix",
                "description": "Whisk flour, eggs, milk, and sugar into a batter.",
            },
            {
                "title": "Cook",
                "description": "Pour ladles of batter onto a hot greased pan.",
            },
            {
                "title": "Finish",
                "description": "Flip once bubbles form and cook until golden.",
            },
        ],
    },
]


def register_cli(app: Flask) -> None:
    @app.cli.command("seed")
    def seed() -> None:
        """Insert a small set of example recipes for local development."""
        if Recipe.query.first() is not None:
            click.echo("Recipes already exist; skipping seeding.")
            return
        for recipe in SEED_RECIPES:
            recipe_service.create_recipe(recipe)
        click.echo(f"Seeded {len(SEED_RECIPES)} recipes.")

    @app.cli.command("init-db")
    def init_db() -> None:
        """Create all tables directly (handy for quick local setups)."""
        from .core.extensions import db

        db.create_all()
        click.echo("Database tables created.")
