import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LlmProviderService } from './llm-provider.service';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(),
}));

describe('LlmProviderService', () => {
  const generateContent = jest.fn();

  function createService(config: Record<string, string | undefined>) {
    const configService = {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;
    return new LlmProviderService(configService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: { generateContent },
    }));
  });

  it('throws when GEMINI_API_KEY is missing', async () => {
    const service = createService({ AI_FEATURES_ENABLED: 'true' });

    await expect(service.generateText('hello')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('returns generated text and uses configured model', async () => {
    generateContent.mockResolvedValue({
      text: '  Xin chào  ',
      usageMetadata: {
        promptTokenCount: 1,
        candidatesTokenCount: 2,
        totalTokenCount: 3,
      },
    });
    const service = createService({
      AI_FEATURES_ENABLED: 'true',
      GEMINI_API_KEY: 'test-key',
      GEMINI_MODEL: 'gemini-test',
    });

    const result = await service.generateText('hello');

    expect(result).toBe('Xin chào');
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-test', contents: 'hello' }),
    );
  });

  it('parses JSON returned in markdown fence', async () => {
    generateContent.mockResolvedValue({ text: '```json\n{"title":"A"}\n```' });
    const service = createService({
      AI_FEATURES_ENABLED: 'true',
      GEMINI_API_KEY: 'test-key',
    });

    await expect(
      service.generateJson<{ title: string }>('prompt'),
    ).resolves.toEqual({ title: 'A' });
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          responseMimeType: 'application/json',
        }),
      }),
    );
  });

  it('extracts the first JSON object when the response has extra text', async () => {
    generateContent.mockResolvedValue({
      text: 'Đây là kết quả: {"summary":"OK","urgentCount":0} cảm ơn.',
    });
    const service = createService({
      AI_FEATURES_ENABLED: 'true',
      GEMINI_API_KEY: 'test-key',
    });

    await expect(
      service.generateJson<{ summary: string; urgentCount: number }>('prompt'),
    ).resolves.toEqual({ summary: 'OK', urgentCount: 0 });
  });

  it('throws BadGatewayException for invalid JSON', async () => {
    generateContent.mockResolvedValue({ text: 'not-json' });
    const service = createService({
      AI_FEATURES_ENABLED: 'true',
      GEMINI_API_KEY: 'test-key',
    });

    await expect(service.generateJson('prompt')).rejects.toThrow(
      BadGatewayException,
    );
  });
});
