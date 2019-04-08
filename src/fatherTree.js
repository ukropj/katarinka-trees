import fs from 'fs'
import _ from 'lodash'

import {loadFatherData} from './parser'

export const generateFatherTree = async () => {
  const {workshops, firstVisit} = await loadFatherData()

  const dotStr = [
    'digraph op_tree {',
    '  labelloc=t;',
    '  fontsize=20',
    '  label="Ktorý OP bol u koho novicom";',
    '  rankdir=BT;',
    '  edge [color=darkgreen dir=back]',
    ..._.map(firstVisit, (id, father) => {
      return `  ${workshops[id].father} -> ${father};`
    }),
    '  {rank = min; Benignus; Petardus;}',
    '}',
  ].join('\n')

  fs.writeFile('./target/strom_op.dot', dotStr, (err) => {
    if (err) throw err
    console.log('Done: strom_op.dot')
  })
}
