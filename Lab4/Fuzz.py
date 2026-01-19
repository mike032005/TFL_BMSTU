import time
import random
from typing import List, Tuple
from functools import lru_cache

class AttributeGrammarParser:
    def __init__(self):
        self.string = None
        self.attributes = {}
        
    def parse(self, input_str):
        self.string = list(input_str)
        self.attributes = {}
        
        self._replace_aba()
        
        if self._count_s() == 1 and len(self.string) == 1:
            return True
        
        if self._has_aa():
            return False
        
        self._init_attributes()
        
        while True:
            self._apply_bbS_rule()
            
            if self._count_s() == 1 and len(self.string) == 1:
                return True

            ss_pos = self._find_ss_position()
            
            if ss_pos is None:
                return False
            
            if self.attributes.get(ss_pos, 0) != self.attributes.get(ss_pos + 1, 0):
                return False
            
            result = self._process_ss(ss_pos)
            if not result:
                return False
            
            self._apply_bbS_rule()
            
            if self._count_s() == 1 and len(self.string) == 1:
                return True
    
    def _replace_aba(self):
        i = 0
        while i < len(self.string) - 2:
            if (self.string[i] == 'a' and 
                self.string[i + 1] == 'b' and 
                self.string[i + 2] == 'a'):
                self.string[i:i + 3] = ['S']
            else:
                i += 1
    
    def _has_aa(self):
        for i in range(len(self.string) - 1):
            if self.string[i] == 'a' and self.string[i + 1] == 'a':
                return True
        return False
    
    def _init_attributes(self):
        for i, char in enumerate(self.string):
            if char == 'S':
                self.attributes[i] = 1
    
    def _count_s(self):
        return sum(1 for char in self.string if char == 'S')
    
    def _apply_bbS_rule(self):
        i = 0
        while i < len(self.string):
            if self.string[i] == 'S':
                b_count = 0
                j = i - 1
                while j >= 0 and self.string[j] == 'b':
                    b_count += 1
                    j -= 1
                
                if b_count % 2 == 0:
                    if b_count == 0 or (j >= 0 and (self.string[j] == 'a' or self.string[j] == 'S')) or j < 0:
                        start_pos = i - b_count
                        self.string[start_pos:i + 1] = ['S']
                        self.attributes[start_pos] = 0
                        self._update_attributes_after_change(start_pos, b_count + 1, 1)
                        i = start_pos
            i += 1
    
    def _find_ss_position(self):
        for i in range(len(self.string) - 1):
            if self.string[i] == 'S' and self.string[i + 1] == 'S':
                return i
        return None
    
    def _process_ss(self, ss_pos):
        KL = 0
        iL = ss_pos - 1
        
        while iL >= 2:
            if (self.string[iL - 2] == 'b' and 
                self.string[iL - 1] == 'b' and 
                self.string[iL] == 'a'):
                KL += 1
                iL -= 3
            else:
                break
        
        KR = 0
        iR = ss_pos + 2
        
        while iR <= len(self.string) - 3:
            if (self.string[iR] == 'a' and 
                self.string[iR + 1] == 'b' and 
                self.string[iR + 2] == 'b'):
                KR += 1
                iR += 3
            else:
                break
        
        if KL > KR:
            iL += (KL - KR) * 3
        elif KR > KL:
            if iR != len(self.string) or (self.string[iL] == 'S') or (self.string.count('S') > 2):
                iR -= (KR - KL) * 3
        
        if iL+1 < 0 or iR > len(self.string) or iL >= iR:
            return False
        
        new_attr = min(KL, KR) if KL > 0 and KR > 0 else 0
        self.string[iL+1:iR] = ['S']
        self.attributes[iL] = new_attr
        old_length = iR - iL
        self._update_attributes_after_change(iL, old_length, 1)
        
        return True
    
    def _update_attributes_after_change(self, pos, old_length, new_length):
        shift = new_length - old_length
        new_attributes = {}
        
        for attr_pos, attr_value in self.attributes.items():
            if attr_pos < pos:
                new_attributes[attr_pos] = attr_value
            elif attr_pos >= pos + old_length:
                new_attributes[attr_pos + shift] = attr_value
        
        self.attributes = new_attributes


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


def run_fuzz_tests():
    """Запуск fuzz-тестирования двух парсеров"""
    
    fixed_test_cases = [
        ("aba", True),
        ("bbaba", True),
        ("bbbbaba", True),
        ("bbabbaabaabaabbabb", True),
        ("bbabbabbabbaabaabaabbabbbbabbaabaabaabbabbabbabb", True),
        ("bbabbabbbbbbbbabbaabaabaabbabbbbbbbbbbabbaabaabaabbabbabbabb", True),
        ("bbabbabbbbbbbbabbaabaabaabbabbbbbbbbbbabbabbabbaabaabaabbabbbbabbaabaabaabbabbabbabbabbabb", True),
        ("bbbbbbbbbbbbabbabbabbabbbbbbabbaabaabaabbabbbbbbbbbbbbbbabbaabaabaabbabbabbabbbbabbabbbbababbbbabaabbabbabbabb", True),
    ]
    
    random.seed(42)  
    random_test_cases = []
    
    for _ in range(50):
        length = random.randint(3, 100)
        random_str = ''.join(random.choice('ab') for _ in range(length))
        random_test_cases.append((random_str, None))
    
    all_match = True
    
    for test_str, expected in fixed_test_cases:
        parser1 = AttributeGrammarParser()
        result1 = parser1.parse(test_str)
        
        parser2 = FastAttributeGrammarParser(test_str)
        result2 = parser2.check()
        
        if result1 != result2:
            all_match = False
            break
    
    if all_match:
        for test_str, _ in random_test_cases:
            parser1 = AttributeGrammarParser()
            result1 = parser1.parse(test_str)
            
            parser2 = FastAttributeGrammarParser(test_str)
            result2 = parser2.check()
            
            if result1 != result2:
                all_match = False
                break
    
    if all_match:
        print("Совпало все")
    else:
        print("Не совпало")


if __name__ == "__main__":
    run_fuzz_tests()