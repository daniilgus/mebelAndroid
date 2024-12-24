const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); 

const app = express();
const port = process.env.PORT || 3000; 

const pool = new Pool({
    user: 'postgres',
    host: 'postgres.railway.internal',
    database: 'railway',
    password: 'LHDGRwjsZnsBQUBvUIQVHvzKTdjaHleb',
    port: 5432,
});

pool.connect()
    .then(client => {
        return client.query('SELECT NOW()')
            .then(res => {
                console.log('Подключение к базе данных успешно:', res.rows[0]);
                client.release();
            })
            .catch(err => {
                console.error('Ошибка при выполнении запроса:', err);
                client.release();
            });
    })
    .catch(err => {
        console.error('Ошибка при подключении к базе данных:', err);
    });


app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Получение списка мебели
app.get('/furniture', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, material FROM furniture');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении мебели:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


// Добавление новой мебели
app.post('/furniture', async (req, res) => {
    const { name, material } = req.body;

    try {
        const result = await pool.query('INSERT INTO furniture (name, material) VALUES (\$1, \$2) RETURNING *', [name, material]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении мебели:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление мебели
app.put('/furniture/:id', async (req, res) => {
    const { id } = req.params; 
    const { name, material } = req.body; 

    try {
        await pool.query('UPDATE furniture SET name = \$1, material = \$2 WHERE id = \$3', 
            [name, material, id]);
        res.status(200).json({ message: 'Мебель успешно обновлена' });
    } catch (error) {
        console.error('Ошибка при обновлении мебели:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление мебели
app.delete('/furniture/:id', async (req, res) => {
    const furnitureId = req.params.id;
    try {
        await pool.query('DELETE FROM furniture WHERE id = \$1', [furnitureId]);
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка при удалении мебели:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = \$1', [username]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password); // Сравнение хешей

            if (match) {
                res.json({ success: true });
            } else {
                res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
        }
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});


app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
