import fs from 'fs'
import _ from 'lodash'

import {loadFatherData} from './parser'

const toNodeId = (id) => `n${id}`

const toEdge = (...ids) => ids.map(toNodeId).join(' -> ')

const minlen = (id1, id2) => {
  const y1 = +id1.split('_')[0]
  const y2 = +id2.split('_')[0]
  return y1 - y2
}

export const generateWorkshopFatherTree = async () => {
  const {workshops, firstVisit, fathers, years} = await loadFatherData()
  const dotStr = [
    'digraph op_druziny_tree {',
    '  labelloc=t;',
    '  fontsize=30',
    '  label="OP vsetkých družín a kde boli novicmi";',
    '  rankdir=BT;',
    '  newrank=true;',
    '  edge [color="black:invis:black" arrowhead=none];',
    ..._.map(years, (ids, year) => {
      return `  ${toNodeId(year)} [shape=plaintext fontcolor="sienna" fontsize=20 label="${year}"];`
    }),
    `  ${toEdge(..._.keys(years))} [color=white];`,
    ..._.map(workshops, ({father}, id) => {
      return `  ${toNodeId(id)} [label="${father}"];`
    }),
    ..._.map(years, (ids, year) => {
      return `  ${toNodeId(year)} [label="${year}"];`
    }),
    ..._.filter(
      _.map(fathers, (ids, father) => {
        const primaryIds = ids.filter((id) => !workshops[id].prev)
        return primaryIds.length > 1 ? `  ${toEdge(...primaryIds)};` : null
      })
    ),
    ..._.filter(
      _.map(fathers, (ids, father) => {
        const extraIds = ids.filter((id) => workshops[id].prev)
        return extraIds.map((id) => `  ${toEdge(workshops[id].prev, id)};`).join('\n')
      })
    ),
    ..._.map(fathers, (ids, father) => {
      return `  ${toEdge(firstVisit[father], ids[0])} [color=darkgreen dir=back minlen=${minlen(
        ids[0],
        firstVisit[father]
      )}];`
    }),
    ..._.map(years, (ids, year) => {
      // return [`  subgraph cluster_${year} {`,
      //   '    labelloc ="t";',
      //   `    label="${year}";`,
      //   `    {rank=same ${ids.map(toNodeId).join(' ')}}`,
      //   '  }'
      // ].join('\n')
      return `  {rank=same ${toNodeId(year)} ${ids.map(toNodeId).join(' ')}}`
    }),
    `  {rank = min; ${years[Math.min(..._.keys(years))].map(toNodeId).join(' ')}}`,
    '}',
  ].join('\n')

  fs.writeFile('./target/strom_op_druziny.dot', dotStr, (err) => {
    if (err) throw err
    console.log('Done: strom_op_druziny.dot')
  })
}
