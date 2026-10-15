"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIMINISHERS = exports.INTENSIFIERS = exports.NEGATION_WORDS = exports.SENTIMENT_LEXICON = exports.TOPIC_DEFINITIONS = void 0;
exports.TOPIC_DEFINITIONS = [
    {
        name: 'Shipping & Delivery',
        category: 'Logistics',
        owner: 'Operations',
        keywords: [
            'delivery', 'shipping', 'courier', 'fedex', 'ups', 'dhl', 'usps',
            'carrier', 'tracking', 'dispatch', 'late', 'delayed', 'delay', 'transit',
            'arrived late', 'lost package', 'on time', 'fast shipping', 'slow delivery'
        ],
        patterns: [
            /\b(ship(ped|ping)?|deliver(y|ed)?|courier|tracking|transit|arrived)\b/i,
            /\b(late delivery|shipping delay|slow shipping)\b/i
        ]
    },
    {
        name: 'Packaging & Condition',
        category: 'Fulfillment',
        owner: 'Operations',
        keywords: [
            'packaging', 'package', 'box', 'bubble wrap', 'crushed', 'unboxing',
            'protective', 'wrapped', 'damaged box', 'seal', 'dented', 'scratch',
            'torn', 'open box', 'used item', 'broken seal'
        ],
        patterns: [
            /\b(packag(e|ing)|box|bubble wrap|unboxing|dented|crushed|seal)\b/i
        ]
    },
    {
        name: 'Price & Value',
        category: 'Commercial',
        owner: 'Marketing',
        keywords: [
            'price', 'expensive', 'cheap', 'cost', 'overpriced', 'worth',
            'value', 'deal', 'discount', 'affordable', 'money', 'bargain',
            'rip off', 'waste of money', 'bang for buck', 'good value'
        ],
        patterns: [
            /\b(price|expensive|cheap|cost|overpriced|worth(less)?|value|waste of money)\b/i
        ]
    },
    {
        name: 'Product Quality & Durability',
        category: 'Product',
        owner: 'Quality Engineering',
        keywords: [
            'quality', 'material', 'durability', 'sturdy', 'flimsy', 'broke',
            'crack', 'cracked', 'cheaply made', 'craftsmanship', 'wear and tear',
            'faulty', 'defective', 'fell apart', 'solid build', 'premium feel',
            'stopped working', 'malfunction', 'broken'
        ],
        patterns: [
            /\b(quality|durable|durability|sturdy|flimsy|broke(n)?|crack(ed)?|defective|cheaply made)\b/i
        ]
    },
    {
        name: 'Sizing & Fit',
        category: 'Product Specs',
        owner: 'Product',
        keywords: [
            'size', 'sizing', 'fit', 'small', 'large', 'tight', 'loose',
            'dimension', 'dimensions', 'too big', 'too small', 'measurement',
            'runs large', 'runs small', 'true to size', 'chart', 'measurement'
        ],
        patterns: [
            /\b(size|sizing|fit(s)?|tight|loose|runs (small|large)|too (big|small))\b/i
        ]
    },
    {
        name: 'Customer Support',
        category: 'Support',
        owner: 'Customer Support',
        keywords: [
            'support', 'agent', 'service', 'representative', 'helpdesk',
            'response time', 'unhelpful', 'courteous', 'ticket', 'email reply',
            'call center', 'hold time', 'chat support', 'customer care', 'rep'
        ],
        patterns: [
            /\b(customer (service|care|support)|support agent|representative|helpdesk)\b/i
        ]
    },
    {
        name: 'Returns & Refunds',
        category: 'Policy',
        owner: 'Customer Support',
        keywords: [
            'return', 'returns', 'refund', 'refunds', 'exchange', 'warranty',
            'replacement', 'money back', 'rma', 'restocking fee', 'policy',
            'chargeback', 'refused return'
        ],
        patterns: [
            /\b(return(s|ed|ing)?|refund(ed|s)?|exchange|warranty|money back)\b/i
        ]
    },
    {
        name: 'Usability & Setup',
        category: 'User Experience',
        owner: 'Product',
        keywords: [
            'easy to use', 'setup', 'installation', 'install', 'instructions',
            'manual', 'complicated', 'confusing', 'plug and play', 'intuitive',
            'user friendly', 'difficult to set up', 'clear directions', 'hard to assemble'
        ],
        patterns: [
            /\b(setup|instruction(s)?|manual|assembly|install(ation)?|intuitive|user friendly)\b/i
        ]
    },
    {
        name: 'Battery & Power',
        category: 'Hardware',
        owner: 'Product',
        keywords: [
            'battery', 'charge', 'charging', 'charger', 'battery life',
            'drain', 'draining', 'power adapter', 'battery died', 'holds charge',
            'fast charge'
        ],
        patterns: [
            /\b(batter(y|ies)|charg(e|er|ing)|power adapter)\b/i
        ]
    },
    {
        name: 'Performance & Features',
        category: 'Features',
        owner: 'Product',
        keywords: [
            'performance', 'speed', 'fast', 'slow', 'lag', 'lagging',
            'smooth', 'screen', 'display', 'sound', 'audio', 'bass',
            'bluetooth', 'connectivity', 'app', 'software', 'freeze', 'crash'
        ],
        patterns: [
            /\b(performance|speed|lag(ging)?|smooth|screen|display|audio|sound|bluetooth|connect(ivity)?)\b/i
        ]
    }
];
exports.SENTIMENT_LEXICON = {
    // Strong Positive (+2)
    'excellent': 2.0,
    'outstanding': 2.0,
    'superb': 2.0,
    'fantastic': 2.0,
    'amazing': 2.0,
    'love': 2.0,
    'loved': 2.0,
    'flawless': 2.0,
    'perfect': 2.0,
    'perfectly': 2.0,
    'exceptional': 2.0,
    'masterpiece': 2.0,
    'best': 2.0,
    'brilliant': 2.0,
    'phenomenal': 2.0,
    'thrilled': 2.0,
    'impressive': 2.0,
    // Mild Positive (+1)
    'good': 1.0,
    'great': 1.2,
    'nice': 0.8,
    'decent': 0.6,
    'fine': 0.5,
    'solid': 0.9,
    'durable': 1.0,
    'sturdy': 1.0,
    'helpful': 1.0,
    'friendly': 1.0,
    'satisfied': 1.0,
    'pleased': 1.0,
    'happy': 1.0,
    'recommend': 1.2,
    'worth': 0.9,
    'smooth': 0.8,
    'quick': 0.8,
    'prompt': 0.9,
    'comfortable': 1.0,
    'reliable': 1.1,
    'clean': 0.7,
    'intuitive': 1.0,
    'clear': 0.7,
    'works well': 1.2,
    // Strong Negative (-2)
    'terrible': -2.0,
    'horrible': -2.0,
    'awful': -2.0,
    'dreadful': -2.0,
    'garbage': -2.0,
    'trash': -2.0,
    'junk': -2.0,
    'waste': -1.8,
    'unusable': -2.0,
    'broken': -1.8,
    'defective': -1.8,
    'scam': -2.2,
    'fraud': -2.2,
    'ripoff': -2.0,
    'disaster': -2.0,
    'ruined': -1.9,
    'hate': -1.9,
    'hated': -1.9,
    'disgusted': -2.0,
    'nightmare': -2.0,
    // Mild Negative (-1)
    'bad': -1.0,
    'poor': -1.2,
    'slow': -0.8,
    'late': -1.0,
    'delayed': -1.0,
    'cheap': -0.8,
    'flimsy': -1.1,
    'weak': -0.9,
    'disappointed': -1.2,
    'disappointing': -1.2,
    'frustrated': -1.3,
    'frustrating': -1.3,
    'annoying': -1.0,
    'confusing': -0.9,
    'difficult': -0.8,
    'uncomfortable': -1.0,
    'loose': -0.6,
    'tight': -0.6,
    'missing': -1.1,
    'damaged': -1.4,
    'dented': -0.9,
    'scratched': -0.9,
    'unhelpful': -1.2,
    'rude': -1.5,
    'ignored': -1.2,
    'regret': -1.2,
    'fail': -1.3,
    'failed': -1.4,
    'stopped working': -1.6
};
exports.NEGATION_WORDS = new Set([
    'not', 'no', 'never', 'hardly', 'barely', 'scarcely',
    'rarely', 'seldom', "didn't", "wasn't", "weren't", "isn't",
    "aren't", "don't", "doesn't", "won't", "cannot", "can't",
    "couldn't", "shouldn't", "without"
]);
exports.INTENSIFIERS = {
    'very': 1.4,
    'extremely': 1.6,
    'really': 1.3,
    'super': 1.4,
    'incredibly': 1.5,
    'highly': 1.4,
    'exceptionally': 1.6,
    'totally': 1.3,
    'completely': 1.3,
    'absolutely': 1.5,
    'hugely': 1.4,
    'vastly': 1.3
};
exports.DIMINISHERS = {
    'somewhat': 0.7,
    'slightly': 0.6,
    'a bit': 0.6,
    'a little': 0.6,
    'barely': 0.5,
    'kind of': 0.7,
    'sort of': 0.7
};
