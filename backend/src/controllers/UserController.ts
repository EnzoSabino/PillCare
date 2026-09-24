import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class UserController {
  // Criar novo utilizador
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
      const userExists = await prisma.user.findUnique({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      const user = await prisma.user.create({
        data: { name, email, password },
        select: { id: true, name: true, email: true, createdAt: true } // Não retorna a senha
      });

      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar utilizador.' });
    }
  }

  // Listar utilizadores
  async index(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    return res.json(users);
  }
}