"use babel";

// Originally Forked From https://github.com/maiermic/antlr4-ace-ext/commit/081f93bc421de8cf1ff0e686867b529045c47932

import antlr4 from 'antlr4';

const SkippedAntlrTokenType = -1;
const DefaultAtomTokenType = 'text';

/**
 * Map of ANTLR4 token name to ACE token type.
 * Describes which ANTLR4 token name refers to which ACE token type ({@link https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode#common-tokens see common ACE tokens}).
 *
 * @typedef {Object.<string, string>} AntlrTokenNameToAceTokenTypeMap
 *
 * @example
 * <pre><code>
 * {
 *   "'+'": 'keyword.operator',
 *   "'-'": 'keyword.operator',
 *   "'return'": 'keyword.control',
 *   "ID": 'identifier',
 *   "INT": 'constant.numeric'
 * }
 * </pre></code>
 */

/**
 * Tokenizer for the atom editor that uses an ANTLR4 lexer.
 *
 * @param Lexer
 * An ANTLR4 lexer class that should be used to tokenize lines of code.
 *
 * @param {AntlrTokenNameToAtomTokenTypeMap} antlrTokenNameToAtomTokenType
 * Description of the syntax highlighting rules.
 *
 * @constructor
 */
export default class Antlr4Tokenizer {
  constructor (Lexer, antlrTokenNameToAtomTokenType) {
    this.Lexer = Lexer;
    this.antlrTokenNameToAtomTokenType = antlrTokenNameToAtomTokenType || {};
  }

  getLineTokens(line) {
    let stream = new antlr4.InputStream(line + '\n');
    let lexer = new this.Lexer(stream);

    // added line feed might cause token recognition error
    // that should be ignored (not logged)
    lexer.removeErrorListeners();

    let commonTokens = lexer.getAllTokens();
    removeLineFeedOfLastCommonTokenValue(commonTokens);
    let changeTokenTypeToAtomType = changeTokenType(
      this.mapAntlrTokenTypeToAtomType.bind(this)
    );
    let tokens = insertSkippedTokens(commonTokens, line)
      .map(mapCommonTokenToAtomToken)
      // .map(changeTokenTypeToAtomType);
    return tokens;
  }

  getAntlrTokenName(tokenType) {
    return this.Lexer.symbolicNames[tokenType] ||
      this.Lexer.literalNames[tokenType];
  };

  mapAntlrTokenNameToAtomType(tokenName) {
    return this.antlrTokenNameToAtomTokenType[tokenName] || DefaultAtomTokenType;
  };

  mapAntlrTokenTypeToAtomType(tokenType) {
    return this.mapAntlrTokenNameToAtomType(this.getAntlrTokenName(tokenType));
  };
}

function removeLineFeedOfLastCommonTokenValue(commonTokens) {
  if (commonTokens.length > 0) {
    let last = commonTokens[commonTokens.length - 1];
    last.text = last.text.replace('\n', '');
  }
}

function changeTokenType(mapType) {
  return function (token) {
    token.type = mapType(token.type);
    return token;
  };
}

function mapCommonTokenToAtomToken(commonToken) {
  return {
    type: commonToken.type,
    value: commonToken.text
  };
}

function insertSkippedTokens(tokens, line) {
  let skippedText;
  let nextTokenColumn = 0;
  let allTokens = tokens.reduce(function (acc, token) {
    skippedText = line.substring(nextTokenColumn, token.column);
    if (skippedText !== '') {
      acc.push({
        type: SkippedAntlrTokenType,
        text: skippedText,
        column: nextTokenColumn
      });
    }
    acc.push(token);
    nextTokenColumn = getEndColumnOfToken(token) + 1;
    return acc;
  }, []);
  // add skipped token at the end of the line
  skippedText = line.substr(nextTokenColumn);
  if (skippedText !== '') {
    allTokens.push({
      type: SkippedAntlrTokenType,
      text: skippedText,
      column: nextTokenColumn
    });
  }
  return allTokens;
}

function getEndColumnOfToken(token) {
  return token.column + token.text.length - 1;
}

module.exports = {
  SkippedAntlrTokenType: SkippedAntlrTokenType,
  DefaultAtomTokenType: DefaultAtomTokenType,
  Antlr4Tokenizer: Antlr4Tokenizer,
  removeLineFeedOfLastCommonTokenValue: removeLineFeedOfLastCommonTokenValue,
  changeTokenType: changeTokenType,
  mapCommonTokenToAtomToken: mapCommonTokenToAtomToken,
  insertSkippedTokens: insertSkippedTokens,
  getEndColumnOfToken: getEndColumnOfToken
};