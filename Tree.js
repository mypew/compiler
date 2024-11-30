//-----------Подключаемые модули-----------//
//-----------Подключаемые модули-----------//

const Token = require("./Token");

/**
 * Класс, который собирает дерево токенов
 */
class Tree {
  static first_error = null;

  constructor(token, parent) {
    this.parent = parent;
    this.nodes = [];
    this.token = token;
    this.stack = [];
    this.rule_number = 0;
  }

  static async AddToken(tree, token) {
    // Массив правила формирования нетерминального токена
    let rule;

    if(token) tree.stack.push(token);

    // Условие выполняется, если ни одно из правил узла не подошло
    if(tree.rule_number == tree.token.rules.length) {
      if(tree.parent) {
        if(token) {
          if(tree.stack[0].code != tree.token.code) {
            // Переходим на шаг вправо по правилам узла
            tree.parent.rule_number++;
            tree.parent.nodes.pop();
          }
          tree.stack.pop();
        }
        // Передаем имеющиеся токены в стеке узла родителю
        tree.parent.stack = [].concat(tree.parent.stack, tree.stack);
        tree = tree.parent;
        tree = await Tree.AddToken(tree, token);
        return tree;
      }
      else {
        return tree;
      }
    }
    else {
      rule = tree.token.rules[tree.rule_number];
    }

    // Перебираем правила
    for(let i = 0; i < rule.length; i++) {
      // Условие выполняется, если правило не может быть выполнено
      if(tree.stack.length == 0 ||
         rule[i] != tree.stack[i].code && (await Token.GetToken(rule[i])).type == Token.NONTERMINAL && !token ||
         rule[i] != tree.stack[i].code && (await Token.GetToken(rule[i])).type == Token.TERMINAL ||
         rule[i] != tree.stack[i].code && rule[i] == tree.token.code) {
        // Переходим на шаг вправо по правилам узла
        tree.rule_number++;
        if(!Tree.first_error && token) {
          Tree.first_error = `Получен ${token.name}(${token.text}), а ожидался (${(await Token.GetToken(rule[i])).name}) в строке ${token.line} ${token.symbols}`;
        }
        if(token) tree.stack.pop();
        tree = await Tree.AddToken(tree, token);
        break;
      }
      // Условие выполняется, если найдено несовпадение и токен нетерминальный
      else if(rule[i] != tree.stack[i].code && (await Token.GetToken(rule[i])).type == Token.NONTERMINAL) {
        let node = new Tree(await Token.GetToken(rule[i]),tree);
        if(tree) tree.stack.pop();
        // Переносим оставшиеся элементы в новый узел
        let stack_r = [];
        for(let j = i; j < tree.stack.length; j++) stack_r.push(tree.stack.pop());
        for(let j = i; j < tree.stack.length; j++) node.stack.push(stack_r.pop());

        tree.nodes.push(node);
        tree = node;
        tree = await Tree.AddToken(tree, token);
        break;
      }
      else if(i == tree.stack.length-1 || i == rule.length-1) {
        Tree.first_error = null;
        // Условие выполняется в том случае, если нетерминальный токен полностью собран
        if(rule.length <= tree.stack.length) {
          if(rule[0] != tree.token.code) {
            // Создаем узлы и собранного токена
            let nodes = [];
            let count_nonterminal = 0;
            for(let j = 0; j < rule.length; j++) {
              if((await Token.GetToken(rule[j])).type == Token.TERMINAL) {
                let node = new Tree(tree.stack[j],tree);
                nodes.push(node);
              }
              else if((await Token.GetToken(rule[j])).type == Token.NONTERMINAL) {
                nodes.push(tree.nodes[count_nonterminal]);
                count_nonterminal++;
              }
            }
            tree.nodes = nodes;

            // Собираем в стеке нетерминльный токен
            let new_stack = [tree.token];
            for(let j = rule.length; j < tree.stack.length; j++) new_stack.push(tree.stack[j]);
            tree.stack = new_stack;

            tree = await Tree.AddToken(tree, null);
          }
          else {
            // Создаем узлы и собранного токена
            let nodes_r = [];
            let nodes = [];
            let count_nonterminal = 0;
            for(let j = 1; j < rule.length; j++) {
              if((await Token.GetToken(rule[j])).type == Token.NONTERMINAL) nodes.push(tree.nodes.pop());
            }
            for(let j = 1; j < rule.length; j++) {
              nodes_r.push(nodes.pop());
            }
            for(let j = 1; j < rule.length; j++) {
              if((await Token.GetToken(rule[j])).type == Token.TERMINAL) {
                let node = new Tree(tree.stack[j],tree);
                nodes.push(node);
              }
              else if((await Token.GetToken(rule[j])).type == Token.NONTERMINAL) {
                nodes.push(nodes_r[count_nonterminal]);
                count_nonterminal++;
              }
            }
            tree.nodes = tree.nodes.concat(nodes);

            // Собираем в стеке нетерминльный токен
            let new_stack = [tree.token];
            for(let j = rule.length; j < tree.stack.length; j++) new_stack.push(tree.stack[j]);
            tree.stack = new_stack;

            tree = await Tree.AddToken(tree, null);
          }
        }
        break;
      }
    }
    return tree;
  }

  /**
   * Функция, которая проверяет, была ли ошибка в дереве, если да, то возвращает её
   */
  static async ErrorCheck(tree) {
    let result;

    if(tree.parent != null) result = "Код не закончен";
    else if(Tree.first_error) result = Tree.first_error;
    else result = tree;

    Tree.first_error = null;

    return result;
  }

  /**
   * Рекурсивная функция, которая переводит синтаксическое дерево в читабельный вид в виде текста
   */
  static async StrTree(tree, lvl) {
    if(typeof tree == 'string') return tree;
    
    let name;
    if(tree.token.type == Token.TERMINAL) name = `${tree.token.name}( ${tree.token.text} )`;
    else name = `${tree.token.name}`;

    let result = `${await this.#StrTreeIndent(lvl)}+-${name}\n`;

    for(let node of tree.nodes) {
      result += `${await this.#StrTreeIndent(lvl)}\n`;
      result += await this.StrTree(node, lvl+1);
    }

    return result;
  }

  /**
   * Функция, которая генерирует отступы для текстового синтаксического дерева
   */
  static async #StrTreeIndent(lvl) {
    let indent = '|';
    for(let i = 0; i < lvl; i++) indent += ' |';
    return indent;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Tree;
//-----------Экспортируемые модули-----------//