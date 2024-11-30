//-----------Подключаемые модули-----------//
const Syntax = require('./Syntax');
const Tree = require('./Tree');
//-----------Подключаемые модули-----------//

/**
 * Класс, которые отвечает за вызовы этапов компилирования кода
 */
class Compiler extends Syntax {
  /**
  * Функция для обработки Post запроса к данному классу
  */
  static async Post(message) {
    // Проверяем тип запроса
    switch (message.body.type_request) {
      case 'lexer':
        return await Compiler.CodeInTokens(message.body.code);
      case 'syntax':
        return await Tree.StrTree(await Compiler.CodeInTree(message.body.code), 0);
      default:
        return "Bad type_request";
    }
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Compiler;
//-----------Экспортируемые модули-----------//