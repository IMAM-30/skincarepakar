DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS ingredient_aliases;
DROP TABLE IF EXISTS ingredient_benefits;
DROP TABLE IF EXISTS ingredient_risks;
DROP TABLE IF EXISTS benefit_tags;
DROP TABLE IF EXISTS risk_tags;
DROP TABLE IF EXISTS skin_types;
DROP TABLE IF EXISTS skin_conditions;
DROP TABLE IF EXISTS condition_ingredient_rules;
DROP TABLE IF EXISTS fuzzy_rules;
DROP TABLE IF EXISTS routine_templates;
DROP TABLE IF EXISTS knowledge_source_audit;
DROP TABLE IF EXISTS source_references;
DROP TABLE IF EXISTS dataset_metadata;

CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY,
  inci_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  alias_primary TEXT,
  ingredient_group TEXT,
  cosmetic_function TEXT,
  description TEXT,
  source TEXT,
  reference_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE ingredient_aliases (
  id INTEGER PRIMARY KEY,
  ingredient_id INTEGER NOT NULL,
  alias_name TEXT NOT NULL,
  alias_type TEXT,
  source TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE ingredient_benefits (
  id INTEGER PRIMARY KEY,
  ingredient_id INTEGER NOT NULL,
  benefit_tag TEXT NOT NULL,
  strength_score INTEGER NOT NULL,
  evidence_note TEXT,
  source TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE ingredient_risks (
  id INTEGER PRIMARY KEY,
  ingredient_id INTEGER NOT NULL,
  risk_tag TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  risk_condition TEXT,
  note TEXT,
  source TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE benefit_tags (
  id INTEGER PRIMARY KEY,
  tag_name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE risk_tags (
  id INTEGER PRIMARY KEY,
  tag_name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE skin_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  oiliness_default INTEGER NOT NULL,
  dryness_default INTEGER NOT NULL,
  sensitivity_default INTEGER NOT NULL,
  barrier_damage_default INTEGER NOT NULL,
  description TEXT
);

CREATE TABLE skin_conditions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  acne_level INTEGER DEFAULT 0,
  dullness_level INTEGER DEFAULT 0,
  redness_level INTEGER DEFAULT 0,
  barrier_damage_level INTEGER DEFAULT 0,
  dryness_level INTEGER DEFAULT 0,
  oiliness_level INTEGER DEFAULT 0,
  description TEXT
);

CREATE TABLE condition_ingredient_rules (
  id INTEGER PRIMARY KEY,
  condition_name TEXT NOT NULL,
  recommended_benefit_tag TEXT NOT NULL,
  caution_risk_tag TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  note TEXT
);

CREATE TABLE fuzzy_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_code TEXT NOT NULL UNIQUE,
  antecedent_json TEXT NOT NULL,
  consequent_json TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE routine_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile TEXT NOT NULL UNIQUE,
  template_json TEXT NOT NULL
);

CREATE TABLE knowledge_source_audit (
  item_id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_id TEXT NOT NULL,
  item_label TEXT NOT NULL,
  current_value TEXT,
  knowledge_status TEXT NOT NULL,
  knowledge_method TEXT NOT NULL,
  evidence_level TEXT,
  recommended_sources TEXT,
  rationale TEXT,
  direct_expert_validation TEXT,
  optional_expert_review TEXT
);

CREATE TABLE source_references (
  source_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  url TEXT,
  used_for TEXT,
  trust_level TEXT,
  collection_method TEXT
);

CREATE TABLE dataset_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metadata_json TEXT NOT NULL
);
