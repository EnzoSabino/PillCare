import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class MedicationController {
  // Cadastrar medicamento para um utilizador
  async create(req: Request, res: Response) {
    const { name, dosage, manufacturer, isGeneric, price, quantityInStock, refillThreshold, frequencyHours, nextDoseAt, userId } = req.body;

    try {
      const medication = await prisma.medication.create({
        data: {
          name,
          dosage,
          manufacturer,
          isGeneric,
          price,
          quantityInStock,
          refillThreshold,
          frequencyHours,
          nextDoseAt: new Date(nextDoseAt),
          userId
        }
      });

      return res.status(201).json(medication);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao cadastrar medicamento.' });
    }
  }

  // Listar medicamentos de um utilizador específico
  async listByUser(req: Request, res: Response) {
    const { userId } = req.params;

    const medications = await prisma.medication.findMany({
      where: { userId }
    });

    return res.json(medications);
  }

  // Registar toma de dose (Diminui o estoque e recalcula a próxima dose)
  async takeDose(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const medication = await prisma.medication.findUnique({ where: { id } });

      if (!medication) {
        return res.status(404).json({ error: 'Medicamento não encontrado.' });
      }

      if (medication.quantityInStock <= 0) {
        return res.status(400).json({ error: 'Sem stock disponível!' });
      }

      // Calcula o horário da próxima dose
      const nextDose = new Date();
      nextDose.setHours(nextDose.getHours() + medication.frequencyHours);

      // Atualiza o estoque e a próxima dose no banco
      const updatedMedication = await prisma.medication.update({
        where: { id },
        data: {
          quantityInStock: medication.quantityInStock - 1,
          nextDoseAt: nextDose
        }
      });

      // Alerta se o estoque atingiu o limite mínimo de reposição
      const needsRefill = updatedMedication.quantityInStock <= updatedMedication.refillThreshold;

      return res.json({
        medication: updatedMedication,
        alert: needsRefill ? 'Atenção: Stock baixo! Necessário pedir recarga.' : null
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registar dose.' });
    }
  }
}