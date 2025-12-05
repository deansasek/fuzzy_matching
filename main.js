const SIMILARITY_LIMIT = 54;
const TYPO_PENALTY = 10;
const MISMATCH_PENALTY = 25;

function tokenize(str) {
    str = str.toLowerCase().replace(/\//g, " ").replace(/-/g, " ").trim();
    
    str = str.replace(/[!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]/g, "");

    return str.split(/\s+/).filter(token => token.length > 0);
}

function character_frequency(str) {
    const freq = {};
    for (const c of str) {
        freq[c] = (freq[c] || 0) + 1;
    }
    return freq;
}

function similarity(token_1, token_2) {
    const freq_1 = character_frequency(token_1);
    const freq_2 = character_frequency(token_2);
    
    const all_characters = new Set([...Object.keys(freq_1), ...Object.keys(freq_2)]);
    
    let difference = 0;
    for (const c of all_characters) {
        const count_1 = freq_1[c] || 0;
        const count_2 = freq_2[c] || 0;
        difference += Math.abs(count_1 - count_2);
    }

    const frequency_score = 1 - difference / (token_1.length + token_2.length);

    const min_len = Math.min(token_1.length, token_2.length);
    const max_len = Math.max(token_1.length, token_2.length);
    let matches = 0;
    for (let i = 0; i < min_len; i++) {
        if (token_1[i] === token_2[i]) {
            matches++;
        }
    }
    const positional_score = matches / max_len;

    return (frequency_score * 0.6 + positional_score * 0.4);
}

function fuzzy_match(tokens_1, tokens_2) {
    const tokens_1_set = new Set(tokens_1);
    const tokens_2_set = new Set(tokens_2);

    const matched_tokens = new Set();
    tokens_1_set.forEach(token => {
        if (tokens_2_set.has(token)) {
            matched_tokens.add(token);
        }
    });

    const tokens_1_unmatched = Array.from(tokens_1_set).filter(token => !matched_tokens.has(token));
    const tokens_2_unmatched = Array.from(tokens_2_set).filter(token => !matched_tokens.has(token));

    let penalties = 0;
    const tokens_2_matched = new Set();

    for (const token_a of tokens_1_unmatched) {
        let best = null;
        let best_score = 0;
        let penalty_to_apply = 0;

        for (let k = 0; k < tokens_2_unmatched.length; k++) {
            if (tokens_2_matched.has(k)) {
                continue;
            }
            
            const token_b = tokens_2_unmatched[k];
            const similarity_score = similarity(token_a, token_b);
            
            const is_initial_match = (token_a.length === 1 && token_b.startsWith(token_a)) || (token_b.length === 1 && token_a.startsWith(token_b));
            const is_abbreviation_match = (token_a.includes(token_b)) || (token_b.includes(token_a));

            if (is_abbreviation_match) {
                best = k;
                best_score = 1;
            } 
            
            else if (is_initial_match) {
                best = k;
                best_score = 1;
            } 
            
            else if (similarity_score >= (SIMILARITY_LIMIT / 100) && similarity_score > best_score) {
                best = k;
                best_score = similarity_score;
                penalty_to_apply = TYPO_PENALTY;
            }

        }

        if (best !== null) {
            tokens_2_matched.add(best);
            matched_tokens.add(token_a);
            penalties += penalty_to_apply;
        }
    }

    const remaining_tokens = (tokens_1_unmatched.length + tokens_2_unmatched.length) - 2 * tokens_2_matched.size;
    penalties += remaining_tokens * MISMATCH_PENALTY;

    const tokens_1_size = tokens_1_set.size;
    const tokens_2_size = tokens_2_set.size;

    const base = matched_tokens.size / Math.max(tokens_1_size, tokens_2_size);
    const score = Math.max(0, base * 100 - penalties);

    return Math.round(score * 100) / 100;
}

function main(str_1, str_2) {
    const token_1 = tokenize(str_1);
    const token_2 = tokenize(str_2);

    const score = fuzzy_match(token_1, token_2);
    console.log(score);

    return score;
}

main("1/2/1997", "1/2/97");
