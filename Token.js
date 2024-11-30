//-----------Подключаемые модули-----------//
//-----------Подключаемые модули-----------//

/**
 * Класс, отвечающий за токены(лексемы)
 */
class Token {
  // Терминальный тип токена(полноценный токен)
  static get TERMINAL() {return 0};
  // Нетерминальный тип токена(токен, состоящий из нескольки токенов)
  static get NONTERMINAL() {return 1};
  // Таблица всех возможных видов токенов и их правила формирования
  static get #TABLE_TOKENS() {return [
    {code: 0,   name: "разделитель",                          type: Token.TERMINAL,    rules: [{regular: / /,      alt_name: "пробел"}, {regular: /\n/, alt_name: "переход_строки"}, {regular: /\t/, alt_name: "знак_табуляции"}]},
    {code: 1,   name: "целое_число",                          type: Token.TERMINAL,    rules: [{regular: /\d*/,    alt_name: null}]},
    {code: 2,   name: "число_с_плавающей_точкой",             type: Token.TERMINAL,    rules: [{regular: "nety$",   alt_name: null}]},
    {code: 3,   name: "строка",                               type: Token.TERMINAL,    rules: [{regular: /\'.*\'|\'[^']*/, alt_name: null}]},
    {code: 4,   name: "оператор_присваивания",                type: Token.TERMINAL,    rules: [{regular: ':=',     alt_name: null}]},
    {code: 5,   name: "оператор_сложения",                    type: Token.TERMINAL,    rules: [{regular: /\+/,     alt_name: null}]},
    {code: 6,   name: "оператор_вычитания",                   type: Token.TERMINAL,    rules: [{regular: '-',      alt_name: null}]},
    {code: 7,   name: "оператор_умножения",                   type: Token.TERMINAL,    rules: [{regular: /\*/,     alt_name: null}]},
    {code: 8,   name: "оператор_деления",                     type: Token.TERMINAL,    rules: [{regular: '/',      alt_name: null}]},
    {code: 9,   name: "оператор_больше",                      type: Token.TERMINAL,    rules: [{regular: '>',      alt_name: null}]},
    {code: 10,  name: "оператор_меньше",                      type: Token.TERMINAL,    rules: [{regular: '<',      alt_name: null}]},
    {code: 11,  name: "оператор_сравнения",                   type: Token.TERMINAL,    rules: [{regular: '=',      alt_name: null}]},
    {code: 12,  name: "оператор_круглая_открывающая_скобка",  type: Token.TERMINAL,    rules: [{regular: /\(/,     alt_name: null}]},
    {code: 13,  name: "оператор_круглая_закрывающая_скобка",  type: Token.TERMINAL,    rules: [{regular: /\)/,     alt_name: null}]},
    {code: 14,  name: "оператор_конца",                       type: Token.TERMINAL,    rules: [{regular: ';',      alt_name: null}]},
    {code: 15,  name: "оператор_последовательности_действий", type: Token.TERMINAL,    rules: [{regular: ',',      alt_name: null}]},
    {code: 16,  name: "оператор_двоеточие",                   type: Token.TERMINAL,    rules: [{regular: ':',      alt_name: null}]},
    {code: 17,  name: "оператор_точка",                       type: Token.TERMINAL,    rules: [{regular: /\./,     alt_name: null}]},
    {code: 18,  name: "тип_данных_строковый",                 type: Token.TERMINAL,    rules: [{regular: 'string',   alt_name: null}]},
    {code: 19,  name: "тип_данных_целочисленный",             type: Token.TERMINAL,    rules: [{regular: 'integer',  alt_name: null}]},
    {code: 20,  name: "синтаксическая_конструкция_затем",     type: Token.TERMINAL,    rules: [{regular: 'then',   alt_name: null}]},
    {code: 21,  name: "синтаксическая_конструкция_если",      type: Token.TERMINAL,    rules: [{regular: 'if',     alt_name: null}]},
    {code: 22,  name: "синтаксическая_конструкция_иначе",     type: Token.TERMINAL,    rules: [{regular: 'else',   alt_name: null}]},
    {code: 23,  name: "синтаксическая_конструкция_пока",      type: Token.TERMINAL,    rules: [{regular: 'while',  alt_name: null}]},
    {code: 24,  name: "синтаксическая_конструкция_делать",    type: Token.TERMINAL,    rules: [{regular: 'do',     alt_name: null}]},
    {code: 25,  name: "синтаксическая_конструкция_начать",    type: Token.TERMINAL,    rules: [{regular: 'begin',  alt_name: null}]},
    {code: 26,  name: "синтаксическая_конструкция_конец",     type: Token.TERMINAL,    rules: [{regular: 'end',    alt_name: null}]},
    {code: 27,  name: "синтаксическая_конструкция_программа", type: Token.TERMINAL,    rules: [{regular: 'program', alt_name: null}]},
    {code: 28,  name: "синтаксическая_конструкция_переменная",type: Token.TERMINAL,    rules: [{regular: 'var',    alt_name: null}]},
    {code: 29,  name: "синтаксическая_конструкция_константа", type: Token.TERMINAL,    rules: [{regular: 'const',  alt_name: null}]},
    {code: 30,  name: "идентификатор",                        type: Token.TERMINAL,    rules: [{regular: /[a-zA-Z_][a-zA-Z0-9_]*/, alt_name: null}]},
    {code: 31,  name: "программа",                            type: Token.NONTERMINAL, rules: [[32,33,34,35]             ]},
    {code: 32,  name: "имя_программы",                        type: Token.NONTERMINAL, rules: [[27,30,14]                ]},
    {code: 33,  name: "раздел_констант",                      type: Token.NONTERMINAL, rules: [[29,36], [33,36]          ]},
    {code: 34,  name: "раздел_переменных",                    type: Token.NONTERMINAL, rules: [[28,37], [34,37]          ]},
    {code: 35,  name: "тело_программы",                       type: Token.NONTERMINAL, rules: [[25,38,51,17]             ]},
    {code: 36,  name: "объявление_константы",                 type: Token.NONTERMINAL, rules: [[30,16,39,14]             ]},
    {code: 37,  name: "присвоение_типа",                      type: Token.NONTERMINAL, rules: [[40,16,41,14]             ]},
    {code: 38,  name: "операции",                             type: Token.NONTERMINAL, rules: [[42], [38,14,42]          ]},
    {code: 39,  name: "присвоение_значения_константе",        type: Token.NONTERMINAL, rules: [[19,11,1], [18,11,3]      ]},
    {code: 40,  name: "блок_идентификаторов",                 type: Token.NONTERMINAL, rules: [[30], [40,15,30]          ]},
    {code: 41,  name: "тип_данных",                           type: Token.NONTERMINAL, rules: [[19], [18]                ]},
    {code: 42,  name: "операция",                             type: Token.NONTERMINAL, rules: [[43], [44], [45]          ]},
    {code: 43,  name: "присваивание",                         type: Token.NONTERMINAL, rules: [[30,4,52]                 ]},
    {code: 44,  name: "цикл",                                 type: Token.NONTERMINAL, rules: [[23,48,24,49]             ]},
    {code: 45,  name: "условие",                              type: Token.NONTERMINAL, rules: [[46]                      ]},
    {code: 46,  name: "раздел_условия",                       type: Token.NONTERMINAL, rules: [[21,48,20,49], [46,22,49] ]},
    {code: 47,  name: "данные",                               type: Token.NONTERMINAL, rules: [[1], [3], [30]            ]},
    {code: 48,  name: "выражение",                            type: Token.NONTERMINAL, rules: [[12,47,50,47,13]          ]},
    {code: 49,  name: "блок_кода",                            type: Token.NONTERMINAL, rules: [[42], [25,38,51]          ]},
    {code: 50,  name: "оператор_сравнения",                   type: Token.NONTERMINAL, rules: [[9], [10], [11]           ]},
    {code: 51,  name: "конструкция_конец",                    type: Token.NONTERMINAL, rules: [[26], [14,26]             ]},        
    {code: 52,  name: "значение",                             type: Token.NONTERMINAL, rules: [[47], [52,53,47]          ]},   
    {code: 53,  name: "арифметический_оператор",              type: Token.NONTERMINAL, rules: [[8], [7], [6], [5]        ]}
  ]};

  /**
  * Возвращает токен из таблицы токенов по его коду
  */
  static async GetToken(code) {
    return Token.#TABLE_TOKENS[code];
  }

  /**
  * Возвращает токен из таблицы токенов по тексту
  */
  static async GetTokenText(text) {
    // Если текст является массивом символов, то переводим в строку
    if(typeof text == "object") text = await Token.ArrayInString(text);

    for(let token of Token.#TABLE_TOKENS) {
      for(let rule of token.rules) {
        let match = text.match(rule.regular);
        if(match && match[0] == text) return token;
      }
    }

    return null;
  }

  /**
  * Возвращает токен из таблицы токенов по его коду
  */
  static async CreateLexerToken(token, line, line_index, length) {
    delete token.rules;
    token.line = line;
    token.symbols = `с ${line_index+1-length} по ${line_index} символ`;

    return token;
  }

  /**
  * Возвращает токен из таблицы токенов по его коду
  */
  static async CreateLexerBadToken(stack, line, line_index) {
    return {code: -1, name: "лексическая_ошибка", type: -1, text: await Token.ArrayInString(stack), line: line, symbols: `С ${line_index} по ${line_index} символ`};
  }

  /**
  * Переводит массив символов в строку
  */
  static async ArrayInString(array) {
    let result = "";

    for(let symbol of array) {
      result += symbol;
    }

    return result;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Token;
//-----------Экспортируемые модули-----------//