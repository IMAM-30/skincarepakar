import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


USER_AGENT = "skincarepakar-dataset-builder/0.1 (educational ingredient data; no product scraping)"


@dataclass
class FetchResult:
    ok: bool
    url: str
    status: int | None
    content_type: str | None
    path: str | None
    message: str
    item_count: int = 0
    reported_total: int = 0


def fetch_json(url: str, output_path: Path, timeout: int = 30) -> FetchResult:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            content_type = response.headers.get("content-type", "")
            body = response.read()
            payload: Any = json.loads(body.decode("utf-8"))
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            item_count = len(payload.get("tags", [])) if isinstance(payload, dict) else 0
            reported_total = int(payload.get("count") or item_count) if isinstance(payload, dict) else item_count
            return FetchResult(True, url, response.status, content_type, str(output_path), "fetched", item_count, reported_total)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return FetchResult(False, url, None, None, None, f"failed: {exc}")


def fetch_text(url: str, output_path: Path, timeout: int = 30) -> FetchResult:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,text/plain"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            content_type = response.headers.get("content-type", "")
            text = response.read().decode("utf-8", errors="replace")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(text, encoding="utf-8")
            return FetchResult(True, url, response.status, content_type, str(output_path), "reference page fetched", 1, 1)
    except (urllib.error.URLError, TimeoutError) as exc:
        return FetchResult(False, url, None, None, None, f"failed: {exc}")
