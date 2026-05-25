from pathlib import Path

from .base import FetchResult, fetch_text


REFERENCE_URL = "https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en"


def crawl_cosing_reference(root: Path) -> FetchResult:
    output_path = root / "data" / "raw" / "cosing" / "cosing_reference.html"
    result = fetch_text(REFERENCE_URL, output_path)
    if result.ok:
        result.message = "reference page fetched; bulk ingredient export not scraped in this pipeline"
    return result

