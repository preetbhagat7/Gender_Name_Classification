/**
 * Professional-grade Indian Name Gender Predictor
 * Features: Title detection, Surname weighting, and JSON lookup.
 */
class GenderPredictor {
    constructor(database = {}) {
        this.db = database;
        
        // Comprehensive list of Indian and Global titles
        this.prefixes = {
            male: /\b(mr|shri|shree|mister|master|msr)\b/gi,
            female: /\b(mrs|ms|miss|smt|shrimati|कुमारी|shreemati|lady)\b/gi
        };

        // Standard Indian Suffixes that imply gender
        this.suffixes = {
            male: ['kumar', 'singh', 'prasad', 'nath', 'ji', 'lal', 'bhagat', 'son'],
            female: ['kumari', 'devi', 'kaur', 'begum', 'shree', 'ben', 'didi']
        };
    }

    predict(input) {
        let fullName = input.toLowerCase().trim();
        let reasons = [];
        let score = { male: 0, female: 0 };

        // 1. DIRECT PREFIX MATCH (Highest Priority)
        if (this.prefixes.male.test(fullName)) {
            return { gender: 'male', confidence: 1.0, reasons: ["Found Male Title (e.g., Mr/Shri)"] };
        }
        if (this.prefixes.female.test(fullName)) {
            return { gender: 'female', confidence: 1.0, reasons: ["Found Female Title (e.g., Mrs/Ms)"] };
        }

        // 2. TOKENIZATION & CORE NAME EXTRACTION
        // Remove dots and split into words
        let parts = fullName.replace(/\./g, '').split(/\s+/);
        
        // Remove titles from the tokens for cleaner analysis
        let cleanTokens = parts.filter(p => 
            !p.match(/^(mr|mrs|ms|shri|smt|kumar|kumari|singh|devi|shree)$/i)
        );
        
        // Core name is usually the first remaining token
        let coreName = cleanTokens[0] || parts[0];

        // 3. DATABASE LOOKUP (Your JSON file)
        if (this.db[coreName]) {
            return { 
                gender: this.db[coreName], 
                confidence: 0.98, 
                reasons: [`Database match for "${coreName}"`] 
            };
        }

        // 4. SUFFIX/SURNAME WEIGHTING
        parts.forEach(part => {
            if (this.suffixes.male.includes(part)) score.male += 1.5;
            if (this.suffixes.female.includes(part)) score.female += 1.5;
        });

        // 5. PATTERN ANALYSIS (Fallback)
        // Female names in India often end in 'a', 'i', or 'ee'
        if (coreName.match(/[aei]$/)) {
            score.female += 1.0;
            reasons.push("Ends in vowel (Common female trait)");
        } else {
            score.male += 0.5;
            reasons.push("Ends in consonant (Common male trait)");
        }

        // Final Decision
        const finalGender = score.male >= score.female ? "male" : "female";
        const confidence = score.male === score.female ? 0.5 : 0.85;

        return { 
            gender: finalGender, 
            confidence: confidence, 
            reasons: reasons.length > 0 ? reasons : ["General pattern match"] 
        };
    }
}