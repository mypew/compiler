//-----------Подключаемые модули-----------//
const Lexer = require('./Lexer');
const Tree = require('./Tree');
//-----------Подключаемые модули-----------//

/**
 * Класс, отвечающий за синтаксический анализ потока токенов и перевода его в синтаксическое дерево
 */
class Syntax extends Lexer {
  /**
  * Функция, которая возвращает синтаксическое дерево из текста кода
  */
  static async CodeInTree(code) {
    // Получаем массив токенов из массива символов
    let tokens = await Syntax.CodeInTokens(code);
    // Создаем дерево, задавая ему родительский узел токен "программа"
    let tree = new Tree(await Syntax.GetToken(31), null);

    // Перебор всех токенов
    for(let token of tokens) {
      // Отбрасываем все разделители
      if(token.code != 0) {
        // Добавляем токен в дерево
        tree = await Tree.AddToken(tree, token);
      }
    }

    // Проверяем дерево на ошибки
    tree = Tree.ErrorCheck(tree);

    return tree;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Syntax;
//-----------Экспортируемые модули-----------//