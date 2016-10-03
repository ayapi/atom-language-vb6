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
    
    switch(type) {
      case -1:
        if (/^\s*('|:?Rem )/i.test(tokens[i].value)) {
          return 'comment.line.vb6';
        }
        if (/^\s*_/.test(tokens[i].value)) {
          return 'constant.character.escape.continuation.vb6';
        }
        
      case VisualBasic6Lexer.MACRO_IF:
      case VisualBasic6Lexer.MACRO_ELSEIF:
      case VisualBasic6Lexer.MACRO_ELSE:
      case VisualBasic6Lexer.MACRO_END_IF:
        return 'comment.block.preprocessor.vb6';
      
      case VisualBasic6Lexer.INTEGERLITERAL:
      case VisualBasic6Lexer.DOUBLELITERAL:
      case VisualBasic6Lexer.DATELITERAL:
      case VisualBasic6Lexer.COLORLITERAL:
      case VisualBasic6Lexer.FILENUMBER:
        return 'constant.numeric';
        
      case VisualBasic6Lexer.STRINGLITERAL:
        return 'string';
        
      case VisualBasic6Lexer.LPAREN:
      case VisualBasic6Lexer.RPAREN:
        return 'meta.brace.round.vb6';
        
      case VisualBasic6Lexer.L_SQUARE_BRACKET:
      case VisualBasic6Lexer.R_SQUARE_BRACKET:
        return 'meta.brace.square.vb6';
      
      case VisualBasic6Lexer.AMPERSAND:
      case VisualBasic6Lexer.ASSIGN:
      case VisualBasic6Lexer.AT:
      case VisualBasic6Lexer.COLON:
      case VisualBasic6Lexer.DIV:
      case VisualBasic6Lexer.DOLLAR:
      case VisualBasic6Lexer.EQ:
      case VisualBasic6Lexer.MINUS_EQ:
      case VisualBasic6Lexer.PLUS_EQ:
      case VisualBasic6Lexer.EXCLAMATIONMARK:
      case VisualBasic6Lexer.GEQ:
      case VisualBasic6Lexer.GT:
      case VisualBasic6Lexer.HASH:
      case VisualBasic6Lexer.LEQ:
      case VisualBasic6Lexer.LT:
      case VisualBasic6Lexer.MINUS:
      case VisualBasic6Lexer.MULT:
      case VisualBasic6Lexer.NEQ:
      case VisualBasic6Lexer.PERCENT:
      case VisualBasic6Lexer.PLUS:
      case VisualBasic6Lexer.POW:
      case VisualBasic6Lexer.MOD:
      case VisualBasic6Lexer.AND:
      case VisualBasic6Lexer.NOT:
      case VisualBasic6Lexer.OR:
      case VisualBasic6Lexer.XOR:
      case VisualBasic6Lexer.IMP:
      case VisualBasic6Lexer.EQV:
      case VisualBasic6Lexer.IS:
      case VisualBasic6Lexer.LIKE:
      case VisualBasic6Lexer.ADDRESSOF:
        return 'keyword.operator.vb6';
      
      case VisualBasic6Lexer.FALSE:
      case VisualBasic6Lexer.NOTHING:
      case VisualBasic6Lexer.NULL:
      case VisualBasic6Lexer.TRUE:
      case VisualBasic6Lexer.APPEND:
      case VisualBasic6Lexer.BINARY:
      case VisualBasic6Lexer.INPUT:
      case VisualBasic6Lexer.OUTPUT:
      case VisualBasic6Lexer.RANDOM:
      case VisualBasic6Lexer.READ:
      case VisualBasic6Lexer.READ_WRITE:
      case VisualBasic6Lexer.WRITE:
      case VisualBasic6Lexer.SHARED:
      case VisualBasic6Lexer.LOCK_READ:
      case VisualBasic6Lexer.LOCK_WRITE:
      case VisualBasic6Lexer.LOCK_READ_WRITE:
      case VisualBasic6Lexer.TEXT:
        return 'constant.language.vb6';
      
      case VisualBasic6Lexer.IF:
      case VisualBasic6Lexer.THEN:
      case VisualBasic6Lexer.ELSE:
      case VisualBasic6Lexer.ELSEIF:
      case VisualBasic6Lexer.END_IF:
      case VisualBasic6Lexer.WHILE:
      case VisualBasic6Lexer.WEND:
      case VisualBasic6Lexer.FOR:
      case VisualBasic6Lexer.TO:
      case VisualBasic6Lexer.EACH:
      case VisualBasic6Lexer.IN:
      case VisualBasic6Lexer.CASE:
      case VisualBasic6Lexer.SELECT:
      case VisualBasic6Lexer.END_SELECT:
      case VisualBasic6Lexer.RETURN:
      case VisualBasic6Lexer.DO:
      case VisualBasic6Lexer.UNTIL:
      case VisualBasic6Lexer.LOOP:
      case VisualBasic6Lexer.NEXT:
      case VisualBasic6Lexer.WITH:
      case VisualBasic6Lexer.END_WITH:
      case VisualBasic6Lexer.EXIT_DO:
      case VisualBasic6Lexer.EXIT_FOR:
      case VisualBasic6Lexer.EXIT_FUNCTION:
      case VisualBasic6Lexer.EXIT_PROPERTY:
      case VisualBasic6Lexer.EXIT_SUB:
      case VisualBasic6Lexer.GOSUB:
      case VisualBasic6Lexer.GOTO:
      case VisualBasic6Lexer.STEP:
      case VisualBasic6Lexer.STOP:
      case VisualBasic6Lexer.BEGIN:
      case VisualBasic6Lexer.END:
      case VisualBasic6Lexer.ERROR:
      case VisualBasic6Lexer.ON_ERROR:
        return 'keyword.control.vb6';
        
      case VisualBasic6Lexer.IDENTIFIER:
        if (
          i >= 2
          && 
          this.findLexerType(['FUNCTION', 'SUB'], tokens[i - 2].type)
        ) {
          return 'entity.name.function.vb6';
        }
        return 'indentifier.vb6';
        
      case VisualBasic6Lexer.CALL:
      case VisualBasic6Lexer.CLASS:
      case VisualBasic6Lexer.CONST:
      case VisualBasic6Lexer.DIM:
      case VisualBasic6Lexer.REDIM:
      case VisualBasic6Lexer.FUNCTION:
      case VisualBasic6Lexer.ATTRIBUTE:
      case VisualBasic6Lexer.SUB:
      case VisualBasic6Lexer.END_SUB:
      case VisualBasic6Lexer.END_FUNCTION:
      case VisualBasic6Lexer.SET:
      case VisualBasic6Lexer.LET:
      case VisualBasic6Lexer.GET:
      case VisualBasic6Lexer.PROPERTY_LET:
      case VisualBasic6Lexer.PROPERTY_SET:
      case VisualBasic6Lexer.RANDOMIZE:
      case VisualBasic6Lexer.OPTION_EXPLICIT:
      case VisualBasic6Lexer.OPTION_BASE:
      case VisualBasic6Lexer.OPTION_COMPARE:
      case VisualBasic6Lexer.OPTION_PRIVATE_MODULE:
      case VisualBasic6Lexer.ENUM:
      case VisualBasic6Lexer.END_ENUM:
      case VisualBasic6Lexer.EVENT:
      case VisualBasic6Lexer.DECLARE:
      case VisualBasic6Lexer.DEFBOOL:
      case VisualBasic6Lexer.DEFBYTE:
      case VisualBasic6Lexer.DEFDATE:
      case VisualBasic6Lexer.DEFDBL:
      case VisualBasic6Lexer.DEFDEC:
      case VisualBasic6Lexer.DEFCUR:
      case VisualBasic6Lexer.DEFINT:
      case VisualBasic6Lexer.DEFLNG:
      case VisualBasic6Lexer.DEFOBJ:
      case VisualBasic6Lexer.DEFSNG:
      case VisualBasic6Lexer.DEFSTR:
      case VisualBasic6Lexer.DEFVAR:
      case VisualBasic6Lexer.LIB:
      case VisualBasic6Lexer.ON:
      case VisualBasic6Lexer.END_PROPERTY:
      case VisualBasic6Lexer.RESUME:
      case VisualBasic6Lexer.ERASE:
      case VisualBasic6Lexer.VERSION:
      case VisualBasic6Lexer.TYPE:
      case VisualBasic6Lexer.END_TYPE:
        return 'storage.type.vb6';
        
      case VisualBasic6Lexer.BOOLEAN:
      case VisualBasic6Lexer.BYTE:
      case VisualBasic6Lexer.DATE:
      case VisualBasic6Lexer.DOUBLE:
      case VisualBasic6Lexer.INTEGER:
      case VisualBasic6Lexer.LONG:
      case VisualBasic6Lexer.SINGLE:
      case VisualBasic6Lexer.STRING:
      case VisualBasic6Lexer.VARIANT:
        return 'support.type.vb6';
        
      case VisualBasic6Lexer.AS:
      case VisualBasic6Lexer.ALIAS:
      case VisualBasic6Lexer.PRIVATE:
      case VisualBasic6Lexer.PUBLIC:
      case VisualBasic6Lexer.STATIC:
      case VisualBasic6Lexer.FRIEND:
      case VisualBasic6Lexer.IMPLEMENTS:
      case VisualBasic6Lexer.OPTIONAL:
      case VisualBasic6Lexer.BYREF:
      case VisualBasic6Lexer.BYVAL:
      case VisualBasic6Lexer.PARAMARRAY:
      case VisualBasic6Lexer.WITHEVENTS:
      case VisualBasic6Lexer.PRESERVE:
      case VisualBasic6Lexer.ACCESS:
        return 'storage.modifier.vb6';
        
      case VisualBasic6Lexer.APPACTIVATE:
      case VisualBasic6Lexer.BEEP:
      case VisualBasic6Lexer.CHDIR:
      case VisualBasic6Lexer.CHDRIVE:
      case VisualBasic6Lexer.CLOSE:
      case VisualBasic6Lexer.COLLECTION:
      case VisualBasic6Lexer.DELETESETTING:
      case VisualBasic6Lexer.FILECOPY:
      case VisualBasic6Lexer.GLOBAL:
      case VisualBasic6Lexer.KILL:
      case VisualBasic6Lexer.LOAD:
      case VisualBasic6Lexer.LOCK:
      case VisualBasic6Lexer.LEN:
      case VisualBasic6Lexer.LINE_INPUT:
      case VisualBasic6Lexer.LSET:
      case VisualBasic6Lexer.ME:
      case VisualBasic6Lexer.MID:
      case VisualBasic6Lexer.MKDIR:
      case VisualBasic6Lexer.NAME:
      case VisualBasic6Lexer.NEW:
      case VisualBasic6Lexer.OPEN:
      case VisualBasic6Lexer.PRINT:
      case VisualBasic6Lexer.PROPERTY_GET:
      case VisualBasic6Lexer.PUT:
      case VisualBasic6Lexer.RESET:
      case VisualBasic6Lexer.RMDIR:
      case VisualBasic6Lexer.RSET:
      case VisualBasic6Lexer.SAVEPICTURE:
      case VisualBasic6Lexer.SAVESETTING:
      case VisualBasic6Lexer.SEEK:
      case VisualBasic6Lexer.SENDKEYS:
      case VisualBasic6Lexer.SETATTR:
      case VisualBasic6Lexer.TIME:
      case VisualBasic6Lexer.TYPEOF:
      case VisualBasic6Lexer.UNLOAD:
      case VisualBasic6Lexer.UNLOCK:
      case VisualBasic6Lexer.WIDTH:
        return 'keyword.other.vb6'
    }
    return 'text.vb6.' + type.toString();
  }
}
