"use babel";

import VisualBasic6Grammar from './VisualBasic6Grammar';

export default {
  activate(state) {
    console.log('vb6 activate');
    atom.grammars.addGrammar(new VisualBasic6Grammar(atom.grammars));
  }
}
