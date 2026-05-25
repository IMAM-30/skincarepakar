from pathlib import Path

from .base import FetchResult, fetch_text


REFERENCE_URL = "https://cosmileeurope.eu/inci/"


def crawl_cosmile_reference(root: Path) -> FetchResult:
    output_path = root / "data" / "raw" / "cosmile" / "cosmile_inci_reference.html"
    result = fetch_text(REFERENCE_URL, output_path)
    if result.ok:
        result.message = "reference page fetched; interactive ingredient search not bulk-scraped"
    return result

