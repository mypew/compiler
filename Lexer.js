//-----------Подключаемые модули-----------//
//-----------Подключаемые модули-----------//

/**
 * Класс, отвечающий за лексический анализ кода и перевода его из потока символов в поток токенов
 */
class Lexer {
  /** Константы */
  // Итератор
  static get #ITERATOR() {return{
    count: 0,
    line: 1,
    line_point: 0,
    stack: ""
  }};
  // Массив правил лексического анализа
  static get #RULES() {return [
    {code: 0, name: "разделитель", requests: [{request: / /, alt_name: "пробел"}, 
                                            {request: /\n/, alt_name: "переход_строки"}, 
                                            {request: /\t/, alt_name: "знак_табуляции"}]},
    {code: 1, name: "целое_число", requests: [{request: /\d*/, alt_name: null}]},
    {code: 2, name: "число_с_плавающей_точкой", requests: [{request: /\d*\.\d*/, alt_name: null}]},
    {code: 3, name: "строка", requests: [{request: /\'.*\'|\'[^']*/, alt_name: null}]},
    {code: 4, name: "оператор_присваивания", requests: [{request: ':=', alt_name: null}]},
    {code: 5, name: "оператор_сложения", requests: [{request: /\+/, alt_name: null}]},
    {code: 6, name: "оператор_вычитания", requests: [{request: '-', alt_name: null}]},
    {code: 7, name: "оператор_умножения", requests: [{request: /\*/, alt_name: null}]},
    {code: 8, name: "оператор_деления", requests: [{request: '/', alt_name: null}]},
    {code: 9, name: "оператор_больше", requests: [{request: '>', alt_name: null}]},
    {code: 10, name: "оператор_меньше", requests: [{request: '<', alt_name: null}]},
    {code: 11, name: "оператор_сравнения", requests: [{request: '=', alt_name: null}]},
    {code: 12, name: "оператор_круглая_открывающая_скобка", requests: [{request: /\(/, alt_name: null}]},
    {code: 13, name: "оператор_круглая_закрывающая_скобка", requests: [{request: /\)/, alt_name: null}]},
    {code: 14, name: "оператор_конца", requests: [{request: ';', alt_name: null}]},
    {code: 15, name: "оператор_последовательности_действий", requests: [{request: ',', alt_name: null}]},
    {code: 16, name: "оператор_двоеточие", requests: [{request: ':', alt_name: null}]},
    {code: 17, name: "оператор_точка", requests: [{request: /\./, alt_name: null}]},
    {code: 18, name: "тип_данных_строковый", requests: [{request: 'string', alt_name: null}]},
    {code: 19, name: "тип_данных_целочисленный", requests: [{request: 'integer', alt_name: null}]},
    {code: 20, name: "тип_данных_дробный", requests: [{request: 'float', alt_name: null}]},
    {code: 21, name: "синтаксическая_конструкция_если", requests: [{request: 'if', alt_name: null}]},
    {code: 22, name: "синтаксическая_конструкция_иначе", requests: [{request: 'else', alt_name: null}]},
    {code: 23, name: "синтаксическая_конструкция_пока", requests: [{request: 'while', alt_name: null}]},
    {code: 24, name: "синтаксическая_конструкция_делать", requests: [{request: 'do', alt_name: null}]},
    {code: 25, name: "синтаксическая_конструкция_начать", requests: [{request: 'begin', alt_name: null}]},
    {code: 26, name: "синтаксическая_конструкция_конец", requests: [{request: 'end', alt_name: null}]},
    {code: 27, name: "синтаксическая_конструкция_программа", requests: [{request: 'program', alt_name: null}]},
    {code: 28, name: "синтаксическая_конструкция_переменная", requests: [{request: 'var', alt_name: null}]},
    {code: 29, name: "синтаксическая_конструкция_константа", requests: [{request: 'const', alt_name: null}]},
    {code: 30, name: "идентификатор", requests: [{request: /[a-zA-Z_][a-zA-Z0-9_]*/, alt_name: null}]},
  ]};

  /**
  * Функция, которая переводит код из его первоначального вида в поток лексем
  */
  static async GetTokens(code) {
    let tokens = [];
    let rule;
    let iterator = this.#ITERATOR;
    let stack; // стек символов

    while(iterator.count <= code.length) {
      // добавляем в стек символов символ из потока по индексу count, если он не достиг конца
      stack = (iterator.count != code.length) ? iterator.stack + code[iterator.count] : iterator.stack;

      // Получаем подходящее правило на основе стека символов, либо null
      rule = await this.#SearchRule(stack);

      // Если правило найдено и мы не достигли конца или на прошлом шаге стэк был пуст, то заменяем стек символов прошлого шага на нынешний
      if(rule && iterator.count != code.length || iterator.stack.length == 0) {
        iterator.stack = stack;
      }
      // Иначе берём стек символов прошлого шага и проверяем
      else {
        // Получаем правило на основе стека символов с прошлого шага
        rule = await this.#SearchRule(iterator.stack);

        // Если правило ровно null и размер стека равен 1, то возвращаем ошибочную лексему(проверка на неизвестный символ)
        if (!rule && iterator.stack.length == 1) {
          return this.#GetBadToken(iterator, iterator.stack);
        }
        
        // Цикл, который проверяет, есть ли альтернативные имена у правила, если да, то меняем(" " -> "пробел")
        for(let req of rule.requests) iterator.stack.match(req.request) ? req.alt_name ? rule.text = req.alt_name : rule.text = iterator.stack : null;
        
        // Формируем лексему из правила и добавляем в массив лексем
        await this.#SetToken(tokens, rule, iterator);

        // Если мы достигли конца строки, то переходим на новую
        if(iterator.stack == '\n') {
          iterator.line++;
          iterator.line_point = 0;
        }
        
        // Если мы не достигли конца потока символов, то обнуляем стек символов прошлого шага
        iterator.stack = (iterator.count != code.length) ? code[iterator.count] : '';
      }
      
      // Увеличиваем шаг на один
      iterator.count++;
      iterator.line_point++;
    }

    return tokens;
  }

  /**
  * Функция, которая ищет первое правило, для которого входящий стэк является истинным
  */
  static async #SearchRule(stack) {
    // Перебираем все правила
    for(let rule of this.#RULES) {
      // Перебираем все запросы
      for(let req of rule.requests) {
        // Получаем строку по запросу
        let match = stack.match(req.request);
        // Если строка идентична стэку, то возвращаем правило
        if(match && match[0] == stack) return rule;
      }
    }

    return null;
  }

  /**
  * Функция, которая добавлет токен в массив токенов
  */
  static async #SetToken(tokens, rule, iterator) {
    tokens.push({line: iterator.line, code: rule.code, code_name: rule.name, text: rule.text, symbols: `С ${iterator.line_point+1-iterator.stack.length} по ${iterator.line_point} символ`});
  }

  /**
  * Функция, которая возвращает лексему ошибку
  */
  static async #GetBadToken(iterator, string) {
    return [{line: iterator.line, code: -1, code_name: "error_lexical", text: string, symbols: `С ${iterator.line_point} по ${iterator.line_point} символ`}];
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Lexer;
//-----------Экспортируемые модули-----------//