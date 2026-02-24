-- 043: Command Center tables — features, roadmap, changelog, docs, comments

-- ============================================================
-- FEATURES — product feature tracker
-- ============================================================
CREATE TABLE IF NOT EXISTS cc_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'platform',
  status VARCHAR(20) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('shipped', 'in_progress', 'planned', 'exploring', 'cut')),
  priority INTEGER NOT NULL DEFAULT 0,
  release_phase VARCHAR(20) CHECK (release_phase IN ('v1', 'v1.5', 'v2', 'future')),
  shipped_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_features_status ON cc_features(status);
CREATE INDEX IF NOT EXISTS idx_cc_features_category ON cc_features(category);

-- ============================================================
-- ROADMAP — phased roadmap items
-- ============================================================
CREATE TABLE IF NOT EXISTS cc_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  phase VARCHAR(20) NOT NULL DEFAULT 'later'
    CHECK (phase IN ('now', 'next', 'later', 'done', 'icebox')),
  category VARCHAR(50),
  priority INTEGER NOT NULL DEFAULT 0,
  feature_id UUID REFERENCES cc_features(id) ON DELETE SET NULL,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_roadmap_phase ON cc_roadmap(phase);

-- ============================================================
-- CHANGELOG — shipped updates log
-- ============================================================
CREATE TABLE IF NOT EXISTS cc_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  body TEXT,
  version VARCHAR(20),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  feature_ids UUID[] DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_changelog_date ON cc_changelog(entry_date DESC);

-- ============================================================
-- DOCS — design specs, marketing plans, decision docs, notes
-- ============================================================
CREATE TABLE IF NOT EXISTS cc_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  body TEXT,
  doc_type VARCHAR(30) NOT NULL DEFAULT 'note'
    CHECK (doc_type IN ('design_spec', 'marketing', 'decision', 'note', 'meeting', 'strategy')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'admin'
    CHECK (visibility IN ('admin', 'advisory', 'all')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_docs_type ON cc_docs(doc_type);
CREATE INDEX IF NOT EXISTS idx_cc_docs_visibility ON cc_docs(visibility);

-- ============================================================
-- COMMENTS — threaded comments on any command center item
-- ============================================================
CREATE TABLE IF NOT EXISTS cc_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type VARCHAR(20) NOT NULL
    CHECK (parent_type IN ('feature', 'roadmap', 'changelog', 'doc')),
  parent_id UUID NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_comments_parent ON cc_comments(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_cc_comments_author ON cc_comments(author_id);

-- Triggers
CREATE TRIGGER cc_features_updated_at BEFORE UPDATE ON cc_features FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cc_roadmap_updated_at BEFORE UPDATE ON cc_roadmap FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cc_changelog_updated_at BEFORE UPDATE ON cc_changelog FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cc_docs_updated_at BEFORE UPDATE ON cc_docs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cc_comments_updated_at BEFORE UPDATE ON cc_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
