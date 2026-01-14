import { ActivityTranslationService } from '../activityTranslationService';

describe('ActivityTranslationService', () => {
  it('should translate a simple activity description into academic terms', async () => {
    const input = "Baked sourdough bread";
    const result = await ActivityTranslationService.translate(input, '10th Grade');

    expect(result).toHaveProperty('translation');
    expect(result).toHaveProperty('skills');
    expect(result).toHaveProperty('grade');
    expect(Array.isArray(result.skills)).toBe(true);
    expect(result.skills.length).toBeGreaterThan(0);
  });
});
