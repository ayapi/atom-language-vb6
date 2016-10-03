"use babel";

import {Grammar} from 'first-mate';
import antlr4 from 'antlr4';
import {VisualBasic6Lexer} from 'antlr4-vb6';
import Tokenizer from './Tokenizer';

export default class VisualBasic6Grammar extends Grammar {
  constructor(registry) {
    const name = 'VisualBasic6.0';
    const scopeName = 'source.vb6';
    super(registry, {
      name: name,
      scopeName: scopeName,
      patterns: {},
      fileTypes: ['bas', 'cls']
    });
    this.name = 'VisualBasic6.0';
    this.scopeName = 'source.vb6';
    this.tokenizer = new Tokenizer(VisualBasic6Lexer);
  }
  tokenizeLine(line, ruleStack = [], firstLine = false, compatibilityMode) {
    let tags = [];
    tags.push(this.registry.startIdForScope(this.scopeName));
    
    let tokens = this.tokenizer
      .getLineTokens(line)
      .map((token, i, tokens) => {
        token.scopes = [this.getScopeName(tokens, i)];
        return token;
      });
    tokens.forEach(token => {
      tags.push(this.registry.startIdForScope(token.scopes[0]));
      tags.push(token.value.length);
      tags.push(this.registry.endIdForScope(token.scopes[0]));
    });
    
    tags.push(line.length);
    tags.push(this.registry.endIdForScope(this.scopeName));
    let result = {
      line: line,
      tags: tags,
      tokens: tokens,
      ruleStack: ruleStack
    };
    return result;
  }
  findLexerType(list, type) {
    return list.some(name => {
      return (
        VisualBasic6Lexer.hasOwnProperty(name)
        &&
        VisualBasic6Lexer[name] === type
      );
    });
  }
  getScopeName(tokens, i) {
    let type = tokens[i].type;
    let isControlScope = this.findLexerType('IF|THEN|ELSE|ELSEIF|END_IF|WHILE|WEND|FOR|TO|EACH|IN|CASE|SELECT|END_SELECT|RETURN|DO|UNTIL|LOOP|NEXT|WITH|END_WITH|EXIT_DO|EXIT_FOR|EXIT_FUNCTION|EXIT_PROPERTY|EXIT_SUB|GOSUB|GOTO|STEP|STOP'.split('|'), type);
    if (isControlScope) {
      return 'keyword.control.vb6'
    }
    
    let isModifierScope = this.findLexerType('CALL|CLASS|CONST|DIM|REDIM|FUNCTION|SUB|END_SUB|END_FUNCTION|SET|LET|GET|RANDOMIZE|OPTION_EXPLICIT|ENUM|END_ENUM|EVENT|DECLARE|LIB|ON|END_PROPERTY|RESUME|ON_ERROR'.split('|'), type);
    if (isModifierScope) {
      return 'storage.modifier.vb6';
    }
    
    let isTypeScope = this.findLexerType('BOOLEAN|BYTE|DATE|DOUBLE|INTEGER|LONG|SINGLE|STRING|VARIANT'.split('|'), type);
    if (isTypeScope) {
      return 'storage.type.vb6'
    }
    
    let isConstantScope = this.findLexerType('FALSE|NOTHING|NULL|TRUE'.split('|'), type);
    if (isConstantScope) {
      return 'constant.language.vb6';
    }
    
    let isSupportFunction = this.findLexerType('PRIVATE|PUBLIC|STATIC|FRIEND|IMPLEMENTS|OPTIONAL|BYREF|BYVAL|PARAMARRAY|SHARED|WITHEVENTS|PRESERVE'.split('|'), type);
    if (isSupportFunction) {
      return 'support.function.vb6';
    }
    
    let isOperatorScope = this.findLexerType('AMPERSAND|ASSIGN|AT|COLON|DIV|DOLLAR|EQ|EXCLAMATIONMARK|GEQ|GT|HASH|LEQ|LT|MINUS|MULT|NEQ|PERCENT|PLUS|POW|MOD|AND|NOT|OR|XOR|IMP|EQV|IS|LIKE|ADDRESSOF|AS'.split('|'), type);
    if (isOperatorScope) {
      return 'keyword.operator.vb6';
    }
    
    switch(type) {
      case -1:
        if (/^\s*('|:?Rem )/i.test(tokens[i].value)) {
          return 'comment.line.vb6';
        }
        if (/^\s*_/.test(tokens[i].value)) {
          return 'constant.character.escape.continuation.vb6';
        }
      case VisualBasic6Lexer.INTEGERLITERAL:
        return 'constant.numeric';
      case VisualBasic6Lexer.STRINGLITERAL:
        return 'string';
      case VisualBasic6Lexer.LPAREN:
      case VisualBasic6Lexer.RPAREN:
        return "meta.brace.round.vb6";
      case VisualBasic6Lexer.IDENTIFIER:
        if (
          i >= 2
          && 
          this.findLexerType(['FUNCTION', 'SUB'], tokens[i - 2].type)
        ) {
          return 'entity.name.function.vb6';
        }
        return 'indentifier.vb6';
    }
    return type.toString();
  }
}
