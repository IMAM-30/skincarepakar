#!/usr/bin/env python3
import csv
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
DB_PATH = PROCESSED / "skincare_ingredients.sqlite"


def read_csv(name: str) -> list[dict]:
    with (PROCESSED / name).open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def insert_rows(conn: sqlite3.Connection, table: str, rows: list[dict]) -> None:
    if not rows:
        return
    fields = list(rows[0].keys())
    placeholders = ", ".join(["?"] * len(fields))
    field_sql = ", ".join(fields)
    conn.executemany(
        f"INSERT INTO {table} ({field_sql}) VALUES ({placeholders})",
        [[row.get(field, "") for field in fields] for row in rows],
    )


def run() -> None:
    if DB_PATH.exists():
        DB_PATH.unlink()
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    schema = (ROOT / "database" / "schema.sql").read_text(encoding="utf-8")
    conn.executescript(schema)

    table_files = {
        "ingredients": "ingredients_master.csv",
        "ingredient_aliases": "ingredient_aliases.csv",
        "ingredient_benefits": "ingredient_benefits.csv",
        "ingredient_risks": "ingredient_risks.csv",
        "benefit_tags": "benefit_tags.csv",
        "risk_tags": "risk_tags.csv",
        "skin_types": "skin_types.csv",
        "skin_conditions": "skin_conditions.csv",
        "condition_ingredient_rules": "condition_ingredient_rules.csv",
        "knowledge_source_audit": "knowledge_source_audit.csv",
        "source_references": "source_references.csv",
    }
    for table, filename in table_files.items():
        insert_rows(conn, table, read_csv(filename))

    fuzzy_rules = json.loads((PROCESSED / "fuzzy_rules_seed.json").read_text(encoding="utf-8"))
    conn.executemany(
        "INSERT INTO fuzzy_rules (rule_code, antecedent_json, consequent_json, description, is_active) VALUES (?, ?, ?, ?, 1)",
        [
            (
                rule["code"],
                json.dumps(rule["if"], ensure_ascii=False),
                json.dumps(rule["then"], ensure_ascii=False),
                rule.get("description", ""),
            )
            for rule in fuzzy_rules
        ],
    )

    routines = json.loads((PROCESSED / "routine_templates.json").read_text(encoding="utf-8"))
    conn.executemany(
        "INSERT INTO routine_templates (profile, template_json) VALUES (?, ?)",
        [(row["profile"], json.dumps(row, ensure_ascii=False)) for row in routines],
    )

    metadata = json.loads((PROCESSED / "dataset_metadata.json").read_text(encoding="utf-8"))
    conn.execute("INSERT INTO dataset_metadata (metadata_json) VALUES (?)", (json.dumps(metadata, ensure_ascii=False),))
    conn.commit()
    conn.close()
    print(f"SQLite exported: {DB_PATH}")


if __name__ == "__main__":
    run()
