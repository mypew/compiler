//-----------Подключаемые модули-----------//
const Lexer = require('./Lexer');
const Syntax = require('./Syntax');
//-----------Подключаемые модули-----------//

/**
 * Класс, которые отвечает за вызовы этапов компилирования кода
 */
class Compiler {
  /**
  * Функция для обработки Post запроса к данному классу
  */
  static async Post(message) {
    // Проверяем тип запроса
    switch (message.body.type_request) {
      case 'lexer':
        return await Lexer.CodeInTokens(message.body.code);
      case 'syntax':
        return await Syntax.GetTree(message.body.code);
      default:
        return "Bad type_request";
    }
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Compiler;
//-----------Экспортируемые модули-----------//