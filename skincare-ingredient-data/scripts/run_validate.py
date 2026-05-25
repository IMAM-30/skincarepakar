#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.validators.validate_dataset import validate


def main() -> None:
    ok, errors, counts = validate(ROOT / "data" / "processed")
    report = {"ok": ok, "counts": counts, "errors": errors}
    report_path = ROOT / "docs" / "validation_report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not ok:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
