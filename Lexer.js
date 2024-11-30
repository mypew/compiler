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
    let tokens = [];
    let stack = [];
    let symbol;
    let index = 0;
    let line = 1;
    let line_index = 0;

    while(index <= code.length) {
      if(index != code.length) stack.push(code[index]);

      let token = await Lexer.GetTokenText(stack);

      if(!token && stack.length == 1) {
        return Token.CreateLexerBadToken(stack, line, line_index+1);
      }
      else if(!token || index == code.length ) {
        if(index != code.length) symbol = stack.pop();

        token = await Lexer.GetTokenText(stack);
        
        // Цикл, который проверяет, есть ли альтернативные имена у правила, если да, то меняем(" " -> "пробел")
        for(let rule of token.rules) (await this.ArrayInString(stack)).match(rule.regular) ? rule.alt_name ? token.text = rule.alt_name : token.text = await this.ArrayInString(stack) : null;
        
        token = await Lexer.CreateLexerToken(token, line, line_index, stack.length);

        tokens.push(token);

        if(stack[0] == '\n') {
          line++;
          line_index = 0;
        }
        
        // Обнуляем стэк
        if(index != code.length) {
          stack = [];
          index--;
          line_index--;
        }
      }
      
      index++;
      line_index++;
    }

    return tokens;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Lexer;
//-----------Экспортируемые модули-----------//