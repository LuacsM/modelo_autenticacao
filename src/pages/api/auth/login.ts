import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../../bd'; // Importando o pool de conexão

const SECRET_KEY = process.env.SECRET_KEY as string; // Acessando a variável de ambiente

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, { expiresIn: '1m' });
    await pool.query('INSERT INTO tokens (usuario_id, token, expiracao) VALUES ($1, $2, $3)', [
      usuario.id,
      token,
      new Date(Date.now() + 60 * 1000), // 1 minute from now
    ]);

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
