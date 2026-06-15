"""Custom Flask CLI commands (database seeding)."""

from __future__ import annotations

import click
from flask import Flask

from .extensions import db
from .services import create_recipe

SEED_RECIPES = [
    {
        "title": "Spaghetti Aglio e Olio",
        "description": "A simple, classic Italian pasta dish.",
        "ingredients": [
            {"amount": "400", "unit": "g", "name": "Spaghetti"},
            {"amount": "4", "unit": "cloves", "name": "Garlic"},
            {"amount": "120", "unit": "ml", "name": "Olive oil"},
            {"amount": "1", "unit": "pinch", "name": "Chili flakes"},
        ],
        "instructions": [
            {"text": "Cook the spaghetti in salted boiling water until al dente."},
            {"text": "Gently fry the sliced garlic and chili flakes in olive oil."},
            {"text": "Toss the drained pasta with the oil and serve immediately."},
        ],
    },
    {
        "title": "Pancakes",
        "description": "Fluffy breakfast pancakes.",
        "ingredients": [
            {"amount": "200", "unit": "g", "name": "Flour"},
            {"amount": "2", "unit": "", "name": "Eggs"},
            {"amount": "300", "unit": "ml", "name": "Milk"},
            {"amount": "1", "unit": "tbsp", "name": "Sugar"},
        ],
        "instructions": [
            {"text": "Whisk flour, eggs, milk, and sugar into a smooth batter."},
            {"text": "Pour ladles of batter onto a hot greased pan."},
            {"text": "Flip once bubbles form and cook until golden."},
        ],
    },
]


def register_cli(app: Flask) -> None:
    @app.cli.command("seed")
    def seed() -> None:
        """Insert a small set of example recipes for local development."""
        for recipe in SEED_RECIPES:
            create_recipe(recipe)
        click.echo(f"Seeded {len(SEED_RECIPES)} recipes.")

    @app.cli.command("init-db")
    def init_db() -> None:
        """Create all tables directly (handy for quick local setups)."""
        db.create_all()
        click.echo("Database tables created.")
