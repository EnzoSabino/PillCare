import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const routes = Router();
const prisma = new PrismaClient();

// ==========================================
// ROTAS DE AUTENTICAÇÃO E UTILIZADORES
// ==========================================

routes.post('/users', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return res.status(400).json({ error: 'E-mail já cadastrado.' });
  }

  const user = await prisma.user.create({
    data: { name, email, password },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return res.status(201).json(user);
});

routes.post('/sessions', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e palavra-passe são obrigatórios.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(400).json({ error: 'Credenciais inválidas.' });
  }

  return res.json({ id: user.id, name: user.name, email: user.email });
});

// ==========================================
// ROTAS DE MEDICAMENTOS DO PACIENTE
// ==========================================

routes.get('/users/:userId/medications', async (req, res) => {
  const { userId } = req.params;

  try {
    const medications = await prisma.medication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(medications);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar medicamentos.' });
  }
});

routes.post('/users/:userId/medications', async (req, res) => {
  const { userId } = req.params;
  const { name, dosage, quantityInStock, refillThreshold, frequencyHours } = req.body;

  if (!name || !dosage || quantityInStock === undefined) {
    return res.status(400).json({ error: 'Nome, dosagem e quantidade são obrigatórios.' });
  }

  try {
    const freqHours = Number(frequencyHours) || 8;
    const nextDoseAt = new Date();
    nextDoseAt.setHours(nextDoseAt.getHours() + freqHours);

    const medication = await prisma.medication.create({
      data: {
        name,
        dosage,
        quantityInStock: Number(quantityInStock),
        refillThreshold: Number(refillThreshold) || 5,
        frequencyHours: freqHours,
        nextDoseAt,
        userId,
      },
    });

    return res.status(201).json(medication);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao guardar no banco de dados.' });
  }
});

// Registar Toma (Baixa no stock + Registo no Histórico)
routes.patch('/medications/:id/take', async (req, res) => {
  const { id } = req.params;

  try {
    const currentMed = await prisma.medication.findUnique({ where: { id } });

    if (!currentMed) {
      return res.status(404).json({ error: 'Medicamento não encontrado.' });
    }

    if (currentMed.quantityInStock <= 0) {
      return res.status(400).json({ error: 'Medicamento sem stock disponível.' });
    }

    const nextDoseAt = new Date();
    nextDoseAt.setHours(nextDoseAt.getHours() + currentMed.frequencyHours);

    // Reduz stock e cria entrada no histórico
    const [updatedMedication] = await prisma.$transaction([
      prisma.medication.update({
        where: { id },
        data: {
          quantityInStock: currentMed.quantityInStock - 1,
          nextDoseAt,
        },
      }),
      prisma.doseHistory.create({
        data: {
          userId: currentMed.userId,
          medicationId: currentMed.id,
        },
      }),
    ]);

    return res.json(updatedMedication);
  } catch (error) {
    console.error('Erro no PATCH /take:', error);
    return res.status(500).json({ error: 'Erro ao registar a dose.' });
  }
});

// Eliminar Medicamento
routes.delete('/medications/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.medication.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover o medicamento.' });
  }
});

// ==========================================
// ROTA DE HISTÓRICO DE TOMAS
// ==========================================

routes.get('/users/:userId/history', async (req, res) => {
  const { userId } = req.params;

  try {
    const history = await prisma.doseHistory.findMany({
      where: { userId },
      include: {
        medication: {
          select: { name: true, dosage: true },
        },
      },
      orderBy: { takenAt: 'desc' },
      take: 30,
    });

    return res.json(history);
  } catch (error) {
    console.error('Erro no GET /history:', error);
    return res.status(500).json({ error: 'Não foi possível carregar o histórico.' });
  }
});

export { routes };