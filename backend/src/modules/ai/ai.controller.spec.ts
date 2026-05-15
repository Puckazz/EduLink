import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  const aiService = {
    generateNotificationDraft: jest.fn(),
    summarizeFeedback: jest.fn(),
    suggestFeedbackReply: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: aiService }],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('delegates notification generation to AiService', async () => {
    aiService.generateNotificationDraft.mockResolvedValue({
      title: 'T',
      content: 'C',
    });

    await expect(
      controller.generateNotification({ brief: 'Brief' }),
    ).resolves.toEqual({ title: 'T', content: 'C' });
    expect(aiService.generateNotificationDraft).toHaveBeenCalledWith({
      brief: 'Brief',
    });
  });

  it('delegates feedback summary to AiService', async () => {
    aiService.summarizeFeedback.mockResolvedValue({
      summary: 'Summary',
      urgentCount: 0,
      stats: { open: 0, inProgress: 0, resolved: 0, total: 0 },
      analytics: { totalInPeriod: 0, respondedCount: 0, resolutionRate: 0 },
      categoryBreakdown: [],
      suggestedActions: [],
    });

    await expect(
      controller.summarizeFeedback({ status: 'OPEN' }),
    ).resolves.toEqual(expect.objectContaining({ summary: 'Summary' }));
    expect(aiService.summarizeFeedback).toHaveBeenCalledWith({
      status: 'OPEN',
    });
  });

  it('delegates reply suggestion to AiService', async () => {
    aiService.suggestFeedbackReply.mockResolvedValue({ content: 'Reply' });

    await expect(controller.suggestFeedbackReply(10)).resolves.toEqual({
      content: 'Reply',
    });
    expect(aiService.suggestFeedbackReply).toHaveBeenCalledWith(10);
  });
});
