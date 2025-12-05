import string

# 54 was the best compromise based on the names tried
SIMILARITY_LIMIT = 54
TYPO_PENALTY = 10
MISMATCH_PENALTY = 25

def tokenize(str):
    str = str.lower().replace("/", " ").replace("-", " ").strip()
    table = str.maketrans("", "", string.punctuation)

    return str.translate(table).split()

def character_frequency(str):
    frequency = {}

    for char in str:
        frequency[char] = frequency.get(char, 0) + 1

    return frequency

def similarity(token_1, token_2):
    frequency_1 = character_frequency(token_1)
    frequency_2 = character_frequency(token_2)

    all_characters = set(frequency_1) | set(frequency_2)
    difference = sum(abs(frequency_1.get(char, 0) - frequency_2.get(char, 0)) for char in all_characters)

    frequency_score = 1 - difference / (len(token_1) + len(token_2))

    matches = sum(1 for i in range(min(len(token_1), len(token_2))) if token_1[i] == token_2[i])
    positional_score = matches / max(len(token_1), len(token_2))

    return (frequency_score * 0.6 + positional_score * 0.4)

def fuzzy_match(tokens_1, tokens_2):
    tokens_1_set, tokens_2_set = set(tokens_1), set(tokens_2)

    matched_tokens = tokens_1_set & tokens_2_set
    tokens_1_unmatched = list(tokens_1_set - matched_tokens)
    tokens_2_unmatched = list(tokens_2_set - matched_tokens)

    penalties = 0
    tokens_2_matched = set()

    for i, token_a in enumerate(tokens_1_unmatched):
        best_token = None
        best_score = 0

        for k, token_b in enumerate(tokens_2_unmatched):
            if k in tokens_2_matched:
                continue

            similarity_score = similarity(token_a, token_b)
            is_initial_match = (len(token_a) == 1 and token_b.startswith(token_a)) or (len(token_b) == 1 and token_a.startswith(token_b))
            is_abbreviation_match = (token_a in token_b) or (token_b in token_a)

            penalty_to_apply = 0

            if is_abbreviation_match:
                best_token = k
                best_score = 1

            elif is_initial_match:
                best_token = k
                best_score = 1

            elif similarity_score >= (SIMILARITY_LIMIT / 100) and similarity_score > best_score:
                best_token = k
                best_score = similarity_score
                penalty_to_apply = TYPO_PENALTY

        if best_token is not None:
            tokens_2_matched.add(best_token)
            matched_tokens.add(token_a)
            penalties += penalty_to_apply

    remaining_tokens = (len(tokens_1_unmatched) + len(tokens_2_unmatched)) - 2 * len(tokens_2_matched)
    penalties += remaining_tokens * MISMATCH_PENALTY

    base_score = len(matched_tokens) / max(len(tokens_1_set), len(tokens_2_set))
    final_score = max(0, base_score * 100 - penalties)

    return round(final_score, 2)

def main(str_1, str_2):
    token_1 = tokenize(str_1)
    token_2 = tokenize(str_2)

    score = fuzzy_match(token_1, token_2)
    print(score)

    return score

main("1/2/1997", "1/2/97")
