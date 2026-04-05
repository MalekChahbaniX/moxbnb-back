import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

// FAQ data (in a real app, this would come from a database)
const faqs = [
  {
    id: '1',
    question: 'Comment puis-je annuler une réservation ?',
    answer: 'Vous pouvez annuler une réservation depuis la section "Mes réservations" de votre profil. Sélectionnez la réservation que vous souhaitez annuler et cliquez sur le bouton "Annuler". Notez que les conditions d\'annulation dépendent de la politique de l\'hôte.',
    category: 'Réservations'
  },
  {
    id: '2',
    question: 'Comment fonctionne le système de paiement ?',
    answer: 'Nous utilisons un système de paiement sécurisé. Vous pouvez ajouter plusieurs moyens de paiement (carte bancaire, compte bancaire, mobile money) depuis la section "Moyens de paiement". Le paiement est effectué au moment de la réservation selon les conditions définies.',
    category: 'Paiement'
  },
  {
    id: '3',
    question: 'Comment devenir hôte ?',
    answer: 'Pour devenir hôte, cliquez sur "Devenir hôte" dans le menu principal. Vous devrez compléter votre profil, vérifier votre identité et ajouter votre premier logement. Notre équipe examinera votre demande dans les 24-48 heures.',
    category: 'Hôte'
  },
  {
    id: '4',
    question: 'quelles sont les frais de service ?',
    answer: 'Les frais de service varient selon le type de réservation : Pour les voyageurs : environ 10-15% du prix total. Pour les hôtes : environ 3% du prix total. Ces frais couvrent notre plateforme d\'assistance 24/7 et la sécurisation des transactions.',
    category: 'Frais'
  },
  {
    id: '5',
    question: 'Comment puis-je contacter un hôte ?',
    answer: 'Vous pouvez contacter un hôte avant de réserver en utilisant le bouton "Contacter l\'hôte" sur la page du logement. Une fois la réservation confirmée, vous pouvez communiquer directement avec l\'hôte via notre système de messagerie intégré.',
    category: 'Communication'
  },
  {
    id: '6',
    question: 'Que faire en cas de problème pendant mon séjour ?',
    answer: 'En cas de problème pendant votre séjour, contactez d\'abord l\'hôte via notre messagerie. Si le problème n\'est pas résolu, vous pouvez nous contacter via le support disponible 24/7. Nous intervenons rapidement pour trouver une solution.',
    category: 'Séjour'
  }
];

// In-memory storage for support tickets (in production, use a database)
const supportTickets: any[] = [];

// Get FAQs
export const getFaqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query as Record<string, string>;
    
    let filteredFaqs = faqs;
    if (category && category !== 'Toutes') {
      filteredFaqs = faqs.filter(faq => faq.category === category);
    }

    res.status(200).json({
      success: true,
      data: filteredFaqs
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching FAQs'
    } as ApiResponse);
  }
};

// Create support ticket
export const createTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { subject, message, category, priority } = req.body;

    if (!subject || !message) {
      res.status(400).json({
        success: false,
        error: 'Subject and message are required'
      } as ApiResponse);
      return;
    }

    const ticket = {
      id: Date.now().toString(),
      userId,
      subject,
      message,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      createdAt: new Date(),
      lastUpdate: new Date(),
      responses: 0
    };

    supportTickets.push(ticket);

    res.status(201).json({
      success: true,
      data: { ticket }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating ticket'
    } as ApiResponse);
  }
};

// Get user tickets
export const getTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 20 } = req.query as Record<string, string>;
    
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    let tickets = supportTickets.filter(ticket => ticket.userId === userId);
    
    // Filter by status if specified
    if (status && status !== 'all') {
      tickets = tickets.filter(ticket => ticket.status === status);
    }

    // Sort by creation date (newest first)
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const total = tickets.length;
    const paginatedTickets = tickets.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: paginatedTickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching tickets'
    } as ApiResponse);
  }
};

// Get ticket by ID
export const getTicketById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { ticketId } = req.params;

    const ticket = supportTickets.find(t => 
      t.id === ticketId && t.userId === userId
    );

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: { ticket }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching ticket'
    } as ApiResponse);
  }
};

// Update ticket status
export const updateTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { ticketId } = req.params;
    const { status, message } = req.body;

    const ticketIndex = supportTickets.findIndex(t => 
      t.id === ticketId && t.userId === userId
    );

    if (ticketIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
      return;
    }

    // Update ticket
    if (status) supportTickets[ticketIndex].status = status;
    if (message) {
      // In a real app, you'd add this as a response to the ticket
      supportTickets[ticketIndex].responses += 1;
    }
    supportTickets[ticketIndex].lastUpdate = new Date();

    res.status(200).json({
      success: true,
      data: { ticket: supportTickets[ticketIndex] }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error updating ticket'
    } as ApiResponse);
  }
};

// Get contact information
export const getContactInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const contactInfo = {
      phone: '+216 71 123 456',
      email: 'support@moxbnb.com',
      whatsapp: '+216 71 123 456',
      chat: 'available',
      workingHours: '24/7'
    };

    res.status(200).json({
      success: true,
      data: contactInfo
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching contact info'
    } as ApiResponse);
  }
};

export const supportController = {
  getFaqs,
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  getContactInfo
};
