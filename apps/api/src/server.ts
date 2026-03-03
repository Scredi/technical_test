import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { getDb, initDb } from '@repo/db';
import type { User } from '@repo/db';

initDb();
const app = express();
app.use(cors());
app.use(express.json());

function rowToUser(row: Record<string, unknown>): User {
  return {
    uuid: row.uuid as string,
    email: row.email as string,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    role: row.role as User['role'],
    phone: (row.phone as string) || null,
    created_at: (row.created_at as string) || null,
    changed_at: (row.changed_at as string) || null,
    enabled: Boolean(row.enabled),
    status: row.status as User['status'],
    accepted_terms_on: (row.accepted_terms_on as string) || null,
    last_login_on: (row.last_login_on as string) || null,
  };
}

const USER_ROLES: User['role'][] = ['administrator', 'formalist_manager', 'formalist', 'account_manager', 'customer', 'support'];

const USER_STATUSES: User['status'][] = ['disabled', 'pending', 'enabled'];

function isUserRole(value: string): value is User['role'] {
  return USER_ROLES.includes(value as User['role']);
}

function isUserStatus(value: string): value is User['status'] {
  return USER_STATUSES.includes(value as User['status']);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

app.get('/api/users', (_req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM user ORDER BY created_at DESC').all() as Record<string, unknown>[];
    res.json(rows.map(rowToUser));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:uuid', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM user WHERE uuid = ?').get(req.params.uuid) as Record<string, unknown> | undefined;
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(rowToUser(row));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    if (!isRecord(req.body)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { email, first_name, last_name, role, phone, enabled, status, accepted_terms_on, last_login_on } = req.body;

    if (
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof first_name !== 'string' ||
      !first_name.trim() ||
      typeof last_name !== 'string' ||
      !last_name.trim() ||
      typeof role !== 'string' ||
      !isUserRole(role)
    ) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({ error: 'Invalid phone field' });
    }

    if (enabled !== undefined && typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid enabled field' });
    }

    if (status !== undefined && (typeof status !== 'string' || !isUserStatus(status))) {
      return res.status(400).json({ error: 'Invalid status field' });
    }

    if (accepted_terms_on !== undefined && accepted_terms_on !== null && typeof accepted_terms_on !== 'string') {
      return res.status(400).json({ error: 'Invalid accepted_terms_on field' });
    }

    if (last_login_on !== undefined && last_login_on !== null && typeof last_login_on !== 'string') {
      return res.status(400).json({ error: 'Invalid last_login_on field' });
    }

    const db = getDb();
    const uuid = randomUUID();
    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO user (uuid, email, first_name, last_name, role, phone, created_at, changed_at, enabled, status, accepted_terms_on, last_login_on)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      uuid,
      email.trim().toLowerCase(),
      first_name.trim(),
      last_name.trim(),
      role,
      phone ?? null,
      now,
      now,
      enabled === undefined ? 1
      : enabled ? 1
      : 0,
      status ?? 'enabled',
      accepted_terms_on ?? null,
      last_login_on ?? null,
    );

    const row = db.prepare('SELECT * FROM user WHERE uuid = ?').get(uuid) as Record<string, unknown> | undefined;
    if (!row) return res.status(500).json({ error: 'Failed to create user' });

    return res.status(201).json(rowToUser(row));
  } catch (e) {
    if (e instanceof Error && e.message.includes('UNIQUE constraint failed: user.email')) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    console.error(e);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

app.patch('/api/users/:uuid', (req, res) => {
  try {
    if (!isRecord(req.body)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM user WHERE uuid = ?').get(req.params.uuid) as Record<string, unknown> | undefined;
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const updates: string[] = [];
    const values: unknown[] = [];

    const addUpdate = (column: string, value: unknown) => {
      updates.push(`${column} = ?`);
      values.push(value);
    };

    if (req.body.email !== undefined) {
      if (typeof req.body.email !== 'string' || !req.body.email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email field' });
      }
      addUpdate('email', req.body.email.trim().toLowerCase());
    }

    if (req.body.first_name !== undefined) {
      if (typeof req.body.first_name !== 'string' || !req.body.first_name.trim()) {
        return res.status(400).json({ error: 'Invalid first_name field' });
      }
      addUpdate('first_name', req.body.first_name.trim());
    }

    if (req.body.last_name !== undefined) {
      if (typeof req.body.last_name !== 'string' || !req.body.last_name.trim()) {
        return res.status(400).json({ error: 'Invalid last_name field' });
      }
      addUpdate('last_name', req.body.last_name.trim());
    }

    if (req.body.role !== undefined) {
      if (typeof req.body.role !== 'string' || !isUserRole(req.body.role)) {
        return res.status(400).json({ error: 'Invalid role field' });
      }
      addUpdate('role', req.body.role);
    }

    if (req.body.phone !== undefined) {
      if (req.body.phone !== null && typeof req.body.phone !== 'string') {
        return res.status(400).json({ error: 'Invalid phone field' });
      }
      addUpdate('phone', req.body.phone ?? null);
    }

    if (req.body.enabled !== undefined) {
      if (typeof req.body.enabled !== 'boolean') {
        return res.status(400).json({ error: 'Invalid enabled field' });
      }
      addUpdate('enabled', req.body.enabled ? 1 : 0);
    }

    if (req.body.status !== undefined) {
      if (typeof req.body.status !== 'string' || !isUserStatus(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status field' });
      }
      addUpdate('status', req.body.status);
    }

    if (req.body.accepted_terms_on !== undefined) {
      if (req.body.accepted_terms_on !== null && typeof req.body.accepted_terms_on !== 'string') {
        return res.status(400).json({ error: 'Invalid accepted_terms_on field' });
      }
      addUpdate('accepted_terms_on', req.body.accepted_terms_on ?? null);
    }

    if (req.body.last_login_on !== undefined) {
      if (req.body.last_login_on !== null && typeof req.body.last_login_on !== 'string') {
        return res.status(400).json({ error: 'Invalid last_login_on field' });
      }
      addUpdate('last_login_on', req.body.last_login_on ?? null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    addUpdate('changed_at', new Date().toISOString());
    values.push(req.params.uuid);

    db.prepare(`UPDATE user SET ${updates.join(', ')} WHERE uuid = ?`).run(...values);

    const row = db.prepare('SELECT * FROM user WHERE uuid = ?').get(req.params.uuid) as Record<string, unknown> | undefined;
    if (!row) return res.status(500).json({ error: 'Failed to update user' });

    return res.json(rowToUser(row));
  } catch (e) {
    if (e instanceof Error && e.message.includes('UNIQUE constraint failed: user.email')) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    console.error(e);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

app.get('/api/formalities/:uuid', (req, res) => {
  try {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT f.uuid, f.company, f.type, f.status, f.creation_date, f.modification_date,
                u.uuid AS owner_uuid, u.email AS owner_email, u.first_name AS owner_first_name, u.last_name AS owner_last_name,
                u.role AS owner_role, u.phone AS owner_phone, u.created_at AS owner_created_at, u.changed_at AS owner_changed_at,
                u.enabled AS owner_enabled, u.status AS owner_status, u.accepted_terms_on AS owner_accepted_terms_on, u.last_login_on AS owner_last_login_on
         FROM formality f
         JOIN user u ON f.owner_uuid = u.uuid
         WHERE f.uuid = ?`,
      )
      .get(req.params.uuid) as Record<string, unknown> | undefined;
    if (!row) return res.status(404).json({ error: 'Formality not found' });
    res.json({
      uuid: row.uuid,
      company: row.company,
      type: row.type,
      status: row.status,
      creation_date: row.creation_date,
      modification_date: row.modification_date,
      owner: rowToUser({
        uuid: row.owner_uuid,
        email: row.owner_email,
        first_name: row.owner_first_name,
        last_name: row.owner_last_name,
        role: row.owner_role,
        phone: row.owner_phone,
        created_at: row.owner_created_at,
        changed_at: row.owner_changed_at,
        enabled: row.owner_enabled,
        status: row.owner_status,
        accepted_terms_on: row.owner_accepted_terms_on,
        last_login_on: row.owner_last_login_on,
      }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch formality' });
  }
});

app.get('/api/formalities', (_req, res) => {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT f.uuid, f.company, f.type, f.status, f.creation_date, f.modification_date,
                u.uuid AS owner_uuid, u.email AS owner_email, u.first_name AS owner_first_name, u.last_name AS owner_last_name,
                u.role AS owner_role, u.phone AS owner_phone, u.created_at AS owner_created_at, u.changed_at AS owner_changed_at,
                u.enabled AS owner_enabled, u.status AS owner_status, u.accepted_terms_on AS owner_accepted_terms_on, u.last_login_on AS owner_last_login_on
         FROM formality f
         JOIN user u ON f.owner_uuid = u.uuid
         ORDER BY f.creation_date DESC`,
      )
      .all() as Record<string, unknown>[];

    const formalities = rows.map((r) => ({
      uuid: r.uuid,
      company: r.company,
      type: r.type,
      status: r.status,
      creation_date: r.creation_date,
      modification_date: r.modification_date,
      owner: rowToUser({
        uuid: r.owner_uuid,
        email: r.owner_email,
        first_name: r.owner_first_name,
        last_name: r.owner_last_name,
        role: r.owner_role,
        phone: r.owner_phone,
        created_at: r.owner_created_at,
        changed_at: r.owner_changed_at,
        enabled: r.owner_enabled,
        status: r.owner_status,
        accepted_terms_on: r.owner_accepted_terms_on,
        last_login_on: r.owner_last_login_on,
      }),
    }));
    res.json(formalities);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch formalities' });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
