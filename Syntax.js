//-----------Подключаемые модули-----------//
const Lexer = require('./Lexer');
//-----------Подключаемые модули-----------//

/**
 * Класс, отвечающий за синтаксический анализ потока токенов и перевода его в синтаксическое дерево
 */
class Syntax {
  /** Константы */
  // Терминальный тип токенов(токены из потока)
  static get #TERMINAL() {return 0};
  // Нетерминальный тип токенов(токены, собирающиеся из других токенов)
  static get #NONTERMINAL() {return 1};
  // Массив правил формирования нетерминальных токенов
  static get #RULES() {return [
    {code: 31, name: 'программа', descriptions: [[{type: this.#NONTERMINAL, code: 32},{type: this.#NONTERMINAL, code: 33},{type: this.#NONTERMINAL, code: 34},{type: this.#NONTERMINAL, code: 35}]]},
    {code: 32, name: 'имя_программы', descriptions: [[{type: this.#TERMINAL, code: 27},{type: this.#TERMINAL, code: 30},{type: this.#TERMINAL, code: 14}]]},
    {code: 33, name: 'раздел_констант', descriptions: [[{type: this.#TERMINAL, code: 29},{type: this.#NONTERMINAL, code: 36}],
                                                      [{type: this.#NONTERMINAL, code: 33},{type: this.#NONTERMINAL, code: 36}]]},
    {code: 34, name: 'раздел_переменных', descriptions: [[{type: this.#TERMINAL, code: 28},{type: this.#NONTERMINAL, code: 37}],
                                                        [{type: this.#NONTERMINAL, code: 34},{type: this.#NONTERMINAL, code: 37}]]},
    {code: 35, name: 'тело_программы', descriptions: [[{type: this.#TERMINAL, code: 25},{type: this.#NONTERMINAL, code: 38},{type: this.#TERMINAL, code: 26},{type: this.#TERMINAL, code: 17}]]},
    {code: 36, name: 'объявление_константы', descriptions: [[{type: this.#TERMINAL, code: 30},{type: this.#TERMINAL, code: 16},{type: this.#NONTERMINAL, code: 39},{type: this.#TERMINAL, code: 14}]]},
    {code: 37, name: 'присвоение_типа', descriptions: [[{type: this.#NONTERMINAL, code: 40},{type: this.#TERMINAL, code: 16},{type: this.#NONTERMINAL, code: 41},{type: this.#TERMINAL, code: 14}]]},
    {code: 38, name: 'операции', descriptions:  [[{type: this.#NONTERMINAL, code: 42}],
                                                [{type: this.#NONTERMINAL, code: 38},{type: this.#NONTERMINAL, code: 42}]]},
    {code: 39, name: 'присвоение_значения_константе', descriptions: [[{type: this.#TERMINAL, code: 19},{type: this.#TERMINAL, code: 11},{type: this.#TERMINAL, code: 1}],
                                                                    [{type: this.#TERMINAL, code: 18},{type: this.#TERMINAL, code: 11},{type: this.#TERMINAL, code: 3}]]},
    {code: 40, name: 'блок_идентификаторов', descriptions:  [[{type: this.#TERMINAL, code: 30}],
                                                            [{type: this.#NONTERMINAL, code: 40},{type: this.#TERMINAL, code: 15},{type: this.#TERMINAL, code: 30}]]},
    {code: 41, name: 'тип_данных', descriptions: [[{type: this.#TERMINAL, code: 19}],
                                                  [{type: this.#TERMINAL, code: 18}]]},
    {code: 42, name: 'операция', descriptions: [[]]},
  ]};

  /**
  * Функция, которая возвращает синтаксическое дерево
  */
  static async GetTree(code) {
    // Получаем массив токенов из массива символов
    let tokens = await Lexer.GetTokens(code);
    // Создаем дерево, задавая ему родительский узел первого правила
    let tree = await this.#CreateNode(this.#RULES[0].code, this.#RULES[0].name, this.#NONTERMINAL, this.#RULES[0].descriptions, null);

    // Перебор всех токенов
    for(let token of tokens) {
      // Отбрасываем все разделители
      if(token.code != 0) {
        // Создаем узел из токена
        let node = await this.#CreateNode(token.code, token.code_name, this.#TERMINAL, [], null);
        console.log(node);
        // Добавляем узел в дерево
        tree = await this.#AddNode(tree, node);
        //console.log(await this.#StrTree(tree, 0));
      }
    }
    tree = await this.#UpTree(tree);
    console.log(await this.#StrTree(tree, 0));

    return await this.#StrTree(tree, 0);
  }

  /**
   * Функция, которая создаёт узел
   */
  static async #CreateNode(code, name, type, descriptions, parent) {
    return {code: code, name: name, type: type, descriptions: descriptions, description_number: 0, parent: parent, nodes: [], stack: []};
  }

  /**
   * Функция, которая возвращает правило по его коду
   */
  static async #GetRule(code) {
    for(let rule of this.#RULES) {
      if(rule.code == code) return rule;
    }

    return null;
  }

  /**
   * Функция, которая добавляет узел в дерево
   */
  static async #AddNode(tree, node) {
    // Массив условий "И"
    let description;

    // Добавляем в стэк узла код токена, если он задан
    if(node) tree.stack.push(node.code);
    if(tree.stack.length < 4)console.log(tree);
    console.log(node);
    console.log(tree.stack);

    // Условие выполняется, если закончились условия "или" у узла
    if(tree.description_number == tree.descriptions.length) {
      // Условие выполняется, если есть родитель у узла
      if(tree.parent) {
        if(node) tree.stack.pop();
        if(node && tree.stack[0] != tree.code) tree.parent.description_number++;
        if(node && tree.stack[0] != tree.code) tree.parent.nodes.pop();
        tree.parent.stack = [].concat(tree.parent.stack, tree.stack);
        tree = tree.parent;
        tree = await this.#AddNode(tree, node);
        return tree;
      }
      // Иначе ошибка
      else {
        return tree;
      }
    }
    // Иначе присваиваем массив условий "И" по индексу "ИЛИ"
    else {
      description = tree.descriptions[tree.description_number];
    }
    console.log(description);

    // Перебираем массив условий "И"
    for(let i = 0; i < description.length; i++) {
      // Условие выполняется, если стэк больше размера правила или найдено несовпадение и токен терминальный или токен ссылается на самого себя
      if(description.length < tree.stack.length || description[i].code != tree.stack[i] && description[i].type == this.#TERMINAL || description[i].code != tree.stack[i] && description[i].code == tree.code) {
        tree.description_number++;
        if(node) tree.stack.pop();
        tree = await this.#AddNode(tree, node);
        break;
      }
      // Условие выполняется, если найдено несовпадение и токен нетерминальный
      else if(description[i].code != tree.stack[i] && description[i].type == this.#NONTERMINAL) {
        let rule = await this.#GetRule(description[i].code);
        let node_d = await this.#CreateNode(rule.code, rule.name, this.#NONTERMINAL, rule.descriptions, tree);
        if(node) tree.stack.pop();
        for(let j = i; j < tree.stack.length; j++) node_d.stack.push(tree.stack[j]);
        tree.nodes.push(node_d);
        tree = node_d;
        tree = await this.#AddNode(tree, node);
        break;
      }
      // Условие выполняется, когда доходим до границ стэка
      else if(i == tree.stack.length-1) {
        // Условие выполняется в том случае, если нетерминальный токен полностью собран
        if(description.length == tree.stack.length) {
          if(description[0].code != tree.code) {
            let nodes = [];
            let count_nonterminal = 0;
            for(let j = 0; j < description.length; j++) {
              if(description[j].type == this.#TERMINAL) {
                let rule = await Lexer.GetRule(description[j].code);
                let node_d = await this.#CreateNode(rule.code, rule.name, this.#TERMINAL, [], tree);
                nodes.push(node_d);
              }
              else if(description[j].type == this.#NONTERMINAL) {
                nodes.push(tree.nodes[count_nonterminal]);
                count_nonterminal++;
              }
            }
            tree.nodes = nodes;

            tree.stack = [tree.code];
            tree = await this.#AddNode(tree, null);
          }
          else {
            let nodes_r = [];
            let nodes = [];
            let count_nonterminal = 0;
            for(let i = 1; i < description.length; i++) {
              if(description[i].type == this.#NONTERMINAL) nodes.push(tree.nodes.pop());
            }
            for(let i = 0; i < nodes.length; i++) {
              nodes_r.push(nodes.pop());
            }
            for(let j = 1; j < description.length; j++) {
              if(description[j].type == this.#TERMINAL) {
                let rule = await Lexer.GetRule(description[j].code);
                let node_d = await this.#CreateNode(rule.code, rule.name, this.#TERMINAL, [], tree);
                nodes.push(node_d);
              }
              else if(description[j].type == this.#NONTERMINAL) {
                nodes.push(nodes_r[count_nonterminal]);
                count_nonterminal++;
              }
            }
            tree.nodes = tree.nodes.concat(nodes);

            tree.stack = [tree.code];
            tree = await this.#AddNode(tree, null);
          }
        }
        break;
      }
    }
    return tree;
  }

  /**
   * Функция, которая возвращает верхушку дерева
   */
  static async #UpTree(tree) {
    if(tree.parent) tree = await this.#UpTree(tree.parent);

    return tree;
  }

  /**
   * Рекурсивная функция, которая переводит синтаксическое дерево в читабельный вид в виде текста
   */
  static async #StrTree(tree, lvl) {
    let result = `${await this.#StrTreeIndent(lvl)}+-${tree.name}\n`;

    for(let node of tree.nodes) {
      result += `${await this.#StrTreeIndent(lvl)}\n`;
      result += await this.#StrTree(node, lvl+1);
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
module.exports = Syntax;
//-----------Экспортируемые модули-----------//