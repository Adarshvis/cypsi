# Schema workflow scripts (confirmed present, not run)

- scripts/setup-scratch.mjs – create throwaway scratch DB copy
- scripts/push-scratch.mts – Payload push (CMS_DB_PUSH=true) against scratch
- scripts/diff-scratch.mjs – derive additive DDL (output e.g. scratch-diff.sql)
- scripts/apply-new-schema.mjs – apply the derived DDL to the real DB

Real DB uses `push: process.env.CMS_DB_PUSH === 'true'` (off by default). Old rows from backups/cps_pre_drop_20260816_110840.dump must NOT be restored.
