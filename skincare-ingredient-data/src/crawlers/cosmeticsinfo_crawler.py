from pathlib import Path

from .base import FetchResult, fetch_text


REFERENCE_URL = "https://www.cosmeticsinfo.org/ingredients/"


def crawl_cosmeticsinfo_reference(root: Path) -> FetchResult:
    output_path = root / "data" / "raw" / "cosmeticsinfo" / "ingredients_reference.html"
    result = fetch_text(REFERENCE_URL, output_path)
    if result.ok:
        result.message = "reference page fetched; ingredient detail pages not bulk-scraped"
    return result

