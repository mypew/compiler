//-----------Подключаемые модули-----------//
const Token = require('./Token');
//-----------Подключаемые модули-----------//

/**
 * Класс, отвечающий за лексический анализ кода и перевода его из потока символов в поток токенов
 */
class Lexer extends Token {
  /**
  * Функция, которая переводит код из его первоначального вида в поток токенов
  */
  static async CodeInTokens(code) {
    // Массив токенов
    let tokens = [];
    // Стэк символов
    let stack = [];
    // Символ
    let symbol;
    // Индекс символа в потоке символов
    let index = 0;
    // Строка, на которой мы находимся
    let line = 1;
    // Индекс символа в строке
    let line_index = 0;

    while(index <= code.length) {
      // добавляем в стек символов символ из потока по индексу, если он не достиг конца
      if(index != code.length) stack.push(code[index]);

      // Получаем токен на основе стека символов
      let token = await Lexer.GetTokenText(stack);

      // Если токен не найден и размер стэка 1, то возвращаем ошибочный токен
      if(!token && stack.length == 1) {
        return Token.CreateLexerBadToken(stack, line, line_index+1);
      }
      // Если токен не найден или мы дошли до конца
      else if(!token || index == code.length ) {
        // Возвращаемся на шаг назад если не достигли конца
        if(index != code.length) symbol = stack.pop();

        // Получаем правило на основе стека символов
        token = await Lexer.GetTokenText(stack);
        
        // Цикл, который проверяет, есть ли альтернативные имена у правила, если да, то меняем(" " -> "пробел")
        for(let rule of token.rules) (await this.ArrayInString(stack)).match(rule.regular) ? rule.alt_name ? token.text = rule.alt_name : token.text = await this.ArrayInString(stack) : null;
        
        // Формируем токен под стандарты лексера
        token = await Lexer.CreateLexerToken(token, line, line_index, stack.length);

        // Добавляем токен
        tokens.push(token);

        // Если мы достигли конца строки, то переходим на новую
        if(stack[0] == '\n') {
          line++;
          line_index = 0;
        }
        
        // Очищаем стэк и уходим на шаг назад
        if(index != code.length) {
          stack = [];
          index--;
          line_index--;
        }
      }
      
      // Увеличиваем шаг на один
      index++;
      line_index++;
    }

    return tokens;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Lexer;
//-----------Экспортируемые модули-----------//