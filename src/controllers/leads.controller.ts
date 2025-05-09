import { Request, Response } from 'express';
import { ResponseUtils } from '../utils/reponse';
import { StatusCode } from '../types/response';
import { LeadService } from '../service/leads.service';
import { LeadModel } from '../models/leads.model';
import { LeadLabel } from '../types/leads';
import LeadValidations from '../validations/lead.validation';
import { mongoLeadService } from '../service/mongo';
import { UserProvider } from '../types';

class LeadController {
  /**
   * Update or assign a tag to a conversation (lead).
   */
  public async updateTag(req: Request, res: Response): Promise<void> {
    const validationResult = await LeadValidations.updateTag(req.body);
    if (validationResult !== true) {
      return ResponseUtils.error(res, validationResult, StatusCode.BAD_REQUEST);
    }

    const { conversationId, tag, provider, providerId } = req.body;

    try {
      const updatedLead = await mongoLeadService.updateOne(
        { conversationId },
        {
          provider,
          providerId,
          transactions: [
            {
              tag: tag,
            },
          ],
        }
      );
      return ResponseUtils.success(
        res,
        { updatedLead },
        'Lead tag updated successfully',
        StatusCode.OK
      );
    } catch (error: any) {
      console.error('Error updating lead tag:', error);
      return ResponseUtils.error(
        res,
        'Failed to update lead tag',
        StatusCode.INTERNAL_SERVER_ERROR,
        error.message || error
      );
    }
  }

  /**
   * Tag a conversation based on the message content.
   * @param message The message content to analyze.
   * @returns The determined lead label.
   */
  public async tagConversation(message: string): Promise<LeadLabel> {
    const lowerMessage = message.toLowerCase();
    console.log('Tagging conversation with message:', lowerMessage);

    if (
      lowerMessage.includes('cancel') ||
      lowerMessage.includes('not interested') ||
      lowerMessage.includes('lost') ||
      lowerMessage.includes('give up') ||
      lowerMessage.includes('not going ahead') ||
      lowerMessage.includes('abandon')
    ) {
      return LeadLabel.CLOSED_LOST_TRANSACTION;
    }

    if (
      lowerMessage.includes('paid') ||
      lowerMessage.includes('completed') ||
      lowerMessage.includes('successful') ||
      lowerMessage.includes('received') ||
      lowerMessage.includes('done') ||
      lowerMessage.includes('confirmed')
    ) {
      return LeadLabel.TRANSACTION_SUCCESSFUL;
    }

    if (
      lowerMessage.includes('payment') ||
      lowerMessage.includes('transfer') ||
      lowerMessage.includes('awaiting payment') ||
      lowerMessage.includes('waiting for payment') ||
      lowerMessage.includes('pending payment')
    ) {
      return LeadLabel.PAYMENT_PENDING;
    }

    if (
      lowerMessage.includes('order') ||
      lowerMessage.includes('purchase') ||
      lowerMessage.includes('confirm') ||
      lowerMessage.includes('processing') ||
      lowerMessage.includes('shipping')
    ) {
      return LeadLabel.TRANSACTION_IN_PROGRESS;
    }

    if (
      lowerMessage.includes('follow-up') ||
      lowerMessage.includes('reminder') ||
      lowerMessage.includes('call me') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('check back') ||
      lowerMessage.includes('ping me')
    ) {
      return LeadLabel.FOLLOW_UP_REQUIRED;
    }

    if (
      lowerMessage.includes('inquiry') ||
      lowerMessage.includes('question') ||
      lowerMessage.includes('info') ||
      lowerMessage.includes('enquiry') ||
      lowerMessage.includes('how much') ||
      lowerMessage.includes('what is the price')
    ) {
      return LeadLabel.NEW_INQUIRY;
    }

    if (
      lowerMessage.includes('demo') ||
      lowerMessage.includes('show me') ||
      lowerMessage.includes('walkthrough')
    ) {
      return LeadLabel.DEMO_REQUEST;
    }

    if (
      lowerMessage.includes('technical') ||
      lowerMessage.includes('bug') ||
      lowerMessage.includes('issue') ||
      lowerMessage.includes('problem') ||
      lowerMessage.includes('support') ||
      lowerMessage.includes('help')
    ) {
      return LeadLabel.TECHNICAL_SUPPORT;
    }

    if (
      lowerMessage.includes('price') ||
      lowerMessage.includes('cost') ||
      lowerMessage.includes('pricing') ||
      lowerMessage.includes('quote')
    ) {
      return LeadLabel.PRICING_INQUIRY;
    }

    if (
      lowerMessage.includes('partnership') ||
      lowerMessage.includes('partner') ||
      lowerMessage.includes('collaborate') ||
      lowerMessage.includes('business opportunity')
    ) {
      return LeadLabel.PARTNERSHIP_OPPORTUNITY;
    }

    if (
      lowerMessage.includes('feedback') ||
      lowerMessage.includes('suggestion') ||
      lowerMessage.includes('recommend') ||
      lowerMessage.includes('review')
    ) {
      return LeadLabel.FEEDBACK;
    }

    if (
      lowerMessage.includes('engaged') ||
      lowerMessage.includes('interested') ||
      lowerMessage.includes('discuss') ||
      lowerMessage.includes('talking')
    ) {
      return LeadLabel.ENGAGED;
    }

    if (
      lowerMessage.includes('not a lead') ||
      lowerMessage.includes('spam') ||
      lowerMessage.includes('unsubscribe') ||
      lowerMessage.includes('wrong number')
    ) {
      return LeadLabel.NOT_A_LEAD;
    }

    return LeadLabel.NOT_A_LEAD;
  }

  /**
   * Retrieve a list of leads.
   */
  public async listLeads(req: Request, res: Response): Promise<void> {
    try {
      const leads = await LeadService.getLeads();
      return ResponseUtils.success(
        res,
        { leads },
        'Leads retrieved successfully',
        StatusCode.OK
      );
    } catch (error: any) {
      console.error('Error retrieving leads:', error);
      return ResponseUtils.error(
        res,
        'Failed to retrieve leads',
        StatusCode.INTERNAL_SERVER_ERROR,
        error.message || error
      );
    }
  }
}

export const LeadCtrl = new LeadController();
