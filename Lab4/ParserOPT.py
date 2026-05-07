import time
import random

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
        
        #Основной цикл работы 
        while True:
            # S -> bbS
            self._apply_bbS_rule()
            
            if self._count_s() == 1 and len(self.string) == 1:
                return True

            # Ищем первую позицию SS
            ss_pos = self._find_ss_position()
            
            if ss_pos is None:
                return False
            
            # Проверяем атрибуты двух S
            if self.attributes.get(ss_pos, 0) != self.attributes.get(ss_pos + 1, 0):
                return False
            
            # Выполняем подалгоритм
            result = self._process_ss(ss_pos)
            if not result:
                return False
            
            #  S -> bbS
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
        # Ищем конструкции 'bba' слева
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
        
        # Ищем конструкции 'abb' справа
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


def test_parser():
    parser = AttributeGrammarParser()
    
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
        parser = AttributeGrammarParser()
        start_time = time.time()
        result = parser.parse(test_str)
        end_time = time.time()
        
        belongs = "Да" if result == expected else "Нет (ошибка)"
        time_taken = (end_time - start_time) * 1000  # в миллисекундах
        print(f"Строка длиной {len(test_str)}: {belongs}, Время: {time_taken:.6f} мс")


def stress_test():
    parser = AttributeGrammarParser()
    
    for length in [3,5,7,18,48,60,90,110, 500]:
        random_str = ''.join(random.choice('ab') for _ in range(length))
        
        start_time = time.time()
        result = parser.parse(random_str)
        end_time = time.time()
        
        time_taken = (end_time - start_time) * 1000  # в миллисекундах
        print(f"Случайная строка длиной {length}, {result} Время: {time_taken:.6f} мс")


if __name__ == "__main__":
    print("Тестовые строки:")
    test_parser()
    print("\nСлучайные строки:")
    stress_test()