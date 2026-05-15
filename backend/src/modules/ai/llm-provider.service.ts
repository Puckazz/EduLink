import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  GatewayTimeoutException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export interface LlmGenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  responseMimeType?: 'application/json' | 'text/plain';
  thinkingBudget?: number;
}

@Injectable()
export class LlmProviderService {
  private readonly logger = new Logger(LlmProviderService.name);
  private client: GoogleGenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  async generateText(
    prompt: string,
    options: LlmGenerateOptions = {},
  ): Promise<string> {
    this.ensureEnabled();

    const model =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    const timeoutMs = options.timeoutMs ?? 30_000;

    try {
      const request = this.getClient().models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxOutputTokens ?? 1200,
          responseMimeType: options.responseMimeType,
          thinkingConfig:
            options.thinkingBudget !== undefined
              ? { thinkingBudget: options.thinkingBudget }
              : undefined,
        },
      });

      const response = await this.withTimeout(request, timeoutMs);
      const text = response.text?.trim();

      this.logger.debug(
        `Gemini usage: model=${model}, prompt=${response.usageMetadata?.promptTokenCount ?? 'n/a'}, output=${response.usageMetadata?.candidatesTokenCount ?? 'n/a'}, total=${response.usageMetadata?.totalTokenCount ?? 'n/a'}`,
      );

      if (!text) {
        throw new BadGatewayException('AI không trả về nội dung hợp lệ');
      }

      return text;
    } catch (error) {
      if (
        error instanceof GatewayTimeoutException ||
        error instanceof BadGatewayException
      ) {
        throw error;
      }

      this.logger.error(
        'Gemini request failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadGatewayException('Không thể kết nối dịch vụ AI');
    }
  }

  async generateJson<T>(
    prompt: string,
    options: LlmGenerateOptions = {},
  ): Promise<T> {
    const text = await this.generateText(prompt, {
      thinkingBudget: 0,
      ...options,
      responseMimeType: 'application/json',
    });
    return this.parseJson<T>(text);
  }

  private ensureEnabled() {
    const enabled =
      this.configService.get<string>('AI_FEATURES_ENABLED') ?? 'true';
    if (enabled.toLowerCase() === 'false') {
      throw new ServiceUnavailableException('Tính năng AI đang bị tắt');
    }

    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      throw new ServiceUnavailableException('Thiếu cấu hình GEMINI_API_KEY');
    }
  }

  private getClient() {
    if (!this.client) {
      this.client = new GoogleGenAI({
        apiKey: this.configService.get<string>('GEMINI_API_KEY'),
      });
    }
    return this.client;
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    let timeout: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(
        () =>
          reject(new GatewayTimeoutException('Dịch vụ AI phản hồi quá lâu')),
        timeoutMs,
      );
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private parseJson<T>(raw: string): T {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      const extracted = this.extractFirstJsonObject(cleaned);
      if (extracted) {
        try {
          return JSON.parse(extracted) as T;
        } catch {
          // Fall through to the consistent 502 below.
        }
      }

      this.logger.warn(`Invalid AI JSON response: ${cleaned.slice(0, 1000)}`);
      throw new BadGatewayException(
        'AI trả về dữ liệu không đúng định dạng hoặc bị cắt ngắn',
      );
    }
  }

  private extractFirstJsonObject(value: string): string | null {
    const start = value.indexOf('{');
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < value.length; index += 1) {
      const char = value[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;

      if (depth === 0) {
        return value.slice(start, index + 1);
      }
    }

    return null;
  }
}
