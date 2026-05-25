#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.crawlers.cosing_crawler import crawl_cosing_reference
from src.crawlers.cosmile_crawler import crawl_cosmile_reference
from src.crawlers.cosmeticsinfo_crawler import crawl_cosmeticsinfo_reference
from src.crawlers.openbeautyfacts_loader import crawl_openbeautyfacts
from src.utils.source_logger import utc_now


def run(source: str) -> list[dict]:
    tasks = []
    if source in {"all", "openbeautyfacts"}:
        tasks.append(("openbeautyfacts", crawl_openbeautyfacts))
    if source in {"all", "cosing"}:
        tasks.append(("cosing", crawl_cosing_reference))
    if source in {"all", "cosmile"}:
        tasks.append(("cosmile", crawl_cosmile_reference))
    if source in {"all", "cosmeticsinfo"}:
        tasks.append(("cosmeticsinfo", crawl_cosmeticsinfo_reference))

    results = []
    for name, task in tasks:
        result = task(ROOT)
        row = {
            "source": name,
            "ok": result.ok,
            "url": result.url,
            "status": result.status,
            "content_type": result.content_type,
            "path": result.path,
            "message": result.message,
            "item_count": result.item_count,
            "reported_total": result.reported_total,
            "fetched_at": utc_now(),
        }
        results.append(row)
        print(f"[{name}] {row['message']} | status={row['status']} | returned={row['item_count']} | reported_total={row['reported_total']}")

    log_path = ROOT / "docs" / "crawling_notes.json"
    log_path.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch allowed public ingredient references.")
    parser.add_argument("--source", default="all", choices=["all", "openbeautyfacts", "cosing", "cosmile", "cosmeticsinfo"])
    args = parser.parse_args()
    run(args.source)


if __name__ == "__main__":
    main()
