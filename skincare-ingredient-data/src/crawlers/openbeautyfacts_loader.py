from pathlib import Path

from .base import FetchResult, fetch_json


INGREDIENTS_URL = "https://world.openbeautyfacts.org/ingredients.json?page_size=1000"


def crawl_openbeautyfacts(root: Path) -> FetchResult:
    output_path = root / "data" / "raw" / "openbeautyfacts" / "ingredients.json"
    return fetch_json(INGREDIENTS_URL, output_path)
