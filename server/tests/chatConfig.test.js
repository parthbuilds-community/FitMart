const { getFallbackResponse, PRODUCT_TEMPLATE } = require('../config/chatConfig');

describe('chatConfig Utilities', () => {
  describe('getFallbackResponse', () => {
    it('should return protein-specific response when "protein" is in the message', () => {
      const msg = 'How much protein should I take?';
      const response = getFallbackResponse(msg);
      expect(response).toContain('For optimal protein intake');
      expect(response).toContain('1.6-2.2g per kg');
    });

    it('should return workout-specific response when "workout" or "exercise" is in the message', () => {
      const msg1 = 'What is a good workout?';
      const msg2 = 'How to exercise properly?';
      
      const res1 = getFallbackResponse(msg1);
      const res2 = getFallbackResponse(msg2);
      
      expect(res1).toContain('A balanced workout routine');
      expect(res1).toContain('3-4 strength training sessions');
      
      expect(res2).toContain('A balanced workout routine');
    });

    it('should return weight loss-specific response when "weight loss" is in the message', () => {
      const msg = 'Tips for weight loss?';
      const response = getFallbackResponse(msg);
      expect(response).toContain('For sustainable weight loss');
      expect(response).toContain('moderate calorie deficit');
    });

    it('should return muscle gain-specific response when "muscle" or "gain" is in the message', () => {
      const msg1 = 'How to build muscle?';
      const msg2 = 'I want to gain mass';
      
      const res1 = getFallbackResponse(msg1);
      const res2 = getFallbackResponse(msg2);
      
      expect(res1).toContain('For muscle gain');
      expect(res1).toContain('slight calorie surplus');
      
      expect(res2).toContain('For muscle gain');
    });

    it('should return the generic fallback response for unrelated messages', () => {
      const msg = 'Hello, who are you?';
      const response = getFallbackResponse(msg);
      expect(response).toContain("I'm here to help with your fitness journey!");
    });
    
    it('should handle case insensitivity', () => {
      const msg = 'HOW MUCH PROTEIN?';
      const response = getFallbackResponse(msg);
      expect(response).toContain('For optimal protein intake');
    });
  });

  describe('PRODUCT_TEMPLATE', () => {
    it('should correctly format a full product object', () => {
      const product = {
        name: 'Whey Isolate',
        brand: 'Optimum Nutrition',
        price: 2500,
        rating: 4.8
      };
      
      const formatted = PRODUCT_TEMPLATE(product);
      expect(formatted).toContain('**💪 Recommended Products**');
      expect(formatted).toContain('**Whey Isolate**');
      expect(formatted).toContain('**by** **Optimum Nutrition**');
      expect(formatted).toContain('**— ₹2,500**');
      expect(formatted).toContain('**(⭐4.8/5)**');
    });

    it('should handle missing optional fields gracefully', () => {
      const product = {
        name: 'Basic Shaker'
      };
      
      const formatted = PRODUCT_TEMPLATE(product);
      expect(formatted).toContain('**Basic Shaker**');
      expect(formatted).not.toContain('**by**');
      expect(formatted).not.toContain('**— ₹');
      expect(formatted).not.toContain('**(⭐');
    });
  });
});
