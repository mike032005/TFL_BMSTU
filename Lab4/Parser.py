import time
import random
from typing import List, Set, Tuple, Dict, Optional
from functools import lru_cache

class FastAttributeGrammarParser:
    def __init__(self, string: str):
        self.string = string
        self.n = len(string)
        
    def check(self) -> bool:
        s = self.string
        n = self.n
        
        @lru_cache(maxsize=None)
        def parse_T(i: int, j: int) -> frozenset:
            if j - i < 2:
                return frozenset()
            
            result = set()
            
            if j - i == 2 and s[i:j] == "bb":
                result.add(1)
            
            for k in range(i + 1, j - 1):
                if s[k] == 'a':
                    left = parse_T(i, k)
                    right = parse_T(k + 1, j)
                    for v1 in left:
                        for v2 in right:
                            result.add(v1 + v2)
            
            return frozenset(result)
        
        @lru_cache(maxsize=None)
        def parse_S(i: int, j: int) -> frozenset:
            if j - i < 3:
                return frozenset()
            
            result = set()
            s_sub = s[i:j]
            
            if j - i == 3 and s_sub == "aba":
                result.add(1)
            
            if j - i >= 3 and s_sub.startswith("bb"):
                inner = parse_S(i + 2, j)
                if inner:
                    result.add(0)
            
            for a1 in range(i + 1, j - 4):
                if s[a1] != 'a':
                    continue
                
                T1_set = parse_T(i, a1)
                if not T1_set:
                    continue
                
                for a2 in range(a1 + 3, j - 1):
                    if s[a2] != 'a':
                        continue
                    
                    T2_set = parse_T(a2 + 1, j)
                    if not T2_set:
                        continue
                    
                    for mid in range(a1 + 1, a2):
                        S1_set = parse_S(a1 + 1, mid)
                        S2_set = parse_S(mid, a2)
                        
                        common = S1_set.intersection(S2_set)
                        if not common:
                            continue
                        
                        for v1 in T1_set:
                            for v2 in T2_set:
                                result.add(min(v1, v2))
            
            return frozenset(result)
        
        return bool(parse_S(0, n))


def test_parser():
    test_cases = [
        ("aba", True),
        ("bbaba", True),
        ("bbbbaba", True),
        ("bbabbaabaabaabbabb", True),
        ("bbabbabbabbaabaabaabbabbbbabbaabaabaabbabbabbabb", True),
        ("bbabbabbbbbbbbabbaabaabaabbabbbbbbbbbbabbaabaabaabbabbabbabb", True),
        ("bbabbabbbbbbbbabbaabaabaabbabbbbbbbbbbabbabbabbaabaabaabbabbbbabbaabaabaabbabbabbabbabbabb", True),
        ("bbbbbbbbbbbbabbabbabbabbbbbbabbaabaabaabbabbbbbbbbbbbbbbabbaabaabaabbabbabbabbbbabbabbbbababbbbabaabbabbabbabb", True),
    ]
    
    for test_str, expected in test_cases:
        parser = FastAttributeGrammarParser(test_str)
        start_time = time.time()
        result = parser.check()
        end_time = time.time()
        
        belongs = "Да" if result == expected else "Нет (ошибка)"
        time_taken = (end_time - start_time) * 1000
        print(f"Строка длиной {len(test_str)}: {belongs}, Время: {time_taken:.6f} мс")


def stress_test():
    for length in [3,5,7,18,48,60,90,110, 500]:
        random_str = ''.join(random.choice('ab') for _ in range(length))
        parser = FastAttributeGrammarParser(random_str)
        
        start_time = time.time()
        result = parser.check()
        end_time = time.time()
        
        time_taken = (end_time - start_time) * 1000
        print(f"Случайная строка длиной {length}, {result}: Время: {time_taken:.6f} мс")


if __name__ == "__main__":
    print("Тестовые строки:")
    test_parser()
    print("\nСлучайные строки:")
    stress_test()