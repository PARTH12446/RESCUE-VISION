export class UserModel {
    static async findAll(limit = 100, offset = 0) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            'SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return result.rows;
    }

    static async findById(id) {
        const db = (await import('../config/database')).default;
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    static async findByEmail(email) {
        const db = (await import('../config/database')).default;
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    static async create(userData) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            `INSERT INTO users (
                username, email, password_hash, role, full_name, 
                phone_number, location, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                userData.username,
                userData.email,
                userData.password, // Note: You should hash this before storing
                userData.role,
                userData.full_name,
                userData.phone_number,
                userData.location,
                true
            ]
        );
        return result.rows[0];
    }

    static async update(id, userData) {
        const db = (await import('../config/database')).default;
        
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(userData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (fields.length === 0) {
            return null;
        }

        values.push(id);
        
        const result = await db.query(
            `UPDATE users 
             SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${paramCount}
             RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    static async delete(id) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        return (result.rowCount || 0) > 0;
    }

    static async count() {
        const db = (await import('../config/database')).default;
        const result = await db.query('SELECT COUNT(*) FROM users WHERE is_active = true');
        const count = result.rows[0]?.count;
        return count ? parseInt(count, 10) : 0;
    }

    // Additional helper methods
    static async findByUsername(username) {
        const db = (await import('../config/database')).default;
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0] || null;
    }

    static async updateLastLogin(id) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        return (result.rowCount || 0) > 0;
    }

    static async findByRole(role) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            'SELECT * FROM users WHERE role = $1 AND is_active = true ORDER BY created_at DESC',
            [role]
        );
        return result.rows;
    }

    static async searchUsers(searchTerm, limit = 50) {
        const db = (await import('../config/database')).default;
        const result = await db.query(
            `SELECT * FROM users 
             WHERE (username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1)
             AND is_active = true
             ORDER BY created_at DESC
             LIMIT $2`,
            [`%${searchTerm}%`, limit]
        );
        return result.rows;
    }
}