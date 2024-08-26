import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY as string; // Acessando a variável de ambiente

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token || req.body.token || req.query.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return res.status(200).json({ valid: true, decoded });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
