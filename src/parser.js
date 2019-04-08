import fs from 'fs'
import _ from 'lodash'
import {promisify} from 'util'

const readFile = promisify(fs.readFile)

export const loadFatherData = async () => {
  const data = await readFile('./source/fathers.csv', 'utf-8')
  const lines = data.split(/\r?\n/)
  lines.shift()

  const workshops = {}
  const years = {}
  const firstVisit = {}
  const fathers = {}
  const fatherWorkshopsInYear = {}

  lines.forEach((l, i) => {
    // if (i > 20) return
    const [year, no, father, firstVisitorsStr] = l.split(',')
    const id = `${year}_${no}`
    const firstVisitors = firstVisitorsStr.length ? firstVisitorsStr.split(';') : []

    workshops[id] = {father, year, no, firstVisitors}

    firstVisitors.forEach((n) => {
      const name = n.replace('*', '')
      firstVisit[name] = id
      // if (n.indexOf('*') !== -1) {
      // firstVisit[name].sluzba = true
    })

    years[year] || (years[year] = [])
    years[year].push(id)

    fathers[father] || (fathers[father] = [])
    fathers[father].push(id)

    fatherWorkshopsInYear[father] || (fatherWorkshopsInYear[father] = {})
    const fc = fatherWorkshopsInYear[father]
    fc[year] || (fc[year] = [])

    workshops[id].prev = _.last(fc[year])
    fc[year].push(id)
  })

  return {workshops, fathers, years, firstVisit}
}
