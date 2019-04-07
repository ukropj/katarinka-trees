const fs = require('fs')
const _ = require('lodash')

const SEP = '_'

const toNodeId = (id) => `n${id}`

const toEdge = (...ids) => ids.map(toNodeId).join(' -> ')

const minlen = (id1, id2) => {
  const y1 = +(id1.split(SEP)[0])
  const y2 = +(id2.split(SEP)[0])
  return y1 - y2
}

fs.readFile('./source/strom.csv', 'utf-8', (err, data) => {
  if (err) return
  const lines = data.split(/\r?\n/)
  lines.shift()

  const druziny = {}
  const roky = {}
  const novicka = {}
  const ops = {}
  lines.forEach((l, i) => {
    // if (i > 20) return 
    const [year,no,op,noviciStr] = l.split(',')
    const id = `${year}${SEP}${no}`
    const novici =  noviciStr.length ? noviciStr.split(';') : []
    druziny[id] = {op, year, no, novici}
    novici.forEach((n) => {
      novicka[n.replace('*', '')] = id
      ~n.indexOf('*') && (novicka[n.replace('*', '')].sluzba = true)
    })
    roky[year] || (roky[year] = [])
    roky[year].push(id)
    ops[op] || (ops[op] = [])
    ops[op].push(id)
  })
  console.log(novicka)
  
  const dotStr = [
    'digraph op_tree {',
    '  labelloc=t;',
    '  label="Ktorý OP bol u koho novicom";',
    '  rankdir=BT;',
    '  newrank=true;',
    ..._.map(druziny, ({op}, id) => {
      return `  ${toNodeId(id)} [label="${op}"];`
    }),
    ..._.filter(_.map(ops, (ids, op) => {
      return ids.length > 1 ? `  ${toEdge(...ids)} [color=grey arrowhead=none];` : null
    })),
    ..._.map(ops, (ids, op) => {
        console.log(op, ids[0], novicka[op])
        return `  ${toEdge(ids[0], novicka[op])} [color=green minlen=${minlen(ids[0], novicka[op])}];`
      }),
    ..._.map(roky, (ids, year) => {
      // return [`  subgraph cluster_${year} {`,
      //   '    labelloc ="t";',
      //   `    label="${year}";`,
      //   `    {rank=same ${ids.map(toNodeId).join(' ')}}`,
      //   '  }'
      // ].join('\n')
      return `  {rank=same ${ids.map(toNodeId).join(' ')}}`
    }),
    `  {rank = min; n1995_1; n1995_2;}`,
    '}'
  ].join('\n')

  fs.writeFile('./target/strom.dot', dotStr, function(err) {
      if (err) throw err;
      console.log('Done');
  });
});
