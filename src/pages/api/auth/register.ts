import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import pool from '../../../bd'; // Importando o pool de conexão

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO public.usuarios (nome, email, senha_hash, data_criacao) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, data_criacao',
      [nome, email, senhaHash, new Date()] // Adicionando a data de criação com a data atual
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
