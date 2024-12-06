//-----------Подключаемые модули-----------//
const Syntax = require('./Syntax');
const Token = require('./Token');
//-----------Подключаемые модули-----------//

/**
 * Класс, отвечающий за формирование псевдокода
 */
class Pseudocode {
  /**
  * Функция, которая возвращает псевдокода из получаемого паскаль кода
  */
  static async GetPseudocode(code) {
    let tree = await Syntax.CodeInTree(code);
    let pseudocode = await Pseudocode.TreeInPseudocode(tree);

    console.log(pseudocode);

    return pseudocode;
  }

  /**
   * Функция, которая переводит синтаксического дерево в псевдокод
   */
  static async TreeInPseudocode(tree) {
    if(typeof tree == 'string') return tree;

    let result = "";

    if(tree.token.type == Token.NONTERMINAL) {
      for(let node of tree.nodes) {
        result += await Pseudocode.TreeInPseudocode(node);
      }
    } 
    else {
      result += " ";

      if(tree.token.code == 30 ||
         tree.token.code == 1 ||
         tree.token.code == 3) {
        result += `${tree.token.name}(${tree.token.text})`;
      }
      else if(tree.token.code == 14 || 
              tree.token.code == 28 || 
              tree.token.code == 29 || 
              tree.token.code == 25 ||
              tree.token.code == 24 ||
              tree.token.code == 20) {
        result += `${tree.token.name}\n`;
      }
      else if(tree.token.code == 26) {
        result += `\n ${tree.token.name}\n`;
      }
      else if(tree.token.code == 17 && result[result.length-1] == '\n') {
        result = result.slice(0, -1);
        result += `${tree.token.name}\n`;
      }
      else {
        result += `${tree.token.name}`;
      }
    }

    if(tree.parent == null) {
      let result_str = result.split('\n');
      result = '';
      for(let str of result_str) if(str != ' ') result += str.slice(1) + '\n';
    }

    return result;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Pseudocode;
//-----------Экспортируемые модули-----------//